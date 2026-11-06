Apps.messages = {
  render() {
    const s = document.getElementById('screen');
    const fam = Game.state.family;
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Сообщения</h2></div>
      ${[
        {key:'mom',name:'👩 Мама',preview:'Привет, сынок!'},
        {key:'grandma',name:'👵 Бабушка',preview:'Держи на дорогу 💰'},
        {key:'grandpa',name:'👴 Дедушка',preview:'Машины — это хорошо'}
      ].map(f=>`
        <div class="card" style="cursor:pointer" onclick="Apps.messages.chat('${f.key}')">
          <h3>${f.name}</h3>
          <div style="color:#888;font-size:13px">${f.preview}</div>
          <div style="font-size:12px;color:#4ade80;margin-top:4px">Доверие: ${fam[f.key].trust}%</div>
        </div>`).join('')}
    `;
  },
  chat(key) {
    const names = { mom:'👩 Мама', grandma:'👵 Бабушка', grandpa:'👴 Дедушка' };
    const fam = Game.state.family[key];
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.messages.render()">←</span><h2>${names[key]}</h2></div>
      <div class="card"><div>Доверие: ${fam.trust}%</div></div>
      <div class="btn-row" style="flex-direction:column">
        <button onclick="Apps.messages.topic('${key}','how')">«Как дела?»</button>
        <button onclick="Apps.messages.topic('${key}','advice')">«Посоветуй»</button>
        <button onclick="Apps.messages.topic('${key}','brag')">«Похвастаться»</button>
        <button onclick="Apps.messages.topic('${key}','hard')">«Тяжёлый день…»</button>
        <button class="green" onclick="Apps.messages.gift('${key}')">💵 Попросить денег</button>
      </div>
    `;
  },
  topic(key, type) {
    const fam = Game.state.family[key];
    const names = { mom:'Мама', grandma:'Бабушка', grandpa:'Дедушка' };
    let reply = '';
    if (type === 'how') {
      const r = ['Всё хорошо, а у тебя?','Потихоньку','Скучаю!','Отлично, спасибо'];
      reply = r[Math.floor(Math.random()*r.length)];
      fam.trust = Math.min(100, fam.trust + 1);
    } else if (type === 'advice') {
      const r = ['Не бери без осмотра','Следи за налогами','Бери с умом','Не играй в казино!'];
      reply = r[Math.floor(Math.random()*r.length)];
      fam.trust = Math.min(100, fam.trust + 2);
    } else if (type === 'brag') {
      if (Game.state.stats.bought >= 1) { reply = 'Молодец! Горжусь!'; fam.trust = Math.min(100, fam.trust+3); }
      else reply = 'А чем хвастаться?';
    } else if (type === 'hard') {
      if (fam.trust > 60 && Math.random() < 0.3) {
        const m = 5000 + Math.floor(Math.random()*10000);
        Game.state.money += m;
        reply = `Держи ${Game.fmt(m)}, держись!`;
      } else reply = 'Всё наладится';
    }
    Game.save(); UI.updateStatus();
    alert(`${names[key]}: ${reply}`);
  },
  gift(key) {
    const fam = Game.state.family[key];
    if (fam.lastGift && Game.state.day - fam.lastGift < 7) return alert('Уже давали на этой неделе');
    if (fam.trust < 30) return alert('Сначала пообщайся, доверие низкое');
    const sum = (key==='grandma'?15000:key==='grandpa'?20000:25000) + Math.floor(Math.random()*10000);
    Game.state.money += sum;
    fam.lastGift = Game.state.day;
    fam.trust = Math.max(0, fam.trust - 5);
    Game.save(); UI.updateStatus();
    alert(`+${Game.fmt(sum)} 💰`);
  }
};
