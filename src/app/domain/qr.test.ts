import { describe, expect, it } from 'vitest'
import { parseTransactionCode, qrPayload } from './qr'

describe('transaction QR', () => {
  it('encodes the code with an app prefix', () => {
    expect(qrPayload('GP256789')).toBe('GREENPOINT:GP256789')
  })

  it('reads the code back from a scanned QR', () => {
    expect(parseTransactionCode(qrPayload('GP256789'))).toBe('GP256789')
  })

  it('accepts a code typed by hand, with or without #, in any case', () => {
    expect(parseTransactionCode(' #gp256789 ')).toBe('GP256789')
    expect(parseTransactionCode('GP256789')).toBe('GP256789')
  })

  it('ignores QR codes that are not GreenPoint transactions', () => {
    expect(parseTransactionCode('https://example.com')).toBeNull()
    expect(parseTransactionCode('GP12')).toBeNull()
    expect(parseTransactionCode('')).toBeNull()
  })
})
