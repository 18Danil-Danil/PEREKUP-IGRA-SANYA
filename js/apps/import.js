Apps.import = {
  render() {
    const s = document.getElementById('screen');
    if (!Game.state.visa) {
      s.innerHTML = `
        <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Импорт ✈️</h2></div>
        <div class="card" style="background:linear-gradient(135deg,rgba(6,182,212,.15),rgba(3,105,161,.15))">
          <h3>Виза</h3>
          <div style="color:#888;font-size:13px;margin:10px 0">Оформите визу для доступа к аукционам Японии, Кореи, Китая и ОАЭ. Заказ идёт с доставкой через несколько дней.</div>
          <button class="gold" onclick="Apps.import.buyVisa()">Оформить (100 000 ₽)</button>
        </div>
      `;
      return;
    }
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Импорт ✈️</h2></div>
      <div class="card" style="background:linear-gradient(135deg,rgba(6,182,212,.2),rgba(3,105,161,.2))">
        <h3>Выберите страну</h3>
      </div>
      ${IMPORT_COUNTRIES.map(c => `
        <div class="card" onclick="Apps.import.country('${c.id}')" style="cursor:pointer">
          <h3>${c.name}</h3>
          <div style="font-size:12px;color:#888">Доставка ${c.deliveryDays} дн · Наценка ${Math.round(c.fee*100)}%</div>
        </div>
      `).join('')}

      ${(Game.state.imports||[]).length ? `
        <h3 style="margin:16px 0 10px;font-size:15px">В пути (${Game.state.imports.length})</h3>
        ${Game.state.imports.map(im => `
          <div class="card">
            <h3>${im.icon} ${im.name}</h3>
            <div style="font-size:12px;color:#888">${im.country} · Осталось: ${im.daysLeft} дн</div>
            <div class="price">${Game.fmt(im.price)}</div>
          </div>
        `).join('')}
      ` : ''}
    `;
  },

  buyVisa() {
    if (Game.state.money < 100000) return alert('Недостаточно');
    Game.state.money -= 100000;
    Game.state.visa = true;
    Game.save(); UI.updateStatus();
    this.render();
    alert('Виза оформлена!');
  },

  country(id) {
    const c = IMPORT_COUNTRIES.find(x => x.id === id);
    if (!c) return;
    const pool = CAR_DB.filter(x => x.price > 500000);
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.import.render()">←</span><h2>${c.name}</h2></div>
      ${pool.map((car,i) => {
        const finalPrice = Math.round(car.price * (1 + c.fee));
        return `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div>${car.icon} ${car.name}</div>
            <div class="price">${Game.fmt(finalPrice)}</div>
            <div style="font-size:11px;color:#888">Доставка ${c.deliveryDays} дн</div>
          </div>
          <button class="green" onclick="Apps.import.order('${id}', ${i})">Заказать</button>
        </div>`;
      }).join('')}
    `;
  },

  order(countryId, carIdx) {
    const c = IMPORT_COUNTRIES.find(x => x.id === countryId);
    const pool = CAR_DB.filter(x => x.price > 500000);
    const car = pool[carIdx];
    if (!c || !car) return;
    const price = Math.round(car.price * (1 + c.fee));
    if (Game.state.money < price) return alert('Недостаточно денег');
    Game.state.money -= price;
    if (!Game.state.imports) Game.state.imports = [];
    Game.state.imports.push({
      id: Game.state.nextId++,
      name: car.name, icon: car.icon,
      price, market: car.market,
      country: c.name, daysLeft: c.deliveryDays
    });
    Game.save(); UI.updateStatus(); this.render();
    alert(`${car.name} заказана! Придёт через ${c.deliveryDays} дн`);
  },

  tick() {
    if (!Game.state.imports) return;
    Game.state.imports = Game.state.imports.filter(im => {
      im.daysLeft--;
      if (im.daysLeft <= 0) {
        Game.state.garage.push({
          id: Game.state.nextId++, name:im.name, icon:im.icon,
          price:im.price, market:im.market,
          defects: [], hiddenDefects: [], inspected:true,
          tunings: [], year: 2015, mileage: 30000,
          number: null, sold:false
        });
        return false;
      }
      return true;
    });
  }
};
