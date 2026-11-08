// 🔑 КРИТИЧЕСКИЙ ФИКС: const Apps в data.js не попадает в window автоматически.
// Прокидываем вручную, чтобы работали проверки window.Apps в game.js и sleep.js.
if (typeof Apps !== 'undefined') window.Apps = Apps;

const UI = {
  apps: [
    { id:'avtobuy',       name:'AvtoBuy',      icon:'🚗', color:'linear-gradient(135deg,#4a8cff,#1e40af)' },
    { id:'messages',      name:'Сообщения',    icon:'💬', color:'linear-gradient(135deg,#00e5a0,#008f5f)' },
    { id:'bank',          name:'П-Банк',       icon:'🏦', color:'linear-gradient(135deg,#b366ff,#6b21a8)' },
    { id:'garage',        name:'Гараж',        icon:'🔧', color:'linear-gradient(135deg,#ffb547,#b45309)' },
    { id:'trade',         name:'Мои объявл.',  icon:'🏷️', color:'linear-gradient(135deg,#00e5a0,#047857)' },
    { id:'jobs',          name:'Работа',       icon:'💼', color:'linear-gradient(135deg,#ffd93d,#a16207)' },
    { id:'business',      name:'Бизнес',       icon:'🏢', color:'linear-gradient(135deg,#f97316,#7c2d12)' },
    { id:'race',          name:'Гонки',        icon:'🏁', color:'linear-gradient(135deg,#ef4444,#7f1d1d)' },
    { id:'casino',        name:'Casino',       icon:'🎰', color:'linear-gradient(135deg,#ff5470,#991b1b)' },
    { id:'family',        name:'Родные',       icon:'👨‍👩‍👧', color:'linear-gradient(135deg,#ff6bb3,#831843)' },
    { id:'gosbuy',        name:'ГосBuy',       icon:'🪪', color:'linear-gradient(135deg,#8ba3c7,#1e293b)' },
    { id:'profile',       name:'Профиль',      icon:'👤', color:'linear-gradient(135deg,#7c8fa8,#334155)' },
    { id:'achievements',  name:'Достижения',   icon:'🏅', color:'linear-gradient(135deg,#ffcd3c,#b45309)' },
    { id:'shop',          name:'Магазин',      icon:'🛒', color:'linear-gradient(135deg,#3dd8e8,#0e7490)' },
    { id:'numbers',       name:'Номера',       icon:'🔢', color:'linear-gradient(135deg,#ffd93d,#854d0e)' },
    { id:'auction',       name:'Аукцион',      icon:'🏛️', color:'linear-gradient(135deg,#3ddbc0,#115e59)' },
    { id:'carImport',     name:'Импорт',       icon:'✈️', color:'linear-gradient(135deg,#3dd8e8,#0369a1)' },
    { id:'realestate',    name:'Недвижимость', icon:'🏠', color:'linear-gradient(135deg,#ff9352,#9a3412)' },
    { id:'taxi',          name:'Таксопарк',    icon:'🚕', color:'linear-gradient(135deg,#ffd93d,#d97706)' },
    { id:'sleep',         name:'Сон',          icon:'💤', color:'linear-gradient(135deg,#8b93ff,#3730a3)' },
    { id:'tutorial',      name:'Как играть',   icon:'📖', color:'linear-gradient(135deg,#7c5cff,#3730a3)' },
    { id:'saves',         name:'Сохранения',   icon:'💾', color:'linear-gradient(135deg,#64748b,#1e293b)' }
  ],

  _lastMoney: null,
  _currentAppId: null,

  init() {
    Game.init();
    this._installShell();
    this.renderHome();
    this.updateStatus();
    this._installRipple();
    this._installScreenObserver();
    this._installToast();

    if (!Game.state.tutorialShown) {
      setTimeout(() => this.open('tutorial'), 400);
    }
  },

  _installShell() {
    const style = document.createElement('style');
    style.textContent = `
      #save-indicator { font-size:11px; opacity:0; margin-right:6px; display:inline-block; }
      @keyframes saveFlash {
        0%   { opacity:0; transform:scale(.8); }
        20%  { opacity:1; transform:scale(1.15); }
        100% { opacity:0; transform:scale(1); }
      }
      #save-indicator.flash { animation: saveFlash .8s ease-out; }
      #bell { position:relative; cursor:pointer; font-size:16px; padding:0 6px; user-select:none; }
      #bell:active { transform:scale(.85); }
      #bell-badge {
        position:absolute; top:-4px; right:-2px;
        background:#ff5470; color:#fff; font-size:9px; font-weight:800;
        border-radius:8px; padding:1px 4px; min-width:14px; text-align:center;
        display:none; box-shadow:0 0 8px rgba(255,84,112,.6);
      }
      #bell-badge.show { display:inline-block; }
    `;
    document.head.appendChild(style);

    const sb = document.getElementById('statusbar');
    if (!sb) return;

    if (!document.getElementById('save-indicator')) {
      const save = document.createElement('span');
      save.id = 'save-indicator';
      save.textContent = '💾';
      sb.insertBefore(save, sb.firstChild);
    }

    if (!document.getElementById('bell')) {
      const bell = document.createElement('span');
      bell.id = 'bell';
      bell.innerHTML = '🔔<span id="bell-badge">0</span>';
      bell.onclick = () => UI.open('notifications');
      const money = document.getElementById('money');
      sb.insertBefore(bell, money);
    }
  },

  updateStatus() {
    const clockEl = document.getElementById('clock');
    const moneyEl = document.getElementById('money');
    if (!clockEl || !moneyEl) return;
    const newVal = Game.state.money;
    moneyEl.textContent = '💰 ' + Game.fmt(newVal);
    if (this._lastMoney !== null && this._lastMoney !== newVal) {
      moneyEl.classList.remove('pulse');
      void moneyEl.offsetWidth;
      moneyEl.classList.add('pulse');
    }
    this._lastMoney = newVal;
    const h = String(Game.state.hour).padStart(2,'0');
    clockEl.textContent = `День ${Game.state.day}, ${h}:00`;

    const badge = document.getElementById('bell-badge');
    if (badge) {
      const unread = (Game.state.notifications || []).filter(n => !n.read).length;
      if (unread > 0) {
        badge.textContent = unread > 99 ? '99+' : unread;
        badge.classList.add('show');
      } else {
        badge.classList.remove('show');
      }
    }
  },

  renderHome() {
    const s = document.getElementById('screen');
    s.innerHTML = `<div class="app-grid">` + this.apps.map((a,i) =>
      `<div class="app-icon" style="animation-delay:${(i*0.03).toFixed(2)}s" onclick="UI.open('${a.id}')">
        <div class="icon" style="background:${a.color}">${a.icon}</div>
        <span>${a.name}</span>
      </div>`).join('') + `</div>`;
    const dock = document.getElementById('dock');
    dock.innerHTML = ['avtobuy','messages','bank','profile'].map(id => {
      const a = this.apps.find(x => x.id === id);
      return `<div class="dock-icon" style="background:${a.color}" onclick="UI.open('${id}')">${a.icon}</div>`;
    }).join('');
  },

  _cleanupApp(id) {
    if (id === 'jobs' && Apps.jobs && Apps.jobs.cleanup) Apps.jobs.cleanup();
    if (id === 'race' && Apps.race && Apps.race.cleanup) Apps.race.cleanup();
  },

  open(id) {
    if (id !== 'casino' && Apps.casino && Apps.casino.crashState && Apps.casino.crashState.interval) {
      clearInterval(Apps.casino.crashState.interval);
      Apps.casino.crashState.active = false;
    }
    if (this._currentAppId && this._currentAppId !== id) {
      this._cleanupApp(this._currentAppId);
    }
    this._currentAppId = id;

    try {
      if (Apps[id] && Apps[id].render) Apps[id].render();
      else this.toast('Приложение "' + id + '" не загружено', 'red');
    } catch (e) {
      console.error('Render error in app', id, e);
      this.toast('Ошибка: ' + e.message, 'red');
    }
  },

  back() {
    if (Apps.casino && Apps.casino.crashState && Apps.casino.crashState.interval) {
      clearInterval(Apps.casino.crashState.interval);
      Apps.casino.crashState.active = false;
    }
    if (this._currentAppId) this._cleanupApp(this._currentAppId);
    this._currentAppId = null;

    this.renderHome();
    this.updateStatus();
  },

  _installScreenObserver() {
    const s = document.getElementById('screen');
    if (!s) return;
    const observer = new MutationObserver(() => {
      s.style.animation = 'none';
      void s.offsetWidth;
      s.style.animation = '';
    });
    observer.observe(s, { childList: true });
  },

  _installRipple() {
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    }, { passive:true });
  },

  _installToast() {
    const style = document.createElement('style');
    style.textContent = `
      .toast-wrap { position:fixed; top:24px; left:50%; transform:translateX(-50%);
        z-index:9999; display:flex; flex-direction:column; gap:8px;
        pointer-events:none; width:calc(100% - 40px); max-width:380px; }
      .toast { padding:12px 18px; border-radius:14px; font-size:14px; font-weight:600;
        color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.5);
        animation:toastIn .35s cubic-bezier(.16,1,.3,1);
        backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
        border:1px solid rgba(255,255,255,.15); }
      .toast.green { background:linear-gradient(135deg,rgba(0,229,160,.9),rgba(0,168,116,.9)); }
      .toast.red   { background:linear-gradient(135deg,rgba(255,84,112,.9),rgba(196,30,47,.9)); }
      .toast.gold  { background:linear-gradient(135deg,rgba(255,205,60,.95),rgba(224,168,0,.95)); color:#1a1a2e; }
      .toast.info  { background:linear-gradient(135deg,rgba(124,92,255,.9),rgba(90,63,232,.9)); }
      @keyframes toastIn { from { opacity:0; transform:translateY(-12px) scale(.95); }
        to { opacity:1; transform:translateY(0) scale(1); } }
    `;
    document.head.appendChild(style);
    let wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
    this._toastWrap = wrap;
  },

  toast(text, type = 'info', duration = 2600) {
    if (!this._toastWrap) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = text;
    this._toastWrap.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(-8px)';
      setTimeout(() => t.remove(), 320);
    }, duration);
  }
};

(function boot() {
  try {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); return; }
    UI.init();
  } catch (e) {
    console.error('Boot error:', e);
    const scr = document.getElementById('screen');
    if (scr) scr.innerHTML =
      '<div class="card" style="background:rgba(255,84,112,.25);border-color:#ff5470"><h3>⚠ Ошибка запуска</h3>' +
      '<div style="font-size:12px;margin-top:6px">' + e.message + '</div>' +
      '<button style="margin-top:10px" onclick="localStorage.clear();location.reload()">Сброс</button></div>';
  }
})();
