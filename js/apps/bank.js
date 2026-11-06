Apps.bank = {
  render() {
    const s = document.getElementById('screen');
    const taxDebt = Game.state.taxDebt || 0;
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>П-Банк</h2></div>

      <div class="card" style="background:linear-gradient(135deg,#1e40af,#7c3aed)">
        <div style="font-size:12px;opacity:.8">Баланс</div>
        <div style="font-size:32px;font-weight:800">${Game.fmt(Game.state.money)}</div>
        <div style="font-size:12px;opacity:.8">Ур. ${Game.state.level} · Репутация ${Game.state.reputation}</div>
      </div>

      ${taxDebt > 0 ? `
        <div class="card" style="background:linear-gradient(135deg,rgba(255,71,87,.2),rgba(196,30,47,.2));border-color:rgba(255,71,87,.4)">
          <h3>⚠ Долг по налогам и штрафам</h3>
          <div style="font-size:22px;font-weight:800;color:#ff4757;margin:8px 0">${Game.fmt(taxDebt)}</div>
          <div style="font-size:12px;color:#888">Копится НДФЛ 13% с прибыли и штрафы. Растёт на 5% в неделю.</div>
          <button class="red" style="width:100%;margin-top:10px" onclick="Apps.bank.payTax()">Оплатить всё</button>
        </div>
      ` : `
        <div class="card" style="background:linear-gradient(135deg,rgba(0,214,143,.15),rgba(0,168,116,.15));border-color:rgba(0,214,143,.3)">
          <h3>✓ Долгов нет</h3>
          <div style="font-size:12px;color:#888">НДФЛ и штрафы будут копиться здесь.</div>
        </div>
      `}

      <div class="card">
        <h3>Кредит</h3>
        <p style="font-size:13px;color:#888;margin-bottom:8px">Лимит: ${Game.fmt(Game.state.level*150000)} · 30% переплата</p>
        ${Game.state.debt>0
          ?`<div class="defect">Долг: ${Game.fmt(Game.state.debt)}</div>
             <button class="green" onclick="Apps.bank.repay()" style="width:100%;margin-top:8px">Погасить</button>`
          :`<div class="btn-row">
              <button onclick="Apps.bank.loan(50000)">Взять 50k</button>
              <button onclick="Apps.bank.loan(100000)">Взять 100k</button>
              <button onclick="Apps.bank.loan(${Game.state.level*150000})">Максимум</button>
            </div>`}
      </div>

      <div class="card">
        <h3>Статистика</h3>
        <div>Куплено: ${Game.state.stats.bought}</div>
        <div>Продано: ${Game.state.stats.sold}</div>
        <div>Профит: <b style="color:#00d68f">${Game.fmt(Game.state.stats.profit)}</b></div>
        <div>Тюнингов: ${Game.state.stats.tuningsInstalled}</div>
        <div>Номеров продано: ${Game.state.stats.numbersSold}</div>
      </div>
    `;
  },
  payTax() {
    const taxDebt = Game.state.taxDebt || 0;
    if (taxDebt <= 0) return alert('Долгов нет');
    if (Game.state.money < taxDebt) return alert('Не хватает денег');
    Game.state.money -= taxDebt;
    Game.state.taxDebt = 0;
    Game.state.lastTaxDay = Game.state.day;
    Game.save(); UI.updateStatus();
    this.render();
    alert('Долг погашен');
  },
  loan(sum) {
    if (sum > Game.state.level*150000) return alert('Лимит превышен');
    if (Game.state.debt>0) return alert('Сначала погаси текущий');
    Game.state.money += sum;
    Game.state.debt = Math.round(sum*1.3);
    Game.save(); UI.updateStatus(); this.render();
    alert(`Кредит ${Game.fmt(sum)} выдан. К возврату: ${Game.fmt(Game.state.debt)}`);
  },
  repay() {
    if (Game.state.money < Game.state.debt) return alert('Не хватает');
    Game.state.money -= Game.state.debt;
    Game.state.debt = 0;
    Game.save(); UI.updateStatus(); this.render();
    alert('Кредит погашен');
  }
};
