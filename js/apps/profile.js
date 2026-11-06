Apps.profile = {
  render() {
    const s = document.getElementById('screen');
    const p = Game.state.passport;
    const name = p && p.created ? `${p.firstName} ${p.lastName}` : 'Перекуп';
    const gender = p && p.gender === 'f' ? '👩' : '👨';
    const reviews = Game.state.reviews || [];
    const lawsuits = Game.state.lawsuits || [];
    const openSuits = lawsuits.filter(l => !l.resolved);
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Профиль</h2></div>
      <div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(100,116,139,.2),rgba(51,65,85,.2))">
        <div style="font-size:60px">${gender}</div>
        <h3>${name}</h3>
        <div style="font-size:13px;color:#888;margin-top:4px">Ур. ${Game.state.level} · ${Game.state.xp}/${Game.state.level*100} XP</div>
        <div style="font-size:13px;color:#888">Репутация: ${'⭐'.repeat(Math.min(5, Math.floor((Game.state.reputation||0)/2)))} ${Game.state.reputation||0}</div>
        ${!p || !p.created ? '<button class="green" style="margin-top:10px" onclick="UI.open(\'gosbuy\')">Создать паспорт</button>' : ''}
      </div>
      <div class="card">
        <h3>Финансы</h3>
        <div>Баланс: <b style="color:#00e5a0">${Game.fmt(Game.state.money)}</b></div>
        <div>Профит: <b>${Game.fmt(Game.state.stats.profit)}</b></div>
        <div style="color:#ff5470">Налоги/штрафы: ${Game.fmt(Game.state.taxDebt || 0)}</div>
        <div>Кредит: ${Game.state.debt > 0 ? Game.fmt(Game.state.debt) : '—'}</div>
      </div>
      <div class="card">
        <h3>Активы</h3>
        <div>Гараж: ${Game.state.garage.length} авто</div>
        <div>Объявлений: ${(Game.state.myListings||[]).length}</div>
        <div>Номера: ${Game.state.numbersOwned.length}</div>
        <div>Недвижимость: ${Game.state.apartments.length}</div>
        <div>Бизнесов: ${Object.values(Game.state.businesses||{}).filter(Boolean).length}</div>
      </div>
      ${openSuits.length ? `
        <div class="card" style="background:rgba(255,84,112,.15);border-color:rgba(255,84,112,.4)">
          <h3>⚖ Открытые иски (${openSuits.length})</h3>
          ${openSuits.map((l,i) => `
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(140,140,220,.1)">
              <div style="font-size:13px">${l.from}: <i>${l.reason}</i></div>
              <div style="font-size:12px;color:#ff5470">Требует: ${Game.fmt(l.amount)}</div>
              <button class="red" style="margin-top:6px" onclick="Apps.profile.paySuit(${i})">Оплатить</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${reviews.length ? `
        <div class="card">
          <h3>📝 Отзывы (${reviews.length})</h3>
          ${reviews.slice(-5).reverse().map(r => `
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(140,140,220,.1);font-size:13px">
              <div><b>${r.from}</b> ${'⭐'.repeat(r.rating)}</div>
              <div style="color:#888">${r.text}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div class="card">
        <h3>Достижения</h3>
        <div>${Game.state.stats.bought>=1?'✅':'⬜'} Первая покупка</div>
        <div>${Game.state.stats.sold>=1?'✅':'⬜'} Первая продажа</div>
        <div>${Game.state.stats.sold>=10?'✅':'⬜'} 10 продаж</div>
        <div>${Game.state.stats.profit>=1000000?'✅':'⬜'} Профит 1 млн</div>
        <div>${Game.state.stats.tuningsInstalled>=5?'✅':'⬜'} 5 тюнингов</div>
        <div>${Game.state.apartments.length>=1?'✅':'⬜'} Недвижимость</div>
        <div>${Game.state.hasLicense?'✅':'⬜'} Права</div>
        <div>${Game.state.visa?'✅':'⬜'} Виза</div>
        <div>${(Game.state.racesWon||0)>=5?'✅':'⬜'} 5 побед в гонках</div>
        <div>${Object.values(Game.state.businesses||{}).filter(Boolean).length>=1?'✅':'⬜'} Первый бизнес</div>
      </div>
      <div class="btn-row">
        <button class="red" onclick="if(confirm('Сбросить ЭТОТ слот?')){Game.deleteSlot(Game.activeSlot);Game.newGame();UI.renderHome();UI.updateStatus()}">Сброс слота</button>
      </div>
      <div style="text-align:center;font-size:11px;color:#444;margin-top:20px">v3.2 · Слот ${Game.activeSlot}</div>
    `;
  },
  paySuit(i) {
    const openSuits = Game.state.lawsuits.filter(l => !l.resolved);
    const suit = openSuits[i];
    if (!suit) return;
    if (Game.state.money < suit.amount) return alert('Не хватает денег');
    Game.state.money -= suit.amount;
    suit.resolved = true;
    Game.save(); UI.updateStatus(); this.render();
    alert('Иск урегулирован');
  }
};
