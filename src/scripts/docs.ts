export {};

const template = document.querySelector<HTMLTemplateElement>('#code-copy-template');
if (template) {
  document.querySelectorAll<HTMLPreElement>('.prose pre').forEach((pre, index) => {
    const code = pre.querySelector('code');
    if (!code) return;
    code.id ||= `doc-code-${index}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'doc-code';
    pre.before(wrapper);
    wrapper.append(pre);
    const button = template.content.firstElementChild?.cloneNode(true) as
      | HTMLButtonElement
      | undefined;
    if (button) {
      button.dataset.copyTarget = code.id;
      wrapper.append(button);
    }
  });
}
const links = [...document.querySelectorAll<HTMLAnchorElement>('.docs-toc a')];
if ('IntersectionObserver' in window && links.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-100px 0px -65% 0px', threshold: 0 },
  );
  for (const link of links) {
    const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (heading) observer.observe(heading);
  }
}
