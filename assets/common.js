// shared helpers: saved state (used questions, skin). Storage can be blocked, so every access is guarded.
const Store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
  }
};

const SKINS = [
  { id: 'p3', label: 'Persona 3' },
  { id: 'p4', label: 'Persona 4' },
  { id: 'p5', label: 'Persona 5' }
];

function currentSkin() {
  const id = Store.get('jj-skin', 'p4');
  return SKINS.some(s => s.id === id) ? id : 'p4';
}
function applySkin() {
  const id = currentSkin();
  document.documentElement.dataset.skin = id;
  return id;
}
function nextSkin() {
  const i = SKINS.findIndex(s => s.id === currentSkin());
  const nxt = SKINS[(i + 1) % SKINS.length];
  Store.set('jj-skin', nxt.id);
  return nxt.id;
}
function skinLabel(id) { return (SKINS.find(s => s.id === id) || SKINS[1]).label; }

const used = {
  all() { return Store.get('jj-used', {}); },
  has(cat, n) { return !!this.all()[cat + '-' + n]; },
  add(cat, n) { const u = this.all(); u[cat + '-' + n] = 1; Store.set('jj-used', u); },
  clear() { Store.set('jj-used', {}); }
};

applySkin();

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

// keep skin / used marks / range in sync across windows
addEventListener('storage', e => {
  if (e.key === 'jj-skin') applySkin();
  if ((e.key === 'jj-used' || e.key === 'jj-range' || e.key === 'jj-skin') && typeof window.onSharedChange === 'function') window.onSharedChange();
});

// ---- background sparkles: little shapes drifting up the screen (the shape comes from the skin) ----
function makeSparks() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

// each skin has its own flash when a question opens: P3 clock, P4 spiral, P5 HOLD UP!
function holdUpFlash() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const skin = currentSkin();
  const made = [];
  if (skin === 'p4') {
    const s = document.createElement('div'); s.className = 'flash-p4'; made.push(s);
  } else {
    const dim = document.createElement('div'); dim.className = 'flash-dim';
    const img = document.createElement('img');
    img.alt = ''; img.className = 'flash-img' + (skin === 'p3' ? ' clock' : '');
    img.src = 'assets/theme/' + (skin === 'p3' ? 'p3-clock.jpeg' : 'p5-holdup.jpeg');
    made.push(dim, img);
  }
  made.forEach(e => document.body.append(e));
  setTimeout(() => made.forEach(e => e.remove()), 1300);
}

// difficulty (1 easy, 2 medium, 3 hard) as stars + word
function diffLabel(d) { return '★'.repeat(d) + ' ' + ['', 'Easy', 'Medium', 'Hard'][d]; }
