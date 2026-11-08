Apps.jobs = {
  crane:   { active:false, paused:false, pos:0, dir:1, zoneStart:30, zoneEnd:70, shots:0, total:0, interval:null, lastFeedback:null, feedbackTimeout:null },
  wash:    { active:false, clicks:0, timeLeft:8, earnings:0, interval:null },
  courier: { active:false, deliveries:0 },
  build:   { active:false, clicks:0, timeLeft:5, earnings:0, interval:null },
  truck:   { active:false, step:0, total:0 },

  CRANE_WIDTHS: [40, 33, 26, 19, 13],
  CRANE_PERFECT_HALF: 2,
  CRANE_HIT: 2000,
  CRANE_PERFECT: 3500,

  canWork(jobId) {
    if (Game.state.lastWorkDay !== Game.state.day) return true;
    return !Game.state.jobsDoneToday.includes(jobId);
  },

  cleanup() {
    ['crane','wash','build'].forEach(k => {
      if (this[k].interval) { clearInterval(this[k].interval); this[k].interval = null; }
    });
    if (this.crane.feedbackTimeout) {
      clearTimeout(this.crane.feedbackTimeout);
      this.crane.feedbackTimeout = null;
    }
    this.crane.active = false;
    this.crane.paused = false;
    this.crane.lastFeedback = null;
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

  /* ===== Крановщик 2.0 ===== */
  renderCrane() {
    const c = this.crane;
    const center = (c.zoneStart + c.zoneEnd) / 2;
    const perfectHalf = this.CRANE_PERFECT_HALF;
    const fb = c.lastFeedback;

    return `
      <div style="position:relative;height:44px;background:#1a1a2e;border-radius:12px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(140,140,220,.2)">
        <div style="position:absolute;left:${c.zoneStart}%;width:${(c.zoneEnd-c.zoneStart).toFixed(2)}%;top:0;bottom:0;background:rgba(0,214,143,.35)"></div>
        <div style="position:absolute;left:${(center-perfectHalf).toFixed(2)}%;width:${(perfectHalf*2).toFixed(2)}%;top:0;bottom:0;background:rgba(255,205,60,.45)"></div>
        <div id="craneMarker" style="position:absolute;left:${c.pos}%;top:0;bottom:0;width:4px;background:#ffd93d;box-shadow:0 0 10px #ffd93d"></div>
      </div>
      <div style="font-size:12px;margin-bottom:10px;display:flex;justify-content:space-between">
        <span>Попытка ${c.shots+1}/5</span>
        <span>Заработано: <b style="color:#00d68f">${Game.fmt(c.total)}</b></span>
      </div>
      ${fb ? `
        <div style="text-align:center;padding:14px;border-radius:12px;
          background:${fb.type==='perfect'?'rgba(255,205,60,.15)':fb.type==='hit'?'rgba(0,229,160,.15)':'rgba(255,84,112,.15)'};
          border:1px solid ${fb.type==='perfect'?'rgba(255,205,60,.4)':fb.type==='hit'?'rgba(0,229,160,.4)':'rgba(255,84,112,.4)'};
          font-size:20px;font-weight:900;
          color:${fb.type==='perfect'?'#ffcd3c':fb.type==='hit'?'#00e5a0':'#ff5470'}">
          ${fb.type==='perfect' ? '🎯 В ЯБЛОЧКО! +'+Game.fmt(fb.earned) : ''}
          ${fb.type==='hit'     ? '✓ ТОЧНО! +'+Game.fmt(fb.earned) : ''}
          ${fb.type==='miss'    ? '✗ ПРОМАХ' : ''}
        </div>
      ` : `<button class="red" style="width:100%" onclick="Apps.jobs.stopCrane()">СТОП</button>`}
    `;
  },

  _randomZone(width) {
    const start = 5 + Math.random() * (90 - width);
    return { start, end: start + width };
  },

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
    const zone = this._randomZone(this.CRANE_WIDTHS[0]);
    this.crane = {
      active:true, paused:false, pos:0, dir:1,
      zoneStart:zone.start, zoneEnd:zone.end,
      shots:0, total:0, interval:null, lastFeedback:null, feedbackTimeout:null
    };
    this._animateCrane();
    this.render();
  },

  stopCrane() {
    const c = this.crane;
    if (!c.active || c.paused) return;
    clearInterval(c.interval);
    c.interval = null;
    c.paused = true;

    const hit = c.pos >= c.zoneStart && c.pos <= c.zoneEnd;
    const center = (c.zoneStart + c.zoneEnd) / 2;
    const perfect = hit && Math.abs(c.pos - center) <= this.CRANE_PERFECT_HALF;

    let earned = 0, type = 'miss';
    if (perfect) { earned = this.CRANE_PERFECT; type = 'perfect'; }
    else if (hit) { earned = this.CRANE_HIT; type = 'hit'; }
    if (earned > 0) c.total += earned;

    c.shots++;
    c.lastFeedback = { type, earned };
    this.render();

    c.feedbackTimeout = setTimeout(() => {
      c.feedbackTimeout = null;

      if (c.shots >= 5) {
        const total = c.total;
        c.active = false;
        c.paused = false;
        c.lastFeedback = null;
        this.finishJob('crane', total);
        this.render();
        UI.toast(`Смена окончена! +${Game.fmt(total)}`, 'green', 3200);
        return;
      }

      const width = this.CRANE_WIDTHS[c.shots] || 13;
      const zone = this._randomZone(width);
      c.zoneStart = zone.start;
      c.zoneEnd = zone.end;
      c.pos = 0;
      c.dir = 1;
      c.paused = false;
      c.lastFeedback = null;
      this.render();
      requestAnimationFrame(() => this._animateCrane());
    }, 900);
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
        this.finishJob('wash', earn);
        UI.toast(`Мойка окончена! +${Game.fmt(earn)}`, 'green', 3200);
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
      UI.toast(`Смена курьера окончена! +${Game.fmt(total)}`, 'green', 3200);
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
        UI.toast(`Смена окончена! +${Game.fmt(earn)}`, 'green', 3200);
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
      UI.toast(`Рейс завершён! +${Game.fmt(total)}`, 'green', 3200);
      this.render(); return;
    }
    this.render();
  }
};
