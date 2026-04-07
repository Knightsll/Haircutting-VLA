const enEl = document.getElementById('content-en');
const zhEl = document.getElementById('content-zh');
const langSelect = document.getElementById('lang-select');
const phaseSelect = document.getElementById('phase-select');
const toc = document.getElementById('toc');
const titleEl = document.getElementById('phase-page-title');
const phaseHero = document.getElementById('phase-hero');

let currentLang = 'en';
let currentPhase = '1';

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
  const headings = target.querySelectorAll('h1, h2, h3, h4');
  headings.forEach((h, idx) => {
    if (!h.id) h.id = `${lang}-${slugify(h.textContent)}-${idx}`;
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    a.className = `toc-${h.tagName.toLowerCase()}`;
    toc.appendChild(a);
  });
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

function splitBilingual(md) {
  const enMark = '## English';
  const zhMark = '## 中文';
  const enPos = md.indexOf(enMark);
  const zhPos = md.indexOf(zhMark);

  if (enPos >= 0 && zhPos >= 0) {
    if (enPos < zhPos) {
      const en = md.slice(enPos + enMark.length, zhPos).trim();
      const zh = md.slice(zhPos + zhMark.length).trim();
      return { en, zh };
    } else {
      const zh = md.slice(zhPos + zhMark.length, enPos).trim();
      const en = md.slice(enPos + enMark.length).trim();
      return { en, zh };
    }
  }
  return { en: md, zh: md };
}

function normalizeMathDelimiters(md) {
  let out = md
    .replace(/\\\[/g, '\\\\[')
    .replace(/\\\]/g, '\\\\]')
    .replace(/\\\(/g, '\\\\(')
    .replace(/\\\)/g, '\\\\)');

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

async function loadPhase(id) {
  currentPhase = id;
  if (phaseSelect.value !== id) phaseSelect.value = id;

  if (phaseHero) phaseHero.classList.toggle('hidden', id !== '1');

  const res = await fetch(`/docs/phases/phase${id}.md`);
  const mdRaw = await res.text();

  const firstLine = mdRaw.split('\n').find((l) => l.startsWith('# '));
  if (firstLine) titleEl.textContent = firstLine.replace(/^#\s*/, '');

  const parts = splitBilingual(mdRaw);
  const en = normalizeMathDelimiters(parts.en || mdRaw);
  const zh = normalizeMathDelimiters(parts.zh || mdRaw);

  enEl.innerHTML = marked.parse(en);
  zhEl.innerHTML = marked.parse(zh);

  await typesetMath();
  setLang(currentLang);
}

function setPhase(id) {
  const safeId = ['1', '2', '3', '4', '5'].includes(id) ? id : '1';
  const url = new URL(window.location.href);
  url.searchParams.set('id', safeId);
  window.history.replaceState({}, '', url);
  loadPhase(safeId).catch((e) => {
    enEl.innerHTML = `<p>Failed to load phase content: ${e.message}</p>`;
  });
}

langSelect.addEventListener('change', (e) => setLang(e.target.value));
phaseSelect.addEventListener('change', (e) => setPhase(e.target.value));

const params = new URLSearchParams(location.search);
setPhase(params.get('id') || '1');
