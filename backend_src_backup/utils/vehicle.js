/**
 * Normalizes and validates a vehicle registration number.
 * Accepts e.g. "lea 1234", "LEB-21-1234", "ABC-123" -> upper-case, single dashes.
 * Rule: 4-12 chars after cleanup, only A-Z / 0-9 / dash, at least one letter and one digit.
 */
function normalizeVehicleNumber(input) {
  const cleaned = String(input ?? '').toUpperCase().trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (cleaned.length < 4 || cleaned.length > 12) return null;
  if (!/^[A-Z0-9-]+$/.test(cleaned)) return null;
  if (!/[A-Z]/.test(cleaned) || !/\d/.test(cleaned)) return null;
  return cleaned;
}
export { normalizeVehicleNumber };
