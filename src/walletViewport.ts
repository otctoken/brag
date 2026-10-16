// Wallet popups can restore focus to the page header. Keep the table in view,
// but never undo an intentional scroll or navigation by the player.
export function preserveWalletViewport() {
  const left = window.scrollX, top = window.scrollY;
  let frame = 0, stopped = false;
  const cancel = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchmove', cancel);
    window.removeEventListener('keydown', onKey);
  };
  const onKey = (event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab'].includes(event.key)) cancel();
  };
  const restoreSoon = (finish = false) => {
    if (stopped) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!stopped) window.scrollTo({ left, top, behavior: 'instant' });
        if (finish) cancel();
      });
    });
  };
  // Use a wrapper so a FocusEvent is not mistaken for the finish flag.
  const onFocus = () => restoreSoon();
  window.addEventListener('focus', onFocus);
  window.addEventListener('wheel', cancel, { passive: true });
  window.addEventListener('touchmove', cancel, { passive: true });
  window.addEventListener('keydown', onKey);
  return {
    finish: () => { window.removeEventListener('focus', onFocus); restoreSoon(true); },
    cancel: () => { window.removeEventListener('focus', onFocus); cancel(); },
  };
}
