/** Avatars offered at sign-up and in the profile (from Figma "00c. Characters"). */
export const AVATAR_OPTIONS: readonly string[] = [
  'assets/img/elias-neumann.png',
  'assets/img/elise-roth.png',
  'assets/img/frederik-beck.png',
  'assets/img/noah-braun.png',
  'assets/img/sofia-mueller.png',
  'assets/img/steffen-hoffmann.png'
];

/** Older profiles stored avatar files with spaces/umlauts in the name; map them to the current files. */
export function resolveAvatar(path: string | null | undefined, fallback: string): string {
  if (!path) {
    return fallback;
  }
  const legacy = /^assets\/img\/([^/]+)\.png$/.exec(path);
  if (!legacy || !/[\sA-ZÄÖÜäöüß]/.test(legacy[1])) {
    return path;
  }
  const slug = legacy[1].toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '-');
  return `assets/img/${slug}.png`;
}
