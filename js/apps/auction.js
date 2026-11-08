Apps.auction = {
  render() {
    const s = document.getElementById('screen');
    const lots = Game.state.auctionLots || [];
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Аукцион 🏛️</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(20,184,166,.2),rgba(15,118,110,.2))">
        <h3>🚗 Лоты</h3>
        <div style="font-size:12px;color:#888;margin-top:4px">Новые лоты раз в сутки · Боты перебивают ставки</div>
      </div>

      ${lots.length ? lots.map(l => `
        <div class="card">
          <h3>${l.icon} ${l.name}</h3>
          <div style="font-size:12px;color:#888">Рынок: ${Game.fmt(l.market)}</div>
          <div style="margin-top:6px">Текущая: <span class="price">${Game.fmt(l.currentBid)}</span></div>
          <div style="font-size:12px;color:#888">Осталось: ${l.hoursLeft} ч · ${l.lastBidder==='player'?'<span style="color:#00d68f">ваша ставка</span>':'бот лидирует'}</div>
          <div class="btn-row">
            <button class="green" onclick="Apps.auction.bid(${l.id})">+5% (${Game.fmt(Math.round(l.currentBid*1.05))})</button>
          </div>
        </div>
      `).join('') : '<p style="color:#888">Лотов пока нет</p>'}

      <div class="card" style="background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(120,53,15,.15))">
        <h3>📦 Контейнеры из порта</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">Слепой лот. Что внутри — узнаешь после покупки</div>
        <div class="btn-row">
          <button class="green" onclick="Apps.auction.openContainer()">Купить (500 000 ₽)</button>
          <button class="gray" onclick="Apps.auction.inspectContainer()">Осмотреть (100 000 ₽)</button>
        </div>
      </div>
    `;
  },

  spawnLot() {
    if (!Game.state.auctionLots) Game.state.auctionLots = [];
    const used = Game.state.auctionLots.map(l => l.name);
    const pool = AUCTION_CARS.filter(c => !used.includes(c.name));
    if (!pool.length) return;
    const car = pool[Math.floor(Math.random()*pool.length)];
    const id = Game.state.auctionNextId++;
    Game.state.auctionLots.push({
      id, name:car.name, icon:car.icon, market:car.market,
      currentBid: Math.round(car.price * 0.5),
      hoursLeft: 24,
      lastBidder: 'bot'
    });
  },

  bid(id) {
    const lot = Game.state.auctionLots.find(l => l.id === id);
    if (!lot) return;
    const amount = Math.round(lot.currentBid * 1.05);
    if (Game.state.money < amount) return UI.toast('Недостаточно денег', 'red');
    Game.state.money -= amount;
    lot.currentBid = amount;
    lot.lastBidder = 'player';
    if (Math.random() < 0.4 && lot.hoursLeft > 1) {
      lot.currentBid = Math.round(lot.currentBid * 1.07);
      lot.lastBidder = 'bot';
      Game.state.money += amount;
      UI.toast('Бот перебил ставку! Деньги возвращены', 'red', 3200);
    } else {
      UI.toast('Ставка принята!', 'green');
    }
    Game.save(); UI.updateStatus(); this.render();
  },

  openContainer() {
    if (Game.state.money < 500000) return UI.toast('Недостаточно', 'red');
    Game.state.money -= 500000;
    const r = Math.random();
    let c;
    if (r < 0.30) c = CONTAINER_CONTENTS[0];
    else if (r < 0.55) c = CONTAINER_CONTENTS[1];
    else if (r < 0.70) c = CONTAINER_CONTENTS[2];
    else if (r < 0.85) c = CONTAINER_CONTENTS[3];
    else if (r < 0.95) c = CONTAINER_CONTENTS[4];
    else c = CONTAINER_CONTENTS[5];
    Game.state.money += c.value;
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`📦 ${c.icon} ${c.name} · ${Game.fmt(c.value)}`, 'gold', 4000);
  },

  inspectContainer() {
    if (Game.state.money < 100000) return UI.toast('Недостаточно', 'red');
    Game.state.money -= 100000;
    Game.save(); UI.updateStatus();
    const r = Math.random();
    const hint = r < 0.4
      ? '🔦 Чувствуется что-то ценное...'
      : r < 0.7 ? '🔦 Скорее всего запчасти'
      : '🔦 Что-то большое, но вряд ли дорогое';
    UI.toast(hint, 'info', 3500);
  },

  tick() {
    if (!Game.state.auctionLots) return;
    Game.state.auctionLots.forEach(l => l.hoursLeft--);
    const results = [];
    Game.state.auctionLots = Game.state.auctionLots.filter(l => {
      if (l.hoursLeft <= 0) {
        if (l.lastBidder === 'player') {
          Game.state.garage.push({
            id: Game.state.nextId++, name:l.name, icon:l.icon,
            price: l.currentBid, market: l.market,
            defects: [], hiddenDefects: [], inspected:true,
            tunings: [], year: 2015, mileage: 30000,
            number: null, sold:false, registered:false
          });
          results.push(l.name);
        }
        return false;
      }
      return true;
    });
    if (results.length) {
      results.forEach(n => Game.pushNotif('🏆', `Победа на аукционе: ${n}`));
      UI.toast(`🏆 Победа: ${results.join(', ')}`, 'gold', 4000);
    }
    if (Game.state.auctionLots.length < 3 && Math.random() < 0.5) this.spawnLot();
  }
};
