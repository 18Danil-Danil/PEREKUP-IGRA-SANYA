Apps.sleep = {
  render() {
    const s = document.getElementById('screen');
    const today = Game.state.day;
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Сон 💤</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(55,48,163,.18))">
        <h3>Сейчас</h3>
        <div style="font-size:14px">День ${Game.state.day}, ${String(Game.state.hour).padStart(2,'0')}:00</div>
        <div style="font-size:12px;color:#888;margin-top:4px">Сон скипает время. Работы и события обновятся.</div>
      </div>

      <div class="card">
        <h3>💤 Спать 8 часов</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">Пропустить ночь. Если перевалит за полночь — начнётся новый день и придут доходы.</div>
        <button class="green" onclick="Apps.sleep.sleep()">Поспать 8 ч</button>
      </div>

      <div class="card">
        <h3>😴 Вздремнуть 2 часа</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">Быстрый скип. День не меняется.</div>
        <button onclick="Apps.sleep.nap()">Вздремнуть</button>
      </div>

      <div class="card">
        <h3>⏭ Пропустить день</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">Сразу к следующему дню. Придут доходы с аренды и таксопарка.</div>
        <button class="gold" onclick="Apps.sleep.skipDay()">Следующий день</button>
      </div>

      <div class="card">
        <h3>📊 Что будет при новом дне</h3>
        <div style="font-size:13px;color:#888">
          • Обновятся работы (можно снова заработать)<br>
          • Придут доходы с недвижимости и таксопарка<br>
          • Появятся 2 новых объявления на AvtoBuy<br>
          • Могут прийти события от родных<br>
          • Налоги пересчитаются раз в 7 дней
        </div>
      </div>
    `;
  },

  nextDay() {
    Game.state.hour = 0;
    Game.state.day++;
    Game.state.jobsDoneToday = [];
    Game.spawnListings(2);
    const rent = Game.state.apartments.reduce((s,a)=>s+a.rent,0);
    const taxi = Game.state.taxiDrivers.reduce((s,d)=>s+d.income,0);
    Game.state.money += rent + taxi;
    Game.state.taxiDrivers.forEach(d => {
      if (Math.random() < 0.15) {
        const car = Game.state.garage.find(c => c.id === d.carId);
        if (car) car.defects.push("ДТП в такси");
      }
    });
    if (Game.state.day - Game.state.lastTaxDay >= 7 && Game.state.taxDebt > 0) {
      Game.state.taxDebt = Math.round(Game.state.taxDebt * (1 + GOV_FEES.taxPenaltyPerDay));
      Game.state.lastTaxDay = Game.state.day;
    }
    if (window.Apps && Apps.carImport && Apps.carImport.tick) Apps.carImport.tick();
    if (window.Apps && Apps.family && Apps.family.checkBirthdays) Apps.family.checkBirthdays();
    if (window.Apps && Apps.auction && Apps.auction.tick) Apps.auction.tick();
    Game.save(); UI.updateStatus();
    if (rent + taxi > 0) alert(`День ${Game.state.day}\n+${Game.fmt(rent + taxi)} с пассива`);
  },

  sleep() {
    let hours = Game.state.hour + 8;
    if (hours >= 24) { this.nextDay(); }
    else { Game.state.hour = hours; Game.save(); UI.updateStatus(); alert('Поспали 8 часов'); }
    UI.back();
  },

  nap() {
    const h = Game.state.hour + 2;
    if (h >= 24) { this.nextDay(); }
    else { Game.state.hour = h; Game.save(); UI.updateStatus(); alert('Вздремнули 2 часа'); }
    UI.back();
  },

  skipDay() {
    this.nextDay();
    UI.back();
  }
};
