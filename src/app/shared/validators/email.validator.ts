/**
 * Email rules from the DABubble checklist:
 * - leading/trailing whitespace is removed before checking
 * - exactly one "@", no whitespace anywhere
 * - local part: letters, digits and special characters, no empty dot segments
 * - domain: dot separated labels without empty parts, TLD with >= 2 letters
 */
const EMAIL_PATTERN = /^[^\s@.]+(?:\.[^\s@.]+)*@(?:[\p{L}\d](?:[\p{L}\d-]*[\p{L}\d])?\.)+\p{L}{2,}$/u;


/** Trims and lowercases an email address. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}


/** Checks the email against the validation pattern. */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
