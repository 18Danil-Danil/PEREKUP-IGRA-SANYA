Apps.race = {
  state: { active:false, tier:null, phase:'idle', timeout:null, loseTimeout:null, reactionAt:0, driverDelay:0 },

  // Гасит все таймауты и сбрасывает гонку. Вызывается UI при уходе с экрана.
  cleanup() {
    if (this.state.timeout)     { clearTimeout(this.state.timeout);     this.state.timeout = null; }
    if (this.state.loseTimeout) { clearTimeout(this.state.loseTimeout); this.state.loseTimeout = null; }
    this.state.active = false;
    this.state.phase = 'idle';
  },

  render() {
    const s = document.getElementById('screen');
    const st = this.state;
    if (st.active) {
      if (st.phase === 'waiting') {
        s.innerHTML = `
          <div class="header"><h2>🏁 Приготовься...</h2></div>
          <div class="card" style="text-align:center;padding:50px">
            <div style="font-size:80px">🔴</div>
            <div style="font-size:18px;font-weight:800;margin-top:16px">Жди зелёного</div>
            <div style="font-size:13px;color:#888;margin-top:8px">Тапни как только увидишь 🟢</div>
          </div>
        `;
      } else if (st.phase === 'go') {
        s.innerHTML = `
          <div onclick="Apps.race.react()" style="cursor:pointer">
            <div class="header"><h2>🏁 ЖМИ!</h2></div>
            <div class="card" style="text-align:center;padding:60px;background:linear-gradient(135deg,rgba(0,229,160,.3),rgba(0,184,124,.3))">
              <div style="font-size:110px;animation:pulse .4s infinite">🟢</div>
              <div style="font-size:24px;font-weight:900;margin-top:16px;color:#00e5a0">ТАПАЙ!</div>
            </div>
          </div>
        `;
      }
      return;
    }

    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Гонки 🏁</h2></div>
      <div class="card">
        <h3>🏎 Drive Ace</h3>
        <div style="font-size:13px;color:#888">Реакция · без ставки</div>
        <div style="font-size:12px;color:#00e5a0;margin-top:6px">Рекорд: ${Game.state.driveAceBest || '—'} мс</div>
        <button class="green" style="margin-top:10px" onclick="Apps.race.start('ace')">Играть</button>
      </div>
      ${RACE_TIERS.map(t => `
        <div class="card">
          <h3>${t.name}</h3>
          <div style="font-size:13px;color:#888">Ставка ${Game.fmt(t.buy)} · Победа ×${t.mult}</div>
          <button class="green" style="margin-top:10px" onclick="Apps.race.start('${t.id}')">Гонять</button>
        </div>
      `).join('')}
      <div class="card">
        <h3>Статистика</h3>
        <div>Побед: ${Game.state.racesWon || 0}</div>
        <div>Поражений: ${Game.state.racesLost || 0}</div>
      </div>
    `;
  },

  start(id) {
    if (id !== 'ace') {
      const tier = RACE_TIERS.find(x => x.id === id);
      if (!tier) return;
      if (Game.state.money < tier.buy) return alert('Мало денег');
      Game.state.money -= tier.buy;
    }
    // Погасим возможные висящие таймауты от предыдущей гонки
    this.cleanup();
    this.state = {
      active:true, tier:id, phase:'waiting', timeout:null, loseTimeout:null,
      reactionAt:0, driverDelay: 280 + Math.random() * 220
    };
    this.render();
    const wait = 1500 + Math.random() * 2500;
    this.state.timeout = setTimeout(() => {
      if (!this.state.active) return; // вышли с экрана — не запускаем
      this.state.phase = 'go';
      this.state.reactionAt = performance.now();
      this.render();
      this.state.loseTimeout = setTimeout(() => {
        if (this.state.active && this.state.phase === 'go') this.finish(false, 3000);
      }, 3000);
    }, wait);
  },

  react() {
    if (this.state.phase !== 'go') return;
    clearTimeout(this.state.loseTimeout);
    const reaction = performance.now() - this.state.reactionAt;
    this.finish(reaction < this.state.driverDelay, reaction);
  },

  finish(won, reactionMs) {
    const tier = this.state.tier;
    this.state.active = false;
    let winAmount = 0;

    if (tier === 'ace') {
      if (!Game.state.driveAceBest || reactionMs < Game.state.driveAceBest) {
        Game.state.driveAceBest = Math.round(reactionMs);
      }
      if (won) Game.state.racesWon = (Game.state.racesWon||0) + 1;
      else Game.state.racesLost = (Game.state.racesLost||0) + 1;
      if (won) { winAmount = 5000; Game.state.money += winAmount; Game.addXP(10); }
    } else {
      const t = RACE_TIERS.find(x => x.id === tier);
      if (won) {
        winAmount = Math.round(t.buy * t.mult);
        Game.state.money += winAmount;
        Game.state.racesWon = (Game.state.racesWon||0) + 1;
        Game.addXP(15);
      } else {
        Game.state.racesLost = (Game.state.racesLost||0) + 1;
      }
    }
    Game.save(); UI.updateStatus();

    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><h2>🏁 ${won?'Победа!':'Проигрыш'}</h2></div>
      <div class="card" style="text-align:center;padding:40px;background:${won?'linear-gradient(135deg,rgba(0,229,160,.3),rgba(0,184,124,.3))':'linear-gradient(135deg,rgba(255,84,112,.3),rgba(196,30,47,.3))'}">
        <div style="font-size:80px">${won?'🏆':'💨'}</div>
        <div style="font-size:22px;font-weight:900;margin-top:16px">${won?'Победа!':'Соперник быстрее'}</div>
        <div style="font-size:16px;margin-top:8px">Реакция: ${Math.round(reactionMs)} мс</div>
        ${winAmount?`<div style="font-size:20px;color:#00e5a0;margin-top:8px">+${Game.fmt(winAmount)}</div>`:''}
      </div>
      <button class="green" style="width:100%" onclick="Apps.race.render()">Ещё раз</button>
      <button class="gray" style="width:100%;margin-top:8px" onclick="UI.back()">Домой</button>
    `;
  }
};
