// НАЧАЛО ЧАСТИ 1
let market = localStorage.getItem("bybit_market") || "spot";
let side = "long";
let orderType = localStorage.getItem("bybit_orderType") || "limit";
let isGridMode = false;

// Состояние модуля Сетки Тейк-Профитов
let isTpGridMode = false;

function toggleTpGridMode() {
  isTpGridMode = !isTpGridMode;
  const btn = document.getElementById("btn-toggle-tp-grid");
  const singleInput = document.getElementById("single-tp-row-input");
  const gridInputs = document.getElementById("tp-grid-inputs");
  const singleRes = document.getElementById("res-single-tp-row");
  const gridRes = document.getElementById("res-grid-tp-block");

  // Сбрасываем и принудительно перезапускаем CSS-анимацию плавного появления
  if (singleRes) singleRes.classList.remove("fade-in-slide");
  if (gridRes) gridRes.classList.remove("fade-in-slide");

  if (isTpGridMode) {
    btn.innerText = "🎯 Одиночный TP";
    btn.classList.add("active");
    if (singleInput) singleInput.style.display = "none";
    if (gridInputs) {
      gridInputs.style.display = "block";
      gridInputs.classList.remove("fade-in-slide");
      void gridInputs.offsetWidth; // Хак для перезапуска анимации в DOM
      gridInputs.classList.add("fade-in-slide");
    }
    if (singleRes) singleRes.style.display = "none";
    if (gridRes) {
      gridRes.style.display = "block";
      void gridRes.offsetWidth;
      gridRes.classList.add("fade-in-slide");
    }

    // Синхронизируем Stop Loss в зеркальное поле сетки цели
    const slGrid = document.getElementById("sl-grid");
    if (slGrid) slGrid.value = document.getElementById("sl").value;

    // Автозаполнение сетки Тейков от текущей цены входа
    const entry = parseFloat(document.getElementById("entry").value) || 0;
    const sl = parseFloat(document.getElementById("sl").value) || 0;
    if (entry > 0 && sl > 0) {
      const dist = Math.abs(entry - sl);
      document.getElementById("tp1").value = formatNumber(
        side === "long" ? entry + dist * 2 : entry - dist * 2,
      );
      document.getElementById("tp2").value = formatNumber(
        side === "long" ? entry + dist * 3 : entry - dist * 3,
      );
      document.getElementById("tp3").value = formatNumber(
        side === "long" ? entry + dist * 4 : entry - dist * 4,
      );
    }
  } else {
    btn.innerText = "🎯 Сетка Тейков (3 TP)";
    btn.classList.remove("active");
    if (singleInput) {
      singleInput.style.display = "flex";
      singleInput.classList.remove("fade-in-slide");
      void singleInput.offsetWidth;
      singleInput.classList.add("fade-in-slide");
    }
    if (gridInputs) gridInputs.style.display = "none";
    if (singleRes) {
      singleRes.style.display = "flex";
      void singleRes.offsetWidth;
      singleRes.classList.add("fade-in-slide");
    }
    if (gridRes) gridRes.style.display = "none";

    // Возвращаем измененный в сетке Stop Loss обратно в базовое поле
    const slGrid = document.getElementById("sl-grid");
    if (slGrid) document.getElementById("sl").value = slGrid.value;
  }
  calculate();
}

function handleTpVolChange(index) {
  const vol = document.getElementById(`tp${index}-vol`).value;
  document.getElementById(`tp${index}-vol-txt`).innerText = vol + "%";

  // Меняем текст процентов прямо в строках копирования Bybit-панели результатов
  const label = document.getElementById(`lbl-tp${index}-pct`);
  if (label) label.innerText = vol + "%";

  calculate();
}

// Логика определения и установки темы оформления (Светлая / Темная)
let currentTheme = localStorage.getItem("bybit_theme") || "dark";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (typeof calculate === "function") {
    calculate();
  }
}

function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("bybit_theme", currentTheme);
  applyTheme(currentTheme);
}

applyTheme(currentTheme);

const pairsData = [
  { value: "BTC", price: 92000, round: 4 },
  { value: "ETH", price: 2400, round: 3 },
  { value: "SOL", price: 180, round: 2 },
  { value: "XRP", price: 2.4, round: 1 },
  { value: "PEPE", price: 0.000018, round: 0 },
  { value: "CUSTOM", price: 10, round: 2 },
];

function formatNumber(num, isCoinQty = false) {
  if (isCoinQty) return num.toString();
  return Number(num.toFixed(6)).toString();
}

function copyValue(elementId, btn) {
  const text = document.getElementById(elementId).innerText;
  if (text === "0.00" || text === "" || text === "0") return;

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add("show-tip", "copied");
    setTimeout(() => {
      btn.classList.remove("show-tip", "copied");
    }, 1000);
  });
}

function copyDirectText(elementId, btn) {
  const text = document.getElementById(elementId).innerText;
  if (text === "0" || text === "") return;

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add("show-tip", "copied");
    setTimeout(() => {
      btn.classList.remove("show-tip", "copied");
    }, 1000);
  });
}

function setOrderType(type) {
  orderType = type;
  localStorage.setItem("bybit_orderType", type);
  document
    .getElementById("order-limit")
    .classList.toggle("active", type === "limit");
  document
    .getElementById("order-market")
    .classList.toggle("active", type === "market");
  calculate();
}

// КОНЕЦ ЧАСТИ 1
// НАЧАЛО ЧАСТИ 2
function drawChart(e, s, t, v = true) {
  const c = document.getElementById("rrChart");
  if (!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  // Получаем динамические цвета темы для отрисовки холста
  const isLight =
    document.documentElement.getAttribute("data-theme") === "light";
  const axisColor = isLight ? "#e8eaed" : "#2b313a";
  const textColor = isLight ? "#5f6368" : "#848e9c";
  const greenColor = isLight ? "#137333" : "#0ecb81";
  const redColor = isLight ? "#c5221f" : "#f6465d";

  if (!v || !e || !s || !t || e <= 0 || s <= 0 || t <= 0) {
    ctx.fillStyle = axisColor;
    ctx.fillRect(0, 30, c.width, 10);
    ctx.fillStyle = textColor;
    ctx.font = "11px sans-serif";
    ctx.fillText("Ожидание параметров...", 10, 18);
    return;
  }
  const sd = Math.abs(e - s),
    td = Math.abs(t - e);
  const sp = ((sd / e) * 100).toFixed(2),
    tp = ((td / e) * 100).toFixed(2),
    rr = (td / sd).toFixed(1);
  const w = c.width,
    sw = (sd / (sd + td)) * w,
    tw = (td / (sd + td)) * w;
  if (side === "long") {
    ctx.fillStyle = isLight
      ? "rgba(197, 34, 31, 0.15)"
      : "rgba(246, 70, 93, 0.25)";
    ctx.fillRect(0, 30, sw, 12);
    ctx.fillStyle = isLight
      ? "rgba(19, 115, 51, 0.15)"
      : "rgba(14, 203, 129, 0.25)";
    ctx.fillRect(sw, 30, tw, 12);
    ctx.fillStyle = isLight ? "#1a73e8" : "#f7a600";
    ctx.fillRect(sw - 1, 20, 2, 32);
    ctx.fillStyle = isLight ? "#c5221f" : "#ff6b7e";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`SL: -${sp}%`, 5, 18);
    ctx.fillStyle = isLight ? "#137333" : "#26e096";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`TP: +${tp}%`, w - 5, 18);
  } else {
    ctx.fillStyle = isLight
      ? "rgba(19, 115, 51, 0.15)"
      : "rgba(14, 203, 129, 0.25)";
    ctx.fillRect(0, 30, tw, 12);
    ctx.fillStyle = isLight
      ? "rgba(197, 34, 31, 0.15)"
      : "rgba(246, 70, 93, 0.25)";
    ctx.fillRect(tw, 30, sw, 12);
    ctx.fillStyle = isLight ? "#1a73e8" : "#f7a600";
    ctx.fillRect(tw - 1, 20, 2, 32);
    ctx.fillStyle = isLight ? "#137333" : "#26e096";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(`TP: +${tp}%`, 5, 18);
    ctx.fillStyle = isLight ? "#c5221f" : "#ff6b7e";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`SL: -${sp}%`, w - 5, 18);
  }
  ctx.fillStyle = rr >= 2 ? greenColor : redColor;
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`R:R = 1 : ${rr} ${rr >= 3 ? "🔥" : ""}`, w / 2, 60);
  ctx.textAlign = "left";
}
// КОНЕЦ ЧАСТИ 2
// НАЧАЛО ЧАСТИ 3
function updatePairsSelectDisplay() {
  const s = document.getElementById("pair");
  const sv = s.value || localStorage.getItem("bybit_pair") || "BTC";
  s.innerHTML = "";

  pairsData.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.value;
    o.setAttribute("data-price", p.price);
    o.setAttribute("data-round", p.round);
    o.innerText =
      market === "futures"
        ? p.value === "CUSTOM"
          ? "* Своя цена"
          : `${p.value}USDT`
        : p.value === "CUSTOM"
          ? "* Своя цена"
          : `${p.value}/USDT`;
    s.appendChild(o);
  });
  s.value = sv;
}

function handleEntryChange() {
  const eStr = document.getElementById("entry").value;
  if (eStr === "") {
    document.getElementById("sl").value = "";
    document.getElementById("sl-grid").value = "";
    document.getElementById("tp").value = "";
    document.getElementById("tp1").value = "";
    document.getElementById("tp2").value = "";
    document.getElementById("tp3").value = "";
    clearResults();
    drawChart(0, 0, 0, false);
    return;
  }
  const e = parseFloat(eStr) || 0;
  if (e <= 0) return;

  // Рассчитываем Стоп-Лосс для обоих инпутов (базовый и зеркало в сетке)
  const slVal = side === "long" ? e * 0.98 : e * 1.02;
  document.getElementById("sl").value = formatNumber(slVal);
  document.getElementById("sl-grid").value = formatNumber(slVal);

  // Рассчитываем базовый Тейк-Профит (пресет 1:3)
  const d = Math.abs(e - slVal);
  const tpV = side === "long" ? e + d * 3 : e - d * 3;
  document.getElementById("tp").value = formatNumber(tpV);

  // ОДНОВРЕМЕННО ОБНОВЛЯЕМ ВСЮ СЕТКУ ТЕЙКОВ под новое направление/цену
  document.getElementById("tp1").value = formatNumber(
    side === "long" ? e + d * 2 : e - d * 2,
  );
  document.getElementById("tp2").value = formatNumber(
    side === "long" ? e + d * 3 : e - d * 3,
  );
  document.getElementById("tp3").value = formatNumber(
    side === "long" ? e + d * 4 : e - d * 4,
  );

  calculate();
}

function handlePairChange() {
  const s = document.getElementById("pair");
  localStorage.setItem("bybit_pair", s.value);
  document.getElementById("coin-label").innerText = s.value;

  if (s.value !== "CUSTOM") {
    const sel = s.options[s.selectedIndex];
    document.getElementById("entry").value = parseFloat(
      sel.getAttribute("data-price"),
    );
    handleEntryChange();
  } else {
    document.getElementById("entry").value = "";
    handleEntryChange();
  }
}

function setMarket(m) {
  market = m;
  localStorage.setItem("bybit_market", m);

  if (m === "spot") {
    side = "long";
  }

  document.getElementById("tab-spot").classList.toggle("active", m === "spot");
  document
    .getElementById("tab-futures")
    .classList.toggle("active", m === "futures");

  document.getElementById("side-selector").style.display =
    m === "spot" ? "none" : "flex";
  document.getElementById("leverage-row").style.display =
    m === "spot" ? "none" : "flex";
  document.getElementById("liq-row").style.display =
    m === "spot" ? "none" : "flex";

  if (document.getElementById("order-type-row")) {
    document.getElementById("order-type-row").style.display =
      m === "spot" ? "none" : "block";
  }

  updatePairsSelectDisplay();

  // Тотальный принудительный пересчет базовых полей и полей сетки при прыжках по вкладкам
  const e = parseFloat(document.getElementById("entry").value) || 0;
  if (e > 0) {
    const slVal = side === "long" ? e * 0.98 : e * 1.02;
    const d = Math.abs(e - slVal);
    const tpVal = side === "long" ? e + d * 3 : e - d * 3;

    document.getElementById("sl").value = formatNumber(slVal);
    document.getElementById("sl-grid").value = formatNumber(slVal);
    document.getElementById("tp").value = formatNumber(tpVal);

    // Перезаписываем сетку, чтобы фьючерсные остатки шорта на споте не вызывали ошибку валидации
    document.getElementById("tp1").value = formatNumber(
      side === "long" ? e + d * 2 : e - d * 2,
    );
    document.getElementById("tp2").value = formatNumber(
      side === "long" ? e + d * 3 : e - d * 3,
    );
    document.getElementById("tp3").value = formatNumber(
      side === "long" ? e + d * 4 : e - d * 4,
    );
  }

  calculate();
}

function setSide(s) {
  side = s;
  document.getElementById("btn-long").classList.toggle("active", s === "long");
  document
    .getElementById("btn-short")
    .classList.toggle("active", s === "short");
  handleEntryChange();
}

function setRisk(r) {
  const riskInput = document.getElementById("risk-pct");
  riskInput.value = r;
  calculate();
}

function applyRR(f) {
  const e = parseFloat(document.getElementById("entry").value);
  if (isNaN(e) || e <= 0) return;
  const sl =
    parseFloat(document.getElementById("sl").value) ||
    (side === "long" ? e * 0.98 : e * 1.02);
  const d = Math.abs(e - sl);
  const tpV = side === "long" ? e + d * f : e - d * f;
  document.getElementById("tp").value = formatNumber(tpV);

  // Принудительно выставляем сетку пропорционально выбранному шагу R:R
  document.getElementById("tp1").value = formatNumber(
    side === "long" ? e + d * (f - 1) : e - d * (f - 1),
  );
  document.getElementById("tp2").value = formatNumber(
    side === "long" ? e + d * f : e - d * f,
  );
  document.getElementById("tp3").value = formatNumber(
    side === "long" ? e + d * (f + 1) : e - d * (f + 1),
  );

  calculate();
}

function clearResults() {
  document.getElementById("res-qty").innerText = "0.00";
  document.getElementById("res-cost-val").innerText = "0.00";
  document.getElementById("res-lev").innerText = "1x";
  document.getElementById("res-sl-val").innerText = "0.00";
  document.getElementById("res-tp-val").innerText = "0.00";
  document.getElementById("res-liq").innerText = "0.00";
  document.getElementById("res-loss").innerText = "0.00 USDT";
  document.getElementById("res-profit").innerText = "0.00 USDT";
  if (document.getElementById("copy-block"))
    document.getElementById("copy-block").classList.remove("blocked");
}

function syncActiveButtonsState() {
  const riskInput = document.getElementById("risk-pct");
  if (riskInput) {
    const currentRisk = parseFloat(riskInput.value);
    const container = document.getElementById("group-risk");
    if (container) {
      container.querySelectorAll(".quick-btn").forEach((btn) => {
        btn.classList.toggle(
          "active",
          parseFloat(btn.innerText) === currentRisk,
        );
      });
    }
  }

  const e = parseFloat(document.getElementById("entry").value);
  const sl = parseFloat(document.getElementById("sl").value);
  const tp = parseFloat(document.getElementById("tp").value);

  if (!isNaN(e) && !isNaN(sl) && !isNaN(tp) && e > 0) {
    const targetDist = Math.abs(e - sl);
    if (targetDist > 0) {
      const currentRR = parseFloat((Math.abs(tp - e) / targetDist).toFixed(1));
      document.querySelectorAll(".quick-risk").forEach((group) => {
        if (!group.closest("#group-risk")) {
          group.querySelectorAll(".quick-btn").forEach((btn) => {
            const btnVal = parseFloat(btn.innerText.split(":").pop()) || 0;
            btn.classList.toggle("active", Math.abs(btnVal - currentRR) <= 0.1);
          });
        }
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  syncActiveButtonsState();

  const riskInput = document.getElementById("risk-pct");
  if (riskInput) {
    riskInput.addEventListener("input", syncActiveButtonsState);
  }

  const tpInput = document.getElementById("tp");
  if (tpInput) {
    tpInput.addEventListener("input", syncActiveButtonsState);
  }
});
// КОНЕЦ ЧАСТИ 3
// НАЧАЛО ЧАСТИ 4
function calculate() {
  document
    .querySelectorAll(".has-error")
    .forEach((el) => el.classList.remove("has-error"));

  const balance = parseFloat(document.getElementById("balance").value);
  const entryStr = document.getElementById("entry").value;

  // Динамически берем Stop Loss из активного в данный момент поля
  const slStr = isTpGridMode
    ? document.getElementById("sl-grid").value
    : document.getElementById("sl").value;

  // Синхронизируем базовые инпуты, чтобы в стейте всегда были актуальные цифры
  if (isTpGridMode) document.getElementById("sl").value = slStr;
  else document.getElementById("sl-grid").value = slStr;

  const tpStr = document.getElementById("tp").value;
  const riskPct = parseFloat(document.getElementById("risk-pct").value);
  const select = document.getElementById("pair");
  const tip = document.getElementById("tip-text");
  const copyBlock = document.getElementById("copy-block");

  // Считываем значения из полей сетки Тейк-Профитов
  const tp1Str = document.getElementById("tp1").value;
  const tp2Str = document.getElementById("tp2").value;
  const tp3Str = document.getElementById("tp3").value;

  // Проверяем пустоту целей в зависимости от режима выхода
  const isTpEmpty = isTpGridMode
    ? tp1Str === "" || tp2Str === "" || tp3Str === ""
    : tpStr === "";

  if (
    entryStr === "" ||
    slStr === "" ||
    isTpEmpty ||
    isNaN(balance) ||
    isNaN(riskPct)
  ) {
    clearResults();
    drawChart(0, 0, 0, false);
    if (tip) {
      tip.className = "status-waiting";
      tip.innerHTML = `⏳ <span><b>Ожидание:</b> Заполните пустые поля ввода котировок для запуска риск-менеджера.</span>`;
    }
    return;
  }

  const entry = parseFloat(entryStr);
  const sl = parseFloat(slStr);

  // ВЫЧИСЛЕНИЕ СРЕДНЕВЗВЕШЕННОГО ТЕЙК-ПРОФИТА
  let tp = 0;
  let v1_vol = parseInt(document.getElementById("tp1-vol").value) || 0;
  let v2_vol = parseInt(document.getElementById("tp2-vol").value) || 0;
  let v3_vol = parseInt(document.getElementById("tp3-vol").value) || 0;
  let totalTpVol = v1_vol + v2_vol + v3_vol;

  if (isTpGridMode) {
    const tp1 = parseFloat(tp1Str);
    const tp2 = parseFloat(tp2Str);
    const tp3 = parseFloat(tp3Str);
    if (totalTpVol > 0) {
      // Формула средней цены выхода: (Цена1 * Объем1 + Цена2 * Объем2 + ...) / Общий Объем
      tp = (tp1 * v1_vol + tp2 * v2_vol + tp3 * v3_vol) / totalTpVol;
    } else {
      tp = tp1;
    }
  } else {
    tp = parseFloat(tpStr);
  }

  let errorMsg = "";
  if (balance <= 0) {
    errorMsg = "Баланс должен быть больше 0";
    document.getElementById("group-balance").classList.add("has-error");
  } else if (isTpGridMode && totalTpVol !== 100) {
    // Жесткий блок: если трейдер распределил больше или меньше 100% объема позиции
    errorMsg = `Сумма объемов Тейк-Профитов должна быть строго 100%! Сейчас: ${totalTpVol}%`;
    const alertLabel = document.getElementById("tp-vol-alert");
    if (alertLabel) alertLabel.className = "tp-vol-alert-error";
  } else if (entry <= 0) {
    errorMsg = "Цена входа должна быть больше 0";
    document.getElementById("group-entry").classList.add("has-error");
  } else if (sl <= 0) {
    errorMsg = "Цена Стоп-Лосса должна быть больше 0";
    if (isTpGridMode)
      document
        .getElementById("sl-grid")
        .parentElement.classList.add("has-error");
    else document.getElementById("group-sl").classList.add("has-error");
  } else if (
    isTpGridMode &&
    (parseFloat(tp1Str) <= 0 ||
      parseFloat(tp2Str) <= 0 ||
      parseFloat(tp3Str) <= 0)
  ) {
    errorMsg = "Все цены Тейк-Профитов в сетке должны быть больше 0";
  } else if (!isTpGridMode && tp <= 0) {
    errorMsg = "Цена Тейк-Профита должна быть больше 0";
    document.getElementById("group-tp").classList.add("has-error");
  } else if (riskPct <= 0 || riskPct > 50) {
    errorMsg = "Риск должен быть от 0.1% до 50%";
    document.getElementById("group-risk").classList.add("has-error");
  } else if (side === "long" && sl >= entry) {
    errorMsg = "Для Long Стоп-Лосс должен быть строго НИЖЕ цены входа!";
    if (isTpGridMode)
      document
        .getElementById("sl-grid")
        .parentElement.classList.add("has-error");
    else document.getElementById("group-sl").classList.add("has-error");
  } else if (
    side === "long" &&
    (isTpGridMode
      ? parseFloat(tp1Str) <= entry ||
        parseFloat(tp2Str) <= entry ||
        parseFloat(tp3Str) <= entry
      : tp <= entry)
  ) {
    errorMsg = "Для Long ВСЕ Тейк-Профиты должны быть строго ВЫШЕ цены входа!";
    if (isTpGridMode) {
      document.getElementById("tp1").parentElement.classList.add("has-error");
      document.getElementById("tp2").parentElement.classList.add("has-error");
      document.getElementById("tp3").parentElement.classList.add("has-error");
    } else document.getElementById("group-tp").classList.add("has-error");
  } else if (side === "short" && sl <= entry) {
    errorMsg = "Для Short Стоп-Лосс должен быть строго ВЫШЕ цены входа!";
    if (isTpGridMode)
      document
        .getElementById("sl-grid")
        .parentElement.classList.add("has-error");
    else document.getElementById("group-sl").classList.add("has-error");
  } else if (
    side === "short" &&
    (isTpGridMode
      ? parseFloat(tp1Str) >= entry ||
        parseFloat(tp2Str) >= entry ||
        parseFloat(tp3Str) >= entry
      : tp >= entry)
  ) {
    errorMsg = "Для Short ВСЕ Тейк-Профиты должны быть строго НИЖЕ цены входа!";
    if (isTpGridMode) {
      document.getElementById("tp1").parentElement.classList.add("has-error");
      document.getElementById("tp2").parentElement.classList.add("has-error");
      document.getElementById("tp3").parentElement.classList.add("has-error");
    } else document.getElementById("group-tp").classList.add("has-error");
  }

  // Если всё ок, сбрасываем ошибку алерта ползунков
  if (errorMsg === "" && isTpGridMode) {
    const alertLabel = document.getElementById("tp-vol-alert");
    if (alertLabel) {
      alertLabel.className = "";
      document.getElementById("tp-vol-total").innerText = "100% (Идеально)";
    }
  }

  if (errorMsg !== "") {
    clearResults();
    drawChart(0, 0, 0, false);
    if (copyBlock) copyBlock.classList.add("blocked");
    if (tip) {
      tip.className = "status-error";
      tip.innerHTML = `⚠️ <span><b>Ошибка валидации:</b> ${errorMsg}</span>`;
    }
    return;
  }

  // Передаем рассчитанную средневзвешенную цену тейка в график для честного вывода R:R пропорции
  drawChart(entry, sl, tp, true);

  if (balance > 0) localStorage.setItem("bybit_balance", balance);
  if (riskPct > 0) localStorage.setItem("bybit_riskPct", riskPct);
  // КОНЕЦ ЧАСТИ 4
  // НАЧАЛО ЧАСТИ 5
  let feeRate =
    market === "futures" ? (orderType === "limit" ? 0.0002 : 0.00055) : 0.001;
  const maxLossMoney = balance * (riskPct / 100);
  let priceChangePct =
    side === "long" ? (entry - sl) / entry : (sl - entry) / entry;

  let positionVolume = maxLossMoney / (priceChangePct + feeRate * 2);
  const targetMargin = balance / 5;

  if (market === "spot" && positionVolume > balance) {
    positionVolume = balance;
  }

  const qty = positionVolume / entry;
  const roundDigits =
    parseInt(select.options[select.selectedIndex].getAttribute("data-round")) ||
    2;
  document.getElementById("res-qty").innerText = formatNumber(
    qty.toFixed(roundDigits),
    true,
  );

  let leverage = 1;
  let marginRequired = positionVolume;

  if (market === "futures") {
    if (positionVolume > targetMargin) {
      leverage = Math.ceil(positionVolume / targetMargin);
      if (leverage > 100) leverage = 100;
      marginRequired = positionVolume / leverage;
    } else {
      leverage = 1;
      marginRequired = positionVolume;
    }
    document.getElementById("res-lev").innerText = leverage + "x";

    let liqPrice =
      side === "long"
        ? entry * (1 - 1 / leverage + 0.004)
        : entry * (1 + 1 / leverage - 0.004);
    document.getElementById("res-liq").innerText = formatNumber(liqPrice);

    const isLiqDangerous = side === "long" ? sl <= liqPrice : sl >= liqPrice;
    if (isLiqDangerous) {
      if (copyBlock) copyBlock.classList.add("blocked");
      if (tip) {
        tip.className = "status-error";
        tip.innerHTML = `🛑 <span><b>КРИТИЧЕСКИЙ РИСК:</b> Выбранное плечо убьет маржу! Ликвидация (<b>${formatNumber(liqPrice)}</b>) наступит раньше, чем сработает Стоп-Лосс. Ордера заблокированы.</span>`;
      }
      return;
    }
  }

  if (copyBlock) copyBlock.classList.remove("blocked");
  const pairName =
    select.value === "CUSTOM"
      ? "Контракт"
      : market === "futures"
        ? `${select.value}USDT`
        : `${select.value}/USDT`;
  if (tip) {
    tip.className = "status-success";
    tip.innerHTML = `🛡️ <span><b>${pairName}:</b> Риск-менеджмент успешно пройден. Математическое преимущество на вашей стороне, ордера полностью готовы к безопасному переносу на Bybit!</span>`;
  }

  // Расчет математической сетки 3-х ведер усреднения входа
  let v1_p = entry;
  let v2_p =
    side === "long"
      ? entry - Math.abs(entry - sl) * 0.35
      : entry + Math.abs(entry - sl) * 0.35;
  let v3_p =
    side === "long"
      ? entry - Math.abs(entry - sl) * 0.7
      : entry + Math.abs(entry - sl) * 0.7;

  document.getElementById("v1-price").innerText = formatNumber(v1_p);
  document.getElementById("v2-price").innerText = formatNumber(v2_p);
  document.getElementById("v3-price").innerText = formatNumber(v3_p);
  document.getElementById("v1-qty").innerText = formatNumber(
    (qty * 0.2).toFixed(roundDigits),
    true,
  );
  document.getElementById("v2-qty").innerText = formatNumber(
    (qty * 0.3).toFixed(roundDigits),
    true,
  );
  document.getElementById("v3-qty").innerText = formatNumber(
    (qty * 0.5).toFixed(roundDigits),
    true,
  );

  const totalFee = positionVolume * feeRate * 2;
  const grossLoss = qty * Math.abs(entry - sl);
  const netLoss = grossLoss + totalFee;
  const grossProfit = qty * Math.abs(tp - entry);
  let netProfit =
    (side === "long" && tp > entry) || (side === "short" && tp < entry)
      ? grossProfit - totalFee
      : -grossProfit - totalFee;

  document.getElementById("res-cost-val").innerText = marginRequired.toFixed(2);
  document.getElementById("res-sl-val").innerText = formatNumber(sl);
  document.getElementById("res-loss").innerText =
    "-" + netLoss.toFixed(2) + " USDT";
  document.getElementById("res-profit").innerText =
    (netProfit >= 0 ? "+" : "") + netProfit.toFixed(2) + " USDT";

  // ДИНАМИЧЕСКИЙ ВЫВОД ЗНАЧЕНИЙ ДЛЯ СЕТКИ 3-Х ТЕЙК-ПРОФИТОВ НА BYBIT-ПАНЕЛЬ
  if (isTpGridMode) {
    // Выводим средневзвешенное значение в скрытое одиночное поле для совместимости
    document.getElementById("res-tp-val").innerText = formatNumber(tp);

    // Считываем текущие цены целей из левых инпутов
    const tp1_val = parseFloat(document.getElementById("tp1").value) || 0;
    const tp2_val = parseFloat(document.getElementById("tp2").value) || 0;
    const tp3_val = parseFloat(document.getElementById("tp3").value) || 0;

    // Записываем точные цены целей в правые блоки для копирования
    document.getElementById("res-tp1-val").innerText = formatNumber(tp1_val);
    document.getElementById("res-tp2-val").innerText = formatNumber(tp2_val);
    document.getElementById("res-tp3-val").innerText = formatNumber(tp3_val);

    // Рассчитываем и выводим точное количество монет под каждую цель на основе ползунков объема
    document.getElementById("res-tp1-qty").innerText = formatNumber(
      (qty * (v1_vol / 100)).toFixed(roundDigits),
      true,
    );
    document.getElementById("res-tp2-qty").innerText = formatNumber(
      (qty * (v2_vol / 100)).toFixed(roundDigits),
      true,
    );
    document.getElementById("res-tp3-qty").innerText = formatNumber(
      (qty * (v3_vol / 100)).toFixed(roundDigits),
      true,
    );
  } else {
    // В обычном режиме просто выводим цену одиночной цели целиком
    document.getElementById("res-tp-val").innerText = formatNumber(tp);
  }

  // Проверяем соответствие кнопок R:R пресетам при каждом цикле расчета
  if (typeof syncActiveButtonsState === "function") {
    syncActiveButtonsState();
  }
}

// Восстановление сохраненного состояния из памяти браузера при загрузке
if (localStorage.getItem("bybit_balance")) {
  const savedBalance = document.getElementById("balance");
  if (savedBalance) savedBalance.value = localStorage.getItem("bybit_balance");
}
if (localStorage.getItem("bybit_riskPct")) {
  const savedRisk = document.getElementById("risk-pct");
  if (savedRisk) savedRisk.value = localStorage.getItem("bybit_riskPct");
}

setMarket(market);
setOrderType(orderType);

// Синхронизируем состояние темы после инициализации интерфейса
applyTheme(currentTheme);
// КОНЕЦ ЧАСТИ 5
