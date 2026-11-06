Apps.numbers = {
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Номера 🔢</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(234,179,8,.18),rgba(133,77,14,.18))">
        <h3>Блатные номера</h3>
        <div style="font-size:13px;color:#888">Купи дёшево — продай дорого. Устанавливать на машину можно в Гараже.</div>
      </div>

      <h3 style="margin:16px 0 10px;font-size:15px">Рынок</h3>
      ${NUMBERS_POOL.map((n,i)=>`
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:20px;font-weight:700">${n.num}</div>
            <div style="font-size:12px;color:#888">${n.region} регион</div>
          </div>
          <button class="green" onclick="Apps.numbers.buy(${i})">${Game.fmt(n.price)}</button>
        </div>`).join('')}

      <h3 style="margin:20px 0 10px;font-size:15px">Мои (${Game.state.numbersOwned.length})</h3>
      ${Game.state.numbersOwned.length ? Game.state.numbersOwned.map((n,i)=>`
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
  buy(i) {
    const n = NUMBERS_POOL[i];
    if (!n) return;
    if (Game.state.money < n.price) return alert('Недостаточно денег');
    Game.state.money -= n.price;
    Game.state.numbersOwned.push({ ...n, installed:false, carId:null });
    Game.save(); UI.updateStatus(); this.render();
    alert(`Номер ${n.num} куплен!`);
  },
  installMenu(i) {
    const n = Game.state.numbersOwned[i];
    const cars = Game.state.garage;
    if (!cars.length) return alert('Нет машин в гараже');
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
    alert('Номер установлен');
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
  },
  sell(i) {
    const n = Game.state.numbersOwned[i];
    if (!n) return;
    if (n.installed) return alert('Сначала сними номер с машины');
    const p = Math.round(n.price * (0.8 + Math.random()*0.4));
    Game.state.money += p;
    Game.state.numbersOwned.splice(i,1);
    Game.state.stats.numbersSold++;
    Game.state.stats.profit += p - n.price;
    Game.addXP(15);
    Game.save(); UI.updateStatus(); this.render();
    alert(`Продан за ${Game.fmt(p)}`);
  }
};
