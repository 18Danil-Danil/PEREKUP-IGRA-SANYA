Apps.business = {
  render() {
    const s = document.getElementById('screen');
    const b = Game.state.businesses;
    const ownedList = Object.entries(b).filter(([,x])=>x);
    const total = ownedList.reduce((sum, [id, x]) => sum + Game.calcBizIncome(id, x), 0);
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Бизнес 🏢</h2></div>
      <div class="card" style="background:linear-gradient(135deg,rgba(249,115,22,.18),rgba(124,45,18,.18))">
        <h3>Пассивный доход</h3>
        <div style="font-size:22px;font-weight:800;color:#00e5a0;margin-top:6px">${Game.fmt(total)}/день</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Владеешь: ${ownedList.length}/3</div>
      </div>
      ${BUSINESSES.map(biz => {
        const owned = b[biz.id];
        const level = owned ? (owned.level || 1) : 0;
        const income = owned ? Game.calcBizIncome(biz.id, owned) : 0;
        const nextUpg = owned && level < 3 ? biz.upgrades.find(u => u.level === level + 1) : null;
        return `<div class="card">
          <h3>${biz.icon} ${biz.name}</h3>
          <div style="font-size:13px;color:#888;margin-top:4px">${biz.desc}</div>
          ${owned 
            ? `<div class="good" style="margin-top:8px">✓ Ур.${level}/3 · ${Game.fmt(income)}/день</div>
               ${level < 3 ? `<div style="height:6px;background:rgba(255,255,255,.1);border-radius:3px;margin-top:8px;overflow:hidden">
                 <div style="height:100%;width:${(level/3*100)}%;background:linear-gradient(90deg,#00e5a0,#00b87c)"></div>
               </div>` : ''}
               ${nextUpg 
                 ? `<button class="green" style="margin-top:10px;width:100%" onclick="Apps.business.upgrade('${biz.id}')">
                     ⬆ Улучшить до ур.${nextUpg.level} · ${Game.fmt(nextUpg.cost)}
                   </button>
                   <div style="font-size:11px;color:#888;margin-top:4px">Доход станет: +${Game.fmt(Math.round(biz.dailyIncome * (nextUpg.level===2?1.5:2)))}/день</div>`
                 : '<div style="font-size:12px;color:#00e5a0;margin-top:10px">✓ Максимальный уровень</div>'}
               <button class="gray" style="margin-top:8px;width:100%" onclick="Apps.business.sell('${biz.id}')">
                 Продать за ${Game.fmt(this.calcRefund(biz, owned))}
               </button>`
            : `<div style="margin-top:8px">Цена: <b>${Game.fmt(biz.price)}</b></div>
               <div class="good">+${Game.fmt(biz.dailyIncome)}/день</div>
               <div style="font-size:11px;color:#888;margin-top:4px">Окупится за ~${Math.round(biz.price / biz.dailyIncome)} дней</div>
               <button class="green" style="margin-top:10px;width:100%" onclick="Apps.business.buy('${biz.id}')">Купить</button>`}
        </div>`;
      }).join('')}
    `;
  },

  calcRefund(biz, owned) {
    const baseRefund = Math.round(biz.price * 0.5);
    const level = owned ? (owned.level || 1) : 1;
    const upgradesRefund = biz.upgrades
      .filter(u => u.level <= level)
      .reduce((s, u) => s + u.cost, 0);
    return baseRefund + Math.round(upgradesRefund * 0.5);
  },

  buy(id) {
    const biz = BUSINESSES.find(x => x.id === id);
    if (!biz) return;
    if (Game.state.money < biz.price) return UI.toast('Не хватает денег', 'red');
    Game.state.money -= biz.price;
    Game.state.businesses[id] = { level: 1 };
    Game.addXP(30);
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`${biz.name} куплено!`, 'gold', 3200);
  },

  upgrade(id) {
    const biz = BUSINESSES.find(x => x.id === id);
    if (!biz) return;
    const b = Game.state.businesses[id];
    if (!b) return;
    const currentLevel = b.level || 1;
    const nextUpg = biz.upgrades.find(u => u.level === currentLevel + 1);
    if (!nextUpg) return UI.toast('Максимальный уровень', 'info');
    if (Game.state.money < nextUpg.cost) return UI.toast('Не хватает денег', 'red');
    Game.state.money -= nextUpg.cost;
    b.level = nextUpg.level;
    Game.addXP(20);
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`${biz.name} улучшено до ур.${nextUpg.level}!`, 'green', 3200);
  },

  sell(id) {
    const biz = BUSINESSES.find(x => x.id === id);
    if (!biz) return;
    const b = Game.state.businesses[id];
    if (!b) return;
    const refund = this.calcRefund(biz, b);
    Game.state.money += refund;
    Game.state.businesses[id] = null;
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`Продано за ${Game.fmt(refund)}`, 'green');
  }
};
