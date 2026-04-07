const enEl = document.getElementById('content-en');
const zhEl = document.getElementById('content-zh');
const langSelect = document.getElementById('lang-select');
const toc = document.getElementById('toc');

let currentLang = 'en';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function buildToc(lang) {
  const target = lang === 'zh' ? zhEl : enEl;
  toc.innerHTML = '';

  const headings = [...target.querySelectorAll('h1, h2, h3, h4, .phase-collapsible > summary')];

  const makeLink = (el, idx) => {
    const title = (el.textContent || '').trim();
    if (!el.id) el.id = `${lang}-${slugify(title)}-${idx}`;
    const a = document.createElement('a');
    a.href = `#${el.id}`;
    a.textContent = title;
    const tag = el.tagName.toLowerCase() === 'summary' ? 'h3' : el.tagName.toLowerCase();
    a.className = `toc-${tag}`;
    return a;
  };

  let i = 0;
  while (i < headings.length) {
    const h = headings[i];
    const title = (h.textContent || '').trim();
    if (/^(中文版本|english\s*version|chinese\s*version)$/i.test(title)) {
      i++;
      continue;
    }

    const isPhaseStructure = /^(phase\s*structure|phase\s*结构)$/i.test(title);
    if (!isPhaseStructure) {
      toc.appendChild(makeLink(h, i));
      i++;
      continue;
    }

    const group = document.createElement('details');
    group.className = 'toc-dropdown';
    group.open = false;

    const summary = document.createElement('summary');
    const label = document.createElement('span');
    label.className = 'toc-summary-label';
    label.textContent = title;
    summary.appendChild(label);
    group.appendChild(summary);

    const sub = document.createElement('nav');
    sub.className = 'toc-sub';

    i++;
    while (i < headings.length) {
      const nxt = headings[i];
      const nxtTitle = (nxt.textContent || '').trim();
      const nxtTag = nxt.tagName.toLowerCase() === 'summary' ? 'h3' : nxt.tagName.toLowerCase();
      if (nxtTag === 'h3' || nxtTag === 'summary') break;
      if (!/^(中文版本|english\s*version|chinese\s*version)$/i.test(nxtTitle)) {
        sub.appendChild(makeLink(nxt, i));
      }
      i++;
    }

    group.appendChild(sub);
    toc.appendChild(group);
  }
}

async function ensureMathJaxReady(timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (window.MathJax && window.MathJax.typesetPromise) return true;
    await new Promise((r) => setTimeout(r, 120));
  }
  return false;
}

async function typesetMath() {
  const ready = await ensureMathJaxReady();
  if (!ready) return;
  try {
    await window.MathJax.typesetPromise([enEl, zhEl]);
  } catch (e) {
    console.warn('MathJax typeset failed:', e);
  }
}

function normalizeMath(md) {
  // 1) normalize escaped delimiters
  let out = md
    .replace(/\\\[/g, '\\\\[')
    .replace(/\\\]/g, '\\\\]')
    .replace(/\\\(/g, '\\\\(')
    .replace(/\\\)/g, '\\\\)');

  // 2) convert legacy bracket blocks: [ ... ] -> \[ ... \]
  const lines = out.split('\n');
  const rebuilt = [];
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].trim();

    if (s === '[') {
      const block = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== ']') {
        block.push(lines[i]);
        i += 1;
      }
      rebuilt.push('\\[');
      rebuilt.push(...block);
      rebuilt.push('\\]');
      continue;
    }

    if (/^\[[^\]]+\]$/.test(s) && !s.startsWith('[http')) {
      rebuilt.push(s.replace(/^\[/, '\\[').replace(/\]$/, '\\]'));
      continue;
    }

    rebuilt.push(lines[i]);
  }
  out = rebuilt.join('\n');

  // 3) escape set braces inside math delimiters
  out = out.replace(/\\\[([\s\S]*?)\\\]/g, (m, inner) => {
    const fixed = inner.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    return `\\[${fixed}\\]`;
  });

  out = out.replace(/\\\(([\s\S]*?)\\\)/g, (m, inner) => {
    const fixed = inner.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    return `\\(${fixed}\\)`;
  });

  return out;
}

function setLang(lang) {
  currentLang = lang;
  if (lang === 'zh') {
    zhEl.classList.remove('hidden');
    enEl.classList.add('hidden');
    document.documentElement.lang = 'zh';
  } else {
    enEl.classList.remove('hidden');
    zhEl.classList.add('hidden');
    document.documentElement.lang = 'en';
  }

  if (langSelect.value !== lang) langSelect.value = lang;
  buildToc(lang);
}

function makePhaseStructureCollapsible(articleEl, lang) {
  const marker = lang === 'zh' ? 'Phase 结构' : 'Phase Structure';
  const h = [...articleEl.querySelectorAll('h3')].find(x => (x.textContent || '').includes(marker));
  if (!h) return;
  if (h.parentElement && h.parentElement.classList.contains('phase-collapsible')) return;

  const details = document.createElement('details');
  details.className = 'phase-collapsible';
  details.open = true;

  const summary = document.createElement('summary');
  summary.textContent = h.textContent;
  if (h.id) summary.id = h.id;
  details.appendChild(summary);

  let node = h.nextSibling;
  while (node) {
    const next = node.nextSibling;
    if (node.nodeType === 1 && node.tagName === 'H3') break;
    details.appendChild(node);
    node = next;
  }

  h.replaceWith(details);
}

async function loadContent() {
  const res = await fetch('/docs/content.md');
  const md = await res.text();

  const zhStart = md.indexOf('## 中文版本');
  const enStart = md.indexOf('## English Version');

  const zhMd = zhStart >= 0 && enStart > zhStart ? md.slice(zhStart, enStart) : md;
  const enMd = enStart >= 0 ? md.slice(enStart) : md;

  enEl.innerHTML = marked.parse(normalizeMath(enMd));
  zhEl.innerHTML = marked.parse(normalizeMath(zhMd));

  makePhaseStructureCollapsible(enEl, 'en');
  makePhaseStructureCollapsible(zhEl, 'zh');

  await typesetMath();
  setLang(currentLang);
}

langSelect.addEventListener('change', (e) => setLang(e.target.value));

loadContent().catch((e) => {
  enEl.innerHTML = `<p>Failed to load content: ${e.message}</p>`;
});
