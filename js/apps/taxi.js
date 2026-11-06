Apps.taxi = {
  render() {
    const s = document.getElementById('screen');
    const g = Game.state.garage;
    const drivers = Game.state.taxiDrivers;
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Таксопарк 🚕</h2></div>
      <div class="card">
        <div>Доход/день: ${Game.fmt(drivers.reduce((s,d)=>s+d.income,0))}</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Водители иногда попадают в ДТП</div>
      </div>
      <h3 style="margin-bottom:10px">Машины</h3>
      ${g.length?g.map(c=>{
        const d = drivers.find(x=>x.carId===c.id);
        return `<div class="card">
          <h3>${c.icon} ${c.name}</h3>
          <div class="good">Доход: ${Game.fmt(Math.round(c.market*0.02))}/день</div>
          ${d
            ?`<button class="gray" style="margin-top:8px" onclick="Apps.taxi.fire(${c.id})">Уволить</button>`
            :`<button class="green" style="margin-top:8px" onclick="Apps.taxi.hire(${c.id})">Нанять</button>`}
        </div>`;
      }).join(''):'<p style="color:#888">Купи машину</p>'}
    `;
  },
  hire(carId) {
    const c = Game.state.garage.find(x=>x.id===carId);
    if (!c) return;
    if (Game.state.taxiDrivers.find(d=>d.carId===carId)) return alert('Уже есть');
    Game.state.taxiDrivers.push({ carId, income: Math.round(c.market*0.02) });
    Game.save(); UI.updateStatus(); this.render();
  },
  fire(carId) {
    Game.state.taxiDrivers = Game.state.taxiDrivers.filter(d=>d.carId!==carId);
    Game.save(); this.render();
  }
};
