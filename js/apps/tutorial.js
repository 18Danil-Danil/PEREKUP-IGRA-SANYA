Apps.tutorial = {
  step: 0,
  slides: [
    { icon:'🚗', title:'Добро пожаловать!',
      text:'Ты — перекуп. Стартовый капитал: 100 000 ₽.<br><br>Цель — купить дёшево, вложить в ремонт и тюнинг, продать дорого.' },
    { icon:'🪪', title:'Начни с ГосBuy',
      text:'Оформи права (5 000 ₽) и создай паспорт.<br><br>Без прав нельзя покупать и продавать машины. Паспорт нужен для ДР-подарков от родных.' },
    { icon:'🔍', title:'Осматривай машины',
      text:'Купи толщиномер и OBD-сканер в Магазине.<br><br>Без них скрытые дефекты (шпаклёвка, скрученный пробег, течь масла) останутся сюрпризом.' },
    { icon:'💬', title:'Торгуйся',
      text:'На AvtoBuy жми «Торговаться».<br><br>Высокий риск = больший дисконт, но продавец может разозлиться и отказаться. Низкий риск = маленькая, но стабильная скидка.' },
    { icon:'🔧', title:'Ремонт и тюнинг',
      text:'В Гараже чини дефекты и ставь тюнинг.<br><br>Каждая деталь повышает рыночную цену. 17 видов — от спойлера до турбины.' },
    { icon:'🚀', title:'Погнали!',
      text:'Работай, вкладывай, расширяйся.<br><br>Бизнес, недвижимость, таксопарк — всё для пассивного дохода. Следи за налогами и репутацией!' }
  ],

  render() {
    const s = document.getElementById('screen');
    const sl = this.slides[this.step] || this.slides[0];
    const isLast = this.step === this.slides.length - 1;
    s.innerHTML = `
      <div class="header"><h2>Как играть 📖</h2></div>
      <div class="card" style="text-align:center;padding:36px 20px;background:linear-gradient(135deg,rgba(124,92,255,.18),rgba(90,63,232,.18))">
        <div style="font-size:80px;margin-bottom:16px;line-height:1">${sl.icon}</div>
        <h3 style="font-size:20px;margin-bottom:14px">${sl.title}</h3>
        <div style="font-size:14px;color:#ccc;line-height:1.55">${sl.text}</div>
      </div>
      <div style="display:flex;gap:6px;margin:4px 0 12px">
        ${this.slides.map((_,i) =>
          `<div style="flex:1;height:4px;border-radius:2px;background:${i<=this.step?'#7c5cff':'rgba(150,150,230,.2)'};transition:background .3s"></div>`
        ).join('')}
      </div>
      <div class="btn-row">
        ${this.step > 0 ? `<button class="gray" onclick="Apps.tutorial.prev()">← Назад</button>` : ''}
        ${isLast
          ? `<button class="green" style="flex:1" onclick="Apps.tutorial.finish()">Погнали! 🚀</button>`
          : `<button class="green" style="flex:1" onclick="Apps.tutorial.next()">Далее →</button>`}
      </div>
    `;
  },

  next()   { if (this.step < this.slides.length - 1) { this.step++; this.render(); } },
  prev()   { if (this.step > 0) { this.step--; this.render(); } },
  finish() {
    Game.state.tutorialShown = true;
    Game.save();
    this.step = 0;
    UI.back();
    UI.toast('Удачи на дорогах! 🚗', 'gold', 3000);
  }
};
