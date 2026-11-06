Apps.avtobuy = {
  filter: '',
  render() {
    const s = document.getElementById('screen');
    const noLicense = !Game.state.hasLicense;
    let list = Game.state.listings.filter(l => !l.sold);
    if (this.filter) list = list.filter(l => l.name.toLowerCase().includes(this.filter.toLowerCase()));
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>AvtoBuy</h2></div>
      ${noLicense ? `<div class="card" style="background:linear-gradient(135deg,rgba(255,71,87,.15),rgba(196,30,47,.15));border-color:rgba(255,71,87,.3)">
        <h3>⚠ Нет прав</h3>
        <div style="font-size:13px;color:#888;margin:8px 0">Оформи права в ГосBuy, чтобы покупать и продавать авто.</div>
        <button class="red" onclick="UI.open('gosbuy')">Перейти в ГосBuy</button>
      </div>` : ''}
      <input placeholder="Поиск..." value="${this.filter}" oninput="Apps.avtobuy.setFilter(this.value)">
      ${list.map(l => `
        <div class="card" onclick="Apps.avtobuy.detail(${l.id})" style="cursor:pointer">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h3>${l.icon} ${l.name} <span style="color:#888;font-size:12px">${l.year}</span></h3>
            <div class="price">${Game.fmt(l.price)}</div>
          </div>
          <div class="market">Рынок: ${Game.fmt(l.market)} · ${l.mileage.toLocaleString('ru-RU')} км${l.number?' · 🔢'+l.number.num:''}</div>
          ${l.defects.length ? `<div class="defect">⚠ ${l.defects.length} дефект(ов)</div>` : '<div class="good">✓ Без видимых дефектов</div>'}
          ${l.price < l.market * 0.75 ? '<div class="good" style="margin-top:4px">🔥 Выгодно</div>' : ''}
        </div>`).join('') || '<p style="color:#888">Ничего не найдено</p>'}
    `;
  },
  setFilter(v) { this.filter = v; this.render(); },
  detail(id) {
    const l = Game.state.listings.find(x => x.id === id);
    if (!l) return;
    const s = document.getElementById('screen');
    const hasTools = Game.state.tools.thickness || Game.state.tools.obd;
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.avtobuy.render()">←</span><h2>${l.icon} ${l.name}</h2></div>
      <div class="card">
        <div>Год: ${l.year} · Пробег: ${l.mileage.toLocaleString('ru-RU')} км</div>
        <div>Цена: <span class="price">${Game.fmt(l.price)}</span></div>
        <div class="market">Рынок: ${Game.fmt(l.market)}</div>
        <div style="font-size:12px;color:#888;margin-top:6px">📋 ПТС при покупке: +${Game.fmt(GOV_FEES.pts)}</div>
        ${l.number?`<div style="margin-top:6px">🔢 ${l.number.num} (${l.number.region} рег.)</div>`:''}
      </div>
      <div class="card">
        <h3>Дефекты</h3>
        ${l.defects.length?l.defects.map(d=>`<div class="defect">⚠ ${d}</div>`).join(''):'<div class="good">✓ Видимых нет</div>'}
        ${l.inspected
          ? (l.hiddenDefects.length?l.hiddenDefects.map(d=>`<div class="defect">🚨 ${d}</div>`).join(''):'<div class="good">✓ Скрытых нет</div>')
          : '<div style="color:#888;font-size:13px;margin-top:8px">Скрытые дефекты не проверены</div>'}
      </div>
      <div class="btn-row">
        ${!l.inspected && hasTools?`<button class="gray" onclick="Apps.avtobuy.inspect(${l.id})">🔍 Осмотреть</button>`:''}
        <button class="green" onclick="Apps.avtobuy.buy(${l.id}, false)">Купить</button>
      </div>
      <div class="btn-row">
        <button onclick="Apps.avtobuy.buy(${l.id}, true)">💰 С задатком (-10%, риск)</button>
        <button class="gray" onclick="Apps.avtobuy.bargain(${l.id})">Торг</button>
      </div>
    `;
  },
  inspect(id) {
    const l = Game.state.listings.find(x => x.id === id);
    if (!l) return;
    const t = Game.state.tools;
    if (!t.thickness && !t.obd) return alert('Нужен толщиномер или OBD-сканер. Купи в Магазине.');
    const keep = [];
    l.hiddenDefects.forEach(d => {
      if (t.thickness && (d.includes('Шпаклёвка') || d.includes('коррозия') || d.includes('кузов'))) keep.push(d);
      if (t.obd && (d.includes('пробег') || d.includes('Течь') || d.includes('подвеска') || d.includes('коробка') || d.includes('вкладыши'))) keep.push(d);
    });
    l.hiddenDefects = keep;
    l.inspected = true;
    alert('Осмотр выполнен. Скрытых дефектов: ' + keep.length);
    this.detail(id);
  },
  buy(id, withDeposit) {
    const l = Game.state.listings.find(x => x.id === id);
    if (!l) return;
    if (!Game.state.hasLicense) {
      alert('Без прав покупать нельзя. Оформи в ГосBuy.');
      return;
    }
    let finalPrice = l.price;
    if (withDeposit) {
      if (Math.random() < 0.15) {
        Game.state.money -= 20000;
        l.sold = true;
        Game.save(); UI.updateStatus();
        alert('Мошенник! Задаток 20 000 ₽ утерян, объявление удалено.');
        this.render(); return;
      }
      finalPrice = Math.round(l.price * 0.9);
    }
    const total = finalPrice + GOV_FEES.pts;
    if (Game.state.money < total) return alert(`Недостаточно денег! Нужно ${Game.fmt(total)} (включая ПТС ${Game.fmt(GOV_FEES.pts)})`);
    Game.state.money -= total;
    l.sold = true;
    l.defects = [...l.defects, ...l.hiddenDefects];
    Game.state.garage.push({ ...l, price: finalPrice, tunings: [], registered:false });
    Game.state.stats.bought++;
    Game.addXP(20);
    Game.save(); UI.updateStatus();
    alert(`Куплено: ${l.name} за ${Game.fmt(finalPrice)}\nПТС: ${Game.fmt(GOV_FEES.pts)}\n\n⚠ Не забудь поставить на учёт в ГосBuy!`);
    this.render();
  },
  bargain(id) {
    const l = Game.state.listings.find(x => x.id === id);
    if (!l) return;
    const disc = Math.round(l.price * 0.08);
    const success = Math.random() < 0.4 + Game.state.reputation * 0.03;
    if (success) { l.price = Math.max(0, l.price - disc); alert(`Скидка ${Game.fmt(disc)}`); }
    else { Game.state.reputation = Math.max(0, Game.state.reputation - 1); alert('Отказ. -1 репутация'); }
    Game.save(); UI.updateStatus();
    this.detail(id);
  }
};
