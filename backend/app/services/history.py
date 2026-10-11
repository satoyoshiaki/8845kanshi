from collections import defaultdict, deque
from datetime import UTC, datetime, timedelta
from threading import Lock
from typing import Any


class HistoryStore:
    def __init__(self, max_points: int = 1800) -> None:
        self._series: dict[str, deque[dict[str, Any]]] = defaultdict(
            lambda: deque(maxlen=max_points)
        )
        self._lock = Lock()

    def append(self, key: str, values: dict[str, Any]) -> None:
        point = {"timestamp": datetime.now(UTC).isoformat(), **values}
        with self._lock:
            self._series[key].append(point)

    def get(self, key: str, minutes: int = 60) -> list[dict[str, Any]]:
        cutoff = datetime.now(UTC) - timedelta(minutes=max(1, min(minutes, 60)))
        with self._lock:
            return [
                point
                for point in self._series.get(key, ())
                if datetime.fromisoformat(point["timestamp"]) >= cutoff
            ]


history_store = HistoryStore()
