import os
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import psutil

from app.config import Settings


SAFE_SUFFIXES = {
    ".css", ".go", ".html", ".java", ".js", ".json", ".jsx", ".md", ".php",
    ".py", ".rs", ".sh", ".sql", ".toml", ".ts", ".tsx", ".vue", ".yaml", ".yml",
}
EXCLUDED_DIRECTORIES = {
    ".git", ".venv", "build", "credentials", "dist", "node_modules", "secrets", "venv",
}


class CodexService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._process_cache: dict[int, psutil.Process] = {}

    def _is_codex(self, process: psutil.Process) -> bool:
        try:
            name = process.name().lower()
            return name in self.settings.codex_names or name.startswith("codex")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return False

    def _find_processes(self) -> list[psutil.Process]:
        processes = []
        for process in psutil.process_iter():
            if self._is_codex(process):
                cached = self._process_cache.get(process.pid)
                if cached is None:
                    cached = psutil.Process(process.pid)
                    cached.cpu_percent(interval=None)
                    self._process_cache[process.pid] = cached
                processes.append(cached)
        active_pids = {process.pid for process in processes}
        self._process_cache = {
            pid: process for pid, process in self._process_cache.items() if pid in active_pids
        }
        return processes

    @staticmethod
    def _idle_status() -> dict[str, Any]:
        return {
            "active": False,
            "state": "idle",
            "pid": None,
            "cpu_percent": 0.0,
            "memory_bytes": 0,
            "started_at": None,
            "uptime_seconds": 0,
            "working_directory": None,
            "last_activity": None,
            "git_repository": None,
            "git_branch": None,
            "recent_files": [],
            "process_count": 0,
        }

    def _workspace(self, process: psutil.Process) -> Path | None:
        try:
            path = Path(process.cwd()).resolve()
            allowed = self.settings.codex_workspace_root.resolve()
            path.relative_to(allowed)
            return path
        except (OSError, ValueError, psutil.AccessDenied, psutil.NoSuchProcess):
            return None

    @staticmethod
    def _git_info(workspace: Path | None) -> tuple[str | None, str | None]:
        if not workspace:
            return None, None
        current = workspace
        while current != current.parent:
            git_dir = current / ".git"
            if git_dir.is_dir():
                try:
                    head = (git_dir / "HEAD").read_text(encoding="utf-8").strip()
                    branch = head.rsplit("/", 1)[-1] if head.startswith("ref:") else head[:12]
                    return str(current), branch
                except OSError:
                    return str(current), None
            current = current.parent
        return None, None

    @staticmethod
    def _recent_files(workspace: Path | None, limit: int = 10) -> list[dict[str, Any]]:
        if not workspace or not workspace.is_dir():
            return []
        recent: list[tuple[float, Path]] = []
        base_depth = len(workspace.parts)
        try:
            for root, directories, files in os.walk(workspace):
                current = Path(root)
                if len(current.parts) - base_depth >= 4:
                    directories[:] = []
                else:
                    directories[:] = [
                        directory
                        for directory in directories
                        if directory not in EXCLUDED_DIRECTORIES and not directory.startswith(".")
                    ]
                for filename in files:
                    path = current / filename
                    if path.suffix.lower() not in SAFE_SUFFIXES or filename.startswith("."):
                        continue
                    try:
                        recent.append((path.stat().st_mtime, path.relative_to(workspace)))
                    except OSError:
                        continue
        except OSError:
            return []
        recent.sort(key=lambda item: item[0], reverse=True)
        return [
            {"path": str(path), "modified_at": datetime.fromtimestamp(mtime, UTC).isoformat()}
            for mtime, path in recent[:limit]
        ]

    def status(self) -> dict[str, Any]:
        processes = self._find_processes()
        if not processes:
            return self._idle_status()

        details = []
        for process in processes:
            try:
                details.append(
                    {
                        "process": process,
                        "cpu": process.cpu_percent(interval=None),
                        "memory": process.memory_info().rss,
                        "created": process.create_time(),
                    }
                )
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        if not details:
            return self._idle_status()

        primary = max(details, key=lambda item: (item["cpu"], item["memory"]))
        process = primary["process"]
        workspace = next(
            (
                candidate
                for item in details
                if (candidate := self._workspace(item["process"])) is not None
            ),
            None,
        )
        repository, branch = self._git_info(workspace)
        recent_files = self._recent_files(workspace)
        last_activity = recent_files[0]["modified_at"] if recent_files else None
        cpu_total = round(sum(item["cpu"] for item in details), 2)
        memory_total = sum(item["memory"] for item in details)
        active = cpu_total >= 0.5 or (
            last_activity is not None
            and time.time() - datetime.fromisoformat(last_activity).timestamp() < 300
        )
        return {
            "active": active,
            "state": "active" if active else "idle",
            "pid": process.pid,
            "cpu_percent": cpu_total,
            "memory_bytes": memory_total,
            "started_at": datetime.fromtimestamp(primary["created"], UTC).isoformat(),
            "uptime_seconds": max(0, int(time.time() - primary["created"])),
            "working_directory": str(workspace) if workspace else None,
            "last_activity": last_activity,
            "git_repository": repository,
            "git_branch": branch,
            "recent_files": recent_files,
            "process_count": len(details),
        }
