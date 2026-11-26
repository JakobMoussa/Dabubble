const RETRY_DELAY_MS = 100;
const MAX_TRIES = 20;


/** Focuses the element with the given id as soon as it is rendered, retrying for up to two seconds. */
export function focusWhenReady(id: string, triesLeft = MAX_TRIES): void {
  setTimeout(() => {
    const element = document.getElementById(id);
    if (element) element.focus();
    else if (triesLeft > 1) focusWhenReady(id, triesLeft - 1);
  }, RETRY_DELAY_MS);
}
