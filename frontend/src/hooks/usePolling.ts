import { useCallback, useEffect, useRef, useState } from 'react'

import { fetchJson } from '../api/client'

export function usePolling<T>(path: string, intervalMs: number) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const controllerRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    try {
      const result = await fetchJson<T>(path, controller.signal)
      setData(result)
      setError(null)
    } catch (requestError) {
      if ((requestError as Error).name !== 'AbortError') {
        setError((requestError as Error).message)
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [path])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), intervalMs)
    return () => {
      window.clearInterval(timer)
      controllerRef.current?.abort()
    }
  }, [intervalMs, refresh])

  return { data, error, loading, refresh }
}
