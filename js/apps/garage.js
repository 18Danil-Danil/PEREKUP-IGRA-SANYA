Apps.garage = {
  render() {
    const s = document.getElementById('screen');
    const g = Game.state.garage;
    const hasSTO = Game.state.businesses && Game.state.businesses.sto;
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Гараж (${g.length})</h2></div>
      ${hasSTO ? '<div class="card" style="background:rgba(0,229,160,.1);border-color:rgba(0,229,160,.3)"><h3>🔧 Своё СТО</h3><div style="font-size:13px;color:#888">Ремонт −50%</div></div>' : ''}
      ${g.map((c,i) => `
        <div class="card">
          <h3>${c.icon} ${c.name} ${c.registered?'<span class="good" style="font-size:11px">✓ на учёте</span>':'<span class="defect" style="font-size:11px">⚠ не на учёте</span>'}</h3>
          <div>Куплено: ${Game.fmt(c.price)} · Рынок: ${Game.fmt(c.market + (c.tunings||[]).reduce((s,t)=>s+t.bonus,0))}</div>
          ${c.number?`<div>🔢 ${c.number.num} (+${Game.fmt(c.number.price)})</div>`:''}
          ${c.defects.length?c.defects.map(d=>`<div class="defect">⚠ ${d}</div>`).join(''):'<div class="good">✓ Исправна</div>'}
          ${(c.tunings||[]).length?`<div class="good">🔧 ${c.tunings.map(t=>t.name).join(', ')}</div>`:''}
          <div class="btn-row">
            ${c.defects.length?`<button class="gray" onclick="Apps.garage.repair(${i})">Ремонт (${Game.fmt(c.defects.length*25000*(hasSTO?0.5:1))})</button>`:''}
            <button class="gray" onclick="Apps.garage.tuneMenu(${i})">🔧 Тюнинг</button>
            <button class="green" onclick="Apps.garage.sellMenu(${i})">Продать</button>
          </div>
        </div>`).join('') || '<p style="color:#888">Гараж пуст. Купи машину на AvtoBuy.</p>'}
    `;
  },
  repair(i) {
    const c = Game.state.garage[i];
    const hasSTO = Game.state.businesses && Game.state.businesses.sto;
    const cost = Math.round(c.defects.length * 25000 * (hasSTO ? 0.5 : 1));
    if (!c.defects.length) return alert('Нечего чинить');
    if (Game.state.money < cost) return alert('Не хватает денег');
    Game.state.money -= cost;
    c.defects = [];
    c.market = Math.round(c.market * 0.95);
    Game.save(); UI.updateStatus(); this.render();
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
          <div><div>${t.name}</div><div style="font-size:12px;color:#888">+${Game.fmt(t.bonus)}</div></div>
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
    Game.save(); UI.updateStatus(); this.tuneMenu(i);
  },
  sellMenu(i) {
    const c = Game.state.garage[i];
    const fastPrice = Math.round((c.market + (c.tunings||[]).reduce((s,t)=>s+t.bonus,0)) * 0.7);
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.garage.render()">←</span><h2>Продажа: ${c.name}</h2></div>
      <div class="card">
        <h3>💨 Быстро (перекупу)</h3>
        <div class="price">${Game.fmt(fastPrice)}</div>
        <div style="font-size:12px;color:#888;margin-top:4px">−30% от рынка, без ожидания</div>
        <button class="gray" style="margin-top:10px;width:100%" onclick="Apps.garage.fastSell(${i})">Продать</button>
      </div>
      <div class="card">
        <h3>🏷️ Выставить объявление</h3>
        <div style="font-size:13px;color:#888">Сам назначишь цену. Покупатели придут через 1–3 дня</div>
        <input id="listPrice" type="number" value="${c.market}" placeholder="Цена">
        <button class="green" style="width:100%" onclick="Apps.garage.listOnMarket(${i})">Выставить</button>
      </div>
    `;
  },
  fastSell(i) {
    const c = Game.state.garage[i];
    if (!c.registered) {
      if (!confirm('Машина не на учёте. Штраф 30 000 ₽. Продолжить?')) return;
      Game.addFine('Продажа без учёта', 30000);
    }
    const mp = c.market + (c.tunings||[]).reduce((s,t)=>s+t.bonus,0) + (c.number?c.number.price:0);
    const sellPrice = Math.round(mp * 0.7);
    const spent = c.price + (c.tunings||[]).reduce((s,t)=>s+t.price,0);
    const profit = sellPrice - spent;
    Game.state.money += sellPrice;
    const tax = Game.applyTax(profit);
    Game.state.stats.profit += profit;
    Game.state.stats.sold++;
    Game.state.garage.splice(i, 1);
    Game.addXP(20);
    Game.save(); UI.updateStatus(); this.render();
    alert(`Продано за ${Game.fmt(sellPrice)}\nПрофит: ${Game.fmt(profit)}${tax>0?'\nНДФЛ: '+Game.fmt(tax):''}`);
  },
  listOnMarket(i) {
    const c = Game.state.garage[i];
    const price = parseInt(document.getElementById('listPrice').value);
    if (isNaN(price) || price < 1000) return alert('Некорректная цена');
    if (!c.registered) {
      if (!confirm('Машина не на учёте. Штраф 30 000 ₽. Продолжить?')) return;
      Game.addFine('Продажа без учёта', 30000);
    }
    Apps.trade.listCar(c.id, price);
    alert('Выставлено на продажу. Покупатели начнут приходить.');
    this.render();
  }
};
