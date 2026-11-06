Apps.business = {
  render() {
    const s = document.getElementById('screen');
    const b = Game.state.businesses;
    const total = Object.values(b).filter(Boolean).reduce((s,x)=>s+x.dailyIncome,0);
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Бизнес 🏢</h2></div>
      <div class="card" style="background:linear-gradient(135deg,rgba(249,115,22,.18),rgba(124,45,18,.18))">
        <h3>Пассивный доход</h3>
        <div style="font-size:22px;font-weight:800;color:#00e5a0;margin-top:6px">${Game.fmt(total)}/день</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Владеешь: ${Object.values(b).filter(Boolean).length}/3</div>
      </div>
      ${BUSINESSES.map(biz => {
        const owned = b[biz.id];
        return `<div class="card">
          <h3>${biz.icon} ${biz.name}</h3>
          <div style="font-size:13px;color:#888;margin-top:4px">${biz.desc}</div>
          ${owned 
            ? `<div class="good" style="margin-top:8px">✓ Доход: ${Game.fmt(owned.dailyIncome)}/день</div>
               <button class="gray" style="margin-top:10px" onclick="Apps.business.sell('${biz.id}')">Продать за ${Game.fmt(Math.round(biz.price*0.5))}</button>`
            : `<div style="margin-top:8px">Цена: <b>${Game.fmt(biz.price)}</b></div>
               <div class="good">+${Game.fmt(biz.dailyIncome)}/день</div>
               <div style="font-size:11px;color:#888;margin-top:4px">Окупится за ~${Math.round(biz.price / biz.dailyIncome)} дней</div>
               <button class="green" style="margin-top:10px" onclick="Apps.business.buy('${biz.id}')">Купить</button>`}
        </div>`;
      }).join('')}
    `;
  },
  buy(id) {
    const biz = BUSINESSES.find(x => x.id === id);
    if (!biz) return;
    if (Game.state.money < biz.price) return alert('Не хватает денег');
    Game.state.money -= biz.price;
    Game.state.businesses[id] = { dailyIncome: biz.dailyIncome };
    Game.addXP(30);
    Game.save(); UI.updateStatus(); this.render();
    alert(`${biz.name} куплено!`);
  },
  sell(id) {
    const biz = BUSINESSES.find(x => x.id === id);
    if (!biz) return;
    Game.state.money += Math.round(biz.price * 0.5);
    Game.state.businesses[id] = null;
    Game.save(); UI.updateStatus(); this.render();
  }
};
