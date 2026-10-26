export {};

const toggles = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');
function syncThemeButtons() {
  const dark = document.documentElement.dataset.theme === 'dark';
  for (const button of toggles) {
    button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    button.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  }
}
for (const button of toggles) {
  button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ol-theme', theme);
    } catch {
      /* Session-only preference. */
    }
    syncThemeButtons();
  });
}
syncThemeButtons();
window.addEventListener('pageshow', syncThemeButtons);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  try {
    if (localStorage.getItem('ol-theme')) return;
  } catch {
    /* Follow the system. */
  }
  document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
  syncThemeButtons();
});

for (const disclosure of document.querySelectorAll<HTMLDetailsElement>('[data-disclosure]')) {
  const summary = disclosure.querySelector('summary');
  document.addEventListener('click', (event) => {
    if (event.target instanceof Node && !disclosure.contains(event.target)) disclosure.open = false;
  });
  disclosure.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      disclosure.open = false;
      summary?.focus();
    }
  });
  for (const link of disclosure.querySelectorAll('a')) {
    link.addEventListener('click', () => {
      disclosure.open = false;
    });
  }
}

const copyTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
document.addEventListener('click', async (event) => {
  const button =
    event.target instanceof Element
      ? event.target.closest<HTMLButtonElement>('[data-copy-value], [data-copy-target]')
      : null;
  if (!button) return;
  const target = button.dataset.copyTarget
    ? document.getElementById(button.dataset.copyTarget)
    : null;
  const value = button.dataset.copyValue ?? target?.textContent;
  if (!value) return;
  const status = document.getElementById('copy-status');
  const original = button.dataset.copyLabel ?? button.getAttribute('aria-label') ?? 'Copy code';
  button.dataset.copyLabel = original;
  try {
    await navigator.clipboard.writeText(value);
    button.dataset.copied = 'true';
    button.setAttribute('aria-label', 'Copied to clipboard');
    if (status) status.textContent = 'Copied to clipboard.';
    clearTimeout(copyTimers.get(button));
    copyTimers.set(
      button,
      setTimeout(() => {
        delete button.dataset.copied;
        button.setAttribute('aria-label', original);
        if (status) status.textContent = '';
      }, 1800),
    );
  } catch {
    if (status) status.textContent = 'Clipboard unavailable. Select the code and copy it manually.';
  }
});

// Tables keep their two-dimensional layout without widening the document.
for (const table of document.querySelectorAll<HTMLTableElement>('.prose table')) {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', table.caption?.textContent || 'Scrollable table');
  table.before(wrapper);
  wrapper.append(table);
}
