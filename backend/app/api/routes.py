import asyncio
from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query, Request


router = APIRouter(prefix="/api")


def services(request: Request) -> Any:
    return request.app.state.services


@router.get("/health")
def health(request: Request) -> dict[str, Any]:
    availability = services(request).docker.availability()
    return {"status": "ok", "docker": availability}


@router.get("/cpu")
def cpu(request: Request) -> dict[str, Any]:
    return services(request).system.cpu()


@router.get("/memory")
def memory(request: Request) -> dict[str, Any]:
    return services(request).system.memory()


@router.get("/disk")
def disk(request: Request) -> list[dict[str, Any]]:
    return services(request).system.disks()


@router.get("/network")
def network(request: Request, include_bridges: bool = True) -> list[dict[str, Any]]:
    return services(request).system.network(include_bridges=include_bridges)


@router.get("/system")
def system(request: Request, include_bridges: bool = True) -> dict[str, Any]:
    app_services = services(request)
    return app_services.system.snapshot(
        docker_version=app_services.docker.version(), include_bridges=include_bridges
    )


@router.get("/docker")
def docker_containers(request: Request) -> dict[str, Any]:
    try:
        containers = services(request).docker.containers()
        return {"available": True, "containers": containers, "error": None}
    except RuntimeError as exc:
        return {"available": False, "containers": [], "error": str(exc)}


@router.get("/docker/{identifier}")
def docker_container(request: Request, identifier: str) -> dict[str, Any]:
    try:
        container = services(request).docker.container(identifier)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if container is None:
        raise HTTPException(status_code=404, detail="Container not found")
    return container


@router.get("/docker/{identifier}/history")
def docker_history(
    request: Request,
    identifier: str,
    minutes: Annotated[int, Query(ge=1, le=60)] = 5,
) -> list[dict[str, Any]]:
    app_services = services(request)
    container = app_services.docker.container(identifier)
    if container is None:
        raise HTTPException(status_code=404, detail="Container not found")
    return app_services.history.get(f"docker:{container['id']}", minutes)


@router.get("/minecraft")
async def minecraft(request: Request) -> dict[str, Any]:
    return await services(request).minecraft.status()


@router.get("/minecraft/players")
async def minecraft_players(request: Request) -> dict[str, Any]:
    status = await services(request).minecraft.status()
    return {
        "online": status["online"],
        "count": status["players_online"],
        "max": status["players_max"],
        "players": status["player_names"],
        "available": status["player_list_available"],
    }


@router.get("/codex")
def codex(request: Request) -> dict[str, Any]:
    return services(request).codex.status()


@router.get("/codex/process")
def codex_process(request: Request) -> dict[str, Any]:
    status = services(request).codex.status()
    return {key: status[key] for key in ("active", "state", "pid", "cpu_percent", "memory_bytes", "started_at", "uptime_seconds", "process_count")}


@router.get("/codex/workspace")
def codex_workspace(request: Request) -> dict[str, Any]:
    status = services(request).codex.status()
    return {key: status[key] for key in ("working_directory", "git_repository", "git_branch")}


@router.get("/codex/activity")
def codex_activity(request: Request) -> dict[str, Any]:
    status = services(request).codex.status()
    return {"last_activity": status["last_activity"], "recent_files": status["recent_files"]}


@router.get("/history/{scope}")
def history(
    request: Request,
    scope: str,
    minutes: Annotated[int, Query(ge=1, le=60)] = 5,
) -> list[dict[str, Any]]:
    if scope not in {"host", "codex", "network"}:
        raise HTTPException(status_code=404, detail="Unknown history scope")
    return services(request).history.get(scope, minutes)


@router.get("/dashboard")
async def dashboard(request: Request) -> dict[str, Any]:
    app_services = services(request)
    system_task = asyncio.to_thread(
        app_services.system.snapshot, app_services.docker.version(), False
    )
    docker_task = asyncio.to_thread(app_services.docker.containers)
    codex_task = asyncio.to_thread(app_services.codex.status)
    minecraft_task = app_services.minecraft.status()
    system_result, docker_result, codex_result, minecraft_result = await asyncio.gather(
        system_task, docker_task, codex_task, minecraft_task, return_exceptions=True
    )
    return {
        "system": None if isinstance(system_result, Exception) else system_result,
        "docker": {
            "available": not isinstance(docker_result, Exception),
            "containers": [] if isinstance(docker_result, Exception) else docker_result,
            "error": str(docker_result) if isinstance(docker_result, Exception) else None,
        },
        "minecraft": {
            "online": False,
            "error": str(minecraft_result),
        } if isinstance(minecraft_result, Exception) else minecraft_result,
        "codex": {
            "active": False,
            "state": "idle",
            "error": str(codex_result),
        } if isinstance(codex_result, Exception) else codex_result,
    }
