Apps.family = {
  activeChat: null,

  getDateFromDay(d) {
    const doy = ((d - 1) % 360) + 1;
    return [Math.ceil(doy / 30), ((doy - 1) % 30) + 1];
  },

  initMember(key) {
    const m = Game.state.family[key];
    if (!m.chatLog) m.chatLog = [];
    if (m.needCongrats === undefined) m.needCongrats = false;
    if (m.lastBirthdayDay === undefined) m.lastBirthdayDay = 0;
    if (m.lastVisit === undefined) m.lastVisit = 0;
    if (m.trust === undefined) m.trust = 50;
    if (m.lastGift === undefined) m.lastGift = 0;
    return m;
  },

  render() {
    this.activeChat = null;
    const s = document.getElementById('screen');
    const [cm, cd] = this.getDateFromDay(Game.state.day);
    const isNewYear  = cm === 1 && cd === 1;
    const isMarch8   = cm === 3 && cd === 8;
    const isFeb23    = cm === 2 && cd === 23;
    const isHoliday  = isNewYear || isMarch8 || isFeb23;
    const holidayName = isNewYear ? '🎄 Новый год' : isMarch8 ? '🌷 8 Марта' : isFeb23 ? '🎖 23 Февраля' : null;

    const p = Game.state.passport;
    const isMyBD = p.created && p.birthDay[0] === cm && p.birthDay[1] === cd;

    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Родные 👨‍👩‍👧</h2></div>

      ${isHoliday ? `
        <div class="card" style="background:linear-gradient(135deg,rgba(236,72,153,.2),rgba(131,24,67,.2))">
          <h3>${holidayName}</h3>
          <div style="font-size:13px;color:#888;margin:8px 0">Поздравь родных, чтобы поднять доверие</div>
          <button class="green" onclick="Apps.family.greetAll()">Поздравить всех</button>
        </div>
      ` : ''}

      ${isMyBD ? `
        <div class="card" style="background:linear-gradient(135deg,rgba(255,217,61,.2),rgba(224,168,0,.2))">
          <h3>🎂 С днём рождения!</h3>
          <div style="font-size:13px;color:#888;margin-top:6px">Родные уже поздравили и скинулись на подарок.</div>
        </div>
      ` : ''}

      ${FAMILY_MEMBERS.map(f => {
        const m = this.initMember(f.key);
        const bd = m.needCongrats ? '🎂' : '';
        return `<div class="card" style="cursor:pointer" onclick="Apps.family.chat('${f.key}')">
          <h3>${f.name} ${bd}</h3>
          <div style="font-size:12px;color:#888">Доверие: ${m.trust}%</div>
          ${m.needCongrats ? '<div style="font-size:12px;color:#f59e0b;margin-top:4px">🎂 Сегодня ДР — не забудь поздравить!</div>' : ''}
        </div>`;
      }).join('')}
    `;
  },

  chat(key) {
    this.activeChat = key;
    const m = this.initMember(key);
    const member = FAMILY_MEMBERS.find(x => x.key === key);
    if (!m.chatLog.length) {
      m.chatLog.push({ role: 'them', text: 'Привет! Как ты там?' });
    }

    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="Apps.family.render()">←</span><h2>${member.name}</h2></div>

      <div class="card">
        <div style="font-size:12px;color:#888;margin-bottom:8px">Доверие: ${m.trust}%</div>
        ${m.needCongrats ? `<button class="gold" style="width:100%;margin-bottom:8px" onclick="Apps.family.congratulate('${key}')">🎂 Поздравить с ДР</button>` : ''}
        <div style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0">
          ${m.chatLog.map(msg => `
            <div style="padding:8px 12px;border-radius:12px;max-width:85%;font-size:13px;
              ${msg.role === 'me' ? 'align-self:flex-end;background:#3b82f6;color:#fff' :
                msg.role === 'typing' ? 'align-self:flex-start;background:rgba(50,50,80,.7);color:#888;font-style:italic' :
                'align-self:flex-start;background:rgba(50,50,80,.7);color:#fff'}">
              ${msg.text}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="btn-row" style="flex-direction:column">
        <button onclick="Apps.family.topic('${key}', 'how')">«Как дела?»</button>
        <button onclick="Apps.family.topic('${key}', 'advice')">«Посоветуй»</button>
        <button onclick="Apps.family.topic('${key}', 'brag')">«Похвастаться»</button>
        <button onclick="Apps.family.topic('${key}', 'hard')">«Тяжёлый день…»</button>
        <button class="green" onclick="Apps.family.topic('${key}', 'visit')">🚶 Заехать в гости</button>
        <button class="gray" onclick="Apps.family.gift('${key}')">💵 Попросить денег</button>
      </div>
    `;
  },

  topic(key, type) {
    const m = this.initMember(key);
    const myText = {
      how:    'Как дела?',
      advice: 'Посоветуй что-нибудь',
      brag:   'Смотри что купил!',
      hard:   'Тяжёлый день был...',
      visit:  'Можно заехать в гости?'
    }[type];

    m.chatLog.push({ role: 'me', text: myText });
    m.chatLog.push({ role: 'typing', text: 'печатает…' });
    Game.save();
    this.chat(key);

    setTimeout(() => {
      const mm = Game.state.family[key];
      mm.chatLog = mm.chatLog.filter(x => x.role !== 'typing');

      let reply = '', trustDelta = 0, money = 0;
      if (type === 'how') {
        const opts = ['Всё хорошо, а ты как?', 'Потихоньку, на даче копаюсь', 'Скучаю по тебе!', 'Нормально, работаю'];
        reply = opts[Math.floor(Math.random() * opts.length)];
        trustDelta = 1;
      } else if (type === 'advice') {
        const opts = ['Не бери без осмотра — лоханёшься', 'Следи за налогами, а то ГосBuy оштрафует', 'Бери с умом, не гонись за дешёвкой', 'Меньше в казино играй!'];
        reply = opts[Math.floor(Math.random() * opts.length)];
        trustDelta = 2;
      } else if (type === 'brag') {
        if (Game.state.stats.bought >= 1) { reply = 'Молодец! Горжусь!'; trustDelta = 3; }
        else reply = 'А чем хвастаться? Ещё ничего не купил';
      } else if (type === 'hard') {
        if (mm.trust > 60 && Math.random() < 0.3) {
          money = 3000 + Math.floor(Math.random() * 7000);
          Game.state.money += money;
          reply = `Держи ${Game.fmt(money)}, держись!`;
        } else reply = 'Всё наладится, ты справишься';
        trustDelta = 1;
      } else if (type === 'visit') {
        if (mm.lastVisit && Game.state.day - mm.lastVisit < 7) {
          reply = 'Ты недавно был, давай чуть позже';
        } else {
          mm.lastVisit = Game.state.day;
          trustDelta = 5;
          reply = 'Приезжай конечно! Чай, пироги';
          if (key === 'grandma' && Math.random() < 0.3) {
            money = 3000 + Math.floor(Math.random() * 5000);
            Game.state.money += money;
            reply += ` (положила в карман ${Game.fmt(money)})`;
          }
        }
      }

      mm.trust = Math.max(0, Math.min(100, mm.trust + trustDelta));
      mm.chatLog.push({ role: 'them', text: reply });
      if (mm.chatLog.length > 20) mm.chatLog = mm.chatLog.slice(-20);
      Game.save(); UI.updateStatus();

      if (this.activeChat === key) this.chat(key);
    }, 1500);
  },

  gift(key) {
    const m = this.initMember(key);
    if (m.lastGift && Game.state.day - m.lastGift < 7) return UI.toast('Уже давали на этой неделе', 'info');
    if (m.trust < 30) return UI.toast('Доверие слишком низкое. Поговори сначала', 'red');
    const base = key === 'grandma' ? 5000 : key === 'grandpa' ? 7000 : 10000;
    const sum = base + Math.floor(Math.random() * 5000);
    Game.state.money += sum;
    m.lastGift = Game.state.day;
    m.trust = Math.max(0, m.trust - 5);
    Game.save(); UI.updateStatus();
    this.chat(key);
    UI.toast(`+${Game.fmt(sum)}`, 'green');
  },

  congratulate(key) {
    const m = this.initMember(key);
    if (!m.needCongrats) return;
    m.needCongrats = false;
    m.trust = Math.min(100, m.trust + 15);
    Game.addXP(20);
    Game.save(); UI.updateStatus();
    this.chat(key);
    UI.toast('Поздравил(а)! Доверие +15', 'green', 3200);
  },

  greetAll() {
    const [cm, cd] = this.getDateFromDay(Game.state.day);
    const isHoliday = (cm === 1 && cd === 1) || (cm === 3 && cd === 8) || (cm === 2 && cd === 23);
    if (!isHoliday) return UI.toast('Сегодня не праздник', 'info');
    FAMILY_MEMBERS.forEach(f => {
      const m = this.initMember(f.key);
      m.trust = Math.min(100, m.trust + 3);
    });
    Game.save(); UI.updateStatus();
    this.render();
    UI.toast('Поздравил(а) родных! Доверие +3 всем', 'green', 3200);
  },

  checkBirthdays() {
    const [cm, cd] = this.getDateFromDay(Game.state.day);
    FAMILY_MEMBERS.forEach(f => {
      const m = this.initMember(f.key);
      const isBD = f.birthDay[0] === cm && f.birthDay[1] === cd;
      if (isBD) {
        if (m.lastBirthdayDay !== Game.state.day) {
          m.lastBirthdayDay = Game.state.day;
          m.needCongrats = true;
          Game.pushNotif('🎂', `${f.name} — день рождения! Не забудь поздравить`);
        }
      } else if (m.needCongrats && m.lastBirthdayDay < Game.state.day - 1) {
        m.trust = Math.max(0, m.trust - 10);
        m.needCongrats = false;
      }
    });

    const p = Game.state.passport;
    if (p.created && p.birthDay[0] === cm && p.birthDay[1] === cd) {
      if (p.lastBirthdayAwarded !== Game.state.day) {
        p.lastBirthdayAwarded = Game.state.day;
        let total = 0;
        FAMILY_MEMBERS.forEach(f => {
          const gift = Math.round(f.gift * 0.5);
          Game.state.money += gift;
          total += gift;
        });
        if (total > 0) {
          Game.pushNotif('🎉', `С днём рождения тебя! Родные скинулись: ${Game.fmt(total)}`);
          UI.toast(`🎂 С днём рождения! +${Game.fmt(total)}`, 'gold', 4000);
        }
      }
    }
    Game.save();
  }
};
