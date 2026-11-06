Apps.bank = {
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>П-Банк</h2></div>
      <div class="card" style="background:linear-gradient(135deg,#1e40af,#7c3aed)">
        <div style="font-size:12px;opacity:.8">Баланс</div>
        <div style="font-size:32px;font-weight:800">${Game.fmt(Game.state.money)}</div>
        <div style="font-size:12px;opacity:.8">Ур. ${Game.state.level} · Репутация ${Game.state.reputation}</div>
      </div>
      <div class="card">
        <h3>Кредит</h3>
        <p style="font-size:13px;color:#888;margin-bottom:8px">Лимит: ${Game.fmt(Game.state.level*200000)}</p>
        ${Game.state.debt>0
          ?`<div class="defect">Долг: ${Game.fmt(Game.state.debt)}</div>
             <button class="green" onclick="Apps.bank.repay()" style="width:100%;margin-top:8px">Погасить</button>`
          :`<div class="btn-row">
              <button onclick="Apps.bank.loan(50000)">Взять 50k</button>
              <button onclick="Apps.bank.loan(100000)">Взять 100k</button>
            </div>`}
      </div>
      <div class="card">
        <h3>Статистика</h3>
        <div>Куплено: ${Game.state.stats.bought}</div>
        <div>Продано: ${Game.state.stats.sold}</div>
        <div>Профит: ${Game.fmt(Game.state.stats.profit)}</div>
      </div>
    `;
  },
  loan(sum) {
    if (sum > Game.state.level*200000) return alert('Лимит превышен');
    if (Game.state.debt>0) return alert('Сначала погаси текущий');
    Game.state.money += sum;
    Game.state.debt = Math.round(sum*1.3);
    Game.save(); UI.updateStatus(); this.render();
  },
  repay() {
    if (Game.state.money < Game.state.debt) return alert('Не хватает');
    Game.state.money -= Game.state.debt;
    Game.state.debt = 0;
    Game.save(); UI.updateStatus(); this.render();
  }
};
