Apps.profile = {
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Профиль</h2></div>
      <div class="card" style="text-align:center">
        <div style="font-size:60px">👤</div>
        <h3>Перекуп</h3>
        <div>Ур. ${Game.state.level} · ${Game.state.xp}/${Game.state.level*100} XP</div>
        <div>Репутация: ${Game.state.reputation}</div>
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
      </div>
      <div class="btn-row">
        <button class="red" onclick="if(confirm('Сбросить?')){localStorage.removeItem(Game.SAVE_KEY);location.reload()}">Сброс</button>
      </div>
    `;
  }
};
