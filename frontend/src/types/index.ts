export interface CpuMetrics {
  usage_percent: number
  model: string
  physical_cores: number
  logical_cpus: number
  per_core_percent: number[]
  load_average: { '1m': number; '5m': number; '15m': number }
  temperature_celsius: number | null
}

export interface MemoryMetrics {
  total: number
  used: number
  available: number
  usage_percent: number
  swap_total: number
  swap_used: number
  swap_percent: number
}

export interface DiskMetrics {
  mountpoint: string
  total: number
  used: number
  free: number
  usage_percent: number
  read_bytes: number | null
  write_bytes: number | null
  read_bytes_per_second: number
  write_bytes_per_second: number
}

export interface NetworkInterface {
  interface: string
  ipv4: string[]
  ipv6: string[]
  is_up: boolean
  is_bridge: boolean
  rx_bytes: number
  tx_bytes: number
  download_bytes_per_second: number
  upload_bytes_per_second: number
}

export interface SystemInfo {
  hostname: string
  os: string
  kernel: string
  architecture: string
  uptime_seconds: number
  boot_time: string
  cpu_model: string
  ram_total: number
  docker_version: string | null
}

export interface SystemSnapshot {
  timestamp: string
  cpu: CpuMetrics
  memory: MemoryMetrics
  disks: DiskMetrics[]
  network: NetworkInterface[]
  info: SystemInfo
}

export interface DockerNetwork {
  name: string
  ip_address: string | null
}

export interface PortMapping {
  container: string
  host_ip: string | null
  host_port: string | null
}

export interface ContainerMetrics {
  id: string
  short_id: string
  name: string
  image: string
  status: string
  health: string | null
  created: string | null
  started: string | null
  uptime_seconds: number
  restart_count: number
  cpu_percent: number
  memory_usage: number
  memory_limit: number
  memory_percent: number
  network_rx: number
  network_tx: number
  block_read: number
  block_write: number
  networks: DockerNetwork[]
  ports: PortMapping[]
}

export interface DockerResponse {
  available: boolean
  containers: ContainerMetrics[]
  error: string | null
}

export interface MinecraftStatus {
  timestamp: string
  online: boolean
  host: string
  port: number
  version: string | null
  motd: string | null
  latency_ms: number | null
  players_online: number
  players_max: number
  player_names: string[] | null
  player_list_available: boolean
  error: string | null
  container: ContainerMetrics | null
}

export interface RecentFile {
  path: string
  modified_at: string
}

export interface CodexStatus {
  active: boolean
  state: 'active' | 'idle'
  pid: number | null
  cpu_percent: number
  memory_bytes: number
  started_at: string | null
  uptime_seconds: number
  working_directory: string | null
  last_activity: string | null
  git_repository: string | null
  git_branch: string | null
  recent_files: RecentFile[]
  process_count: number
  error?: string
}

export interface DashboardResponse {
  system: SystemSnapshot | null
  docker: DockerResponse
  minecraft: MinecraftStatus
  codex: CodexStatus
}

export interface HistoryPoint {
  timestamp: string
  cpu_percent?: number
  memory_percent?: number
  memory_bytes?: number
  memory_usage?: number
  rx_bytes_per_second?: number
  tx_bytes_per_second?: number
}
