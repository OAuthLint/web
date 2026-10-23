export {};

interface SearchData {
  url: string;
  meta: { title?: string };
  excerpt: string;
}
interface Pagefind {
  search(query: string): Promise<{ results: { data(): Promise<SearchData> }[] }>;
}
const dialog = document.querySelector<HTMLDialogElement>('#site-search');
const input = document.querySelector<HTMLInputElement>('#site-search-input');
const results = document.querySelector<HTMLElement>('#search-results');
const status = document.querySelector<HTMLElement>('#search-status');
if (dialog && input && results && status) {
  let module: Promise<Pagefind> | undefined;
  let request = 0;
  let timer: ReturnType<typeof setTimeout>;
  const initial = results.cloneNode(true);
  let opener: HTMLElement | null = null;
  const open = () => {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    input.focus();
  };
  document.querySelector('[data-search-open]')?.addEventListener('click', open);
  document.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        dialog.close();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    }
  });
  async function search(query: string, sequence: number) {
    if (!query) {
      results?.replaceChildren(...Array.from(initial.cloneNode(true).childNodes));
      // biome-ignore lint/style/noNonNullAssertion: async context loses narrowing; status is guarded by outer if
      status!.textContent = '';
      return;
    }
    // biome-ignore lint/style/noNonNullAssertion: async context loses narrowing; status is guarded by outer if
    status!.textContent = 'Searching...';
    try {
      const url = '/pagefind/pagefind.js';
      module ??= import(/* @vite-ignore */ url) as Promise<Pagefind>;
      const pagefind = await module;
      const response = await pagefind.search(query);
      const items = await Promise.all(response.results.slice(0, 12).map((item) => item.data()));
      if (sequence !== request) return;
      results?.replaceChildren();
      for (const item of items) {
        const destination = new URL(item.url, location.origin);
        if (destination.origin !== location.origin) continue;
        const link = document.createElement('a');
        link.href = destination.pathname + destination.hash;
        const title = document.createElement('strong');
        title.textContent = item.meta.title ?? destination.pathname;
        const excerpt = document.createElement('span');
        // Pagefind provides highlighted HTML; render only its text.
        excerpt.textContent = new DOMParser().parseFromString(
          item.excerpt,
          'text/html',
        ).body.textContent;
        link.append(title, excerpt);
        results?.append(link);
      }
      // biome-ignore lint/style/noNonNullAssertion: async context loses narrowing; status is guarded by outer if
      status!.textContent = response.results.length
        ? response.results.length + (response.results.length === 1 ? ' result' : ' results')
        : 'No results. Try a rule ID, a command, or a broader term.';
    } catch {
      if (sequence !== request) return;
      module = undefined;
      results?.replaceChildren();
      // biome-ignore lint/style/noNonNullAssertion: async context loses narrowing; status is guarded by outer if
      status!.textContent = 'Search is unavailable. Browse the documentation or try again.';
      const link = document.createElement('a');
      link.href = '/docs';
      link.textContent = 'Browse documentation';
      results?.append(link);
    }
  }
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const sequence = ++request;
    timer = setTimeout(() => void search(input.value.trim(), sequence), 160);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      results.querySelector('a')?.focus();
    }
  });
  results.addEventListener('keydown', (event) => {
    const links = [...results.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown' && index < links.length - 1) {
      event.preventDefault();
      links[index + 1]?.focus();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index <= 0) input.focus();
      else links[index - 1]?.focus();
    }
  });
}
