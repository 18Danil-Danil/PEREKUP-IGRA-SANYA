Apps.casino = {
  minesState: { active:false, bet:0, mines:[], revealed:[], mult:1 },
  crashState: { active:false, bet:0, mult:1, crashAt:0, interval:null },
  bjState: { active:false, bet:0, playerHand:[], dealerHand:[], deck:[] },

  getBet() { return Game.state.casinoBet || 1000; },
  setBet(v) {
    let n = parseInt(v);
    if (isNaN(n) || n < 100) n = 100;
    if (n > 100000000) n = 100000000;
    Game.state.casinoBet = n;
    Game.save();
    this.render();
  },

  render() {
    const bet = this.getBet();
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Casino 🎰</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(168,85,247,.2),rgba(99,102,241,.2));border-color:rgba(168,85,247,.4)">
        <h3>💵 Ставка</h3>
        <input type="number" value="${bet}" min="100" step="100"
          onchange="Apps.casino.setBet(this.value)"
          style="margin-bottom:8px;font-size:18px;font-weight:700;text-align:center">
        <div class="btn-row">
          <button class="gray" onclick="Apps.casino.setBet(1000)">1K</button>
          <button class="gray" onclick="Apps.casino.setBet(10000)">10K</button>
          <button class="gray" onclick="Apps.casino.setBet(100000)">100K</button>
          <button class="gray" onclick="Apps.casino.setBet(1000000)">1M</button>
          <button class="gray" onclick="Apps.casino.setBet(${Game.state.money})">ВСЁ</button>
        </div>
      </div>

      <div class="card" style="background:linear-gradient(135deg,rgba(239,68,68,.18),rgba(168,85,247,.18))">
        <h3>🚀 Краш</h3>
        ${this.crashState.active
          ? `<div id="crashMult" style="text-align:center;font-size:44px;font-weight:900;
              background:linear-gradient(135deg,#ffd93d,#f59e0b);
              -webkit-background-clip:text;-webkit-text-fill-color:transparent;
              background-clip:text;margin:12px 0">×${this.crashState.mult.toFixed(2)}</div>
             <button class="gold" style="width:100%" onclick="Apps.casino.crashCashout()">Забрать ${Game.fmt(Math.round(this.crashState.bet*this.crashState.mult))}</button>`
          : `<div style="color:#888;font-size:12px;margin-bottom:8px">Множитель растёт. Успей забрать до краша!</div>
             <button class="red" style="width:100%" onclick="Apps.casino.crashStart()">Старт (${Game.fmt(bet)})</button>`}
      </div>

      <div class="card">
        <h3>🎰 Слоты</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">Три одинаковых = ×10 · Два одинаковых = ×2</div>
        <button onclick="Apps.casino.slots()">Крутить (${Game.fmt(bet)})</button>
      </div>

      <div class="card">
        <h3>🃏 Блэкджек</h3>
        ${this.bjState.active
          ? `<div style="margin-bottom:8px">
              <div>Вы: <b>${this.bjState.playerHand.join(' ')}</b> = ${this.bjSum(this.bjState.playerHand)}</div>
              <div>Дилер: <b>${this.bjState.dealerHand.join(' ')}</b> = ${this.bjSum(this.bjState.dealerHand)}</div>
             </div>
             <div class="btn-row">
              <button class="green" onclick="Apps.casino.bjHit()">Взять</button>
              <button class="gray" onclick="Apps.casino.bjStand()">Хватит</button>
             </div>`
          : `<div style="color:#888;font-size:12px;margin-bottom:8px">Блэкджек ×2.5 · победа ×2 · ничья возврат</div>
             <button onclick="Apps.casino.bjStart()">Играть (${Game.fmt(bet)})</button>`}
      </div>

      <div class="card">
        <h3>🎡 Рулетка</h3>
        <div style="color:#888;font-size:12px;margin-bottom:8px">Красное/чёрное ×2 · Зеро ×36</div>
        <div class="btn-row">
          <button class="red" onclick="Apps.casino.roulette('red')">Красное</button>
          <button class="gray" onclick="Apps.casino.roulette('black')">Чёрное</button>
          <button class="gold" onclick="Apps.casino.roulette('zero')">Зеро</button>
        </div>
      </div>

      <div class="card">
        <h3>🎁 Кейс Перекупа</h3>
        <div style="color:#888;font-size:12px;margin-bottom:8px">Джекпот ×10 · редко</div>
        <button class="green" onclick="Apps.casino.caseOpen()">Открыть (${Game.fmt(bet)})</button>
      </div>

      <div class="card">
        <h3>💣 Мины</h3>
        ${this.minesState.active
          ? `<div>×${this.minesState.mult.toFixed(2)}</div>
             <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:8px">
              ${Array.from({length:25}).map((_,i)=>{
                const rev = this.minesState.revealed.includes(i);
                const bg = rev ? 'linear-gradient(135deg,#00d68f,#00a874)' : 'rgba(50,50,80,.8)';
                return `<div onclick="Apps.casino.minesClick(${i})" style="aspect-ratio:1;background:${bg};border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center">${rev?'💎':''}</div>`;
              }).join('')}
             </div>
             <button class="green" style="width:100%;margin-top:8px" onclick="Apps.casino.minesCashout()">Забрать ${Game.fmt(Math.round(this.minesState.bet*this.minesState.mult))}</button>`
          : `<button onclick="Apps.casino.minesStart()">Начать (${Game.fmt(bet)})</button>`}
      </div>
    `;
  },

  /* ===== Краш ===== */
  crashStart() {
    if (this.crashState.active) return;
    const bet = this.getBet();
    if (Game.state.money < bet) return alert('Мало денег');
    Game.state.money -= bet;
    const crashAt = 1.1 + Math.pow(Math.random(),2) * 9;
    this.crashState = { active:true, bet, mult:1, crashAt, interval:null };
    Game.save(); UI.updateStatus();
    this.crashState.interval = setInterval(() => {
      if (!this.crashState.active) return;
      this.crashState.mult += 0.02 + this.crashState.mult * 0.008;
      if (this.crashState.mult >= this.crashState.crashAt) {
        clearInterval(this.crashState.interval);
        this.crashState.active = false;
        Game.save(); UI.updateStatus();
        alert(`💥 Краш на ×${this.crashState.mult.toFixed(2)}! Ставка потеряна.`);
        this.render();
        return;
      }
      const el = document.getElementById('crashMult');
      if (el) el.textContent = '×' + this.crashState.mult.toFixed(2);
    }, 80);
    this.render();
  },
  crashCashout() {
    if (!this.crashState.active) return;
    clearInterval(this.crashState.interval);
    const win = Math.round(this.crashState.bet * this.crashState.mult);
    Game.state.money += win;
    this.crashState.active = false;
    Game.save(); UI.updateStatus();
    alert(`Забрано: ${Game.fmt(win)}`);
    this.render();
  },

  /* ===== Слоты ===== */
  slots() {
    const bet = this.getBet();
    if (Game.state.money < bet) return alert('Мало денег');
    Game.state.money -= bet;
    const r = () => Math.floor(Math.random()*5);
    const [a,b,c] = [r(),r(),r()];
    let mult = 0;
    if (a===b&&b===c) mult = 10;
    else if (a===b||b===c||a===c) mult = 2;
    const win = bet * mult;
    Game.state.money += win;
    Game.save(); UI.updateStatus(); this.render();
    alert(`🎰 ${a}${b}${c}\n${win?'Выигрыш: '+Game.fmt(win):'Проигрыш'}`);
  },

  /* ===== Блэкджек ===== */
  makeDeck() {
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const deck = [];
    for (let i=0;i<4;i++) for (const r of ranks) deck.push(r);
    return deck.sort(()=>Math.random()-0.5);
  },
  bjSum(hand) {
    let sum = 0, aces = 0;
    for (const c of hand) {
      if (c === 'A') { aces++; sum += 11; }
      else if (['J','Q','K'].includes(c)) sum += 10;
      else sum += parseInt(c);
    }
    while (sum > 21 && aces > 0) { sum -= 10; aces--; }
    return sum;
  },
  bjStart() {
    const bet = this.getBet();
    if (Game.state.money < bet) return alert('Мало денег');
    Game.state.money -= bet;
    const deck = this.makeDeck();
    this.bjState = { active:true, bet,
      playerHand:[deck.pop(),deck.pop()],
      dealerHand:[deck.pop(),deck.pop()], deck };
    Game.save(); UI.updateStatus();
    if (this.bjSum(this.bjState.playerHand) === 21) return this.bjFinish('blackjack');
    this.render();
  },
  bjHit() {
    if (!this.bjState.active) return;
    this.bjState.playerHand.push(this.bjState.deck.pop());
    if (this.bjSum(this.bjState.playerHand) > 21) return this.bjFinish('bust');
    this.render();
  },
  bjStand() {
    if (!this.bjState.active) return;
    while (this.bjSum(this.bjState.dealerHand) < 17) {
      this.bjState.dealerHand.push(this.bjState.deck.pop());
    }
    const p = this.bjSum(this.bjState.playerHand);
    const d = this.bjSum(this.bjState.dealerHand);
    if (d > 21) return this.bjFinish('dealer_bust');
    if (p > d)  return this.bjFinish('win');
    if (p < d)  return this.bjFinish('lose');
    return this.bjFinish('push');
  },
  bjFinish(result) {
    let win = 0, msg = '';
    const bet = this.bjState.bet;
    if (result==='blackjack') { win = Math.round(bet*2.5); msg = 'Блэкджек!'; }
    else if (result==='win' || result==='dealer_bust') { win = bet*2; msg = 'Победа!'; }
    else if (result==='push') { win = bet; msg = 'Ничья'; }
    else if (result==='bust') { msg = 'Перебор'; }
    else if (result==='lose') { msg = 'Проигрыш'; }
    Game.state.money += win;
    this.bjState.active = false;
    Game.save(); UI.updateStatus();
    alert(`${msg}${win?' +'+Game.fmt(win):''}`);
    this.render();
  },

  /* ===== Рулетка ===== */
  roulette(betType) {
    const bet = this.getBet();
    if (Game.state.money < bet) return alert('Мало денег');
    Game.state.money -= bet;
    const num = Math.floor(Math.random()*37);
    const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    let mult = 0;
    if (betType==='red' && reds.includes(num)) mult = 2;
    else if (betType==='black' && num !== 0 && !reds.includes(num)) mult = 2;
    else if (betType==='zero' && num === 0) mult = 36;
    const win = bet * mult;
    Game.state.money += win;
    Game.save(); UI.updateStatus(); this.render();
    alert(`🎡 Выпало: ${num}\n${win?'Выигрыш: '+Game.fmt(win):'Проигрыш'}`);
  },

  /* ===== Кейс ===== */
  caseOpen() {
    const bet = this.getBet();
    if (Game.state.money < bet) return alert('Мало денег');
    Game.state.money -= bet;
    const r = Math.random();
    let mult = 0;
    if (r < 0.02) mult = 10;
    else if (r < 0.15) mult = 2;
    else if (r < 0.5) mult = 1.2;
    const win = Math.round(bet * mult);
    Game.state.money += win;
    Game.save(); UI.updateStatus(); this.render();
    alert(mult >= 10 ? `🎁 Джекпот! ${Game.fmt(win)}` : `🎁 ${Game.fmt(win)}`);
  },

  /* ===== Мины ===== */
  minesStart() {
    const bet = this.getBet();
    if (Game.state.money < bet) return alert('Мало денег');
    Game.state.money -= bet;
    const mines = [];
    while (mines.length < 5) {
      const m = Math.floor(Math.random()*25);
      if (!mines.includes(m)) mines.push(m);
    }
    this.minesState = { active:true, bet, mines, revealed:[], mult:1 };
    Game.save(); UI.updateStatus(); this.render();
  },
  minesClick(i) {
    if (!this.minesState.active || this.minesState.revealed.includes(i)) return;
    if (this.minesState.mines.includes(i)) {
      this.minesState.active = false;
      Game.save(); UI.updateStatus(); this.render();
      return alert('💥 Мина!');
    }
    this.minesState.revealed.push(i);
    const mult = [1.2,1.5,1.9,2.4,3.0,3.7,4.6,5.7,7.0,8.6];
    this.minesState.mult = mult[this.minesState.revealed.length-1] || 10;
    this.render();
  },
  minesCashout() {
    if (!this.minesState.active) return;
    const win = Math.round(this.minesState.bet*this.minesState.mult);
    Game.state.money += win;
    this.minesState.active = false;
    Game.save(); UI.updateStatus(); this.render();
    alert(`Забрано: ${Game.fmt(win)}`);
  }
};
