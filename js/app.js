/* ============================================================
   Radio Estación Mix · Player PWA
   Reproductor, metadata SSE de Zeno.FM, historial, ajustes,
   notificaciones y redes sociales
   ============================================================ */
'use strict';

/* ==================== CONFIGURACIÓN ====================
   Edita aquí tus enlaces de redes sociales y WhatsApp.
   ======================================================= */
const CONFIG = {
  name: 'Radio Voz Cristiana',
  slogan: 'La mejor música en vivo',
  stream: 'https://radioserver.radiovozdelcielo.com/listen/voz_cristiana/radio.mp3',
  zenoCode: 'listen/voz_cristiana/radio.mp3',
  socials: {
    facebook: 'https://www.facebook.com/profile.php?id=61594307230402',
    instagram: 'https://www.instagram.com/vozcristiana2026/',
    youtube: 'https://youtube.com/@vozcristiana-q6b?si=69E_1ndSvoYnWLLQ',
    tiktok: 'https://www.tiktok.com/@djchochobarwilmer ',
    whatsapp: 'https://wa.link/j3mghy'
  },
  wppText: 'Hola! Quiero pedir una canción y saludar en Radio Voz Cristiana 🎶'
};

const STREAM_URL = CONFIG.stream;
const ZENO_SSE = 'https://radioserver.radiovozdelcielo.com/api/nowplaying/vozdelcielo ' + CONFIG.zenoCode;
const REPO = { name: CONFIG.name, dj: CONFIG.name, url: STREAM_URL };

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- Estado ---------- */
const state = {
  playing: false,
  volume: +(localStorage.getItem('em_vol') ?? 80),
  title: '',
  art: '',
  lastTitle: '',
  history: [],
  theme: localStorage.getItem('em_theme') ?? 'mix',
  settings: {
    autoplay: localStorage.getItem('em_auto') === '1',
    notify: localStorage.getItem('em_notify') === '1',
    vinyl: localStorage.getItem('em_vinyl') !== '0',
    save: localStorage.getItem('em_save') === '1'
  }
};

const THEMES = {
  mix:       { name: 'Mix',        a: '#ffd400', b: '#ff8a00', c: '#ff3d00' },
  neon:      { name: 'Neón',       a: '#ff2d95', b: '#7c4dff', c: '#3fa9ff' },
  fuego:     { name: 'Fuego',      a: '#ff4d2e', b: '#ff8a00', c: '#ffd000' },
  esmeralda: { name: 'Esmeralda',  a: '#34d399', b: '#10b981', c: '#06b6d4' },
  cielo:     { name: 'Cielo',      a: '#38bdf8', b: '#3b82f6', c: '#8b5cf6' },
  dorado:    { name: 'Dorado',     a: '#fbbf24', b: '#f59e0b', c: '#fb923c' },
  nocturno:  { name: 'Nocturno',   a: '#c084fc', b: '#8b5cf6', c: '#6366f1' },
  rosa:      { name: 'Rosa',       a: '#f472b6', b: '#ec4899', c: '#fb7185' },
  oceano:    { name: 'Océano',     a: '#22d3ee', b: '#0ea5e9', c: '#3b82f6' },
  acido:     { name: 'Ácido',      a: '#a3e635', b: '#22c55e', c: '#14b8a6' }
};

const audio = new Audio();
audio.src = STREAM_URL;
audio.preload = 'none';
audio.volume = state.volume / 100;

const els = {
  body: document.body,
  art: $('#art'),
  songTitle: $('#songTitle'),
  songInfo: $('#songInfo'),
  titleHolder: $('#titleHolder'),
  play: $('#btnPlay'),
  pauseIco: $('#icPause'),
  playIco: $('#icPlay'),
  bnPlay: $('#bnPlay'),
  bnIcP: $('#bnIcPlay'),
  bnIcPa: $('#bnIcPause'),
  vol: $('#vol'),
  volNum: $('#volNum'),
  mute: $('#btnMute'),
  icVol: $('#icVol'),
  icMuted: $('#icMuted'),
  listeners: $('#listeners'),
  bitrate: $('#bitrate'),
  djName: $('#djName'),
  djNow: $('#djNow'),
  djProfile: $('#djProfile'),
  djNowName: $('#djNowName'),
  pillListeners: $('#pillListeners'),
  plist: $('#plist'),
  plSub: $('#plSub'),
  djMainPhoto: $('#djMainPhoto'),
  djListeners2: $('#djListeners2'),
  djBitrate2: $('#djBitrate2'),
  djSongs: $('#djSongs'),
  artWrap: $('#artWrap'),
  sidebar: $('#sidebar'),
  overlay: $('#overlay'),
  menuToggle: $('#menuToggle'),
  sidebarClose: $('#sidebarClose'),
  btnHome: $('#btnHome'),
  sideLogo: $('#sideLogo'),
  toast: $('#toast'),
  installBtn: $('#installBtn'),
  installBtn2: $('#installBtn2'),
  setAutoplay: $('#setAutoplay'),
  setNotify: $('#setNotify'),
  setVinyl: $('#setVinyl'),
  setSave: $('#setSave'),
  wppBtn: $('#wppBtn'),
  djCallBtn: $('#djCallBtn'),
  djWppBtn: $('#djWppBtn'),
  btnShare: $('#btnShare'),
  btnShare2: $('#btnShare2'),
  btnPlayAbout: $('#btnPlayAbout'),
  btnRestart: $('#btnRestart'),
  btnRestart2: $('#btnRestart2'),
  themeGrid: $('#themeGrid')
};

/* ---------- Redes sociales ---------- */
function socialSvg(key) {
  const icons = {
    facebook: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 2.5.1 3.6 1.3 3.7 3.7.1 1.3.1 1.6.1 4.9s0 3.6-.1 4.9c-.1 2.5-1.2 3.6-3.7 3.7-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-2.5-.1-3.6-1.2-3.7-3.7C3.3 15.6 3.3 15.2 3.3 12s0-3.6.1-4.9c.1-2.5 1.2-3.6 3.7-3.7C8.4 2.3 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.9.1-2.5.7-2.6 2.6-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.9.7 2.5 2.6 2.6 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.9-.1 2.5-.7 2.6-2.6.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.9-.7-2.5-2.6-2.6-1.2-.1-1.6-.1-4.7-.1Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.3-3.1a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M23 12s0-3.9-.5-5.6c-.3-1-1.1-1.8-2.1-2.1C18.7 3.8 12 3.8 12 3.8s-6.7 0-8.4.5c-1 .3-1.8 1.1-2.1 2.1C1 8.1 1 12 1 12s0 3.9.5 5.6c.3 1 1.1 1.8 2.1 2.1 1.7.5 8.4.5 8.4.5s6.7 0 8.4-.5c-1-.3-1.8-1.1-2.1-2.1.5-1.7.5-5.6.5-5.6Zm-13.2 4V8l5.4 4-5.4 4Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.6 7.1a5 5 0 0 1-3.6-1.6 4.9 4.9 0 0 1-1.4-3.5h-3.2v13a2.8 2.8 0 1 1-2.3-2.8V9.1a6 6 0 1 0 5.3 5.9V9.6a8 8 0 0 0 4.5 1.4V7.9c-.4 0-.8 0-1.3-.2a3.4 3.4 0 0 1 2-1.4l-1-.7Z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm6 14.2c-.3.8-1.5 1.4-2.5 1.5-.6.1-1.4.1-2.2-.1-1.2-.4-2.4-1.2-3.4-2.2-1-1-1.8-2.2-2.2-3.4-.2-.8-.2-1.6-.1-2.2.1-1 .7-2.2 1.5-2.5.3-.1.6-.1.8.1l1.8 1.8c.2.2.2.5 0 .7l-.6.6c-.1.2-.2.5-.1.6.4.7 1.1 1.5 1.7 2 .5.6 1.4 1.3 2.1 1.7.2.1.4.1.6-.1l.6-.6c.2-.2.5-.2.7 0l1.9 1.9c.2.2.2.6.1.8Z"/></svg>'
  };
  return icons[key] || '';
}
const SOCIAL_CLASS = { facebook: 'fb', instagram: 'ig', youtube: 'yt', tiktok: 'tk', whatsapp: 'wa' };
const SOCIAL_LABEL = { facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', whatsapp: 'WhatsApp' };

function injectSocials() {
  /* Enlaces del menú lateral marcados con data-social */
  $$('a[data-social]').forEach(a => {
    const key = a.dataset.social;
    const url = CONFIG.socials[key];
    if (url && url.startsWith('http')) a.href = url;
    if (a.title === '') a.title = SOCIAL_LABEL[key] || key;
  });
  /* Filas de redes generadas dinámicamente */
  $$('[data-social-row]').forEach(row => {
    row.innerHTML = Object.keys(SOCIAL_CLASS).filter(k => CONFIG.socials[k]).map(k => {
      const url = CONFIG.socials[k];
      const href = k === 'whatsapp' ? (CONFIG.socials.whatsapp || '#') : (url.startsWith('http') ? url : '#');
      return `<a href="${href}" class="social-btn ${SOCIAL_CLASS[k]}" target="_blank" rel="noopener" aria-label="${SOCIAL_LABEL[k]}" title="${SOCIAL_LABEL[k]}">${socialSvg(k)}</a>`;
    }).join('');
  });
}

/* ---------- Utilidades ---------- */
function toast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  requestAnimationFrame(() => els.toast.classList.add('show'));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.toast.classList.remove('show');
    setTimeout(() => (els.toast.hidden = true), 320);
  }, 2600);
}

function splitTitle(raw) {
  const t = (raw || '').trim();
  if (!t) return { artist: '', song: 'Sonando en vivo…' };
  const i = t.indexOf(' - ');
  if (i > 0) return { artist: t.slice(0, i).trim(), song: t.slice(i + 3).trim() };
  return { artist: REPO.name, song: t };
}

/* ---------- Vistas / navegación ---------- */
const navBtns = $$('.nav-item, .bn-item');
function goView(name) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  navBtns.forEach(b => {
    if (b.dataset.view === name) b.classList.add('active');
    else b.classList.remove('active');
  });
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navBtns.forEach(b => b.addEventListener('click', () => { if (b.dataset.view) goView(b.dataset.view); }));
els.btnHome.addEventListener('click', () => goView('home'));
els.sideLogo.addEventListener('click', () => goView('home'));

function openMenu() { els.sidebar.classList.add('open'); els.overlay.hidden = false; requestAnimationFrame(() => els.overlay.classList.add('show')); }
function closeMenu() { els.sidebar.classList.remove('open'); els.overlay.classList.remove('show'); setTimeout(() => (els.overlay.hidden = true), 260); }
els.menuToggle.addEventListener('click', openMenu);
els.sidebarClose.addEventListener('click', closeMenu);
els.overlay.addEventListener('click', closeMenu);

/* ---------- Reproductor ---------- */
function setPlaying(on, fromUI = false) {
  state.playing = on;
  els.body.classList.toggle('playing', on);
  els.playIco.hidden = on;
  els.pauseIco.hidden = !on;
  els.bnIcP.hidden = on;
  els.bnIcPa.hidden = !on;
  if (fromUI) {
    if (on) { audio.play().catch(err => { toast('No se pudo conectar al streaming'); setPlaying(false); }); }
    else { audio.pause(); }
  }
}

function togglePlay() {
  setPlaying(!state.playing, true);
  if (state.playing) toast('Reproduciendo en vivo ▶');
}

els.play.addEventListener('click', togglePlay);
els.bnPlay.addEventListener('click', togglePlay);
els.btnPlayAbout.addEventListener('click', () => { goView('home'); setTimeout(togglePlay, 250); });

els.btnRestart.addEventListener('click', restartStream);
els.btnRestart2.addEventListener('click', restartStream);

function restartStream() {
  const was = state.playing;
  audio.pause();
  audio.src = STREAM_URL + '?r=' + uid();
  audio.load();
  if (was) audio.play().catch(() => setTimeout(() => audio.play().catch(() => {}), 1200));
  toast('Reiniciando stream…');
}

/* ---------- Volumen ---------- */
function syncVol() {
  audio.volume = state.volume / 100;
  els.vol.value = state.volume;
  els.vol.style.setProperty('--range', state.volume + '%');
  els.volNum.textContent = state.volume;
  els.icVol.hidden = state.volume === 0;
  els.icMuted.hidden = state.volume !== 0;
  localStorage.setItem('em_vol', state.volume);
}
els.vol.addEventListener('input', () => { state.volume = +els.vol.value; syncVol(); });
els.mute.addEventListener('click', () => { state.volume = state.volume === 0 ? 80 : 0; syncVol(); });
syncVol();

/* ---------- Metadata Zeno.FM (SSE) ---------- */
function parseMeta(data) {
  const title = (data.streamTitle || data.title || '').trim();
  const listeners = data.listeners || 0;

  const { artist, song } = splitTitle(title);
  els.songTitle.textContent = song || 'Sonando en vivo…';
  els.songInfo.textContent = artist && artist !== REPO.name ? (artist + ' · ' + CONFIG.name) : CONFIG.slogan + ' · ' + CONFIG.name;
  els.songTitle.classList.remove('marquee');
  const sh = els.songTitle.scrollWidth, ch = els.titleHolder.clientWidth;
  if (sh > ch + 30) {
    els.songTitle.classList.add('marquee');
    els.songTitle.style.setProperty('--dur', Math.max(9, sh / 55) + 's');
  }

  if (listeners) {
    els.listeners.textContent = fmtNum(listeners);
    els.pillListeners.textContent = fmtNum(listeners);
    els.djListeners2.textContent = fmtNum(listeners);
  } else {
    els.listeners.textContent = 'En vivo';
    els.pillListeners.textContent = '♫';
    els.djListeners2.textContent = '—';
  }

  els.bitrate.textContent = (data.bitrate || '128') + ' kbps';
  els.djBitrate2.textContent = data.bitrate || '128';
  els.djName.textContent = CONFIG.name;

  if (title) {
    const clean = title.replace(new RegExp('^' + CONFIG.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*-\\s*', 'i'), '');
    pushHistory(clean || title);
    els.djNowName.textContent = clean || title;
    els.djNow.hidden = false;

    if (title !== state.lastTitle) {
      if (state.lastTitle && state.playing) {
        try {
          if (state.settings.notify && 'Notification' in window && Notification.permission === 'granted') {
            const n = new Notification('🎵 Sonando en ' + CONFIG.name, { body: clean || title, icon: 'logo.png', tag: 'radio-now' });
            setTimeout(() => n.close(), 6000);
          }
        } catch (e) { /* ignorar */ }
      }
      state.lastTitle = title;
    }
  }

  const tips = [
    'Escucha en vivo la mejor selección musical de Radio Estación Mix.',
    'Pide tu canción por WhatsApp y saluda al aire.',
    'La cabina de Estación Mix suena 24/7 con los éxitos del momento.',
    'Comparte la radio con tus amigos y llena la pista.',
    'Mix, éxitos y variedad: solo aquí, Radio Estación Mix.'
  ];
  const tip = $('#tipText');
  if (tip) {
    const cur = state.history[0] || title;
    tip.textContent = cur ? `Ahora: «${cur.slice(0, 60)}». ` + tips[(Math.floor(Date.now() / 300000)) % tips.length] : tips[0];
  }
}

function pushHistory(title) {
  const clean = title.replace(/ *\[[^\]]*\] *$/g, '').trim();
  if (!clean || state.history[0] === clean) return;
  state.history.unshift(clean);
  state.history = state.history.slice(0, 25);
  renderHistory(state.history);
}

function fmtNum(n) {
  n = +n || 0;
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + 'k';
  return String(n);
}

function renderHistory(h) {
  if (!h || !h.length) { els.plist.innerHTML = '<li class="pl-empty">Sin historial por ahora…</li>'; return; }
  els.plSub.textContent = 'Últimas ' + h.length + ' canciones en el aire';
  els.djSongs.textContent = h.length;
  els.plist.innerHTML = h.map((item, i) => {
    const now = i === 0;
    return `<li class="pl-item${now ? ' current' : ''}" style="animation-delay:${i * 30}ms">
      <span class="pl-num">${String(i + 1).padStart(2, '0')}</span>
      <svg class="pl-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7L8 5Z"/></svg>
      <div class="pl-txt"><b>${esc(item)}</b><small>${now ? 'Sonando ahora' : 'Hace ~' + Math.min(i * 5, 60) + ' min'}</small></div>
    </li>`;
  }).join('');
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let zenoTimer = null;
async function connectZeno() {
  try {
    const ctrl = new AbortController();
    zenoTimer = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(ZENO_SSE, { headers: { Accept: 'text/event-stream' }, signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error('bad response');
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    clearTimeout(zenoTimer); /* detener el timeout de conexión */
    zenoTimer = null;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        const s = line.trim();
        if (s.startsWith('data:')) {
          const payload = s.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const j = JSON.parse(payload);
            if (j.streamTitle || j.title) parseMeta(j);
          } catch (e) { /* evento no JSON */ }
        }
      }
    }
  } catch (e) {
    /* reconectar con backoff */
    clearTimeout(zenoTimer);
    setTimeout(connectZeno, 5000);
  }
}

/* ---------- Temas de colores ---------- */
function buildThemeGrid() {
  const keys = Object.keys(THEMES);
  els.themeGrid.innerHTML = keys.map(k => {
    const t = THEMES[k];
    return `<button class="theme-cell" data-theme="${k}" aria-label="${t.name}" title="Tema ${t.name}">
      <span class="th-swatch" style="--a:${t.a};--b:${t.b};--c:${t.c}"></span>
      <span class="th-name">${t.name}</span>
    </button>`;
  }).join('');
}

function applyTheme(name) {
  if (!THEMES[name]) name = 'mix';
  state.theme = name;
  els.body.classList.remove(...Object.keys(THEMES).map(k => 'theme-' + k));
  els.body.classList.add('theme-' + name);
  localStorage.setItem('em_theme', name);
  $$('.theme-cell').forEach(c => c.classList.toggle('active', c.dataset.theme === name));
}

els.themeGrid.addEventListener('click', e => {
  const cell = e.target.closest('.theme-cell');
  if (!cell) return;
  applyTheme(cell.dataset.theme);
  toast('Tema aplicado: ' + THEMES[cell.dataset.theme].name);
});

/* ---------- Ajustes ---------- */
function applySettings() {
  els.body.classList.toggle('save', state.settings.save);
  els.setAutoplay.checked = state.settings.autoplay;
  els.setNotify.checked = state.settings.notify;
  els.setVinyl.checked = state.settings.vinyl;
  els.setSave.checked = state.settings.save;
  document.querySelectorAll('.art-inner img, .art-ring').forEach(el => {
    el.style.animation = state.settings.vinyl ? '' : 'none';
  });
  localStorage.setItem('em_auto', state.settings.autoplay ? '1' : '0');
  localStorage.setItem('em_notify', state.settings.notify ? '1' : '0');
  localStorage.setItem('em_vinyl', state.settings.vinyl ? '1' : '0');
  localStorage.setItem('em_save', state.settings.save ? '1' : '0');
}

els.setAutoplay.addEventListener('change', () => { state.settings.autoplay = els.setAutoplay.checked; applySettings(); });
els.setNotify.addEventListener('change', () => {
  state.settings.notify = els.setNotify.checked; applySettings();
  if (state.settings.notify) askNotifications();
});
els.setVinyl.addEventListener('change', () => { state.settings.vinyl = els.setVinyl.checked; applySettings(); });
els.setSave.addEventListener('change', () => { state.settings.save = els.setSave.checked; applySettings(); });

function askNotifications() {
  if (!('Notification' in window)) { toast('Este navegador no soporta notificaciones'); return; }
  if (Notification.permission === 'default') Notification.requestPermission().then(p => toast(p === 'granted' ? 'Notificaciones activadas' : 'Notificaciones bloqueadas'));
}

/* ---------- Compartir ---------- */
async function shareRadio() {
  const data = {
    title: CONFIG.name + ' — En Vivo',
    text: state.title ? `🎵 Ahora en ${CONFIG.name}\n${state.title}\nRadio en vivo.` : `Escucha ${CONFIG.name} en vivo · La mejor música.`,
    url: location.href.split('#')[0]
  };
  if (navigator.share) {
    try { await navigator.share(data); } catch (e) { /* cancelado */ }
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(data.text + ' ' + data.url).catch(() => {});
    toast('Enlace copiado al portapapeles');
  } else {
    toast('Escucha: ' + data.url);
  }
}
els.btnShare.addEventListener('click', shareRadio);
els.btnShare2.addEventListener('click', shareRadio);

/* ---------- WhatsApp / Pedidos ---------- */
function wppUrl() {
  return CONFIG.socials.whatsapp + '?text=' + encodeURIComponent(CONFIG.wppText);
}
els.wppBtn.addEventListener('click', () => window.open(wppUrl(), '_blank'));
els.djWppBtn?.addEventListener('click', () => window.open(wppUrl(), '_blank'));
els.djCallBtn?.addEventListener('click', () => {
  const tel = (CONFIG.socials.whatsapp || '').replace('https://wa.me/', '').split('?')[0];
  if (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)) location.href = 'tel:+' + tel;
  else { window.open(wppUrl(), '_blank'); }
});

/* ---------- Teclado ---------- */
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !/INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) {
    e.preventDefault(); togglePlay();
  }
  if (e.key === 'ArrowUp') { state.volume = Math.min(100, state.volume + 5); syncVol(); }
  if (e.key === 'ArrowDown') { state.volume = Math.max(0, state.volume - 5); syncVol(); }
  if (e.key === 'Escape') closeMenu();
});

/* ---------- PWA: instalación ---------- */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  els.installBtn.hidden = false;
  els.installBtn2.hidden = false;
});
function doInstall() {
  if (!deferredPrompt) { toast('Abre desde Chrome/Edge para instalar'); return; }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
}
els.installBtn.addEventListener('click', doInstall);
els.installBtn2.addEventListener('click', doInstall);
window.addEventListener('appinstalled', () => { toast('¡App instalada! 🎉'); els.installBtn.classList.add('hidden'); });

/* ---------- Audio events ---------- */
audio.addEventListener('playing', () => setPlaying(true));
audio.addEventListener('play', () => { if (!audio.paused) setPlaying(true); });
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('error', () => { if (state.playing) { setPlaying(false); toast('Conexión perdida · reintentando…'); setTimeout(restartStream, 3500); } });

/* ---------- Arranque ---------- */
function init() {
  applySettings();
  buildThemeGrid();
  applyTheme(state.theme);
  injectSocials();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  connectZeno();

  if (state.settings.autoplay) {
    setTimeout(() => setPlaying(true, true), 400);
  }

  /* Panel lateral desktop siempre visible */
  const mq = window.matchMedia('(min-width: 760px)');
  const onMq = () => { if (mq.matches) els.sidebar.classList.remove('open'); };
  mq.addEventListener('change', onMq);
  if (mq.matches) {
    els.sidebar.style.width = '250px';
    els.sidebar.style.transform = 'translateX(0)';
    document.body.style.paddingLeft = '250px';
  }

  console.log('%c ' + CONFIG.name + ' %c Player PWA v1.0 ', 'background:linear-gradient(120deg,#ffd400,#ff8a00);color:#000;padding:4px 8px;border-radius:6px 0 0 6px;font-weight:700', 'background:#0c0a07;color:#fff;padding:4px 8px;border-radius:0 6px 6px 0');
}

init();
