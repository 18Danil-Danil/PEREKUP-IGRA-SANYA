const Game = {
  SAVE_VERSION: '2.1',
  SAVE_KEY: 'perekup_save_v2',
  state: null,

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
    if (!s.family) s.family = {
      mom:{trust:50,lastGift:0}, grandma:{trust:50,lastGift:0}, grandpa:{trust:50,lastGift:0}
    };
    if (!s.stats) s.stats = { bought:0, sold:0, profit:0, tuningsInstalled:0, numbersSold:0 };
    if (s.stats.tuningsInstalled === undefined) s.stats.tuningsInstalled = 0;
    if (s.stats.numbersSold === undefined) s.stats.numbersSold = 0;
    if (!s.auctionLots) s.auctionLots = [];
    if (!s.auctionNextId) s.auctionNextId = 1;
    if (!s.visa) s.visa = false;
    if (!s.imports) s.imports = [];
    this.save();
  },

  newGame() {
    this.state = {
      saveVersion: this.SAVE_VERSION,
      money:300000, day:1, hour:12, level:1, xp:0, reputation:5,
      garage:[], listings:[], nextId:1, debt:0,
      tools:{thickness:false, obd:false, mileage:false},
      numbersOwned:[], apartments:[], taxiDrivers:[],
      auctionLots:[], auctionNextId:1, visa:false, imports:[],
      family:{
        mom:{trust:50,lastGift:0}, grandma:{trust:50,lastGift:0}, grandpa:{trust:50,lastGift:0}
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

  tick() {
    this.state.hour++;
    if (this.state.hour >= 24) {
      this.state.hour = 0; this.state.day++;
      this.spawnListings(2);
      const rent = this.state.apartments.reduce((s,a)=>s+a.rent,0);
      const taxi = this.state.taxiDrivers.reduce((s,d)=>s+d.income,0);
      this.state.money += rent + taxi;
      this.state.taxiDrivers.forEach(d => {
        if (Math.random() < 0.15) {
          const car = this.state.garage.find(c => c.id === d.carId);
          if (car) car.defects.push("ДТП в такси");
        }
      });
      if (window.Apps && Apps.import && Apps.import.tick) Apps.import.tick();
    }
    if (window.Apps && Apps.auction && Apps.auction.tick) Apps.auction.tick();
    this.save();
    if (window.UI) UI.updateStatus();
  },

  save() { try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state)); } catch(e){} },
  fmt(n) { return Math.round(n).toLocaleString('ru-RU') + ' ₽'; },
  addXP(n) {
    this.state.xp += n;
    while (this.state.xp >= this.state.level * 100) {
      this.state.xp -= this.state.level * 100; this.state.level++;
    }
  }
};

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
  const number = hasNumber ? NUMBERS_POOL[Math.floor(Math.random()*NUMBERS_POOL.length)] : null;
  return {
    id, name:base.name, icon:base.icon, price, market:base.market,
    defects: randomDefects(), hiddenDefects: randomHiddenDefects(), inspected:false,
    year: 2005 + Math.floor(Math.random()*18),
    mileage: 50000 + Math.floor(Math.random()*250000),
    seller: ["Алексей","Дмитрий","Сергей","Марина","Ольга"][Math.floor(Math.random()*5)],
    number, sold:false
  };
}
