Apps.casino = {
  minesState: { active:false, bet:0, mines:[], revealed:[], mult:1 },
  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Casino 🎰</h2></div>
      <div class="card">
        <h3>Слоты</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">Ставка 10 000 ₽</div>
        <button onclick="Apps.casino.slots()">Крутить</button>
      </div>
      <div class="card">
        <h3>Кейс Перекупа</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">50 000 ₽ · шанс на джекпот</div>
        <button class="green" onclick="Apps.casino.caseOpen()">Открыть</button>
      </div>
      <div class="card">
        <h3>Мины 💣</h3>
        ${this.minesState.active
          ?`<div>Множитель: ×${this.minesState.mult.toFixed(2)}</div>
            <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:8px">
              ${Array.from({length:25}).map((_,i)=>{
                const rev = this.minesState.revealed.includes(i);
                return `<div onclick="Apps.casino.minesClick(${i})" style="aspect-ratio:1;background:${rev?'#22c55e':'#2a2a3e'};border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center">${rev?'💎':''}</div>`;
              }).join('')}
            </div>
            <button class="green" style="width:100%;margin-top:8px" onclick="Apps.casino.minesCashout()">Забрать ${Game.fmt(this.minesState.bet*this.minesState.mult)}</button>`
          :`<button onclick="Apps.casino.minesStart()">Начать (10 000 ₽)</button>`}
      </div>
      <div class="card">
        <h3>Кости 🎲</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">Ставка 10k. Больше/меньше 7 = ×2, ровно 7 = ×6</div>
        <div class="btn-row">
          <button onclick="Apps.casino.dice('high')">Больше 7</button>
          <button onclick="Apps.casino.dice('low')">Меньше 7</button>
          <button onclick="Apps.casino.dice('seven')">Ровно 7</button>
        </div>
      </div>
    `;
  },
  slots() {
    if (Game.state.money < 10000) return alert('Мало денег');
    Game.state.money -= 10000;
    const r = () => Math.floor(Math.random()*5);
    const [a,b,c] = [r(),r(),r()];
    let win = 0;
    if (a===b&&b===c) win = 100000;
    else if (a===b||b===c||a===c) win = 20000;
    Game.state.money += win;
    Game.save(); UI.updateStatus(); this.render();
    alert(`🎰 ${a}${b}${c}\n${win?'Выигрыш: '+Game.fmt(win):'Проигрыш'}`);
  },
  caseOpen() {
    if (Game.state.money < 50000) return alert('Мало денег');
    Game.state.money -= 50000;
    const r = Math.random();
    let win = 0;
    if (r < 0.02) win = 500000;
    else if (r < 0.15) win = 100000;
    else if (r < 0.5) win = 60000;
    Game.state.money += win;
    Game.save(); UI.updateStatus(); this.render();
    alert(win>50000?`🎁 Джекпот! ${Game.fmt(win)}`:`🎁 ${Game.fmt(win)}`);
  },
  minesStart() {
    if (Game.state.money < 10000) return alert('Мало денег');
    Game.state.money -= 10000;
    const mines = [];
    while (mines.length < 5) {
      const m = Math.floor(Math.random()*25);
      if (!mines.includes(m)) mines.push(m);
    }
    this.minesState = { active:true, bet:10000, mines, revealed:[], mult:1 };
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
  },
  dice(type) {
    if (Game.state.money < 10000) return alert('Мало денег');
    Game.state.money -= 10000;
    const d1 = 1+Math.floor(Math.random()*6);
    const d2 = 1+Math.floor(Math.random()*6);
    const sum = d1+d2;
    let mult = 0;
    if (type==='high'&&sum>7) mult=2;
    else if (type==='low'&&sum<7) mult=2;
    else if (type==='seven'&&sum===7) mult=6;
    const win = 10000*mult;
    Game.state.money += win;
    Game.save(); UI.updateStatus(); this.render();
    alert(`🎲 ${d1}+${d2}=${sum}\n${win?'+'+Game.fmt(win):'Проигрыш'}`);
  }
};
