Apps.realestate = {
  render() {
    const s = document.getElementById('screen');
    const owned = Game.state.apartments || [];
    const totalIncome = owned.reduce((s,a)=>s+a.rent,0);
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Недвижимость 🏠</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(249,115,22,.18),rgba(154,52,18,.18))">
        <h3>Пассивный доход</h3>
        <div style="font-size:24px;font-weight:800;color:#00d68f;margin-top:4px">${Game.fmt(totalIncome)}/день</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Сдаётся объектов: ${owned.length}</div>
      </div>

      <h3 style="margin:16px 0 10px;font-size:15px">Купить</h3>
      ${APARTMENTS.map((a,i)=>`
        <div class="card">
          <h3>${a.icon} ${a.name}</h3>
          <div>Цена: ${Game.fmt(a.price)}</div>
          <div class="good">+${Game.fmt(a.rent)}/день</div>
          <div style="font-size:11px;color:#888;margin-top:4px">Окупаемость: ~${Math.round(a.price / a.rent)} дней</div>
          <button class="green" style="margin-top:8px" onclick="Apps.realestate.buy(${i})">Купить</button>
        </div>`).join('')}

      <h3 style="margin:20px 0 10px;font-size:15px">Моя недвижимость (${owned.length})</h3>
      ${owned.length ? owned.map((a,i)=>`
        <div class="card">
          <h3>${a.icon} ${a.name}</h3>
          <div class="good">+${Game.fmt(a.rent)}/день</div>
          <button class="gray" style="margin-top:8px" onclick="Apps.realestate.sell(${i})">Продать (${Game.fmt(Math.round(a.price*0.9))})</button>
        </div>`).join('') : '<p style="color:#888">Пусто</p>'}
    `;
  },
  buy(i) {
    const a = APARTMENTS[i];
    if (!a) return;
    if (Game.state.money < a.price) return UI.toast('Мало денег', 'red');
    Game.state.money -= a.price;
    Game.state.apartments.push({ ...a });
    Game.addXP(20);
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`Куплено: ${a.name}`, 'gold', 3200);
  },
  sell(i) {
    const a = Game.state.apartments[i];
    if (!a) return;
    const price = Math.round(a.price*0.9);
    Game.state.money += price;
    Game.state.apartments.splice(i,1);
    Game.save(); UI.updateStatus(); this.render();
    UI.toast(`Продано за ${Game.fmt(price)}`, 'green');
  }
};
