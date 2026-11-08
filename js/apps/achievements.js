Apps.achievements = {
  defs: [
    { id:'first_buy',      icon:'🛒', name:'Первая покупка',      desc:'Купить первое авто',                    reward:5000,   check: s => s.stats.bought >= 1 },
    { id:'first_sell',     icon:'💸', name:'Первая продажа',      desc:'Продать первое авто',                   reward:5000,   check: s => s.stats.sold >= 1 },
    { id:'ten_sells',      icon:'🏆', name:'10 продаж',           desc:'Продать 10 машин',                      reward:50000,  check: s => s.stats.sold >= 10 },
    { id:'fifty_sells',    icon:'👑', name:'50 продаж',           desc:'Продать 50 машин',                      reward:200000, check: s => s.stats.sold >= 50 },
    { id:'million',        icon:'💎', name:'Профит 1 млн',        desc:'Заработать 1 000 000 ₽ профита',        reward:100000, check: s => s.stats.profit >= 1000000 },
    { id:'five_tuning',    icon:'🔧', name:'5 тюнингов',          desc:'Установить 5 улучшений',                reward:20000,  check: s => s.stats.tuningsInstalled >= 5 },
    { id:'first_property', icon:'🏠', name:'Первая недвижимость', desc:'Купить первую недвижимость',            reward:30000,  check: s => s.apartments.length >= 1 },
    { id:'license',        icon:'🪪', name:'Права',                desc:'Получить водительские права',           reward:2000,   check: s => s.hasLicense === true },
    { id:'visa',           icon:'✈️', name:'Виза',                desc:'Оформить визу',                          reward:5000,   check: s => s.visa === true },
    { id:'first_biz',      icon:'🏢', name:'Первый бизнес',       desc:'Купить первый бизнес',                   reward:100000, check: s => Object.values(s.businesses||{}).filter(Boolean).length >= 1 },
    { id:'five_races',     icon:'🏁', name:'5 побед в гонках',    desc:'Победить в гонках 5 раз',                reward:30000,  check: s => (s.racesWon||0) >= 5 },
    { id:'millionaire',    icon:'💰', name:'Миллионер',           desc:'Накопить 1 000 000 ₽ на балансе',       reward:50000,  check: s => s.money >= 1000000 },
    { id:'number_trade',   icon:'🔢', name:'Номерной магнат',     desc:'Продать 3 номера',                       reward:15000,  check: s => s.stats.numbersSold >= 3 },
    { id:'rep_80',         icon:'⭐', name:'Хорошая репутация',   desc:'Достичь репутации 80',                   reward:40000,  check: s => (s.reputation||0) >= 80 },
    { id:'auction_win',    icon:'🏛️', name:'Аукционист',         desc:'Победить на аукционе',                   reward:25000,  check: s => (s.garage||[]).length >= 1 && (s.stats.bought||0) >= 1 && (s.stats.bought||0) > 0 },
    { id:'tools_all',      icon:'🔍', name:'Полный арсенал',     desc:'Купить толщиномер и OBD-сканер',         reward:15000,  check: s => s.tools.thickness && s.tools.obd }
  ],

  checkNew() {
    if (!Game.state) return;
    if (!Game.state.unlockedAchievements) Game.state.unlockedAchievements = [];

    const newly = [];
    this.defs.forEach(a => {
      if (Game.state.unlockedAchievements.includes(a.id)) return;
      let ok = false;
      try { ok = a.check(Game.state); } catch(e) { ok = false; }
      if (ok) {
        Game.state.unlockedAchievements.push(a.id);
        Game.state.money += a.reward;
        newly.push(a);
      }
    });

    if (newly.length) {
      if (!Game.state.notifications) Game.state.notifications = [];
      newly.forEach(a => {
        Game.state.notifications.push({
          id: Game.state.nextId++,
          icon: '🏅',
          text: `Достижение: ${a.name} (+${Game.fmt(a.reward)})`,
          day: Game.state.day,
          hour: Game.state.hour,
          read: false
        });
      });
      Game.save();
      if (window.UI) {
        if (UI.updateStatus) UI.updateStatus();
        if (UI._currentAppId === 'achievements') this.render();
        else if (UI._currentAppId === 'profile' && Apps.profile && Apps.profile.render) Apps.profile.render();
      }
    }
  },

  render() {
    const s = document.getElementById('screen');
    const unlocked = Game.state.unlockedAchievements || [];
    const total = this.defs.length;
    const count = unlocked.length;
    const pct = (count / total * 100).toFixed(1);

    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Достижения 🏅</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(255,205,60,.2),rgba(180,131,9,.2))">
        <h3>Прогресс</h3>
        <div style="font-size:26px;font-weight:800;margin-top:6px;color:#ffcd3c">${count} / ${total}</div>
        <div style="height:6px;background:rgba(255,255,255,.1);border-radius:3px;margin-top:8px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#ffcd3c,#e0a800);transition:width .4s"></div>
        </div>
        <div style="font-size:11px;color:#888;margin-top:6px">Достижения открываются автоматически. Награда начисляется сразу</div>
      </div>

      ${this.defs.map(a => {
        const done = unlocked.includes(a.id);
        return `<div class="card" style="opacity:${done?1:.6};${done?'border-color:rgba(0,229,160,.3);background:rgba(0,229,160,.08)':''}">
          <div style="display:flex;gap:12px;align-items:center">
            <div style="font-size:32px;line-height:1">${done?a.icon:'🔒'}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px">${a.name}</div>
              <div style="font-size:12px;color:#888;margin-top:2px">${a.desc}</div>
              <div style="font-size:12px;color:${done?'#00e5a0':'#666'};margin-top:4px">
                ${done ? '✓ Получено · +' + Game.fmt(a.reward) : '🏆 Награда: ' + Game.fmt(a.reward)}
              </div>
            </div>
          </div>
        </div>`;
      }).join('')}
    `;
  }
};
