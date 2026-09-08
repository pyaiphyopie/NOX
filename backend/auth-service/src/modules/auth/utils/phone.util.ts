/**
 * Normalize Myanmar mobile numbers to E.164 (+95...).
 * Accepts: 09xxxxxxxx, 9xxxxxxxx, +959xxxxxxxx, 959xxxxxxxx
 */
export function normalizeMyanmarPhone(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.startsWith('959') && digits.length >= 11) {
    return `+${digits}`;
  }
  if (digits.startsWith('09') && digits.length >= 10) {
    return `+95${digits.slice(1)}`;
  }
  if (digits.startsWith('9') && digits.length >= 9) {
    return `+95${digits}`;
  }
  if (digits.startsWith('95') && digits.length >= 10) {
    return `+${digits}`;
  }

  return input.startsWith('+') ? input : `+${digits}`;
}
