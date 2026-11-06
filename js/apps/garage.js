Apps.garage = {
  render() {
    const s = document.getElementById('screen');
    const g = Game.state.garage;
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Гараж (${g.length})</h2></div>
      ${g.map((c,i) => `
        <div class="card">
          <h3>${c.icon} ${c.name}</h3>
          <div>Куплено: ${Game.fmt(c.price)} · Рынок: ${Game.fmt(c.market + (c.tunings||[]).reduce((s,t)=>s+t.bonus,0))}</div>
          ${c.number?`<div>🔢 ${c.number.num} (+${Game.fmt(c.number.price)})</div>`:''}
          ${c.defects.length?c.defects.map(d=>`<div class="defect">⚠ ${d}</div>`).join(''):'<div class="good">✓ Исправна</div>'}
          ${(c.tunings||[]).length?`<div class="good">🔧 ${c.tunings.map(t=>t.name).join(', ')}</div>`:''}
          <div class="btn-row">
            ${c.defects.length?`<button class="gray" onclick="Apps.garage.repair(${i})">Ремонт (${Game.fmt(c.defects.length*15000)})</button>`:''}
            <button class="gray" onclick="Apps.garage.tuneMenu(${i})">🔧 Тюнинг</button>
            <button class="green" onclick="Apps.garage.sell(${i})">Продать</button>
          </div>
        </div>`).join('') || '<p style="color:#888">Гараж пуст.</p>'}
    `;
  },
  repair(i) {
    const c = Game.state.garage[i];
    const cost = c.defects.length * 15000;
    if (!c.defects.length) return alert('Нечего чинить');
    if (Game.state.money < cost) return alert('Не хватает денег');
    Game.state.money -= cost;
    c.defects = [];
    c.market = Math.round(c.market * 0.95);
    Game.save(); UI.updateStatus();
    this.render(); alert('Отремонтировано');
  },
  tuneMenu(i) {
    const c = Game.state.garage[i];
    const owned = (c.tunings||[]).map(t=>t.name);
    const avail = TUNING.filter(t => !owned.includes(t.name));
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.garage.render()">←</span><h2>Тюнинг: ${c.name}</h2></div>
      ${avail.length?avail.map(t=>`
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div>${t.name}</div>
            <div style="font-size:12px;color:#888">+${Game.fmt(t.bonus)}</div>
          </div>
          <button class="green" onclick="Apps.garage.tune(${i}, '${t.name}')">${Game.fmt(t.price)}</button>
        </div>`).join('') : '<p style="color:#888">Всё установлено</p>'}
    `;
  },
  tune(i, name) {
    const c = Game.state.garage[i];
    const t = TUNING.find(x => x.name === name);
    if (!t) return;
    if (Game.state.money < t.price) return alert('Недостаточно денег');
    if (!c.tunings) c.tunings = [];
    c.tunings.push(t);
    Game.state.money -= t.price;
    Game.state.stats.tuningsInstalled++;
    Game.addXP(10);
    Game.save(); UI.updateStatus();
    this.tuneMenu(i);
  },
  sell(i) {
    const c = Game.state.garage[i];
    let mp = c.market + (c.tunings||[]).reduce((s,t)=>s+t.bonus,0) + (c.number?c.number.price:0);
    const sellPrice = Math.round(mp * (0.85 + Math.random()*0.2));
    Game.state.money += sellPrice;
    const spent = c.price + (c.tunings||[]).reduce((s,t)=>s+t.price,0);
    Game.state.stats.profit += sellPrice - spent;
    Game.state.stats.sold++;
    Game.state.garage.splice(i, 1);
    Game.addXP(30);
    Game.save(); UI.updateStatus();
    this.render();
    alert(`Продано за ${Game.fmt(sellPrice)}\nПрофит: ${Game.fmt(sellPrice - spent)}`);
  }
};
