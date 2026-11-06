Apps.gosbuy = {
  render() {
    const s = document.getElementById('screen');
    const p = Game.state.passport;
    const taxDebt = Game.state.taxDebt || 0;
    const fines = Game.state.fines || [];
    const unregistered = (Game.state.garage || []).filter(c => !c.registered);

    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>ГосBuy 🪪</h2></div>

      <div class="card">
        <h3>📋 Паспорт</h3>
        ${p.created ? `
          <div style="font-size:16px;font-weight:700;margin-top:8px">${p.firstName} ${p.lastName}</div>
          <div style="font-size:12px;color:#888">${p.gender === 'm' ? 'Мужской' : 'Женский'} · ДР: ${p.birthDay[1]}.${String(p.birthDay[0]).padStart(2,'0')}</div>
        ` : `
          <input id="passFirst" placeholder="Имя" value="${p.firstName}">
          <input id="passLast" placeholder="Фамилия" value="${p.lastName}">
          <select id="passGender" style="width:100%;padding:12px;border-radius:14px;border:1px solid rgba(140,140,220,.15);background:rgba(28,28,48,.65);color:#f2f2ff;font-family:inherit;font-size:14px;margin-bottom:14px">
            <option value="m">Мужской</option>
            <option value="f">Женский</option>
          </select>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <input id="passDay" type="number" min="1" max="30" placeholder="День" value="15">
            <input id="passMonth" type="number" min="1" max="12" placeholder="Месяц" value="5">
          </div>
          <button class="green" style="width:100%" onclick="Apps.gosbuy.createPassport()">Создать паспорт</button>
        `}
      </div>

      <div class="card">
        <h3>🚗 Водительские права</h3>
        ${Game.state.hasLicense
          ? '<div class="good">✓ Получены</div>'
          : `<div style="font-size:12px;color:#888;margin-bottom:8px">Без прав нельзя покупать и продавать авто.</div>
             <button class="green" onclick="Apps.gosbuy.buyLicense()">Получить (${Game.fmt(GOV_FEES.license)})</button>`}
      </div>

      <div class="card">
        <h3>💰 Налоги (НДФЛ 13%)</h3>
        ${taxDebt > 0
          ? `<div style="font-size:20px;font-weight:800;color:#ff4757;margin:8px 0">${Game.fmt(taxDebt)}</div>
             <div style="font-size:11px;color:#888;margin-bottom:8px">+5% в неделю при просрочке</div>
             <button class="red" onclick="Apps.gosbuy.payTax()">Оплатить всё</button>`
          : '<div class="good">✓ Долгов нет</div>'}
      </div>

      ${fines.length ? `
        <div class="card">
          <h3>📄 Штрафы (${fines.length})</h3>
          ${fines.slice(-5).reverse().map(f => `
            <div style="padding:6px 0;border-bottom:1px solid rgba(140,140,220,.1);font-size:13px">
              <div>${f.reason}</div>
              <div style="font-size:11px;color:#888">День ${f.day} · ${Game.fmt(f.amount)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="card">
        <h3>🔖 Постановка на учёт</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">${Game.fmt(GOV_FEES.registration)} за авто</div>
        ${unregistered.length ? unregistered.map(c => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(140,140,220,.1)">
            <div>${c.icon} ${c.name}</div>
            <button class="green" onclick="Apps.gosbuy.register(${c.id})">Оформить</button>
          </div>
        `).join('') : '<div class="good">✓ Все машины на учёте</div>'}
      </div>
    `;
  },

  createPassport() {
    const first = document.getElementById('passFirst').value.trim();
    const last  = document.getElementById('passLast').value.trim();
    const gender = document.getElementById('passGender').value;
    const day   = parseInt(document.getElementById('passDay').value);
    const month = parseInt(document.getElementById('passMonth').value);
    if (!first || !last) return alert('Заполни имя и фамилию');
    if (!day || !month || day < 1 || day > 30 || month < 1 || month > 12) return alert('Неверная дата');
    Game.state.passport = {
      firstName: first, lastName: last, gender,
      birthDay: [month, day],
      created: true,
      lastBirthdayAwarded: 0
    };
    Game.save(); UI.updateStatus();
    this.render();
    alert('Паспорт создан!');
  },

  buyLicense() {
    if (Game.state.hasLicense) return;
    if (Game.state.money < GOV_FEES.license) return alert('Недостаточно денег');
    Game.state.money -= GOV_FEES.license;
    Game.state.hasLicense = true;
    Game.addXP(10);
    Game.save(); UI.updateStatus();
    this.render();
    alert('Права получены!');
  },

  payTax() {
    const debt = Game.state.taxDebt || 0;
    if (debt <= 0) return alert('Долгов нет');
    if (Game.state.money < debt) return alert('Не хватает денег');
    Game.state.money -= debt;
    Game.state.taxDebt = 0;
    Game.state.lastTaxDay = Game.state.day;
    Game.state.fines = [];
    Game.save(); UI.updateStatus();
    this.render();
    alert('Долг погашен');
  },

  register(carId) {
    const car = Game.state.garage.find(c => c.id === carId);
    if (!car) return;
    if (car.registered) return alert('Уже на учёте');
    if (Game.state.money < GOV_FEES.registration) return alert('Не хватает денег');
    Game.state.money -= GOV_FEES.registration;
    car.registered = true;
    Game.save(); UI.updateStatus();
    this.render();
    alert('Машина поставлена на учёт');
  }
};
