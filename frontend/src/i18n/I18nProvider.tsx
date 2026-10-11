import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Locale = 'ja' | 'en'

const STORAGE_KEY = '8845kanshi.locale'

const japanese: Record<string, string> = {
  'Overview': '概要',
  'Monitoring': 'モニタリング',
  'Docker': 'Docker',
  'Minecraft': 'Minecraft',
  'Codex': 'Codex',
  'Network': 'ネットワーク',
  'System': 'システム',
  'Settings': '設定',
  'Server': 'サーバー',
  'Infrastructure Overview': 'インフラ概要',
  'Host Monitoring': 'ホスト監視',
  'Docker Fleet': 'Dockerコンテナ',
  'Minecraft Server': 'Minecraftサーバー',
  'Codex Activity': 'Codexアクティビティ',
  'Network Interfaces': 'ネットワークインターフェース',
  'System Information': 'システム情報',
  'Dashboard Settings': 'ダッシュボード設定',
  'Container Detail': 'コンテナ詳細',
  'Server Infrastructure': 'サーバーインフラ',
  'Live telemetry': 'ライブ監視中',
  'Open menu': 'メニューを開く',
  'Close menu': 'メニューを閉じる',
  'Close navigation': 'ナビゲーションを閉じる',
  'Refresh dashboard': 'ダッシュボードを更新',
  'Switch to English': '英語へ切り替え',
  'Switch to Japanese': '日本語へ切り替え',
  'Monitor only': '監視専用',
  'Read-only telemetry. No terminal or container controls.': '読み取り専用の監視画面です。ターミナルやコンテナ操作は提供しません。',
  'Retry': '再試行',
  'Host': 'ホスト',
  'Online': 'オンライン',
  'Offline': 'オフライン',
  'Healthy': '正常',
  'Unavailable': '取得不可',
  'Active': '稼働中',
  'Idle': '待機中',
  'Running': '稼働中',
  'Stopped': '停止中',
  'Up': '稼働',
  'Down': '停止',
  'running': '稼働中',
  'stopped': '停止中',
  'healthy': '正常',
  'Unhealthy': '異常',
  'Starting': '起動中',
  'Restarting': '再起動中',
  'Exited': '終了',
  'Paused': '一時停止',
  'Dead': '停止',
  'Created state': '作成済み',
  'No host telemetry': 'ホスト情報なし',
  'Server did not respond': 'サーバーから応答がありません',
  'No active workspace': '作業中のワークスペースなし',
  'Dashboard data unavailable': 'ダッシュボード情報を取得できません',
  'Memory': 'メモリ',
  'Disk': 'ディスク',
  'Host Utilization': 'ホスト使用状況',
  'Realtime // 5 minutes': 'リアルタイム // 5分',
  'Network Throughput': 'ネットワーク通信量',
  'Aggregate // 5 minutes': '合計 // 5分',
  'Download': 'ダウンロード',
  'Upload': 'アップロード',
  'Container telemetry': 'コンテナ監視情報',
  'View all': 'すべて表示',
  'Container': 'コンテナ',
  'State': '状態',
  'Status': '状態',
  'Service Focus': 'サービス状況',
  'Players': 'プレイヤー',
  'Latency': '応答時間',
  'System telemetry unavailable': 'システム監視情報を取得できません',
  'CPU usage': 'CPU使用率',
  'Temperature': '温度',
  'CPU package sensor': 'CPUパッケージセンサー',
  'Load average': 'ロードアベレージ',
  'CPU & Memory History': 'CPU・メモリ履歴',
  'Host telemetry // 15 minutes': 'ホスト監視 // 15分',
  'Logical CPU Cores': '論理CPUコア',
  'processors': 'プロセッサ',
  'cores': 'コア',
  'threads': 'スレッド',
  'Memory & Swap': 'メモリ・スワップ',
  'Allocation': '割り当て状況',
  'Swap': 'スワップ',
  'Storage': 'ストレージ',
  'Mounted volumes': 'マウント済みボリューム',
  'Used': '使用済み',
  'Free': '空き',
  'Read': '読み込み',
  'Write': '書き込み',
  'Docker unavailable': 'Docker情報を取得できません',
  'Containers': 'コンテナ数',
  'Total discovered': '検出された合計',
  'Aggregate CPU': '合計CPU',
  'Running containers': '稼働中コンテナ',
  'Container Inventory': 'コンテナ一覧',
  'Docker Engine': 'Docker Engine',
  'Filter containers': 'コンテナを検索',
  'Uptime': '稼働時間',
  'Network I/O': 'ネットワークI/O',
  'Block I/O': 'ブロックI/O',
  'No containers match this filter.': '条件に一致するコンテナはありません。',
  'Container unavailable': 'コンテナ情報を取得できません',
  'Back to containers': 'コンテナ一覧へ戻る',
  'Current usage': '現在の使用率',
  'Restarts': '再起動回数',
  'Started': '開始日時',
  'Resource History': 'リソース履歴',
  'Container Metadata': 'コンテナメタデータ',
  'Runtime identity': '実行環境情報',
  'Container ID': 'コンテナID',
  'Image': 'イメージ',
  'Created': '作成日時',
  'Block Read': 'ブロック読込',
  'Block Write': 'ブロック書込',
  'Network & Ports': 'ネットワーク・ポート',
  'Read-only inspection': '読み取り専用情報',
  'No IP': 'IPなし',
  'No published ports.': '公開ポートはありません。',
  'Minecraft telemetry unavailable': 'Minecraft監視情報を取得できません',
  'Version unavailable': 'バージョン取得不可',
  'Minecraft is offline or unreachable. The dashboard and all other monitors remain operational.': 'Minecraftは停止中、または到達できません。他の監視機能は引き続き動作しています。',
  'Player sample available': 'プレイヤー一覧を取得済み',
  'Player list unavailable': 'プレイヤー一覧を取得できません',
  'Ping': 'Ping',
  'Server list latency': 'サーバー応答時間',
  'Version': 'バージョン',
  'Reported by server': 'サーバー報告値',
  'Container not found': 'コンテナが見つかりません',
  'Online Players': 'オンラインプレイヤー',
  'connected': '接続中',
  'No players online': 'オンラインのプレイヤーはいません',
  'Minecraft Resources': 'Minecraftリソース',
  'Docker container telemetry': 'Dockerコンテナ監視情報',
  'Network RX': 'ネットワーク受信',
  'Network TX': 'ネットワーク送信',
  'Minecraft container telemetry is unavailable.': 'Minecraftコンテナの監視情報を取得できません。',
  'Set MINECRAFT_CONTAINER_NAME to the actual container name.': 'MINECRAFT_CONTAINER_NAMEに実際のコンテナ名を設定してください。',
  'Codex telemetry unavailable': 'Codex監視情報を取得できません',
  'OS-observable process telemetry only · no prompts or content': 'OSから観測できるプロセス情報のみ・プロンプトや内容は取得しません',
  'processes': 'プロセス',
  'Codex process aggregate': 'Codexプロセス合計',
  'Resident memory': '常駐メモリ',
  'Last activity': '最終アクティビティ',
  'Branch': 'ブランチ',
  'No Git repository': 'Gitリポジトリなし',
  'Codex Resource History': 'Codexリソース履歴',
  '15 minutes': '15分',
  'Workspace': 'ワークスペース',
  'Sanitized process context': '安全化されたプロセス情報',
  'Working directory': '作業ディレクトリ',
  'Git repository': 'Gitリポジトリ',
  'Current branch': '現在のブランチ',
  'Recent Activity': '最近のアクティビティ',
  'File metadata only': 'ファイルメタデータのみ',
  'Content is never read or returned': 'ファイル内容は読み取りも返却もしません',
  'No recent source file metadata available.': '最近更新されたソースファイル情報はありません。',
  'Network telemetry unavailable': 'ネットワーク監視情報を取得できません',
  'Aggregate throughput': '合計スループット',
  'Interfaces': 'インターフェース',
  'Total traffic': '総通信量',
  'RX + TX counters': '受信・送信カウンター',
  'Host network stack': 'ホストネットワーク',
  'Show Docker bridges': 'Dockerブリッジを表示',
  'Docker bridge': 'Dockerブリッジ',
  'System information unavailable': 'システム情報を取得できません',
  'Hostname': 'ホスト名',
  'Operating system': 'OS',
  'Kernel': 'カーネル',
  'Architecture': 'アーキテクチャ',
  'Processor': 'プロセッサ',
  'CPU topology': 'CPU構成',
  'physical': '物理',
  'logical': '論理',
  'Installed RAM': '搭載メモリ',
  'Boot time': '起動日時',
  'System Identity': 'システム識別情報',
  'Host Information': 'ホスト情報',
  'Read-only inventory': '読み取り専用インベントリ',
  'Mounted Storage': 'マウント済みストレージ',
  'Usage summary': '使用状況',
  'used': '使用済み',
  'free': '空き',
  'total': '合計',
  'Language': '言語',
  'Display language': '表示言語',
  'Japanese': '日本語',
  'English': '英語',
  'Language preference is saved in this browser.': '言語設定はこのブラウザに保存されます。',
  'Security posture': 'セキュリティ方針',
  'Monitor-only by design': '監視専用として設計',
  'This interface does not expose control actions, shells, or file content.': 'この画面は操作機能、シェル、ファイル内容を公開しません。',
  'Refresh Intervals': '更新間隔',
  'Configured by environment': '環境変数で設定',
  'System / Network': 'システム / ネットワーク',
  'seconds': '秒',
  'Data Boundaries': 'データ取得範囲',
  'What the API can observe': 'APIが取得できる情報',
  'Metrics only': 'メトリクスのみ',
  'Host counters, container metadata, Minecraft status, and process resource usage.': 'ホスト統計、コンテナメタデータ、Minecraft状態、プロセスのリソース使用量を取得します。',
  'Secrets excluded': '秘密情報を除外',
  'Environment variables, command lines, tokens, cookies, keys, and file contents are never returned.': '環境変数、コマンドライン、トークン、Cookie、鍵、ファイル内容は返却しません。',
  'No mutations': '変更操作なし',
  'Docker write APIs are disabled by the socket proxy. No exec, stop, restart, or delete endpoints exist.': 'ソケットプロキシでDocker書込APIを無効化し、exec・停止・再起動・削除APIも実装していません。',
  'Configuration': '設定項目',
  'Environment variables': '環境変数',
  'Variable': '変数',
  'Purpose': '用途',
  'Minecraft Java server address': 'Minecraft Javaサーバーのアドレス',
  'Minecraft Java server port': 'Minecraft Javaサーバーのポート',
  'Container name used for resource telemetry': 'リソース監視に使用するコンテナ名',
  'Only workspace tree eligible for metadata scanning': 'メタデータ走査を許可するワークスペース範囲',
  'Comma-separated host mount points': 'カンマ区切りのホストマウントポイント',
  'Published dashboard ports': '公開するダッシュボードポート',
}

type I18nValue = string | number
type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (message: string, values?: Record<string, I18nValue>) => string
  status: (value: string | null | undefined) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'ja'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved === 'en' || saved === 'ja' ? saved : 'ja'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
    document.title = locale === 'ja' ? '8845 KANSHI | サーバー監視' : '8845 KANSHI | Server Monitoring'
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    const t = (message: string, values?: Record<string, I18nValue>) => {
      let translated = locale === 'ja' ? (japanese[message] ?? message) : message
      for (const [key, replacement] of Object.entries(values ?? {})) {
        translated = translated.replaceAll(`{${key}}`, String(replacement))
      }
      return translated
    }
    return {
      locale,
      setLocale,
      toggleLocale: () => setLocale((current) => current === 'ja' ? 'en' : 'ja'),
      t,
      status: (statusValue) => {
        if (!statusValue) return t('Unavailable')
        const normalized = statusValue.charAt(0).toUpperCase() + statusValue.slice(1).toLowerCase()
        return t(normalized === 'Created' ? 'Created state' : normalized)
      },
    }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
