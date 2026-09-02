'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncButton({ sourceId }: { sourceId: string }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'syncing' | 'error'>('idle')

  async function sync(): Promise<void> {
    setState('syncing')
    const response = await fetch('/api/plaid/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId }),
    })
    if (!response.ok) {
      setState('error')
      return
    }
    setState('idle')
    router.refresh()
  }

  return (
    <button
      type="button"
      disabled={state === 'syncing'}
      onClick={() => void sync()}
      className="rounded-md border border-ink-700 px-3 py-1 text-xs font-medium text-ink-300 transition hover:border-ink-500 disabled:opacity-50"
    >
      {state === 'syncing' ? 'Syncing…' : state === 'error' ? 'Retry sync' : 'Sync now'}
    </button>
  )
}
