Apps.saves = {
  render() {
    const s = document.getElementById('screen');
    const slots = Game.getSlotsInfo();
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Сохранения 💾</h2></div>
      <div class="card" style="background:linear-gradient(135deg,rgba(100,116,139,.18),rgba(30,41,59,.18))">
        <h3>3 слота</h3>
        <div style="font-size:13px;color:#888">Каждый слот — отдельный прогресс. Активный слот автосохраняется.</div>
      </div>
      ${slots.map(sl => `
        <div class="card" style="${sl.active?'border-color:#7c5cff;background:rgba(124,92,255,.12)':''}">
          <h3>Слот ${sl.slot} ${sl.active?'<span style="font-size:11px;color:#7c5cff">● активен</span>':''}</h3>
          ${sl.empty 
            ? '<div style="color:#888;font-size:13px">Пусто</div>'
            : `<div>День ${sl.day} · <b style="color:#00e5a0">${Game.fmt(sl.money)}</b></div>
               <div style="font-size:12px;color:#888">Ур. ${sl.level} · Машин: ${sl.garageCount}</div>`}
          <div class="btn-row">
            ${!sl.active && !sl.empty ? `<button class="green" onclick="Apps.saves.load(${sl.slot})">Загрузить</button>` : ''}
            ${!sl.active && sl.empty ? `<button class="green" onclick="Apps.saves.load(${sl.slot})">Новая игра</button>` : ''}
            ${!sl.empty ? `<button class="red" onclick="Apps.saves.del(${sl.slot})">Удалить</button>` : ''}
          </div>
        </div>
      `).join('')}
    `;
  },
  load(n) {
    if (n === Game.activeSlot) return;
    if (!confirm(`Загрузить слот ${n}? Текущий прогресс останется в своём слоте.`)) return;
    Game.loadSlot(n);
    UI.updateStatus();
    UI.renderHome();
    UI.toast(`Загружен слот ${n}`, 'green');
  },
  del(n) {
    if (!confirm(`Удалить слот ${n}? Это нельзя отменить.`)) return;
    Game.deleteSlot(n);
    if (n === Game.activeSlot) {
      Game.newGame();
      Game.save();
      UI.renderHome();
      UI.updateStatus();
    } else {
      this.render();
    }
    UI.toast(`Слот ${n} удалён`, 'red');
  }
};
