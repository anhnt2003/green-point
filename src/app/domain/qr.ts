/** QR payload shown on the citizen's screen 05 and scanned by the collection-point staff. */
const PREFIX = 'GREENPOINT:'

export const qrPayload = (code: string) => `${PREFIX}${code}`

/**
 * Extracts a transaction code from a scanned QR or a code typed by hand.
 * Accepts "GREENPOINT:GP256789", "GP256789" and "#gp256789". Returns null otherwise.
 */
export function parseTransactionCode(text: string): string | null {
  const match = /^(?:GREENPOINT:)?#?(GP\d{6,})$/i.exec(text.trim())
  return match ? match[1].toUpperCase() : null
}
