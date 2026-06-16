export function jumpToPageTop() {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  /* Use scroll(0,0) with passive guard — the caller MUST remove scroll
   * listeners BEFORE calling this to avoid re-trigger. */
  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
  });
}

/** Safely remove a passive scroll listener. */
export function removeScrollListener(
  handler: (e: Event) => void,
): void {
  window.removeEventListener('scroll', handler);
}
