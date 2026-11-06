Apps.profile = {
  render() {
    const s = document.getElementById('screen');
    const p = Game.state.passport;
    const name = p && p.created ? `${p.firstName} ${p.lastName}` : 'Перекуп';
    const gender = p && p.gender === 'f' ? '👩' : '👨';
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Профиль</h2></div>

      <div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(100,116,139,.2),rgba(51,65,85,.2))">
        <div style="font-size:60px">${gender}</div>
        <h3>${name}</h3>
        <div style="font-size:13px;color:#888;margin-top:4px">Ур. ${Game.state.level} · ${Game.state.xp}/${Game.state.level*100} XP</div>
        <div style="font-size:13px;color:#888">Репутация: ${'⭐'.repeat(Math.min(5, Math.floor(Game.state.reputation/2)))} ${Game.state.reputation}</div>
        ${!p || !p.created ? '<button class="green" style="margin-top:10px" onclick="UI.open(\'gosbuy\')">Создать паспорт</button>' : ''}
      </div>

      <div class="card">
        <h3>Финансы</h3>
        <div>Баланс: <b style="color:#00d68f">${Game.fmt(Game.state.money)}</b></div>
        <div>Профит всего: <b>${Game.fmt(Game.state.stats.profit)}</b></div>
        <div style="color:#ff4757">Налоги/штрафы: ${Game.fmt(Game.state.taxDebt || 0)}</div>
        <div>Кредит: ${Game.state.debt > 0 ? Game.fmt(Game.state.debt) : '—'}</div>
      </div>

      <div class="card">
        <h3>Активы</h3>
        <div>Гараж: ${Game.state.garage.length} авто</div>
        <div>Номера: ${Game.state.numbersOwned.length}</div>
        <div>Недвижимость: ${Game.state.apartments.length}</div>
        <div>Таксопарк: ${Game.state.taxiDrivers.length} водителей</div>
      </div>

      <div class="card">
        <h3>Достижения</h3>
        <div>${Game.state.stats.bought>=1?'✅':'⬜'} Первая покупка</div>
        <div>${Game.state.stats.sold>=1?'✅':'⬜'} Первая продажа</div>
        <div>${Game.state.stats.sold>=10?'✅':'⬜'} 10 продаж</div>
        <div>${Game.state.stats.profit>=1000000?'✅':'⬜'} Профит 1 млн</div>
        <div>${Game.state.stats.tuningsInstalled>=5?'✅':'⬜'} 5 тюнингов</div>
        <div>${Game.state.stats.numbersSold>=1?'✅':'⬜'} Первый номер</div>
        <div>${Game.state.apartments.length>=1?'✅':'⬜'} Первая недвижимость</div>
        <div>${Game.state.hasLicense?'✅':'⬜'} Права получены</div>
        <div>${Game.state.visa?'✅':'⬜'} Виза</div>
        <div>${Game.state.garage.length>=5?'✅':'⬜'} 5 авто в гараже</div>
        <div>${Game.state.level>=10?'✅':'⬜'} Уровень 10</div>
      </div>

      <div class="btn-row">
        <button class="red" onclick="if(confirm('Сбросить ВЕСЬ прогресс? Это нельзя отменить.')){localStorage.removeItem(Game.SAVE_KEY);location.reload()}">Сброс</button>
      </div>

      <div style="text-align:center;font-size:11px;color:#444;margin-top:20px">Симулятор Перекупа v3.0</div>
    `;
  }
};
