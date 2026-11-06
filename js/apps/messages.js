Apps.messages = {
  render() {
    const s = document.getElementById('screen');
    const buyers = Game.state.pendingBuyers || [];
    const chats = Game.state.listings.filter(l => !l.sold).slice(0, 5);
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Сообщения</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(0,229,160,.15),rgba(0,143,95,.15))">
        <h3>👨‍👩‍👧 Родные</h3>
        <div style="font-size:13px;color:#888;margin-bottom:8px">Чаты с мамой, бабушкой и дедушкой</div>
        <button class="green" onclick="UI.open('family')">Открыть</button>
      </div>

      ${buyers.length ? `
        <h3 style="margin:16px 0 10px;font-size:15px">💬 Покупатели на мои машины (${buyers.length})</h3>
        ${buyers.map((b,i) => {
          const l = (Game.state.myListings||[]).find(x => x.id === b.listingId);
          if (!l) return '';
          return `<div class="card" style="cursor:pointer" onclick="UI.open('trade')">
            <h3>👤 ${b.name}</h3>
            <div style="color:#888;font-size:13px">Интересуется: ${l.icon} ${l.name}</div>
            <div style="font-size:12px;color:#00e5a0">Предлагает: ${Game.fmt(b.offer)}</div>
          </div>`;
        }).join('')}
      ` : ''}

      <h3 style="margin:16px 0 10px;font-size:15px">Продавцы</h3>
      ${chats.length ? chats.map(l => `
        <div class="card" style="cursor:pointer" onclick="Apps.messages.chat(${l.id})">
          <h3>${l.icon} ${l.name}</h3>
          <div style="color:#888;font-size:13px">${l.seller}: «${l.price < l.market * 0.8 ? 'Торг возможен' : 'Цена окончательная'}»</div>
          <div style="font-size:12px;color:#00e5a0;margin-top:4px">${Game.fmt(l.price)}</div>
        </div>`).join('') : '<p style="color:#888">Нет активных объявлений</p>'}
    `;
  },

  chat(id) {
    const l = Game.state.listings.find(x => x.id === id);
    if (!l) return;
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.messages.render()">←</span><h2>${l.seller}</h2></div>
      <div class="card">
        <div style="font-size:13px;color:#888;margin-bottom:8px">${l.icon} ${l.name} · ${Game.fmt(l.price)}</div>
        <div style="background:rgba(50,50,80,.5);border-radius:12px;padding:12px;font-size:14px">
          <div style="color:#888;font-size:11px;margin-bottom:4px">${l.seller}</div>
          Здравствуйте! Машина в наличии. Что интересует?
        </div>
      </div>
      <div class="btn-row" style="flex-direction:column">
        <button onclick="Apps.messages.ask(${l.id}, 'mileage')">«Какой реальный пробег?»</button>
        <button onclick="Apps.messages.ask(${l.id}, 'accidents')">«Были ли ДТП?»</button>
        <button class="green" onclick="Apps.trade.startSellerTrade(${l.id})">💬 Перейти к торгу</button>
      </div>
    `;
  },

  ask(id, type) {
    const l = Game.state.listings.find(x => x.id === id);
    if (!l) return;
    let reply = '';
    if (type === 'mileage') {
      reply = l.hiddenDefects.includes('Скрученный пробег') ? 'Да всё родное! (глаза бегают)' : 'Пробег родной, всё по документам';
    } else if (type === 'accidents') {
      reply = (l.hiddenDefects.includes('Заменённый кузов') || l.hiddenDefects.includes('Шпаклёвка на крыле'))
        ? 'Было немного, всё сделано хорошо' : 'Не бита, не крашена';
    }
    UI.toast(`${l.seller}: ${reply}`, 'info', 3500);
  }
};
