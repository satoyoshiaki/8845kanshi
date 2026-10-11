import os
import platform
import socket
import time
from datetime import UTC, datetime
from pathlib import Path
from threading import Lock
from typing import Any

import psutil

from app.config import Settings


def _bytes_per_second(current: int, previous: int, elapsed: float) -> float:
    if elapsed <= 0 or current < previous:
        return 0.0
    return (current - previous) / elapsed


class SystemService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._lock = Lock()
        self._last_disk: tuple[float, Any] | None = None
        self._last_network: tuple[float, dict[str, Any]] | None = None
        psutil.cpu_percent(interval=None, percpu=True)

    def _host_path(self, path: str) -> Path:
        if self.settings.host_root == Path("/"):
            return Path(path)
        return self.settings.host_root / path.lstrip("/")

    def _os_name(self) -> str:
        release_file = self._host_path("/etc/os-release")
        try:
            entries = {}
            for line in release_file.read_text(encoding="utf-8").splitlines():
                if "=" in line:
                    key, value = line.split("=", 1)
                    entries[key] = value.strip().strip('"')
            return entries.get("PRETTY_NAME", platform.platform())
        except OSError:
            return platform.platform()

    def _hostname(self) -> str:
        if self.settings.host_hostname:
            return self.settings.host_hostname
        try:
            return self._host_path("/etc/hostname").read_text(encoding="utf-8").strip()
        except OSError:
            return socket.gethostname()

    def _cpu_model(self) -> str:
        try:
            for line in self._host_path("/proc/cpuinfo").read_text(encoding="utf-8").splitlines():
                if line.lower().startswith("model name"):
                    return line.split(":", 1)[1].strip()
        except OSError:
            pass
        return platform.processor() or "Unknown"

    def _temperature(self) -> float | None:
        try:
            temperatures = psutil.sensors_temperatures(fahrenheit=False)
        except (AttributeError, OSError):
            return None
        preferred = ("k10temp", "coretemp", "cpu_thermal", "acpitz")
        for key in preferred:
            readings = temperatures.get(key, [])
            values = [item.current for item in readings if item.current is not None]
            if values:
                return round(max(values), 1)
        for readings in temperatures.values():
            values = [item.current for item in readings if item.current is not None]
            if values:
                return round(max(values), 1)
        return None

    def cpu(self) -> dict[str, Any]:
        per_core = psutil.cpu_percent(interval=None, percpu=True)
        load = os.getloadavg() if hasattr(os, "getloadavg") else (0.0, 0.0, 0.0)
        return {
            "usage_percent": round(sum(per_core) / len(per_core), 1) if per_core else 0.0,
            "model": self._cpu_model(),
            "physical_cores": psutil.cpu_count(logical=False),
            "logical_cpus": psutil.cpu_count(logical=True),
            "per_core_percent": [round(value, 1) for value in per_core],
            "load_average": {"1m": round(load[0], 2), "5m": round(load[1], 2), "15m": round(load[2], 2)},
            "temperature_celsius": self._temperature(),
        }

    def memory(self) -> dict[str, Any]:
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        return {
            "total": memory.total,
            "used": memory.used,
            "available": memory.available,
            "usage_percent": memory.percent,
            "swap_total": swap.total,
            "swap_used": swap.used,
            "swap_percent": swap.percent,
        }

    def disks(self) -> list[dict[str, Any]]:
        now = time.monotonic()
        counters = psutil.disk_io_counters()
        read_speed = write_speed = 0.0
        with self._lock:
            if self._last_disk and counters:
                previous_time, previous = self._last_disk
                elapsed = now - previous_time
                read_speed = _bytes_per_second(counters.read_bytes, previous.read_bytes, elapsed)
                write_speed = _bytes_per_second(counters.write_bytes, previous.write_bytes, elapsed)
            self._last_disk = (now, counters)

        disks = []
        seen: set[str] = set()
        for mount in self.settings.mount_list:
            if mount in seen:
                continue
            seen.add(mount)
            path = self._host_path(mount)
            try:
                usage = psutil.disk_usage(str(path))
            except OSError:
                continue
            disks.append(
                {
                    "mountpoint": mount,
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "usage_percent": usage.percent,
                    "read_bytes": counters.read_bytes if counters else None,
                    "write_bytes": counters.write_bytes if counters else None,
                    "read_bytes_per_second": round(read_speed, 1),
                    "write_bytes_per_second": round(write_speed, 1),
                }
            )
        return disks

    def network(self, include_bridges: bool = True) -> list[dict[str, Any]]:
        now = time.monotonic()
        addresses = psutil.net_if_addrs()
        stats = psutil.net_if_stats()
        counters = psutil.net_io_counters(pernic=True)
        previous_time = now
        previous_counters: dict[str, Any] = {}
        with self._lock:
            if self._last_network:
                previous_time, previous_counters = self._last_network
            self._last_network = (now, counters)
        elapsed = now - previous_time

        interfaces = []
        for name, nic_counters in counters.items():
            if name == "lo" or name.startswith("veth"):
                continue
            is_bridge = name == "docker0" or name.startswith("br-")
            if is_bridge and not include_bridges:
                continue
            ipv4: list[str] = []
            ipv6: list[str] = []
            for address in addresses.get(name, []):
                if address.family == socket.AF_INET:
                    ipv4.append(address.address)
                elif address.family == socket.AF_INET6:
                    ipv6.append(address.address.split("%", 1)[0])
            previous = previous_counters.get(name)
            interfaces.append(
                {
                    "interface": name,
                    "ipv4": ipv4,
                    "ipv6": ipv6,
                    "is_up": bool(stats.get(name) and stats[name].isup),
                    "is_bridge": is_bridge,
                    "rx_bytes": nic_counters.bytes_recv,
                    "tx_bytes": nic_counters.bytes_sent,
                    "download_bytes_per_second": round(
                        _bytes_per_second(nic_counters.bytes_recv, previous.bytes_recv, elapsed), 1
                    ) if previous else 0.0,
                    "upload_bytes_per_second": round(
                        _bytes_per_second(nic_counters.bytes_sent, previous.bytes_sent, elapsed), 1
                    ) if previous else 0.0,
                }
            )
        return sorted(interfaces, key=lambda item: (item["is_bridge"], item["interface"]))

    def info(self, docker_version: str | None = None) -> dict[str, Any]:
        boot_timestamp = psutil.boot_time()
        memory = psutil.virtual_memory()
        return {
            "hostname": self._hostname(),
            "os": self._os_name(),
            "kernel": platform.release(),
            "architecture": platform.machine(),
            "uptime_seconds": max(0, int(time.time() - boot_timestamp)),
            "boot_time": datetime.fromtimestamp(boot_timestamp, UTC).isoformat(),
            "cpu_model": self._cpu_model(),
            "ram_total": memory.total,
            "docker_version": docker_version,
        }

    def snapshot(self, docker_version: str | None = None, include_bridges: bool = True) -> dict[str, Any]:
        return {
            "timestamp": datetime.now(UTC).isoformat(),
            "cpu": self.cpu(),
            "memory": self.memory(),
            "disks": self.disks(),
            "network": self.network(include_bridges=include_bridges),
            "info": self.info(docker_version=docker_version),
        }
