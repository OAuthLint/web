import {
  type CatalogueEntry,
  PAGE_SIZE,
  SEVERITY_RANK,
  matchesRule,
  readCatalogueState,
  writeCatalogueState,
} from '../lib/catalogue';
import type { Severity } from '../lib/rules';

const form = document.querySelector<HTMLFormElement>('#rule-filters');
const list = document.querySelector<HTMLUListElement>('#rule-results');
if (form && list) {
  const rows = [...list.querySelectorAll<HTMLLIElement>('[data-rule]')].map((element) => ({
    element,
    data: {
      id: element.dataset.id ?? '',
      search: element.dataset.search ?? '',
      severity: element.dataset.severity ?? '',
      languages: element.dataset.languages?.split(',') ?? [],
      category: element.dataset.category ?? '',
      mode: element.dataset.mode ?? '',
    } satisfies CatalogueEntry,
  }));
  // biome-ignore lint/style/noNonNullAssertion: child elements are always present in this template
  const query = form.querySelector<HTMLInputElement>('[name="q"]')!;
  const controls = [...form.querySelectorAll<HTMLSelectElement>('select')];
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const sort = document.querySelector<HTMLSelectElement>('#rule-sort')!;
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const count = document.querySelector<HTMLElement>('#rule-count-label')!;
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const pager = document.querySelector<HTMLElement>('#rule-pager')!;
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const previous = document.querySelector<HTMLButtonElement>('#rule-prev')!;
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const next = document.querySelector<HTMLButtonElement>('#rule-next')!;
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const pageLabel = document.querySelector<HTMLElement>('#rule-page-label')!;
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const empty = document.querySelector<HTMLElement>('#rule-empty')!;
  // biome-ignore lint/style/noNonNullAssertion: elements are always present in this template
  const reset = document.querySelector<HTMLButtonElement>('#rule-reset')!;
  let state = readCatalogueState(new URLSearchParams(location.search));
  let debounce: ReturnType<typeof setTimeout>;

  function syncControls() {
    query.value = state.q;
    for (const control of controls) {
      const key = control.name as 'language' | 'category' | 'severity' | 'analysis';
      if (![...control.options].some((option) => option.value === state[key])) state[key] = '';
      control.value = state[key];
    }
    sort.value = state.sort;
  }
  function render(historyMode: 'push' | 'replace' | 'none' = 'push') {
    const matching = rows.filter((row) => matchesRule(row.data, state));
    matching.sort((a, b) => {
      const severity =
        state.sort === 'severity'
          ? SEVERITY_RANK[a.data.severity as Severity] - SEVERITY_RANK[b.data.severity as Severity]
          : 0;
      return severity || a.data.id.localeCompare(b.data.id);
    });
    const pages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    state.page = Math.min(pages, state.page);
    const start = (state.page - 1) * PAGE_SIZE;
    for (const row of rows) row.element.hidden = true;
    for (const row of matching.slice(start, start + PAGE_SIZE)) {
      row.element.hidden = false;
      list?.append(row.element);
    }
    count.textContent =
      matching.length +
      (matching.length === 1 ? ' rule' : ' rules') +
      (matching.length ? ` / ${start + 1}-${Math.min(start + PAGE_SIZE, matching.length)}` : '');
    pageLabel.textContent = `Page ${state.page} of ${pages}`;
    pager.hidden = matching.length === 0;
    empty.hidden = matching.length !== 0;
    previous.disabled = state.page <= 1;
    next.disabled = state.page >= pages;
    reset.hidden = ![state.q, state.language, state.category, state.severity, state.analysis].some(
      Boolean,
    );
    if (historyMode !== 'none') {
      const url = new URL(location.href);
      url.search = writeCatalogueState(state, url.searchParams).toString();
      if (url.href !== location.href)
        history[historyMode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
    }
  }
  function updateFromControls() {
    const values = new URLSearchParams();
    // biome-ignore lint/style/noNonNullAssertion: form is guarded by outer if; narrowing lost in nested function
    for (const [key, value] of new FormData(form!))
      if (typeof value === 'string') values.set(key, value);
    state = readCatalogueState(values);
    state.sort = sort.value === 'severity' ? 'severity' : 'id';
    render();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(debounce);
    updateFromControls();
  });
  query.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(updateFromControls, 160);
  });
  for (const control of controls)
    control.addEventListener('change', () => {
      clearTimeout(debounce);
      updateFromControls();
    });
  sort.addEventListener('change', updateFromControls);
  previous.addEventListener('click', () => {
    state.page--;
    render();
    list.scrollIntoView({ block: 'start' });
  });
  next.addEventListener('click', () => {
    state.page++;
    render();
    list.scrollIntoView({ block: 'start' });
  });
  const clear = () => {
    clearTimeout(debounce);
    state = readCatalogueState(new URLSearchParams());
    syncControls();
    render();
    query.focus();
  };
  reset.addEventListener('click', clear);
  document.querySelector('[data-reset-rules]')?.addEventListener('click', clear);
  window.addEventListener('popstate', () => {
    clearTimeout(debounce);
    state = readCatalogueState(new URLSearchParams(location.search));
    syncControls();
    render('none');
  });
  syncControls();
  render('replace');
}
