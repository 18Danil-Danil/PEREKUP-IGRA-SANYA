Apps.taxi = {
  render() {
    const s = document.getElementById('screen');
    const g = Game.state.garage;
    const drivers = Game.state.taxiDrivers || [];
    const totalIncome = drivers.reduce((s,d)=>s+d.income,0);
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Таксопарк 🚕</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(251,191,36,.18),rgba(217,119,6,.18))">
        <h3>Доход парка</h3>
        <div style="font-size:24px;font-weight:800;color:#00d68f;margin-top:4px">${Game.fmt(totalIncome)}/день</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Водителей: ${drivers.length}</div>
        <div style="font-size:11px;color:#ff4757;margin-top:4px">⚠ Водители иногда бьют машины (ДТП)</div>
      </div>

      <h3 style="margin:16px 0 10px;font-size:15px">Мои машины (${g.length})</h3>
      ${g.length ? g.map(c => {
        const d = drivers.find(x=>x.carId===c.id);
        const income = Math.round(c.market * 0.015);
        return `<div class="card">
          <h3>${c.icon} ${c.name}</h3>
          <div class="good">Потенциал: ${Game.fmt(income)}/день</div>
          ${c.defects.length ? `<div class="defect">⚠ ${c.defects.length} дефект(ов) — доход снижен</div>` : ''}
          ${d
            ? `<div style="font-size:12px;color:#00d68f;margin-top:4px">✓ Работает водитель</div>
               <button class="gray" style="margin-top:8px" onclick="Apps.taxi.fire(${c.id})">Уволить</button>`
            : `<button class="green" style="margin-top:8px" onclick="Apps.taxi.hire(${c.id})">Нанять водителя</button>`}
        </div>`;
      }).join('') : '<p style="color:#888">Купи машину в AvtoBuy</p>'}
    `;
  },
  hire(carId) {
    const c = Game.state.garage.find(x=>x.id===carId);
    if (!c) return;
    if (c.defects.length) return alert('Сначала отремонтируй машину — водитель не сядет за битую');
    if (Game.state.taxiDrivers.find(d=>d.carId===carId)) return alert('Водитель уже есть');
    Game.state.taxiDrivers.push({ carId, income: Math.round(c.market * 0.015) });
    Game.save(); UI.updateStatus(); this.render();
    alert('Водитель нанят!');
  },
  fire(carId) {
    Game.state.taxiDrivers = Game.state.taxiDrivers.filter(d=>d.carId!==carId);
    Game.save(); this.render();
  }
};
