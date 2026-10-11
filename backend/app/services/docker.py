from datetime import UTC, datetime
from threading import Lock
from typing import Any

import docker
from docker.errors import DockerException, NotFound

from app.config import Settings


def _sum_network(stats: dict[str, Any], key: str) -> int:
    return sum(int(values.get(key, 0)) for values in stats.get("networks", {}).values())


def _sum_block_io(stats: dict[str, Any], operation: str) -> int:
    entries = stats.get("blkio_stats", {}).get("io_service_bytes_recursive") or []
    return sum(int(entry.get("value", 0)) for entry in entries if entry.get("op", "").lower() == operation)


def _cpu_percent(stats: dict[str, Any], previous_stats: dict[str, Any] | None = None) -> float:
    cpu = stats.get("cpu_stats", {})
    previous = (previous_stats or {}).get("cpu_stats", {}) or stats.get("precpu_stats", {})
    cpu_delta = cpu.get("cpu_usage", {}).get("total_usage", 0) - previous.get("cpu_usage", {}).get("total_usage", 0)
    system_delta = cpu.get("system_cpu_usage", 0) - previous.get("system_cpu_usage", 0)
    online_cpus = cpu.get("online_cpus") or len(cpu.get("cpu_usage", {}).get("percpu_usage", [])) or 1
    if cpu_delta > 0 and system_delta > 0:
        return round((cpu_delta / system_delta) * online_cpus * 100, 2)
    return 0.0


class DockerService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client: docker.DockerClient | None = None
        self._lock = Lock()
        self._stats_lock = Lock()
        self._previous_stats: dict[str, dict[str, Any]] = {}

    def _get_client(self) -> docker.DockerClient:
        with self._lock:
            if self._client is None:
                self._client = docker.DockerClient(base_url=self.settings.docker_host, timeout=4)
            return self._client

    def version(self) -> str | None:
        try:
            return self._get_client().version().get("Version")
        except DockerException:
            return None

    def availability(self) -> dict[str, Any]:
        try:
            self._get_client().ping()
            return {"available": True, "version": self.version(), "error": None}
        except DockerException as exc:
            return {"available": False, "version": None, "error": str(exc)}

    def _stats(self, container: Any) -> tuple[dict[str, Any], dict[str, Any] | None]:
        current = container.stats(stream=False, one_shot=True)
        with self._stats_lock:
            previous = self._previous_stats.get(container.id)
            self._previous_stats[container.id] = current
        return current, previous

    def _format_container(
        self,
        container: Any,
        stats: dict[str, Any] | None = None,
        previous_stats: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        attrs = container.attrs
        state = attrs.get("State", {})
        config = attrs.get("Config", {})
        stats = stats or {}
        memory_stats = stats.get("memory_stats", {})
        memory_usage = int(memory_stats.get("usage", 0))
        memory_limit = int(memory_stats.get("limit", 0))
        networks = attrs.get("NetworkSettings", {}).get("Networks", {})
        ports = attrs.get("NetworkSettings", {}).get("Ports", {}) or {}
        started_at = state.get("StartedAt")
        uptime_seconds = 0
        if started_at and started_at != "0001-01-01T00:00:00Z":
            try:
                started = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
                uptime_seconds = max(0, int((datetime.now(UTC) - started).total_seconds()))
            except ValueError:
                pass
        port_mappings = []
        for container_port, bindings in ports.items():
            for binding in bindings or []:
                port_mappings.append(
                    {
                        "container": container_port,
                        "host_ip": binding.get("HostIp"),
                        "host_port": binding.get("HostPort"),
                    }
                )
        return {
            "id": container.id,
            "short_id": container.short_id,
            "name": container.name,
            "image": config.get("Image") or "Unknown",
            "status": state.get("Status", container.status),
            "health": state.get("Health", {}).get("Status"),
            "created": attrs.get("Created"),
            "started": started_at,
            "uptime_seconds": uptime_seconds,
            "restart_count": attrs.get("RestartCount", 0),
            "cpu_percent": _cpu_percent(stats, previous_stats),
            "memory_usage": memory_usage,
            "memory_limit": memory_limit,
            "memory_percent": round(memory_usage / memory_limit * 100, 2) if memory_limit else 0.0,
            "network_rx": _sum_network(stats, "rx_bytes"),
            "network_tx": _sum_network(stats, "tx_bytes"),
            "block_read": _sum_block_io(stats, "read"),
            "block_write": _sum_block_io(stats, "write"),
            "networks": [
                {"name": name, "ip_address": values.get("IPAddress")}
                for name, values in networks.items()
            ],
            "ports": port_mappings,
        }

    def containers(self) -> list[dict[str, Any]]:
        try:
            containers = self._get_client().containers.list(all=True)
            result = []
            for container in containers:
                stats = None
                previous_stats = None
                if container.status == "running":
                    try:
                        stats, previous_stats = self._stats(container)
                    except DockerException:
                        stats = None
                result.append(self._format_container(container, stats, previous_stats))
            return sorted(result, key=lambda item: (item["status"] != "running", item["name"].lower()))
        except DockerException as exc:
            raise RuntimeError(f"Docker unavailable: {exc}") from exc

    def container(self, identifier: str) -> dict[str, Any] | None:
        try:
            container = self._get_client().containers.get(identifier)
            stats = previous_stats = None
            if container.status == "running":
                stats, previous_stats = self._stats(container)
            return self._format_container(container, stats, previous_stats)
        except NotFound:
            return None
        except DockerException as exc:
            raise RuntimeError(f"Docker unavailable: {exc}") from exc
