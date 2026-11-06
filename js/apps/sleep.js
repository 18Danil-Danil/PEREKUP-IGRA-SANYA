Apps.sleep = {
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Сон 💤</h2></div>
      <div class="card">
        <h3>Спать 8 часов</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">Пропустить ночь</div>
        <button class="green" onclick="Apps.sleep.sleep()">Поспать</button>
      </div>
      <div class="card">
        <h3>Вздремнуть 2 часа</h3>
        <button onclick="Apps.sleep.nap()">Вздремнуть</button>
      </div>
    `;
  },
  sleep() {
    Game.state.hour += 8;
    if (Game.state.hour >= 24) {
      Game.state.hour = 0;
      Game.state.day++;
      const rent = Game.state.apartments.reduce((s,a)=>s+a.rent,0);
      const taxi = Game.state.taxiDrivers.reduce((s,d)=>s+d.income,0);
      Game.state.money += rent + taxi;
      Game.spawnListings(2);
    }
    Game.save(); UI.updateStatus();
    alert('Поспали'); UI.back();
  },
  nap() {
    Game.state.hour = (Game.state.hour + 2) % 24;
    Game.save(); UI.updateStatus();
    alert('Вздремнули'); UI.back();
  }
};
