Apps.shop = {
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Магазин 🛒</h2></div>
      ${TOOLS_SHOP.map(t => {
        const owned = Game.state.tools[t.id];
        return `<div class="card">
          <h3>${t.icon} ${t.name}</h3>
          <div style="font-size:13px;color:#888">${t.desc}</div>
          <div style="margin-top:8px">${owned?'<span class="good">✓ Куплено</span>':`<button class="green" onclick="Apps.shop.buy('${t.id}')">${Game.fmt(t.price)}</button>`}</div>
        </div>`;
      }).join('')}
    `;
  },
  buy(id) {
    const t = TOOLS_SHOP.find(x => x.id === id);
    if (!t) return;
    if (Game.state.money < t.price) return alert('Недостаточно денег');
    Game.state.money -= t.price;
    Game.state.tools[id] = true;
    Game.save(); UI.updateStatus();
    this.render();
  }
};
