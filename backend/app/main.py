import asyncio
from contextlib import asynccontextmanager, suppress
from dataclasses import dataclass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import Settings, get_settings
from app.services.codex import CodexService
from app.services.docker import DockerService
from app.services.history import HistoryStore, history_store
from app.services.minecraft import MinecraftService
from app.services.system import SystemService


@dataclass
class Services:
    settings: Settings
    system: SystemService
    docker: DockerService
    minecraft: MinecraftService
    codex: CodexService
    history: HistoryStore


def create_services(settings: Settings) -> Services:
    docker_service = DockerService(settings)
    return Services(
        settings=settings,
        system=SystemService(settings),
        docker=docker_service,
        minecraft=MinecraftService(settings, docker_service),
        codex=CodexService(settings),
        history=history_store,
    )


async def sampler(app: FastAPI) -> None:
    services: Services = app.state.services
    while True:
        try:
            system = await asyncio.to_thread(services.system.snapshot, services.docker.version(), False)
            network = system["network"]
            services.history.append(
                "host",
                {
                    "cpu_percent": system["cpu"]["usage_percent"],
                    "memory_percent": system["memory"]["usage_percent"],
                },
            )
            services.history.append(
                "network",
                {
                    "rx_bytes_per_second": sum(item["download_bytes_per_second"] for item in network),
                    "tx_bytes_per_second": sum(item["upload_bytes_per_second"] for item in network),
                },
            )
            codex = await asyncio.to_thread(services.codex.status)
            services.history.append(
                "codex",
                {"cpu_percent": codex["cpu_percent"], "memory_bytes": codex["memory_bytes"]},
            )
            try:
                containers = await asyncio.to_thread(services.docker.containers)
                for container in containers:
                    services.history.append(
                        f"docker:{container['id']}",
                        {
                            "cpu_percent": container["cpu_percent"],
                            "memory_percent": container["memory_percent"],
                            "memory_usage": container["memory_usage"],
                        },
                    )
            except RuntimeError:
                pass
        except Exception:
            pass
        await asyncio.sleep(max(1.0, services.settings.refresh_system_seconds))


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.services = create_services(get_settings())
    task = asyncio.create_task(sampler(app))
    yield
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task


settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)
app.include_router(router)
