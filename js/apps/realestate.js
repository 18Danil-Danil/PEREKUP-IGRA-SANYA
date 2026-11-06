Apps.realestate = {
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Недвижимость 🏠</h2></div>
      <div class="card"><div>Доход/день: ${Game.fmt(Game.state.apartments.reduce((s,a)=>s+a.rent,0))}</div></div>
      <h3 style="margin-bottom:10px">Купить</h3>
      ${APARTMENTS.map((a,i)=>`
        <div class="card">
          <h3>${a.icon} ${a.name}</h3>
          <div>Цена: ${Game.fmt(a.price)}</div>
          <div class="good">+${Game.fmt(a.rent)}/день</div>
          <button class="green" style="margin-top:8px" onclick="Apps.realestate.buy(${i})">Купить</button>
        </div>`).join('')}
      <h3 style="margin:16px 0 10px">Моя (${Game.state.apartments.length})</h3>
      ${Game.state.apartments.length?Game.state.apartments.map((a,i)=>`
        <div class="card">
          <h3>${a.icon} ${a.name}</h3>
          <div class="good">+${Game.fmt(a.rent)}/день</div>
          <button class="gray" style="margin-top:8px" onclick="Apps.realestate.sell(${i})">Продать (${Game.fmt(a.price*0.9)})</button>
        </div>`).join(''):'<p style="color:#888">Пусто</p>'}
    `;
  },
  buy(i) {
    const a = APARTMENTS[i];
    if (Game.state.money < a.price) return alert('Мало денег');
    Game.state.money -= a.price;
    Game.state.apartments.push({ ...a });
    Game.save(); UI.updateStatus(); this.render();
  },
  sell(i) {
    const a = Game.state.apartments[i];
    Game.state.money += Math.round(a.price*0.9);
    Game.state.apartments.splice(i,1);
    Game.save(); UI.updateStatus(); this.render();
  }
};
