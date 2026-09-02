import { describe, expect, it } from 'vitest'
import {
  detectBankFormat,
  parseStatementDate,
  parseStatementRows,
  suggestMapping,
} from '../csv'

describe('detectBankFormat', () => {
  it('detects Chase card exports', () => {
    const format = detectBankFormat([
      'Transaction Date', 'Post Date', 'Description', 'Category', 'Type', 'Amount', 'Memo',
    ])
    expect(format?.id).toBe('chase-card')
    expect(format?.mapping.amountConvention).toBe('NEGATIVE_IS_CHARGE')
  })

  it('detects Bank of America before falling through to Amex', () => {
    const format = detectBankFormat(['Date', 'Description', 'Amount', 'Running Bal.'])
    expect(format?.id).toBe('boa')
  })

  it('detects Amex (positive charges)', () => {
    const format = detectBankFormat(['Date', 'Description', 'Amount'])
    expect(format?.id).toBe('amex')
    expect(format?.mapping.amountConvention).toBe('POSITIVE_IS_CHARGE')
  })

  it('detects Mercury, Brex, and Ramp', () => {
    expect(detectBankFormat(['Date (UTC)', 'Description', 'Amount', 'Status'])?.id).toBe('mercury')
    expect(detectBankFormat(['Purchase Date', 'Merchant Name', 'Amount'])?.id).toBe('brex')
    expect(detectBankFormat(['Transaction Date', 'Merchant Name', 'Amount'])?.id).toBe('ramp')
  })

  it('returns null for unknown exports', () => {
    expect(detectBankFormat(['Foo', 'Bar'])).toBeNull()
  })
})

describe('suggestMapping', () => {
  it('maps common header aliases', () => {
    const mapping = suggestMapping(['Posted Date', 'Payee', 'Debit'])
    expect(mapping).toEqual({
      dateColumn: 'Posted Date',
      descriptionColumn: 'Payee',
      amountColumn: 'Debit',
      amountConvention: 'NEGATIVE_IS_CHARGE',
    })
  })

  it('returns null when a required column is missing', () => {
    expect(suggestMapping(['Date', 'Amount'])).toBeNull()
  })
})

describe('parseStatementDate', () => {
  it('parses ISO and US formats', () => {
    expect(parseStatementDate('2026-03-15')?.toISOString()).toBe('2026-03-15T00:00:00.000Z')
    expect(parseStatementDate('03/15/2026')?.toISOString()).toBe('2026-03-15T00:00:00.000Z')
    expect(parseStatementDate('3/5/26')?.toISOString()).toBe('2026-03-05T00:00:00.000Z')
  })

  it('rejects garbage', () => {
    expect(parseStatementDate('15th of March')).toBeNull()
    expect(parseStatementDate('13/45/2026')).toBeNull()
  })
})

describe('parseStatementRows', () => {
  const chaseMapping = {
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    amountConvention: 'NEGATIVE_IS_CHARGE',
  } as const

  it('flips Chase-style negative charges into positive spend', () => {
    const { transactions, errors } = parseStatementRows(
      [
        { 'Transaction Date': '01/15/2026', Description: 'GITHUB* INC', Amount: '-44.00' },
        { 'Transaction Date': '01/20/2026', Description: 'REFUND ACME', Amount: '25.00' },
      ],
      chaseMapping,
    )
    expect(errors).toHaveLength(0)
    expect(transactions[0]!.amountCents).toBe(4400)
    // credit stays negative so detection ignores it
    expect(transactions[1]!.amountCents).toBe(-2500)
  })

  it('keeps Amex-style positive charges positive', () => {
    const { transactions } = parseStatementRows(
      [{ Date: '2026-01-15', Description: 'SLACK', Amount: '87.50' }],
      { dateColumn: 'Date', descriptionColumn: 'Description', amountColumn: 'Amount', amountConvention: 'POSITIVE_IS_CHARGE' },
    )
    expect(transactions[0]!.amountCents).toBe(8750)
  })

  it('handles parenthesized negatives and $ signs', () => {
    const { transactions } = parseStatementRows(
      [{ 'Transaction Date': '01/15/2026', Description: 'ZOOM.US', Amount: '($15.99)' }],
      chaseMapping,
    )
    expect(transactions[0]!.amountCents).toBe(1599)
  })

  it('skips and reports bad rows without failing the batch', () => {
    const { transactions, errors } = parseStatementRows(
      [
        { 'Transaction Date': 'not a date', Description: 'X', Amount: '-1.00' },
        { 'Transaction Date': '01/15/2026', Description: 'Y', Amount: 'abc' },
        { 'Transaction Date': '01/16/2026', Description: 'GOOD ROW', Amount: '-2.00' },
      ],
      chaseMapping,
    )
    expect(transactions).toHaveLength(1)
    expect(transactions[0]!.rawDescription).toBe('GOOD ROW')
    expect(errors).toHaveLength(2)
  })
})
