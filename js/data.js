/* ====== Константы игры и реестр приложений ====== */

const Apps = {};

const CAR_DB = [
  { name:"ВАЗ 2107", price:80000, market:120000, icon:"🚗" },
  { name:"ВАЗ 2110", price:150000, market:220000, icon:"🚙" },
  { name:"Приора", price:250000, market:380000, icon:"🚘" },
  { name:"Лада Гранта", price:350000, market:500000, icon:"🚗" },
  { name:"Kia Rio", price:450000, market:650000, icon:"🚗" },
  { name:"Hyundai Solaris", price:500000, market:720000, icon:"🚙" },
  { name:"Nissan Qashqai", price:900000, market:1300000, icon:"🚙" },
  { name:"Toyota Camry", price:1200000, market:1700000, icon:"🚘" },
  { name:"BMW 5 серии", price:1800000, market:2500000, icon:"🏎" },
  { name:"Mercedes E-класс", price:2200000, market:3000000, icon:"🏎" },
  { name:"Audi A6", price:2000000, market:2800000, icon:"🏎" },
  { name:"Lexus RX", price:2500000, market:3400000, icon:"🚙" },
  { name:"Porsche Cayenne", price:3500000, market:4500000, icon:"🏎" },
  { name:"Tesla Model 3", price:3000000, market:4000000, icon:"⚡" },
  { name:"УАЗ Патриот", price:800000, market:1100000, icon:"🚙" },
  { name:"Lada Vesta", price:600000, market:850000, icon:"🚗" },
  { name:"Skoda Octavia", price:1100000, market:1600000, icon:"🚗" },
  { name:"VW Polo", price:550000, market:780000, icon:"🚗" },
  { name:"Renault Logan", price:400000, market:550000, icon:"🚗" },
  { name:"Ford Focus", price:700000, market:1000000, icon:"🚗" }
];

const DEFECTS_VISIBLE = [
  "Царапина на бампере", "Битый фонарь", "Потёртый салон",
  "Не работает кондиционер", "Мятая дверь"
];

const DEFECTS_HIDDEN = [
  "Шпаклёвка на крыле", "Скрученный пробег", "Течь масла",
  "Стучит подвеска", "Скрытая коррозия", "Заменённый кузов"
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

const NUMBERS_POOL = [
  { num:"А001АА", region:77, price:150000 },
  { num:"Е777КХ", region:77, price:500000 },
  { num:"О005ОК", region:99, price:200000 },
  { num:"Х555ХХ", region:77, price:350000 },
  { num:"АМР", region:77, price:800000 },
  { num:"ЕКХ", region:77, price:900000 },
  { num:"Т001ТТ", region:77, price:250000 },
  { num:"Р005ОК", region:99, price:300000 },
  { num:"123", region:716, price:100000 },
  { num:"911", region:99, price:180000 },
  { num:"228", region:99, price:90000 },
  { num:"112", region:77, price:70000 },
  { num:"102", region:77, price:60000 },
  { num:"314", region:99, price:50000 }
];

const APARTMENTS = [
  { name:"Студия", price:2000000, rent:15000, icon:"🏢" },
  { name:"1-комн.", price:3500000, rent:25000, icon:"🏢" },
  { name:"2-комн.", price:5500000, rent:40000, icon:"🏬" },
  { name:"3-комн.", price:8000000, rent:60000, icon:"🏬" },
  { name:"Загородный дом", price:15000000, rent:100000, icon:"🏡" }
];

const TOOLS_SHOP = [
  { id:'thickness', name:'Толщиномер', price:30000, icon:'📏', desc:'Показывает шпаклёвку и коррозию' },
  { id:'obd', name:'OBD-сканер', price:50000, icon:'🔌', desc:'Скрытые дефекты и пробег' },
  { id:'mileage', name:'Корректор пробега', price:80000, icon:'⏮', desc:'Задел на будущее' }
];
/* ===== Аукцион ===== */
const AUCTION_CARS = [
  { name:"Toyota Supra",    price:3000000, market:4500000, icon:"🏎" },
  { name:"Nissan Skyline",  price:2500000, market:4000000, icon:"🏎" },
  { name:"Honda NSX",       price:2800000, market:4200000, icon:"🏎" },
  { name:"Mazda RX-7",      price:1800000, market:2800000, icon:"🏎" },
  { name:"Mitsubishi Evo",  price:1500000, market:2200000, icon:"🚙" },
  { name:"Subaru WRX",      price:1400000, market:2100000, icon:"🚙" },
  { name:"BMW M3 E46",      price:2500000, market:3500000, icon:"🏎" },
  { name:"Mercedes AMG GT", price:5500000, market:8000000, icon:"🏎" }
];

const CONTAINER_CONTENTS = [
  { name:"Хлам",              value:0,       icon:"🗑" },
  { name:"Запчасти",          value:200000,  icon:"🔩" },
  { name:"Мотоцикл",          value:600000,  icon:"🏍" },
  { name:"BMW M5",            value:3500000, icon:"🏎" },
  { name:"Toyota LC",         value:4000000, icon:"🚙" },
  { name:"Porsche 911",       value:6000000, icon:"🏎" }
];

/* ===== Импорт ===== */
const IMPORT_COUNTRIES = [
  { id:'japan', name:'🇯🇵 Япония', deliveryDays:5, fee:0.15 },
  { id:'korea', name:'🇰🇷 Корея',  deliveryDays:4, fee:0.12 },
  { id:'china', name:'🇨🇳 Китай',  deliveryDays:7, fee:0.10 },
  { id:'uae',   name:'🇦🇪 ОАЭ',    deliveryDays:6, fee:0.20 }
];
