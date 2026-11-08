// Резервный список регионов на случай, если data.js не содержит NUMBERS_REGIONS
// (например, если у пользователя закешировался старый data.js).
const NUMBERS_REGIONS_FALLBACK = [77, 99, 97, 199, 777, 50, 78, 116, 750, 190];

const Game = {
  SAVE_VERSION: '3.2',
  SAVE_KEY_PREFIX: 'perekup_slot_',
  ACTIVE_SLOT_KEY: 'perekup_active_slot',
  state: null,

  get activeSlot() {
    const v = parseInt(localStorage.getItem(this.ACTIVE_SLOT_KEY) || '1');
    return (v >= 1 && v <= 3) ? v : 1;
  },
  set activeSlot(n) {
    localStorage.setItem(this.ACTIVE_SLOT_KEY, String(n));
  },
  get SAVE_KEY() { return this.SAVE_KEY_PREFIX + this.activeSlot; },

  // ===== Утилиты, не зависящие от data.js =====
  _regions() {
    return (typeof NUMBERS_REGIONS !== 'undefined' && Array.isArray(NUMBERS_REGIONS))
      ? NUMBERS_REGIONS
      : NUMBERS_REGIONS_FALLBACK;
  },

  _numbersPool() {
    return (typeof NUMBERS_POOL !== 'undefined' && Array.isArray(NUMBERS_POOL)) ? NUMBERS_POOL : [];
  },

  // Генератор рынка номеров. Работает даже со старым data.js:
  // если элемент пула содержит region — используем его, иначе берём из _regions().
  generateNumbersMarket() {
    const pool = this._numbersPool();
    const regions = this._regions();
    const market = [];
    const used = new Set();
    pool.forEach(item => {
      const count = 1 + Math.floor(Math.random() * 2);
      let added = 0;
      let attempts = 0;
      while (added < count && attempts < 15) {
        attempts++;
        const region = (item && item.region) ? item.region : regions[Math.floor(Math.random() * regions.length)];
        const key = item.num + '_' + region;
        if (used.has(key)) continue;
        used.add(key);
        market.push({
          id: 'nm_' + key + '_' + Math.random().toString(36).slice(2, 6),
          num: item.num,
          region,
          price: Math.round(item.price * (0.7 + Math.random() * 0.6) / 1000) * 1000
        });
        added++;
      }
    });
    return market;
  },

  init() {
    let saved = null;
    try { saved = localStorage.getItem(this.SAVE_KEY); } catch(e){}
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.saveVersion === this.SAVE_VERSION) this.state = parsed;
        else this.newGame();
      } catch(e) { this.newGame(); }
    } else this.newGame();
    this.migrate();
    if (!this.state.listings || this.state.listings.length === 0) this.spawnListings(12);
    this.save();
    setInterval(() => this.tick(), 60000);
  },

  migrate() {
    const s = this.state;
    if (!s) return;
    if (!s.tools) s.tools = { thickness:false, obd:false, mileage:false };
    if (!s.numbersOwned) s.numbersOwned = [];
    if (!s.apartments) s.apartments = [];
    if (!s.taxiDrivers) s.taxiDrivers = [];
    if (!s.family) s.family = {};
    ['mom','grandma','grandpa'].forEach(k => {
      if (!s.family[k]) s.family[k] = { trust:50, lastGift:0, birthdaySeen:0, birthdayCard:0, needCongrats:false, lastBirthdayDay:0, lastVisit:0, chatLog:[] };
    });
    if (!s.stats) s.stats = { bought:0, sold:0, profit:0, tuningsInstalled:0, numbersSold:0 };
    if (s.stats.tuningsInstalled === undefined) s.stats.tuningsInstalled = 0;
    if (s.stats.numbersSold === undefined) s.stats.numbersSold = 0;
    if (!s.auctionLots) s.auctionLots = [];
    if (!s.auctionNextId) s.auctionNextId = 1;
    if (!s.visa) s.visa = false;
    if (!s.imports) s.imports = [];
    if (s.casinoBet === undefined) s.casinoBet = 1000;
    if (s.lastWorkDay === undefined) s.lastWorkDay = 0;
    if (!s.jobsDoneToday) s.jobsDoneToday = [];
    if (s.taxDebt === undefined) s.taxDebt = 0;
    if (s.lastTaxDay === undefined) s.lastTaxDay = 0;
    if (!s.passport) s.passport = { firstName:'Иван', lastName:'Петров', gender:'m', birthDay:[5,15], created:false };
    if (s.hasLicense === undefined) s.hasLicense = false;
    if (!s.fines) s.fines = [];
    if (!s.registry) s.registry = [];
    // v3.2
    if (!s.myListings) s.myListings = [];
    if (!s.reviews) s.reviews = [];
    if (!s.lawsuits) s.lawsuits = [];
    if (!s.businesses) s.businesses = { sto:null, wash:null, salon:null };
    if (!s.pendingBuyers) s.pendingBuyers = [];
    if (s.driveAceBest === undefined) s.driveAceBest = 0;
    if (s.racesWon === undefined) s.racesWon = 0;
    if (s.racesLost === undefined) s.racesLost = 0;
    if (s.reputation === undefined) s.reputation = 5;
    if (s.activeTrade === undefined) s.activeTrade = null;
    // v3.3
    if (!s.notifications) s.notifications = [];
    if (s.tutorialShown === undefined) s.tutorialShown = false;
    // v3.4
    if (!s.unlockedAchievements) s.unlockedAchievements = [];
    // v3.5 — рынок номеров и уровни бизнесов
    if (!s.numbersMarket) s.numbersMarket = this.generateNumbersMarket();
    ['sto','wash','salon'].forEach(id => {
      const b = s.businesses && s.businesses[id];
      if (b && b.level === undefined) {
        s.businesses[id] = { level: 1 };
      }
    });
    this.save();
  },

  newGame() {
    this.state = {
      saveVersion: this.SAVE_VERSION,
      money:100000, day:1, hour:12, level:1, xp:0, reputation:5,
      garage:[], listings:[], nextId:1, debt:0,
      tools:{thickness:false, obd:false, mileage:false},
      numbersOwned:[], numbersMarket: this.generateNumbersMarket(),
      apartments:[], taxiDrivers:[],
      auctionLots:[], auctionNextId:1, visa:false, imports:[],
      casinoBet: 1000, lastWorkDay: 0, jobsDoneToday: [],
      taxDebt: 0, lastTaxDay: 0,
      passport: { firstName:'Иван', lastName:'Петров', gender:'m', birthDay:[5,15], created:false },
      hasLicense: false, fines: [], registry: [],
      myListings: [], reviews: [], lawsuits: [],
      businesses: { sto:null, wash:null, salon:null },
      pendingBuyers: [],
      driveAceBest: 0, racesWon: 0, racesLost: 0,
      activeTrade: null,
      notifications: [],
      tutorialShown: false,
      unlockedAchievements: [],
      family:{
        mom:     { trust:50, lastGift:0, birthdaySeen:0, birthdayCard:0, needCongrats:false, lastBirthdayDay:0, lastVisit:0, chatLog:[] },
        grandma: { trust:50, lastGift:0, birthdaySeen:0, birthdayCard:0, needCongrats:false, lastBirthdayDay:0, lastVisit:0, chatLog:[] },
        grandpa: { trust:50, lastGift:0, birthdaySeen:0, birthdayCard:0, needCongrats:false, lastBirthdayDay:0, lastVisit:0, chatLog:[] }
      },
      stats:{ bought:0, sold:0, profit:0, tuningsInstalled:0, numbersSold:0 }
    };
    this.spawnListings(12);
    if (window.Apps && Apps.auction && Apps.auction.spawnLot) { Apps.auction.spawnLot(); Apps.auction.spawnLot(); }
    this.save();
  },

  spawnListings(n) {
    for (let i = 0; i < n; i++) {
      const id = this.state.nextId++;
      this.state.listings.push(generateListing(id));
    }
  },

  // Расчёт дохода бизнеса с учётом уровня
  calcBizIncome(id, b) {
    if (!b) return 0;
    const def = BUSINESSES.find(x => x.id === id);
    if (!def) return 0;
    const lvl = b.level || 1;
    const mult = [1, 1.5, 2][Math.min(lvl, 3) - 1] || 1;
    return Math.round(def.dailyIncome * mult);
  },

  // Рефилл рынка номеров — не больше 8 одновременно
  refillNumbersMarket() {
    if (!this.state.numbersMarket) this.state.numbersMarket = [];
    const market = this.state.numbersMarket;
    if (market.length >= 8) return;
    const pool = this._numbersPool();
    const regions = this._regions();
    if (!pool.length) return;
    const target = 8;
    let attempts = 0;
    while (market.length < target && attempts < 30) {
      attempts++;
      const item = pool[Math.floor(Math.random() * pool.length)];
      const region = (item && item.region) ? item.region : regions[Math.floor(Math.random() * regions.length)];
      if (this.state.numbersOwned.some(o => o.num === item.num && o.region === region)) continue;
      if (market.some(m => m.num === item.num && m.region === region)) continue;
      market.push({
        id: 'nm_' + item.num + '_' + region + '_' + this.state.nextId++,
        num: item.num,
        region,
        price: Math.round(item.price * (0.7 + Math.random() * 0.6) / 1000) * 1000
      });
    }
  },

  tick() {
    this.state.hour++;
    if (this.state.hour >= 24) {
      this.state.hour = 0; this.state.day++;
      this.spawnListings(2);
      this.state.jobsDoneToday = [];
      const rent = this.state.apartments.reduce((s,a)=>s+a.rent,0);
      const taxi = this.state.taxiDrivers.reduce((s,d)=>s+d.income,0);
      const biz = Object.entries(this.state.businesses)
        .filter(([,b])=>b)
        .reduce((sum, [id, b]) => sum + this.calcBizIncome(id, b), 0);
      this.state.money += rent + taxi + biz;
      this.state.taxiDrivers.forEach(d => {
        if (Math.random() < 0.15) {
          const car = this.state.garage.find(c => c.id === d.carId);
          if (car) car.defects.push("ДТП в такси");
        }
      });
      if (window.Apps && Apps.trade && Apps.trade.spawnBuyers) Apps.trade.spawnBuyers();
      if (this.state.day - this.state.lastTaxDay >= 7 && this.state.taxDebt > 0) {
        this.state.taxDebt = Math.round(this.state.taxDebt * (1 + GOV_FEES.taxPenaltyPerDay));
        this.state.lastTaxDay = this.state.day;
      }
      if (window.Apps && Apps.carImport && Apps.carImport.tick) Apps.carImport.tick();
      if (window.Apps && Apps.family && Apps.family.checkBirthdays) Apps.family.checkBirthdays();
      this.refillNumbersMarket();
    }
    if (window.Apps && Apps.auction && Apps.auction.tick) Apps.auction.tick();
    this.save();
    if (window.UI) UI.updateStatus();
  },

  save() {
    try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state)); } catch(e){}
    const el = document.getElementById('save-indicator');
    if (el) {
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    }
    if (window.Apps && Apps.achievements && Apps.achievements.checkNew) {
      try {
        const newly = Apps.achievements.checkNew();
        if (newly && newly.length > 0) {
          try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state)); } catch(e){}
          if (window.UI && UI.updateStatus) UI.updateStatus();
        }
      } catch(e) { console.warn('Achievements check error:', e); }
    }
  },

  pushNotif(icon, text) {
    if (!this.state.notifications) this.state.notifications = [];
    this.state.notifications.push({
      id: this.state.nextId++,
      icon, text,
      day: this.state.day,
      hour: this.state.hour,
      read: false
    });
    if (this.state.notifications.length > 100) this.state.notifications.shift();
    this.save();
    if (window.UI && UI.updateStatus) UI.updateStatus();
  },

  getSlotsInfo() {
    const info = [];
    for (let i = 1; i <= 3; i++) {
      let data = null;
      try { data = localStorage.getItem(this.SAVE_KEY_PREFIX + i); } catch(e){}
      if (data) {
        try {
          const p = JSON.parse(data);
          info.push({
            slot: i, empty:false,
            day: p.day, money: p.money, level: p.level,
            garageCount: (p.garage||[]).length,
            active: i === this.activeSlot
          });
        } catch(e) {
          info.push({ slot:i, empty:true, active: i === this.activeSlot });
        }
      } else {
        info.push({ slot:i, empty:true, active: i === this.activeSlot });
      }
    }
    return info;
  },

  loadSlot(n) {
    if (n < 1 || n > 3) return;
    const data = localStorage.getItem(this.SAVE_KEY_PREFIX + n);
    if (!data) { this.activeSlot = n; this.newGame(); return; }
    try {
      const parsed = JSON.parse(data);
      this.activeSlot = n;
      if (parsed.saveVersion !== this.SAVE_VERSION) { this.newGame(); return; }
      this.state = parsed;
      this.migrate();
      this.save();
    } catch(e) { if (window.UI) UI.toast('Ошибка загрузки слота', 'red'); }
  },

  deleteSlot(n) { localStorage.removeItem(this.SAVE_KEY_PREFIX + n); },

  saveToSlot(n) {
    if (n === this.activeSlot) { this.save(); return; }
    try { localStorage.setItem(this.SAVE_KEY_PREFIX + n, JSON.stringify(this.state)); } catch(e){}
  },

  fmt(n) { return Math.round(n).toLocaleString('ru-RU') + ' ₽'; },
  addXP(n) {
    this.state.xp += n;
    while (this.state.xp >= this.state.level * 100) {
      this.state.xp -= this.state.level * 100; this.state.level++;
    }
  },
  applyTax(profit) {
    if (profit <= 0) return 0;
    const tax = Math.round(profit * GOV_FEES.taxRate);
    this.state.taxDebt += tax;
    return tax;
  },
  addFine(reason, amount) {
    this.state.fines.push({ reason, amount, day: this.state.day, paid:false });
    this.state.taxDebt += amount;
  },
  addReview(fromName, text, rating) {
    this.state.reviews.push({ from: fromName, text, rating, day: this.state.day });
    if (this.state.reviews.length > 30) this.state.reviews.shift();
  },
  changeReputation(delta) {
    this.state.reputation = Math.max(0, Math.min(100, (this.state.reputation||0) + delta));
  }
};

// ===== Хелперы (глобальные функции) =====

function randomDefects() {
  const n = Math.floor(Math.random() * 3);
  const res = [];
  for (let i = 0; i < n; i++) res.push(DEFECTS_VISIBLE[Math.floor(Math.random()*DEFECTS_VISIBLE.length)]);
  return [...new Set(res)];
}

function randomHiddenDefects() {
  const n = Math.floor(Math.random() * 2);
  const res = [];
  for (let i = 0; i < n; i++) res.push(DEFECTS_HIDDEN[Math.floor(Math.random()*DEFECTS_HIDDEN.length)]);
  return [...new Set(res)];
}

function generateListing(id) {
  const base = CAR_DB[Math.floor(Math.random() * CAR_DB.length)];
  const price = Math.round(base.price * (0.6 + Math.random()*0.5) / 1000) * 1000;
  const hasNumber = Math.random() < 0.3;
  let number = null;
  if (hasNumber) {
    const pool = (typeof NUMBERS_POOL !== 'undefined' && Array.isArray(NUMBERS_POOL)) ? NUMBERS_POOL : [];
    const regions = (typeof NUMBERS_REGIONS !== 'undefined' && Array.isArray(NUMBERS_REGIONS))
      ? NUMBERS_REGIONS : NUMBERS_REGIONS_FALLBACK;
    if (pool.length) {
      const numBase = pool[Math.floor(Math.random()*pool.length)];
      const region = (numBase && numBase.region) ? numBase.region : regions[Math.floor(Math.random()*regions.length)];
      number = { num: numBase.num, region, price: numBase.price };
    }
  }
  return {
    id, name:base.name, icon:base.icon, price, market:base.market,
    defects: randomDefects(), hiddenDefects: randomHiddenDefects(), inspected:false,
    year: 2005 + Math.floor(Math.random()*18),
    mileage: 50000 + Math.floor(Math.random()*250000),
    seller: ["Алексей","Дмитрий","Сергей","Марина","Ольга"][Math.floor(Math.random()*5)],
    number, sold:false, registered:false
  };
}
