Apps.numbers = {
  render() {
    const s = document.getElementById('screen');
    const market = Game.state.numbersMarket || [];
    const owned = Game.state.numbersOwned || [];
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Номера 🔢</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(234,179,8,.18),rgba(133,77,14,.18))">
        <h3>Блатные номера</h3>
        <div style="font-size:13px;color:#888">Купи дёшево — продай дорого. Рынок обновляется каждый день.</div>
      </div>

      <h3 style="margin:16px 0 10px;font-size:15px">Рынок (${market.length})</h3>
      ${market.length ? market.map(n => `
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:20px;font-weight:700">${n.num}</div>
            <div style="font-size:12px;color:#888">${n.region} регион</div>
          </div>
          <button class="green" onclick="Apps.numbers.buy('${n.id}')">${Game.fmt(n.price)}</button>
        </div>`).join('') : '<p style="color:#888">Рынок пуст. Загляни завтра</p>'}

      <h3 style="margin:20px 0 10px;font-size:15px">Мои (${owned.length})</h3>
      ${owned.length ? owned.map((n,i)=>`
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:20px;font-weight:700">${n.num}</div>
            <div style="font-size:12px;color:#888">${n.region} регион${n.installed?' · <span style="color:#00d68f">на машине</span>':''}</div>
          </div>
          <div class="btn-row" style="margin:0">
            ${!n.installed?`<button class="gray" onclick="Apps.numbers.installMenu(${i})">Установить</button>`:`<button class="gray" onclick="Apps.numbers.uninstall(${i})">Снять</button>`}
            <button onclick="Apps.numbers.sell(${i})">Продать</button>
          </div>
        </div>`).join('') : '<p style="color:#888">Пусто</p>'}
    `;
  },

  buy(id) {
    const item = (Game.state.numbersMarket || []).find(n => n.id === id);
    if (!item) return UI.toast('Номер недоступен', 'red');
    if (Game.state.money < item.price) return UI.toast('Недостаточно денег', 'red');
    if ((Game.state.numbersOwned || []).some(x => x.num === item.num && x.region === item.region)) {
      return UI.toast('Такой номер уже есть', 'red');
    }
    Game.state.money -= item.price;
    if (!Game.state.numbersOwned) Game.state.numbersOwned = [];
    Game.state.numbersOwned.push({
      num: item.num, region: item.region, price: item.price,
      installed: false, carId: null
    });
    Game.state.numbersMarket = Game.state.numbersMarket.filter(n => n.id !== id);
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`Номер ${item.num} (${item.region}) куплен!`, 'green');
  },

  installMenu(i) {
    const n = Game.state.numbersOwned[i];
    const cars = Game.state.garage;
    if (!cars.length) return UI.toast('Нет машин в гараже', 'info');
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.numbers.render()">←</span><h2>Установить ${n.num}</h2></div>
      ${cars.map((c,ci)=>`
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div>${c.icon} ${c.name}</div>
            ${c.number?`<div style="font-size:12px;color:#888">Сейчас: ${c.number.num}</div>`:'<div style="font-size:12px;color:#888">Без номера</div>'}
          </div>
          <button class="green" onclick="Apps.numbers.install(${i}, ${ci})">Поставить</button>
        </div>`).join('')}
    `;
  },

  install(i, carIdx) {
    const n = Game.state.numbersOwned[i];
    const car = Game.state.garage[carIdx];
    if (!n || !car) return;
    if (n.installed) {
      const old = Game.state.garage.find(c => c.id === n.carId);
      if (old) old.number = null;
    }
    if (car.number) {
      const prev = Game.state.numbersOwned.find(x => x.num === car.number.num && x.installed);
      if (prev) { prev.installed = false; prev.carId = null; }
    }
    car.number = { num:n.num, region:n.region, price:n.price };
    n.installed = true;
    n.carId = car.id;
    Game.save(); UI.updateStatus();
    this.render();
    UI.toast('Номер установлен', 'green');
  },

  uninstall(i) {
    const n = Game.state.numbersOwned[i];
    if (!n || !n.installed) return;
    const car = Game.state.garage.find(c => c.id === n.carId);
    if (car) car.number = null;
    n.installed = false;
    n.carId = null;
    Game.save(); UI.updateStatus();
    this.render();
    UI.toast('Номер снят', 'info');
  },

  sell(i) {
    const n = Game.state.numbersOwned[i];
    if (!n) return;
    if (n.installed) return UI.toast('Сначала сними номер с машины', 'red');
    const p = Math.round(n.price * (0.8 + Math.random()*0.4));
    Game.state.money += p;
    Game.state.numbersOwned.splice(i,1);
    Game.state.stats.numbersSold++;
    Game.state.stats.profit += p - n.price;
    Game.addXP(15);
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`Продан за ${Game.fmt(p)}`, 'green');
  }
};
