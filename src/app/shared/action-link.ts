/**
 * Firebase e-mail action links open the app as `/?mode=resetPassword&oobCode=…`.
 * With hash routing those query params sit outside the router, so they are moved
 * into the hash route before Angular boots. Runs once, without side effects otherwise.
 */
export function routeFirebaseActionLink(): void {
  const params = new URLSearchParams(window.location.search);
  const oobCode = params.get('oobCode');
  if (params.get('mode') !== 'resetPassword' || !oobCode) {
    return;
  }
  const target = `${window.location.pathname}#/reset-password?oobCode=${encodeURIComponent(oobCode)}`;
  window.history.replaceState(null, '', target);
}
