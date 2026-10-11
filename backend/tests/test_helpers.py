import unittest
from unittest.mock import patch

from app.config import Settings
from app.services.codex import CodexService
from app.services.docker import _cpu_percent, _sum_block_io, _sum_network
from app.services.system import SystemService


class DockerHelperTests(unittest.TestCase):
    def test_cpu_percent_uses_docker_deltas(self) -> None:
        stats = {
            "cpu_stats": {"cpu_usage": {"total_usage": 300}, "system_cpu_usage": 1_500, "online_cpus": 4},
            "precpu_stats": {"cpu_usage": {"total_usage": 100}, "system_cpu_usage": 500},
        }
        self.assertEqual(_cpu_percent(stats), 80.0)

    def test_network_totals_all_interfaces(self) -> None:
        stats = {"networks": {"eth0": {"rx_bytes": 10}, "eth1": {"rx_bytes": 12}}}
        self.assertEqual(_sum_network(stats, "rx_bytes"), 22)

    def test_block_io_is_case_insensitive(self) -> None:
        stats = {"blkio_stats": {"io_service_bytes_recursive": [{"op": "Read", "value": 7}, {"op": "Write", "value": 4}]}}
        self.assertEqual(_sum_block_io(stats, "read"), 7)


class FallbackTests(unittest.TestCase):
    def test_codex_without_processes_returns_idle(self) -> None:
        service = CodexService(Settings())
        with patch.object(service, "_find_processes", return_value=[]):
            status = service.status()
        self.assertFalse(status["active"])
        self.assertEqual(status["state"], "idle")
        self.assertEqual(status["recent_files"], [])

    def test_missing_temperature_sensor_returns_none(self) -> None:
        service = SystemService(Settings())
        with patch("app.services.system.psutil.sensors_temperatures", return_value={}):
            self.assertIsNone(service._temperature())


if __name__ == "__main__":
    unittest.main()
