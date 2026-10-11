import json
from datetime import UTC, datetime
from typing import Any

from mcstatus import JavaServer

from app.config import Settings
from app.services.docker import DockerService


class MinecraftService:
    def __init__(self, settings: Settings, docker_service: DockerService) -> None:
        self.settings = settings
        self.docker_service = docker_service

    @staticmethod
    def _description(value: Any) -> str:
        if isinstance(value, str):
            return value
        if isinstance(value, dict):
            if "text" in value:
                return str(value["text"])
            return json.dumps(value, ensure_ascii=False)
        return str(value)

    async def status(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "online": False,
            "host": self.settings.minecraft_host,
            "port": self.settings.minecraft_port,
            "version": None,
            "motd": None,
            "latency_ms": None,
            "players_online": 0,
            "players_max": 0,
            "player_names": None,
            "player_list_available": False,
            "error": None,
            "container": None,
        }
        try:
            server = JavaServer(self.settings.minecraft_host, self.settings.minecraft_port, timeout=4)
            status = await server.async_status()
            sample = status.players.sample or []
            result.update(
                {
                    "online": True,
                    "version": status.version.name,
                    "motd": self._description(status.description),
                    "latency_ms": round(status.latency, 1),
                    "players_online": status.players.online,
                    "players_max": status.players.max,
                    "player_names": [player.name for player in sample] if sample else None,
                    "player_list_available": bool(sample) or status.players.online == 0,
                }
            )
            if status.players.online and not sample:
                try:
                    query = await server.async_query()
                    names = list(query.players.names)
                    result["player_names"] = names
                    result["player_list_available"] = True
                except Exception:
                    pass
        except Exception as exc:
            result["error"] = str(exc)

        try:
            result["container"] = self.docker_service.container(self.settings.minecraft_container_name)
        except RuntimeError:
            result["container"] = None
        return result
