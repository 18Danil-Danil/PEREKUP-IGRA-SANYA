const Apps = {};

const CAR_DB = [
  { name:"Комета 2107",     price:70000,   market:110000,  icon:"🚗" },
  { name:"Комета 2110",     price:130000,  market:210000,  icon:"🚙" },
  { name:"Комета Спорт",    price:230000,  market:360000,  icon:"🚘" },
  { name:"Родник Грант",    price:420000,  market:580000,  icon:"🚗" },
  { name:"Kanto Rio",       price:580000,  market:850000,  icon:"🚗" },
  { name:"Hyon Sol",        price:620000,  market:920000,  icon:"🚙" },
  { name:"Niksha Kashkai",  price:1050000, market:1450000, icon:"🚙" },
  { name:"Toreta Kamri",    price:1400000, market:2000000, icon:"🚘" },
  { name:"BMR 5",           price:2100000, market:2900000, icon:"🏎" },
  { name:"Meridian E",      price:2400000, market:3300000, icon:"🏎" },
  { name:"Aurum A6",        price:2200000, market:3000000, icon:"🏎" },
  { name:"Luxor RX",        price:2700000, market:3700000, icon:"🚙" },
  { name:"Porscha Kaen",    price:4200000, market:5800000, icon:"🏎" },
  { name:"Volt Model 3",    price:3100000, market:4200000, icon:"⚡" },
  { name:"Гранит Патриот",  price:1050000, market:1450000, icon:"🚙" },
  { name:"Родник Веста",    price:850000,  market:1150000, icon:"🚗" },
  { name:"Shkala Oktav",    price:1300000, market:1750000, icon:"🚗" },
  { name:"Falkon Polo",     price:680000,  market:950000,  icon:"🚗" },
  { name:"Rena Logan",      price:490000,  market:700000,  icon:"🚗" },
  { name:"Fokus",           price:780000,  market:1050000, icon:"🚗" }
];

const DEFECTS_VISIBLE = [
  "Царапина на бампере", "Битый фонарь", "Потёртый салон",
  "Не работает кондиционер", "Мятая дверь", "Скрип тормозов"
];

const DEFECTS_HIDDEN = [
  "Шпаклёвка на крыле", "Скрученный пробег", "Течь масла",
  "Стучит подвеска", "Скрытая коррозия", "Заменённый кузов",
  "Убитая коробка", "Провёрнутые вкладыши"
];

const TUNING = [
  { name:"Спойлер", price:15000, bonus:25000 },
  { name:"Литые диски", price:30000, bonus:50000 },
  { name:"Магнитола", price:10000, bonus:15000 },
  { name:"Сигнализация", price:20000, bonus:30000 },
  { name:"Ксенон", price:12000, bonus:18000 },
  { name:"Тонировка", price:8000, bonus:12000 },
  { name:"Обвес", price:40000, bonus:60000 },
  { name:"Кожаный салон", price:50000, bonus:70000 },
  { name:"Спортсиденья", price:35000, bonus:50000 },
  { name:"Спортруль", price:18000, bonus:25000 },
  { name:"Прямоток", price:22000, bonus:32000 },
  { name:"Заниженная подвеска", price:45000, bonus:65000 },
  { name:"Карбон", price:28000, bonus:40000 },
  { name:"Панорама", price:60000, bonus:85000 },
  { name:"Магнитола Pro", price:25000, bonus:35000 },
  { name:"Турбина", price:80000, bonus:120000 },
  { name:"Спортвыхлоп", price:32000, bonus:45000 }
];

// Пул номеров — без региона (регион подмешивается рандомно при генерации)
const NUMBERS_POOL = [
  { num:"А001АА", price:150000 },
  { num:"Е777КХ", price:500000 },
  { num:"О005ОК", price:200000 },
  { num:"Х555ХХ", price:350000 },
  { num:"СТЛ",    price:800000 },
  { num:"ЛЮК",    price:900000 },
  { num:"Т001ТТ", price:250000 },
  { num:"Р005ОК", price:300000 },
  { num:"123",    price:100000 },
  { num:"911",    price:180000 },
  { num:"228",    price:90000 },
  { num:"112",    price:70000 },
  { num:"102",    price:60000 },
  { num:"314",    price:50000 }
];

// Доступные регионы для номеров
const NUMBERS_REGIONS = [77, 99, 97, 199, 777, 50, 78, 116, 750, 190];

const APARTMENTS = [
  { name:"Студия", price:3500000, rent:25000, icon:"🏢" },
  { name:"1-комн.", price:5500000, rent:40000, icon:"🏢" },
  { name:"2-комн.", price:8500000, rent:60000, icon:"🏬" },
  { name:"3-комн.", price:13000000, rent:90000, icon:"🏬" },
  { name:"Загородный дом", price:25000000, rent:150000, icon:"🏡" }
];

const TOOLS_SHOP = [
  { id:'thickness', name:'Толщиномер', price:30000, icon:'📏', desc:'Показывает шпаклёвку и коррозию' },
  { id:'obd', name:'OBD-сканер', price:50000, icon:'🔌', desc:'Скрытые дефекты и пробег' },
  { id:'mileage', name:'Корректор пробега', price:80000, icon:'⏮', desc:'Скрывает пробег при продаже' }
];

const AUCTION_CARS = [
  { name:"Toreta Supra",   price:2800000, market:4500000, icon:"🏎" },
  { name:"Niksha Skyline", price:2400000, market:4000000, icon:"🏎" },
  { name:"Hondo NSX",      price:3200000, market:5200000, icon:"🏎" },
  { name:"Mazuka RX-7",    price:1900000, market:3000000, icon:"🏎" },
  { name:"Mitsui Evo",     price:1600000, market:2500000, icon:"🚙" },
  { name:"Sabaru WRX",     price:1400000, market:2200000, icon:"🚙" },
  { name:"BMR M3",         price:2600000, market:4000000, icon:"🏎" },
  { name:"Meridian GT",    price:5800000, market:8500000, icon:"🏎" }
];

const CONTAINER_CONTENTS = [
  { name:"Хлам",       value:0,       icon:"🗑" },
  { name:"Запчасти",   value:300000,  icon:"🔩" },
  { name:"Мотоцикл",   value:700000,  icon:"🏍" },
  { name:"BMR M5",     value:3500000, icon:"🏎" },
  { name:"Toreta LC",  value:4200000, icon:"🚙" },
  { name:"Porscha 911",value:6500000, icon:"🏎" }
];

const IMPORT_COUNTRIES = [
  { id:'japan', name:'🇯🇵 Япония', deliveryDays:5, fee:0.15 },
  { id:'korea', name:'🇰🇷 Корея',  deliveryDays:4, fee:0.12 },
  { id:'china', name:'🇨🇳 Китай',  deliveryDays:7, fee:0.10 },
  { id:'uae',   name:'🇦🇪 ОАЭ',    deliveryDays:6, fee:0.20 }
];

const JOBS = [
  { id:'crane',     name:'🏗 Крановщик',    desc:'Тайминг · 5 попыток × 2 000 ₽',     income:10000 },
  { id:'wash',      name:'🧽 Мойка машин',  desc:'Кликер · 8 сек · 500 ₽/клик',         income:'~4000' },
  { id:'courier',   name:'🚚 Курьер',       desc:'5 заказов × 3 000 ₽',                 income:15000 },
  { id:'build',     name:'👷 Стройка',      desc:'10 кликов за 5 сек × 500 ₽',          income:5000 },
  { id:'truck',     name:'🚛 Дальнобойщик', desc:'3 дорожных события · выбор',          income:20000 }
];

const GOV_FEES = {
  passport: 0, license: 5000,
  pts: 1000, registration: 2000,
  taxRate: 0.13, taxPenaltyPerDay: 0.05
};

const FAMILY_MEMBERS = [
  { key:'mom',    name:'👩 Мама',      birthDay:[8,14],  gift:25000 },
  { key:'grandma',name:'👵 Бабушка',   birthDay:[3,22],  gift:15000 },
  { key:'grandpa',name:'👴 Дедушка',   birthDay:[11,5],  gift:20000 }
];

const FAMILY_EVENTS = {
  birthday: { mom:'🎂 У мамы день рождения!', grandma:'🎂 У бабушки день рождения!', grandpa:'🎂 У дедушки день рождения!' },
  newyear:  '🎄 С Новым годом!',
  march8:   '🌷 С 8 Марта!',
  feb23:    '🎖 С 23 Февраля!'
};

const FAMILY_REPLIES = {
  how:      ['Всё хорошо, а у тебя?', 'Потихоньку, на даче копаюсь', 'Скучаю по тебе!', 'Нормально, работаю'],
  advice:   ['Не бери без осмотра', 'Следи за налогами, а то ГосBuy оштрафует', 'Бери с умом, не гонись за дешёвкой', 'Ты бы машину купил, а не в казино играл'],
  brag:     ['Молодец! Горжусь!', 'Ого, серьёзная тачка!', 'Вот это по-нашему!'],
  hard:     ['Всё наладится, сынок', 'Ты сильный, справишься', 'Держись, я в тебя верю']
};

const BUSINESSES = [
  {
    id:'sto', name:'СТО «Мастер»', icon:'🔧',
    price:1500000, dailyIncome:35000,
    desc:'Своё СТО: ремонт своих машин −50%',
    perks:{ repairDiscount:0.5 },
    upgrades:[
      { level:2, cost:750000 },
      { level:3, cost:1500000 }
    ]
  },
  {
    id:'wash', name:'Автомойка', icon:'🧽',
    price:800000, dailyIncome:18000,
    desc:'Мойка машин: клиенты каждый день',
    perks:{},
    upgrades:[
      { level:2, cost:400000 },
      { level:3, cost:800000 }
    ]
  },
  {
    id:'salon', name:'Автосалон', icon:'🏪',
    price:4000000, dailyIncome:80000,
    desc:'Автосалон: продажи идут сами, но медленнее',
    perks:{ autoSell:true },
    upgrades:[
      { level:2, cost:2000000 },
      { level:3, cost:4000000 }
    ]
  }
];

const TRADE_ARGUMENTS = [
  { id:'lowball',  label:'Предложить низкую цену', risk:'high',  discountRange:[0.15, 0.30] },
  { id:'defect',   label:'Указать на дефект',       risk:'low',   discountRange:[0.05, 0.15] },
  { id:'away',     label:'«Слишком дорого»',        risk:'med',   discountRange:[0.03, 0.10] },
  { id:'cash',     label:'«Наличные сейчас»',       risk:'low',   discountRange:[0.02, 0.08] },
  { id:'leave',    label:'Развернуться и уйти',     risk:'high',  discountRange:[0.10, 0.20] }
];

const TRADE_REPLIES = {
  agree:   ['Хорошо, по рукам!', 'Убедил, беру', 'Ладно, забирай', 'Договорились'],
  refuse:  ['Нет, это слишком мало', 'Не пойдёт', 'За такую цену не отдам', 'Я подумаю ещё'],
  angry:   ['Ты что, с дуба рухнул?', 'Да ты наглеешь!', 'Не звони мне больше', 'Не трать моё время'],
  thinking:['Хм... подумаю...', 'Ну давай пополам', 'Скину, но чуть-чуть']
};

const RACE_TIERS = [
  { id:'street', name:'🌃 Ночные гонки',   buy:10000,  mult:2,  skill:0.55 },
  { id:'club',   name:'🏎 Клубные гонки',  buy:50000,  mult:2,  skill:0.50 },
  { id:'pro',    name:'🥇 Профи-гонки',    buy:200000, mult:2.5,skill:0.45 }
];

const REVIEW_PHRASES = {
  positive: ['Отличный продавец!', 'Машина как описана, рекомендую', 'Всё честно, доволен', 'Продавец адекватный, скинул немного'],
  negative: ['Скрыл дефект!', 'Обманул с пробегом', 'Не берите у него', 'Слил хлам за дорого']
};

// 🚨 generateNumbersMarket больше не объявляется глобально.
// Она теперь — метод Game.generateNumbersMarket() в game.js.
// Это устраняет проблему с порядком загрузки и устаревшим кешем data.js.
