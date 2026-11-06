Apps.numbers = {
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Номера 🔢</h2></div>
      <h3 style="margin-bottom:10px">Рынок</h3>
      ${NUMBERS_POOL.map((n,i)=>`
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-size:20px;font-weight:700">${n.num}</div><div style="font-size:12px;color:#888">${n.region} регион</div></div>
          <button class="green" onclick="Apps.numbers.buy(${i})">${Game.fmt(n.price)}</button>
        </div>`).join('')}
      <h3 style="margin:16px 0 10px">Мои (${Game.state.numbersOwned.length})</h3>
      ${Game.state.numbersOwned.length?Game.state.numbersOwned.map((n,i)=>`
        <div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-size:20px;font-weight:700">${n.num}</div><div style="font-size:12px;color:#888">${n.region} регион</div></div>
          <button class="gray" onclick="Apps.numbers.sell(${i})">Продать</button>
        </div>`).join(''):'<p style="color:#888">Пусто</p>'}
    `;
  },
  buy(i) {
    const n = NUMBERS_POOL[i];
    if (!n) return;
    if (Game.state.money < n.price) return alert('Недостаточно денег');
    Game.state.money -= n.price;
    Game.state.numbersOwned.push({ ...n });
    Game.save(); UI.updateStatus(); this.render();
  },
  sell(i) {
    const n = Game.state.numbersOwned[i];
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
