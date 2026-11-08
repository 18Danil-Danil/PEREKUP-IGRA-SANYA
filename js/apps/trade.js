Apps.trade = {
  activeTrade: null,

  render() {
    const s = document.getElementById('screen');
    const my = Game.state.myListings || [];
    const buyers = Game.state.pendingBuyers || [];
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Мои объявления 🏷️</h2></div>

      ${my.length ? my.map((l,i) => {
        const bCount = buyers.filter(b=>b.listingId===l.id).length;
        return `<div class="card">
          <h3>${l.icon} ${l.name}</h3>
          <div>Цена: <span class="price">${Game.fmt(l.price)}</span></div>
          <div style="font-size:12px;color:#888">Рынок: ${Game.fmt(l.market)} · Дней в продаже: ${Game.state.day - l.listedDay}</div>
          ${bCount ? `<div class="good">💬 Покупателей: ${bCount}</div>` : '<div style="color:#888;font-size:12px">Ждём покупателей...</div>'}
          <div class="btn-row">
            <button class="gray" onclick="Apps.trade.changePrice(${i})">Изменить цену</button>
            <button class="red" onclick="Apps.trade.removeListing(${i})">Снять</button>
          </div>
        </div>`;
      }).join('') : '<p style="color:#888">Нет объявлений. Продай машину из Гаража.</p>'}

      <h3 style="margin:20px 0 10px;font-size:15px">Покупатели (${buyers.length})</h3>
      ${buyers.length ? buyers.map((b,i) => {
        const l = my.find(x => x.id === b.listingId);
        if (!l) return '';
        return `<div class="card">
          <h3>👤 ${b.name}</h3>
          <div style="font-size:13px">Хочет: ${l.icon} ${l.name}</div>
          <div>Предлагает: <span class="price">${Game.fmt(b.offer)}</span></div>
          <div style="font-size:12px;color:#888">${b.offer < l.price ? 'Ниже запрошенной' : 'Готов взять сразу'}</div>
          <div class="btn-row">
            <button class="green" onclick="Apps.trade.acceptBuyer(${i})">Продать</button>
            <button class="gray" onclick="Apps.trade.counterBuyer(${i})">Торг</button>
            <button class="red" onclick="Apps.trade.refuseBuyer(${i})">Отказать</button>
          </div>
        </div>`;
      }).join('') : '<p style="color:#888">Пока никого</p>'}
    `;
  },

  /* ===== Торг с продавцом (из AvtoBuy) ===== */
  startSellerTrade(listingId) {
    const l = Game.state.listings.find(x => x.id === listingId);
    if (!l) return;
    this.activeTrade = {
      listingId, startPrice: l.price, currentPrice: l.price,
      round: 0, angry: false, log: []
    };
    this.renderSellerTrade();
  },

  renderSellerTrade() {
    const t = this.activeTrade;
    if (!t) return Apps.avtobuy.render();
    const l = Game.state.listings.find(x => x.id === t.listingId);
    if (!l) { this.activeTrade = null; return Apps.avtobuy.render(); }
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.trade.cancelTrade()">←</span><h2>Торг: ${l.name}</h2></div>
      <div class="card">
        <div style="font-size:13px;color:#888">${l.seller}</div>
        <div>Цена продавца: <span class="price">${Game.fmt(t.currentPrice)}</span></div>
        <div style="font-size:12px;color:#888">Рынок: ${Game.fmt(l.market)} · Раунд ${t.round}/3</div>
      </div>
      <div class="card" style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
        ${t.log.map(m => `<div style="padding:8px 12px;border-radius:12px;font-size:13px;max-width:85%;
          ${m.role==='me'?'align-self:flex-end;background:#3b82f6;':'align-self:flex-start;background:rgba(50,50,80,.7);'}">${m.text}</div>`).join('') || '<p style="color:#888;font-size:13px">Выбери аргумент для торга:</p>'}
      </div>
      ${t.angry ? `
        <div class="card" style="background:rgba(255,84,112,.2)">
          <h3>😡 Продавец разозлился</h3>
          <div style="font-size:13px;color:#888;margin-top:6px">Больше не хочет разговаривать</div>
          <button class="gray" style="width:100%;margin-top:8px" onclick="Apps.trade.finishTrade()">Уйти</button>
        </div>
      ` : `
        <h3 style="margin:12px 0 8px;font-size:14px">Аргумент:</h3>
        ${TRADE_ARGUMENTS.map(a => `
          <div class="card" style="cursor:pointer;padding:12px;margin-bottom:6px" onclick="Apps.trade.argue('${a.id}')">
            <div style="font-weight:600">${a.label}</div>
            <div style="font-size:11px;color:#888;margin-top:2px">Скидка: ${Math.round(a.discountRange[0]*100)}–${Math.round(a.discountRange[1]*100)}% · Риск: ${{low:'низкий',med:'средний',high:'высокий'}[a.risk]}</div>
          </div>
        `).join('')}
        ${t.currentPrice < t.startPrice ? `<button class="green" style="width:100%;margin-top:8px" onclick="Apps.trade.buyNow()">Купить за ${Game.fmt(t.currentPrice)}</button>` : ''}
      `}
    `;
  },

  argue(argId) {
    const t = this.activeTrade;
    if (!t || t.angry) return;
    const a = TRADE_ARGUMENTS.find(x => x.id === argId);
    if (!a) return;
    t.log.push({ role:'me', text: a.label });
    t.round++;
    t.log.push({ role:'them', text: 'печатает...' });
    this.renderSellerTrade();

    setTimeout(() => {
      t.log = t.log.filter(m => m.text !== 'печатает...');
      let successChance = a.risk === 'high' ? 0.35 : a.risk === 'low' ? 0.75 : 0.55;
      if (t.round >= 3) successChance *= 0.6;
      const roll = Math.random();

      if (roll < successChance) {
        const discPct = a.discountRange[0] + Math.random() * (a.discountRange[1] - a.discountRange[0]);
        const discount = Math.round(t.currentPrice * discPct);
        t.currentPrice -= discount;
        const reply = TRADE_REPLIES.agree[Math.floor(Math.random()*TRADE_REPLIES.agree.length)];
        t.log.push({ role:'them', text: `${reply} (−${Game.fmt(discount)})` });
      } else if (roll > 0.9 && a.risk === 'high') {
        t.angry = true;
        t.log.push({ role:'them', text: TRADE_REPLIES.angry[Math.floor(Math.random()*TRADE_REPLIES.angry.length)] });
      } else {
        t.log.push({ role:'them', text: TRADE_REPLIES.refuse[Math.floor(Math.random()*TRADE_REPLIES.refuse.length)] });
      }

      this.renderSellerTrade();
    }, 1200);
  },

  buyNow() {
    const t = this.activeTrade;
    if (!t) return;
    const l = Game.state.listings.find(x => x.id === t.listingId);
    if (!l) return;
    if (!Game.state.hasLicense) return alert('Нужны права. Оформи в ГосBuy.');
    const total = t.currentPrice + GOV_FEES.pts;
    if (Game.state.money < total) return alert('Недостаточно денег (с ПТС нужно ' + Game.fmt(total) + ')');
    Game.state.money -= total;
    l.sold = true;
    l.defects = [...l.defects, ...l.hiddenDefects];
    Game.state.garage.push({ ...l, price: t.currentPrice, tunings: [], registered:false });
    Game.state.stats.bought++;
    Game.addXP(20);
    Game.save(); UI.updateStatus();
    this.activeTrade = null;
    alert(`Куплено за ${Game.fmt(t.currentPrice)}`);
    Apps.avtobuy.render();
  },

  finishTrade() { this.activeTrade = null; Apps.avtobuy.render(); },
  cancelTrade() { this.activeTrade = null; Apps.avtobuy.render(); },

  /* ===== Свои объявления ===== */
  listCar(carId, price) {
    const car = Game.state.garage.find(c => c.id === carId);
    if (!car) return;
    if (!Game.state.myListings) Game.state.myListings = [];
    Game.state.myListings.push({
      id: Game.state.nextId++,
      carId, name: car.name, icon: car.icon,
      price, market: car.market,
      listedDay: Game.state.day,
      defects: [...(car.defects||[])],
      hiddenDefects: [...(car.hiddenDefects||[])],
      tunings: car.tunings || [],
      number: car.number
    });
    Game.state.garage = Game.state.garage.filter(c => c.id !== carId);
    Game.save(); UI.updateStatus();
  },

  changePrice(i) {
    const l = Game.state.myListings[i];
    if (!l) return;
    const v = prompt('Новая цена:', l.price);
    if (v === null) return;
    const n = parseInt(v);
    if (isNaN(n) || n < 1000) return alert('Некорректная цена');
    l.price = n;
    Game.save(); this.render();
  },

  removeListing(i) {
    const l = Game.state.myListings[i];
    if (!l) return;
    Game.state.garage.push({
      id: l.carId || Game.state.nextId++,
      name: l.name, icon: l.icon,
      price: l.price, market: l.market,
      defects: l.defects, hiddenDefects: l.hiddenDefects,
      inspected: true, tunings: l.tunings, year: 2015, mileage: 30000,
      number: l.number, sold:false, registered:false
    });
    Game.state.myListings.splice(i, 1);
    Game.state.pendingBuyers = Game.state.pendingBuyers.filter(b => b.listingId !== l.id);
    Game.save(); UI.updateStatus(); this.render();
  },

  spawnBuyers() {
    if (!Game.state.myListings) return;
    Game.state.myListings.forEach(l => {
      const existing = (Game.state.pendingBuyers||[]).filter(b => b.listingId === l.id).length;
      if (existing >= 2) return;
      if (Math.random() < 0.55) {
        const names = ['Андрей','Михаил','Ольга','Дарья','Виктор','Екатерина','Павел','Ирина'];
        const priceFactor = 0.7 + Math.random() * 0.35;
        const buyerName = names[Math.floor(Math.random()*names.length)];
        Game.state.pendingBuyers.push({
          id: Game.state.nextId++,
          listingId: l.id,
          name: buyerName,
          offer: Math.round(l.price * priceFactor),
          day: Game.state.day
        });
        Game.pushNotif('💬', `${buyerName} интересуется: ${l.icon} ${l.name}`);
      }
    });
  },

  acceptBuyer(i) {
    const b = Game.state.pendingBuyers[i];
    if (!b) return;
    const li = Game.state.myListings.findIndex(l => l.id === b.listingId);
    if (li === -1) return;
    const l = Game.state.myListings[li];
    Game.state.money += b.offer;
    Game.state.stats.sold++;
    Game.state.stats.profit += b.offer;

    if (l.hiddenDefects && l.hiddenDefects.length && Math.random() < 0.4) {
      Game.state.lawsuits.push({
        from: b.name,
        reason: l.hiddenDefects[0],
        amount: Math.round(b.offer * 0.3),
        day: Game.state.day,
        resolved: false
      });
      Game.addReview(b.name, 'Скрыл дефект: ' + l.hiddenDefects[0], 1);
      Game.changeReputation(-10);
      alert(`Продано за ${Game.fmt(b.offer)}\n⚠ Покупатель заметил скрытый дефект!\nВозможен суд на ${Game.fmt(Math.round(b.offer*0.3))}`);
    } else {
      Game.addReview(b.name, REVIEW_PHRASES.positive[Math.floor(Math.random()*REVIEW_PHRASES.positive.length)], 5);
      Game.changeReputation(3);
      alert(`Продано за ${Game.fmt(b.offer)}\nОтзыв: ⭐⭐⭐⭐⭐`);
    }

    Game.state.myListings.splice(li, 1);
    Game.state.pendingBuyers = Game.state.pendingBuyers.filter(x => x.listingId !== l.id);
    Game.addXP(25);
    Game.save(); UI.updateStatus(); this.render();
  },

  counterBuyer(i) {
    const b = Game.state.pendingBuyers[i];
    if (!b) return;
    const l = Game.state.myListings.find(x => x.id === b.listingId);
    if (!l) return;
    const counter = Math.round((b.offer + l.price) / 2);
    if (Math.random() < 0.6) {
      b.offer = counter;
      Game.save(); alert(`Покупатель согласился на ${Game.fmt(counter)}`); this.render();
    } else {
      Game.state.pendingBuyers.splice(i, 1);
      Game.save(); alert('Покупатель ушёл'); this.render();
    }
  },

  refuseBuyer(i) {
    Game.state.pendingBuyers.splice(i, 1);
    Game.save(); this.render();
  }
};
