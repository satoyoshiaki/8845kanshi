from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "8845 KANSHI"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:3000"

    host_root: Path = Path("/")
    host_hostname: str | None = None
    monitored_mounts: str = "/"

    docker_host: str = "unix:///var/run/docker.sock"
    minecraft_host: str = "127.0.0.1"
    minecraft_port: int = 25565
    minecraft_container_name: str = "minecraft"

    codex_workspace_root: Path = Path("/home")
    codex_process_names: str = "codex,codex-cli,codex-code-mode"

    refresh_system_seconds: float = 2
    refresh_docker_seconds: float = 3
    refresh_minecraft_seconds: float = 5
    refresh_codex_seconds: float = 3
    history_retention_minutes: int = 60

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def mount_list(self) -> list[str]:
        return [item.strip() for item in self.monitored_mounts.split(",") if item.strip()]

    @property
    def codex_names(self) -> set[str]:
        return {item.strip().lower() for item in self.codex_process_names.split(",") if item.strip()}


@lru_cache
def get_settings() -> Settings:
    return Settings()
