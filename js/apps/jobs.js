Apps.jobs = {
  crane:   { active:false, pos:0, dir:1, zoneStart:35, zoneEnd:65, shots:0, total:0, interval:null },
  wash:    { active:false, clicks:0, timeLeft:8, earnings:0, interval:null },
  courier: { active:false, deliveries:0 },
  build:   { active:false, clicks:0, timeLeft:5, earnings:0, interval:null },
  truck:   { active:false, step:0, total:0 },

  canWork(jobId) {
    if (Game.state.lastWorkDay !== Game.state.day) return true;
    return !Game.state.jobsDoneToday.includes(jobId);
  },

  // Останавливает все активные смены (интервалы + сброс флага active).
  // Вызывается из UI при уходе с экрана работы.
  cleanup() {
    ['crane','wash','build'].forEach(k => {
      if (this[k].interval) { clearInterval(this[k].interval); this[k].interval = null; }
    });
    this.crane.active = false;
    this.wash.active = false;
    this.build.active = false;
    this.courier.active = false;
    this.truck.active = false;
  },

  render() {
    const s = document.getElementById('screen');
    s.innerHTML = `
      <div class="header"><span class="back" onclick="UI.back()">←</span><h2>Работа 💼</h2></div>

      <div class="card" style="background:linear-gradient(135deg,rgba(234,179,8,.18),rgba(120,53,15,.18))">
        <h3>Подработки</h3>
        <div style="font-size:13px;color:#888">Каждую работу можно сделать <b>1 раз в день</b>. Всего 5 работ — до 55 000 ₽ в день.</div>
      </div>

      <!-- Крановщик -->
      <div class="card">
        <h3>${JOBS[0].name}</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">${JOBS[0].desc}</div>
        ${this.crane.active ? this.renderCrane() : `
          <button class="green" onclick="Apps.jobs.startCrane()" ${!this.canWork('crane')?'disabled':''}>
            ${this.canWork('crane') ? 'На смену' : '✓ Сегодня отработано'}
          </button>`}
      </div>

      <!-- Мойка -->
      <div class="card">
        <h3>${JOBS[1].name}</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">${JOBS[1].desc}</div>
        ${this.wash.active ? this.renderWash() : `
          <button onclick="Apps.jobs.startWash()" ${!this.canWork('wash')?'disabled':''}>
            ${this.canWork('wash') ? 'Начать мойку' : '✓ Сегодня отработано'}
          </button>`}
      </div>

      <!-- Курьер -->
      <div class="card">
        <h3>${JOBS[2].name}</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">${JOBS[2].desc}</div>
        ${this.courier.active ? this.renderCourier() : `
          <button onclick="Apps.jobs.startCourier()" ${!this.canWork('courier')?'disabled':''}>
            ${this.canWork('courier') ? 'Начать смену' : '✓ Сегодня отработано'}
          </button>`}
      </div>

      <!-- Стройка -->
      <div class="card">
        <h3>${JOBS[3].name}</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">${JOBS[3].desc}</div>
        ${this.build.active ? this.renderBuild() : `
          <button onclick="Apps.jobs.startBuild()" ${!this.canWork('build')?'disabled':''}>
            ${this.canWork('build') ? 'На стройку' : '✓ Сегодня отработано'}
          </button>`}
      </div>

      <!-- Дальнобойщик -->
      <div class="card">
        <h3>${JOBS[4].name}</h3>
        <div style="font-size:12px;color:#888;margin-bottom:8px">${JOBS[4].desc}</div>
        ${this.truck.active ? this.renderTruck() : `
          <button onclick="Apps.jobs.startTruck()" ${!this.canWork('truck')?'disabled':''}>
            ${this.canWork('truck') ? 'В рейс' : '✓ Сегодня отработано'}
          </button>`}
      </div>
    `;
  },

  finishJob(jobId, amount) {
    Game.state.money += amount;
    Game.state.lastWorkDay = Game.state.day;
    if (!Game.state.jobsDoneToday.includes(jobId)) Game.state.jobsDoneToday.push(jobId);
    Game.addXP(5);
    Game.save(); UI.updateStatus();
  },

  /* ===== Крановщик ===== */
  renderCrane() {
    return `
      <div style="position:relative;height:44px;background:#1a1a2e;border-radius:12px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(140,140,220,.2)">
        <div style="position:absolute;left:${this.crane.zoneStart}%;width:${this.crane.zoneEnd-this.crane.zoneStart}%;top:0;bottom:0;background:rgba(0,214,143,.35)"></div>
        <div id="craneMarker" style="position:absolute;left:${this.crane.pos}%;top:0;bottom:0;width:4px;background:#ffd93d;box-shadow:0 0 10px #ffd93d"></div>
      </div>
      <div style="font-size:12px;margin-bottom:10px">
        Попытка ${this.crane.shots+1}/5 · Заработано: <b style="color:#00d68f">${Game.fmt(this.crane.total)}</b>
      </div>
      <button class="red" style="width:100%" onclick="Apps.jobs.stopCrane()">СТОП</button>
    `;
  },

  // Запускает движение маркера. Безопасно вызывать повторно —
  // старый интервал сначала гасится.
  _animateCrane() {
    if (this.crane.interval) clearInterval(this.crane.interval);
    this.crane.interval = setInterval(() => {
      this.crane.pos += this.crane.dir * 2;
      if (this.crane.pos >= 100) { this.crane.pos = 100; this.crane.dir = -1; }
      if (this.crane.pos <= 0)   { this.crane.pos = 0;   this.crane.dir = 1;  }
      const m = document.getElementById('craneMarker');
      if (m) m.style.left = this.crane.pos + '%';
    }, 18);
  },

  startCrane() {
    if (this.crane.active || !this.canWork('crane')) return;
    this.crane = { active:true, pos:0, dir:1, zoneStart:35, zoneEnd:65, shots:0, total:0, interval:null };
    this._animateCrane();
    this.render();
  },

  stopCrane() {
    if (!this.crane.active) return;
    clearInterval(this.crane.interval);
    this.crane.interval = null;

    const hit = this.crane.pos >= this.crane.zoneStart && this.crane.pos <= this.crane.zoneEnd;
    if (hit) this.crane.total += 2000;
    this.crane.shots++;

    if (this.crane.shots >= 5) {
      const total = this.crane.total;
      this.crane.active = false;
      this.finishJob('crane', total);
      alert(`Смена окончена! Заработано: ${Game.fmt(total)}`);
      this.render();
      return;
    }

    // Готовим новую зону и сбрасываем маркер в начало
    this.crane.zoneStart = 20 + Math.random() * 50;
    this.crane.zoneEnd = Math.min(95, this.crane.zoneStart + 15 + Math.random() * 15);
    this.crane.pos = 0;
    this.crane.dir = 1;

    this.render();
    // 🔑 Ключевой фикс: перезапускаем анимацию после перерисовки DOM.
    // requestAnimationFrame гарантирует, что новый #craneMarker уже в дереве.
    requestAnimationFrame(() => this._animateCrane());
  },

  /* ===== Мойка ===== */
  renderWash() {
    return `
      <div onclick="Apps.jobs.washClick()" style="text-align:center;padding:20px;background:#1a1a2e;border-radius:12px;margin-bottom:10px;border:1px solid rgba(0,214,143,.3);cursor:pointer;user-select:none">
        <div style="font-size:60px">🧽</div>
        <div id="washTime" style="font-size:26px;font-weight:800;color:#00d68f">${this.wash.timeLeft} с</div>
        <div id="washEarn" style="font-size:14px;color:#888">${Game.fmt(this.wash.earnings)}</div>
        <div style="font-size:11px;color:#666;margin-top:6px">Тапай сюда!</div>
      </div>
    `;
  },

  startWash() {
    if (this.wash.active || !this.canWork('wash')) return;
    this.wash = { active:true, clicks:0, timeLeft:8, earnings:0, interval:null };
    this.render();
    this.wash.interval = setInterval(() => {
      this.wash.timeLeft--;
      const t = document.getElementById('washTime');
      if (t) t.textContent = this.wash.timeLeft + ' с';
      if (this.wash.timeLeft <= 0) {
        clearInterval(this.wash.interval);
        this.wash.active = false;
        const earn = this.wash.earnings;
        const clicks = this.wash.clicks;
        this.finishJob('wash', earn);
        alert(`Мойка окончена! Заработано: ${Game.fmt(earn)}\nКликов: ${clicks}`);
        this.render();
      }
    }, 1000);
  },

  washClick() {
    if (!this.wash.active) return;
    this.wash.clicks++;
    this.wash.earnings += 500;
    const e = document.getElementById('washEarn');
    if (e) e.textContent = Game.fmt(this.wash.earnings);
  },

  /* ===== Курьер ===== */
  renderCourier() {
    return `
      <div style="text-align:center;padding:20px;background:#1a1a2e;border-radius:12px;margin-bottom:10px">
        <div style="font-size:60px">📦</div>
        <div style="font-size:16px">Доставок: ${this.courier.deliveries}/5</div>
        <div style="font-size:14px;color:#00d68f;margin-top:4px">${Game.fmt(this.courier.deliveries * 3000)}</div>
      </div>
      <button class="green" style="width:100%" onclick="Apps.jobs.deliver()">Доставить заказ</button>
    `;
  },

  startCourier() {
    if (this.courier.active || !this.canWork('courier')) return;
    this.courier = { active:true, deliveries:0 };
    this.render();
  },

  deliver() {
    if (!this.courier.active) return;
    this.courier.deliveries++;
    if (this.courier.deliveries >= 5) {
      const total = 15000;
      this.courier.active = false;
      this.finishJob('courier', total);
      alert(`Смена курьера окончена! +${Game.fmt(total)}`);
      this.render(); return;
    }
    this.render();
  },

  /* ===== Стройка ===== */
  renderBuild() {
    return `
      <div onclick="Apps.jobs.buildClick()" style="text-align:center;padding:20px;background:#1a1a2e;border-radius:12px;margin-bottom:10px;border:1px solid rgba(234,179,8,.3);cursor:pointer;user-select:none">
        <div style="font-size:60px">🧱</div>
        <div id="buildTime" style="font-size:26px;font-weight:800;color:#eab308">${this.build.timeLeft} с</div>
        <div id="buildEarn" style="font-size:14px;color:#888">${Game.fmt(this.build.earnings)}</div>
        <div style="font-size:11px;color:#666;margin-top:6px">Тапай быстрее!</div>
      </div>
    `;
  },

  startBuild() {
    if (this.build.active || !this.canWork('build')) return;
    this.build = { active:true, clicks:0, timeLeft:5, earnings:0, interval:null };
    this.render();
    this.build.interval = setInterval(() => {
      this.build.timeLeft--;
      const t = document.getElementById('buildTime');
      if (t) t.textContent = this.build.timeLeft + ' с';
      if (this.build.timeLeft <= 0) {
        clearInterval(this.build.interval);
        this.build.active = false;
        const earn = this.build.earnings;
        this.finishJob('build', earn);
        alert(`Смена окончена! Заработано: ${Game.fmt(earn)}\nКликов: ${this.build.clicks}`);
        this.render();
      }
    }, 1000);
  },

  buildClick() {
    if (!this.build.active) return;
    this.build.clicks++;
    this.build.earnings += 500;
    const e = document.getElementById('buildEarn');
    if (e) e.textContent = Game.fmt(this.build.earnings);
  },

  /* ===== Дальнобойщик ===== */
  renderTruck() {
    const events = [
      { text:'🚦 Пробка на трассе. Объехать по платной?', yes:{ label:'Объехать (3000)', gain:-3000 }, no:{ label:'Стоять', gain:0 } },
      { text:'⛽ Заправка. Заправиться до полного или минимум?', yes:{ label:'Полный (+2000, +10% скорость)', gain:2000 }, no:{ label:'Минимум', gain:1000 } },
      { text:'🚨 Гаишник тормозит. Дать взятку или по-честному?', yes:{ label:'Взятка (-5000)', gain:-5000 }, no:{ label:'По-честному (+5000 бонус)', gain:5000 } }
    ];
    const ev = events[this.truck.step];
    if (!ev) return '';
    return `
      <div style="padding:16px;background:#1a1a2e;border-radius:12px;margin-bottom:10px;border:1px solid rgba(234,179,8,.3)">
        <div style="font-size:44px;text-align:center">🚛</div>
        <div style="text-align:center;margin:8px 0;font-size:14px">${ev.text}</div>
        <div style="text-align:center;font-size:12px;color:#888">Шаг ${this.truck.step+1}/3 · Заработано: <b style="color:#00d68f">${Game.fmt(this.truck.total)}</b></div>
      </div>
      <div class="btn-row">
        <button class="green" onclick="Apps.jobs.truckChoice(true)">${ev.yes.label}</button>
        <button class="gray" onclick="Apps.jobs.truckChoice(false)">${ev.no.label}</button>
      </div>
    `;
  },

  startTruck() {
    if (this.truck.active || !this.canWork('truck')) return;
    this.truck = { active:true, step:0, total:0 };
    this.render();
  },

  truckChoice(yes) {
    if (!this.truck.active) return;
    const events = [
      { yes:-3000, no:0 },
      { yes:2000, no:1000 },
      { yes:-5000, no:5000 }
    ];
    const gain = yes ? events[this.truck.step].yes : events[this.truck.step].no;
    this.truck.total += gain;
    this.truck.step++;
    if (this.truck.step >= 3) {
      const total = 20000 + this.truck.total;
      this.truck.active = false;
      this.finishJob('truck', total);
      alert(`Рейс завершён! +${Game.fmt(total)}`);
      this.render(); return;
    }
    this.render();
  }
};
