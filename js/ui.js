/* ====== Оболочка «телефона» + запуск ====== */

const UI = {
  apps: [
    { id:'avtobuy', name:'AvtoBuy', icon:'🚗' },
    { id:'messages', name:'Сообщения', icon:'💬' },
    { id:'bank', name:'П-Банк', icon:'🏦' },
    { id:'garage', name:'Гараж', icon:'🔧' },
    { id:'casino', name:'Casino', icon:'🎰' },
    { id:'profile', name:'Профиль', icon:'👤' },
    { id:'shop', name:'Магазин', icon:'🛒' },
    { id:'numbers', name:'Номера', icon:'🔢' },
    { id:'realestate', name:'Недвижимость', icon:'🏠' },
    { id:'taxi', name:'Таксопарк', icon:'🚕' },
    { id:'sleep', name:'Сон', icon:'💤' }
  ],

  init() {
    Game.init();
    this.renderHome();
    this.updateStatus();
  },

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
    s.innerHTML = `<div class="app-grid">` + this.apps.map(a =>
      `<div class="app-icon" onclick="UI.open('${a.id}')">
        <div class="icon">${a.icon}</div><span>${a.name}</span>
      </div>`).join('') + `</div>`;

    const dock = document.getElementById('dock');
    dock.innerHTML = ['avtobuy','messages','bank','profile'].map(id => {
      const a = this.apps.find(x => x.id === id);
      return `<div class="dock-icon" onclick="UI.open('${id}')">${a.icon}</div>`;
    }).join('');
  },

  open(id) { if (Apps[id] && Apps[id].render) Apps[id].render(); },

  back() { this.renderHome(); this.updateStatus(); }
};

/* ====== Запуск с защитой от ошибок ====== */
(function boot() {
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
      return;
    }
    UI.init();
  } catch (e) {
    console.error('Boot error:', e);
    const scr = document.getElementById('screen');
    if (scr) scr.innerHTML =
      '<div class="card" style="background:#7f1d1d">' +
        '<h3>Ошибка запуска</h3>' +
        '<div style="font-size:12px;margin-top:6px">' + e.message + '</div>' +
        '<button style="margin-top:10px" onclick="localStorage.removeItem(Game.SAVE_KEY);location.reload()">Сброс и перезапуск</button>' +
      '</div>';
  }
})();
