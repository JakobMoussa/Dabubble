const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': '*Diese E-Mail-Adresse wird bereits verwendet.',
  'auth/invalid-email': '*Diese E-Mail-Adresse ist leider ungültig.',
  'auth/weak-password': '*Das Passwort muss mindestens 8 Zeichen lang sein.',
  'auth/invalid-credential': '*Falsches Passwort oder E-Mail. Bitte noch einmal versuchen.',
  'auth/user-not-found': '*Zu dieser E-Mail-Adresse gibt es kein Konto.',
  'auth/too-many-requests': '*Zu viele Versuche. Bitte warte kurz und versuche es erneut.',
  'auth/popup-closed-by-user': '*Die Google-Anmeldung wurde abgebrochen.',
  'auth/expired-action-code': '*Der Link ist abgelaufen. Bitte fordere einen neuen an.',
  'auth/invalid-action-code': '*Der Link ist ungültig. Bitte fordere einen neuen an.'
};

const FALLBACK = '*Etwas ist schiefgelaufen. Bitte versuche es erneut.';


/** Maps a Firebase auth error to a user friendly German message. */
export function toAuthMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  return MESSAGES[code] ?? FALLBACK;
}
