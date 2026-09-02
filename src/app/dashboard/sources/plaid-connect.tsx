'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlaidLink } from 'react-plaid-link'

type State =
  | { step: 'idle' }
  | { step: 'loading' }
  | { step: 'ready'; linkToken: string }
  | { step: 'syncing' }
  | { step: 'done'; imported: number }
  | { step: 'error'; message: string }

export function PlaidConnect() {
  const router = useRouter()
  const [state, setState] = useState<State>({ step: 'idle' })

  async function begin(): Promise<void> {
    setState({ step: 'loading' })
    const response = await fetch('/api/plaid/link-token', { method: 'POST' })
    const payload = (await response.json()) as { linkToken?: string; error?: string }
    if (!response.ok || !payload.linkToken) {
      setState({ step: 'error', message: payload.error ?? 'Could not start Plaid Link.' })
      return
    }
    setState({ step: 'ready', linkToken: payload.linkToken })
  }

  if (state.step === 'ready') {
    return (
      <PlaidLauncher
        linkToken={state.linkToken}
        onExit={() => setState({ step: 'idle' })}
        onSuccess={async (publicToken, institutionName) => {
          setState({ step: 'syncing' })
          const response = await fetch('/api/plaid/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicToken, institutionName }),
          })
          const payload = (await response.json()) as {
            importedTransactions?: number
            error?: string
          }
          if (!response.ok) {
            setState({ step: 'error', message: payload.error ?? 'Connection failed.' })
            return
          }
          setState({ step: 'done', imported: payload.importedTransactions ?? 0 })
          router.refresh()
        }}
      />
    )
  }

  return (
    <div>
      {state.step === 'error' && (
        <p className="mb-2 text-sm text-flame">{state.message}</p>
      )}
      {state.step === 'done' ? (
        <p className="text-sm text-savings">
          Bank connected — {state.imported} transactions imported and audited.
        </p>
      ) : (
        <button
          type="button"
          disabled={state.step === 'loading' || state.step === 'syncing'}
          onClick={() => void begin()}
          className="rounded-lg border border-ink-700 px-5 py-2.5 font-semibold text-ink-200 transition hover:border-ink-500 disabled:opacity-50"
        >
          {state.step === 'syncing'
            ? 'Importing transactions…'
            : state.step === 'loading'
              ? 'Starting…'
              : 'Connect a bank with Plaid'}
        </button>
      )}
    </div>
  )
}

function PlaidLauncher({
  linkToken,
  onSuccess,
  onExit,
}: {
  linkToken: string
  onSuccess: (publicToken: string, institutionName: string) => void
  onExit: () => void
}) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: useCallback(
      (publicToken: string, metadata: { institution?: { name?: string } | null }) => {
        onSuccess(publicToken, metadata.institution?.name ?? 'Bank account')
      },
      [onSuccess],
    ),
    onExit,
  })

  if (ready) open()
  return <p className="text-sm text-ink-400">Opening Plaid Link…</p>
}
