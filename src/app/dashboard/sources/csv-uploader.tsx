'use client'

import Papa from 'papaparse'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  detectBankFormat,
  suggestMapping,
  type AmountConvention,
  type ColumnMapping,
  type CsvRow,
} from '@/lib/sources/csv'

interface ParsedFile {
  fileName: string
  headers: string[]
  rows: CsvRow[]
  bankLabel: string | null
  mapping: ColumnMapping
}

interface ImportSummary {
  importedTransactions: number
  duplicatesSkipped: number
  subscriptions: number
  openFlags: number
}

type UploadState =
  | { step: 'idle' }
  | { step: 'mapping'; file: ParsedFile }
  | { step: 'submitting'; file: ParsedFile }
  | { step: 'done'; summary: ImportSummary }
  | { step: 'error'; message: string }

const EMPTY_MAPPING: ColumnMapping = {
  dateColumn: '',
  descriptionColumn: '',
  amountColumn: '',
  amountConvention: 'NEGATIVE_IS_CHARGE',
}

export function CsvUploader() {
  const router = useRouter()
  const [state, setState] = useState<UploadState>({ step: 'idle' })
  const [label, setLabel] = useState('')

  function handleFile(file: File | undefined): void {
    if (!file) return
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? []
        if (headers.length === 0 || result.data.length === 0) {
          setState({ step: 'error', message: 'That file has no parseable rows.' })
          return
        }
        const bank = detectBankFormat(headers)
        const mapping = bank?.mapping ?? suggestMapping(headers) ?? EMPTY_MAPPING
        setLabel(file.name.replace(/\.csv$/i, ''))
        setState({
          step: 'mapping',
          file: {
            fileName: file.name,
            headers,
            rows: result.data,
            bankLabel: bank?.label ?? null,
            mapping,
          },
        })
      },
      error: () =>
        setState({ step: 'error', message: 'Could not parse that CSV file.' }),
    })
  }

  async function submit(file: ParsedFile): Promise<void> {
    setState({ step: 'submitting', file })
    try {
      const response = await fetch('/api/sources/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label || file.fileName,
          mapping: file.mapping,
          rows: file.rows,
        }),
      })
      const payload = (await response.json()) as ImportSummary & { error?: string }
      if (!response.ok) {
        setState({ step: 'error', message: payload.error ?? 'Import failed.' })
        return
      }
      setState({ step: 'done', summary: payload })
      router.refresh()
    } catch {
      setState({ step: 'error', message: 'Network error during import.' })
    }
  }

  if (state.step === 'idle' || state.step === 'error') {
    return (
      <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900/50 p-8 text-center">
        {state.step === 'error' && (
          <p className="mb-4 text-sm text-flame">{state.message}</p>
        )}
        <p className="font-semibold">Upload a statement CSV</p>
        <p className="mt-1 text-sm text-ink-400">
          Chase, Amex, Bank of America, Mercury, Brex, and Ramp exports are
          auto-detected. Anything else: map the columns yourself.
        </p>
        <label className="mt-4 inline-block cursor-pointer rounded-lg bg-savings px-5 py-2.5 font-semibold text-ink-950 transition hover:bg-savings-glow">
          Choose file
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
    )
  }

  if (state.step === 'done') {
    return (
      <div className="rounded-xl border border-savings/40 bg-ink-900 p-6">
        <p className="font-semibold text-savings">Import complete</p>
        <ul className="mt-2 space-y-1 text-sm text-ink-200">
          <li>
            {state.summary.importedTransactions} new transactions imported
            {state.summary.duplicatesSkipped > 0 &&
              ` (${state.summary.duplicatesSkipped} duplicates skipped — re-uploads are free)`}
          </li>
          <li>{state.summary.subscriptions} subscriptions detected</li>
          <li>{state.summary.openFlags} open flags waiting in review</li>
        </ul>
        <button
          type="button"
          onClick={() => setState({ step: 'idle' })}
          className="mt-4 rounded-lg border border-ink-700 px-4 py-2 text-sm font-semibold text-ink-200 transition hover:border-ink-500"
        >
          Upload another
        </button>
      </div>
    )
  }

  const { file } = state
  const submitting = state.step === 'submitting'
  return (
    <MappingForm
      file={file}
      label={label}
      submitting={submitting}
      onLabelChange={setLabel}
      onMappingChange={(mapping) =>
        setState({ step: 'mapping', file: { ...file, mapping } })
      }
      onCancel={() => setState({ step: 'idle' })}
      onSubmit={() => void submit(file)}
    />
  )
}

function MappingForm({
  file,
  label,
  submitting,
  onLabelChange,
  onMappingChange,
  onCancel,
  onSubmit,
}: {
  file: ParsedFile
  label: string
  submitting: boolean
  onLabelChange: (label: string) => void
  onMappingChange: (mapping: ColumnMapping) => void
  onCancel: () => void
  onSubmit: () => void
}) {
  const { mapping } = file
  const ready =
    mapping.dateColumn !== '' &&
    mapping.descriptionColumn !== '' &&
    mapping.amountColumn !== ''

  const preview = useMemo(() => file.rows.slice(0, 5), [file.rows])

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-semibold">{file.fileName}</p>
        <span className="rounded-full bg-ink-800 px-2 py-0.5 text-xs text-ink-300">
          {file.rows.length} rows
        </span>
        {file.bankLabel ? (
          <span className="rounded-full bg-savings/15 px-2 py-0.5 text-xs font-medium text-savings">
            {file.bankLabel} format detected
          </span>
        ) : (
          <span className="rounded-full bg-flame/15 px-2 py-0.5 text-xs font-medium text-flame">
            Unknown format — map the columns below
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Source label">
          <input
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm"
            placeholder="Chase Business ····4821"
          />
        </Field>
        <ColumnSelect
          label="Date column"
          headers={file.headers}
          value={mapping.dateColumn}
          onChange={(dateColumn) => onMappingChange({ ...mapping, dateColumn })}
        />
        <ColumnSelect
          label="Description column"
          headers={file.headers}
          value={mapping.descriptionColumn}
          onChange={(descriptionColumn) =>
            onMappingChange({ ...mapping, descriptionColumn })
          }
        />
        <ColumnSelect
          label="Amount column"
          headers={file.headers}
          value={mapping.amountColumn}
          onChange={(amountColumn) => onMappingChange({ ...mapping, amountColumn })}
        />
        <Field label="Charges are…">
          <select
            value={mapping.amountConvention}
            onChange={(e) =>
              onMappingChange({
                ...mapping,
                amountConvention: e.target.value as AmountConvention,
              })
            }
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm"
          >
            <option value="NEGATIVE_IS_CHARGE">Negative amounts</option>
            <option value="POSITIVE_IS_CHARGE">Positive amounts</option>
          </select>
        </Field>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-ink-800">
        <table className="w-full text-xs">
          <thead className="bg-ink-950 text-left text-ink-400">
            <tr>
              {file.headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-3 py-2 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="border-t border-ink-800 text-ink-200">
                {file.headers.map((header) => (
                  <td key={header} className="whitespace-nowrap px-3 py-2">
                    {row[header] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          disabled={!ready || submitting}
          onClick={onSubmit}
          className="rounded-lg bg-savings px-5 py-2.5 font-semibold text-ink-950 transition hover:bg-savings-glow disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Importing…' : `Import ${file.rows.length} rows`}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onCancel}
          className="rounded-lg border border-ink-700 px-5 py-2.5 font-semibold text-ink-200 transition hover:border-ink-500"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-400">{label}</span>
      {children}
    </label>
  )
}

function ColumnSelect({
  label,
  headers,
  value,
  onChange,
}: {
  label: string
  headers: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm"
      >
        <option value="">— pick a column —</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </Field>
  )
}
