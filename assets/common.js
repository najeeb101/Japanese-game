// shared helpers: saved state (used questions), TV mode, host <-> TV messages, hint choices, win/lose effects.
// Storage can be blocked, so every access is guarded.
const Store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }
};

const used = {
  all() { return Store.get('jj-used', {}); },
  has(cat, n) { return !!this.all()[cat + '-' + n]; },
  add(cat, n) { const u = this.all(); u[cat + '-' + n] = 1; Store.set('jj-used', u); },
  clear() { Store.set('jj-used', {}); }
};

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- TV (audience display) mode: opened by the host as index.html?tv=1 (main menu), remembered for this tab ----
const TV = (() => {
  let on = new URLSearchParams(location.search).get('tv') === '1';
  try { if (on) sessionStorage.setItem('jj-tv', '1'); else on = sessionStorage.getItem('jj-tv') === '1'; } catch (e) { /* ignore */ }
  if (on) document.documentElement.classList.add('tv');
  return on;
})();
function tvQS() { return TV ? '&tv=1' : ''; }

// ---- host <-> TV messages. localStorage 'storage' events reach the *other* windows of the same browser ----
const Bus = {
  send(msg) { Store.set('jj-msg', Object.assign({}, msg, { t: Date.now(), r: Math.random() })); },
  on(fn) {
    addEventListener('storage', e => {
      if (e.key !== 'jj-msg' || !e.newValue) return;
      try { fn(JSON.parse(e.newValue)); } catch (err) { /* ignore */ }
    });
  }
};
// the TV tells the host what it is showing
function announce(view) { if (!TV) return; Store.set('jj-view', view); Bus.send(Object.assign({ type: 'view' }, view)); }

// the TV follows the host from page to page; each page may define window.pageView() to answer a "ping"
function go(url) {
  const here = location.pathname.split('/').pop() + location.search;
  if (here !== url) location.href = url;
}
Bus.on(m => {
  if (!TV) return;
  if (m.type === 'menu') go('index.html?tv=1');
  if (m.type === 'board') go('board.html?tv=1');
  if (m.type === 'cat') go('category.html?c=' + m.c + '&tv=1');
  if (m.type === 'open') go('question.html?c=' + m.c + '&n=' + m.n + '&tv=1');
  if (m.type === 'ping' && typeof window.pageView === 'function') announce(window.pageView());
});

// keep used marks in sync across windows
addEventListener('storage', e => {
  if (e.key === 'jj-used' && typeof window.onSharedChange === 'function') window.onSharedChange();
});

// ---- background sparkles: little gold stars drifting up the screen ----
function makeSparks() {
  if (reducedMotion()) return;
  const layer = document.createElement('div');
  layer.className = 'sparks';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.left = Math.round(Math.random() * 100) + '%';
    s.style.fontSize = (14 + Math.random() * 30).toFixed(0) + 'px';
    s.style.animationDuration = (9 + Math.random() * 12).toFixed(1) + 's';
    s.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
    layer.append(s);
  }
  document.body.prepend(layer);
}
if (document.body) makeSparks(); else addEventListener('DOMContentLoaded', makeSparks);

// "!!!" flash when a question opens
function openFlash() {
  if (reducedMotion()) return;
  const dim = document.createElement('div'); dim.className = 'flash-dim';
  const img = document.createElement('img');
  img.alt = ''; img.className = 'flash-img'; img.src = 'assets/theme/sparks.jpeg';
  document.body.append(dim, img);
  setTimeout(() => { dim.remove(); img.remove(); }, 1300);
}

// difficulty (1 easy, 2 medium, 3 hard) as stars + word
function diffLabel(d) { return '★'.repeat(d) + ' ' + ['', 'Easy', 'Medium', 'Hard'][d]; }

// ---- hint: four multiple-choice answers (the right one plus three from the same category) ----
// Seeded by category + number so the host window and the TV window always show the same choices in the same order.
function seededRandom(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(list, rnd) {
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}
function choicesFor(cat, q) {
  const rnd = seededRandom(cat.key + ':' + q.n);
  const seen = new Set([q.answer.toLowerCase()]);
  const others = [];
  cat.questions.forEach(x => { const k = x.answer.toLowerCase(); if (!seen.has(k)) { seen.add(k); others.push(x.answer); } });
  return shuffled([q.answer].concat(shuffled(others, rnd).slice(0, 3)), rnd);
}

// ---- win / lose effects ----
function playTone(kind) {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const win = kind === 'win';
    (win ? [523, 659, 784, 1047] : [220, 185, 147]).forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = win ? 'triangle' : 'sawtooth'; o.frequency.value = f;
      const t = ac.currentTime + i * (win ? 0.13 : 0.2);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.36);
    });
    setTimeout(() => ac.close(), 1800);
  } catch (e) { /* audio not available */ }
}

function celebrate(kind) {
  playTone(kind);
  if (reducedMotion()) return;
  const fx = document.createElement('div');
  fx.className = 'fx fx-' + kind;
  fx.setAttribute('aria-hidden', 'true');
  const img = (src, cls) => '<img class="' + cls + '" alt="" src="assets/theme/' + src + '.jpeg">';
  if (kind === 'win') {
    fx.innerHTML = img('stars', 'fx-stars') + img('sparks', 'fx-burst') +
      img(Math.random() < 0.5 ? 'wow' : 'omg', 'fx-word') + '<div class="fx-text">Correct!</div>';
    const colors = ['#f5b82e', '#c8202a', '#fff3cf', '#ff7a3d', '#ffd96b'];
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = (Math.random() * 100).toFixed(1) + '%';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * 0.7).toFixed(2) + 's';
      c.style.animationDuration = (1.4 + Math.random() * 1.2).toFixed(2) + 's';
      c.style.setProperty('--sway', ((Math.random() - 0.5) * 160).toFixed(0) + 'px');
      fx.append(c);
    }
  } else {
    fx.innerHTML = img('exclaim', 'fx-word') + '<div class="fx-text">Wrong!</div>';
    document.documentElement.classList.add('shake');
    setTimeout(() => document.documentElement.classList.remove('shake'), 800);
  }
  document.body.append(fx);
  setTimeout(() => fx.remove(), 2500);
}
