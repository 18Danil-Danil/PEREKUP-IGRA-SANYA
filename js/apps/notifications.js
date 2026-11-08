Apps.notifications = {
  render() {
    const s = document.getElementById('screen');
    // shallow-копия с сохранением прежнего read-статуса, чтобы показать «новые» другим цветом
    const items = (Game.state.notifications || []).slice().reverse().map(n => ({...n}));
    // теперь всё прочитано
    (Game.state.notifications || []).forEach(n => n.read = true);
    Game.save(); UI.updateStatus();

    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Уведомления 🔔</h2></div>
      ${items.length ? items.map(n => `
        <div class="card" style="${n.read ? '' : 'border-color:rgba(124,92,255,.5);background:rgba(124,92,255,.1)'}">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <div style="font-size:24px;line-height:1">${n.icon}</div>
            <div style="flex:1">
              <div style="font-size:14px;line-height:1.35">${n.text}</div>
              <div style="font-size:11px;color:#666;margin-top:6px">День ${n.day}, ${String(n.hour).padStart(2,'0')}:00</div>
            </div>
          </div>
        </div>
      `).join('') : `
        <div class="card" style="text-align:center;padding:40px 20px">
          <div style="font-size:56px;opacity:.4;margin-bottom:12px">🔔</div>
          <div style="color:#888;font-size:14px">Пока пусто</div>
          <div style="color:#666;font-size:12px;margin-top:6px">Здесь появятся события: прибытие импорта, победы на аукционе, ДР родных, покупатели на твои машины</div>
        </div>
      `}
      ${items.length ? `<button class="gray" style="width:100%;margin-top:8px" onclick="Apps.notifications.clear()">Очистить все</button>` : ''}
    `;
  },

  clear() {
    if (!confirm('Очистить все уведомления?')) return;
    Game.state.notifications = [];
    Game.save(); UI.updateStatus(); this.render();
  }
};
