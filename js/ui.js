const UI = {
  apps: [
    { id:'avtobuy',    name:'AvtoBuy',       icon:'🚗', color:'linear-gradient(135deg,#3b82f6,#1e40af)' },
    { id:'messages',   name:'Сообщения',     icon:'💬', color:'linear-gradient(135deg,#00d68f,#008f5f)' },
    { id:'bank',       name:'П-Банк',        icon:'🏦', color:'linear-gradient(135deg,#a855f7,#6b21a8)' },
    { id:'garage',     name:'Гараж',         icon:'🔧', color:'linear-gradient(135deg,#f59e0b,#b45309)' },
    { id:'jobs',       name:'Работа',        icon:'💼', color:'linear-gradient(135deg,#eab308,#854d0e)' },
    { id:'casino',     name:'Casino',        icon:'🎰', color:'linear-gradient(135deg,#ef4444,#991b1b)' },
    { id:'family',     name:'Родные',        icon:'👨‍👩‍👧', color:'linear-gradient(135deg,#ec4899,#831843)' },
    { id:'gosbuy',     name:'ГосBuy',        icon:'🪪', color:'linear-gradient(135deg,#64748b,#1e293b)' },
    { id:'profile',    name:'Профиль',       icon:'👤', color:'linear-gradient(135deg,#64748b,#334155)' },
    { id:'shop',       name:'Магазин',       icon:'🛒', color:'linear-gradient(135deg,#06b6d4,#0e7490)' },
    { id:'numbers',    name:'Номера',        icon:'🔢', color:'linear-gradient(135deg,#eab308,#854d0e)' },
    { id:'auction',    name:'Аукцион',       icon:'🏛️', color:'linear-gradient(135deg,#14b8a6,#115e59)' },
    { id:'carImport',  name:'Импорт',        icon:'✈️', color:'linear-gradient(135deg,#06b6d4,#0369a1)' },
    { id:'realestate', name:'Недвижимость',  icon:'🏠', color:'linear-gradient(135deg,#f97316,#9a3412)' },
    { id:'taxi',       name:'Таксопарк',     icon:'🚕', color:'linear-gradient(135deg,#fbbf24,#d97706)' },
    { id:'sleep',      name:'Сон',           icon:'💤', color:'linear-gradient(135deg,#6366f1,#3730a3)' }
  ],

  init() { Game.init(); this.renderHome(); this.updateStatus(); },

  updateStatus() {
    const clockEl = document.getElementById('clock');
    const moneyEl = document.getElementById('money');
    if (!clockEl || !moneyEl) return;
    moneyEl.textContent = '💰 ' + Game.fmt(Game.state.money);
    const h = String(Game.state.hour).padStart(2,'0');
    clockEl.textContent = `День ${Game.state.day}, ${h}:00`;
  },

  renderHome() {
    const s = document.getElementById('screen');
    s.innerHTML = `<div class="app-grid">` + this.apps.map((a,i) =>
      `<div class="app-icon" style="animation-delay:${i*0.03}s" onclick="UI.open('${a.id}')">
        <div class="icon" style="background:${a.color}">${a.icon}</div>
        <span>${a.name}</span>
      </div>`).join('') + `</div>`;

    const dock = document.getElementById('dock');
    dock.innerHTML = ['avtobuy','messages','bank','profile'].map(id => {
      const a = this.apps.find(x => x.id === id);
      return `<div class="dock-icon" style="background:${a.color}" onclick="UI.open('${id}')">${a.icon}</div>`;
    }).join('');
  },

  open(id) {
    if (id !== 'casino' && Apps.casino && Apps.casino.crashState && Apps.casino.crashState.interval) {
      clearInterval(Apps.casino.crashState.interval);
      Apps.casino.crashState.active = false;
    }
    try {
      if (Apps[id] && Apps[id].render) Apps[id].render();
      else alert('Приложение "' + id + '" не загружено. Проверь index.html');
    } catch (e) {
      console.error('Render error in app', id, e);
      alert('Ошибка в приложении "' + id + '":\n' + e.message);
    }
  },

  back() {
    if (Apps.casino && Apps.casino.crashState && Apps.casino.crashState.interval) {
      clearInterval(Apps.casino.crashState.interval);
      Apps.casino.crashState.active = false;
    }
    this.renderHome();
    this.updateStatus();
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
      '<div class="card" style="background:#7f1d1d"><h3>Ошибка запуска</h3>' +
      '<div style="font-size:12px;margin-top:6px">' + e.message + '</div>' +
      '<button style="margin-top:10px" onclick="localStorage.clear();location.reload()">Сброс</button></div>';
  }
})();
