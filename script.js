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

  if (singleRes) singleRes.classList.remove("fade-in-slide");
  if (gridRes) gridRes.classList.remove("fade-in-slide");

  if (isTpGridMode) {
    if (btn) btn.classList.add("active");
    if (singleInput) singleInput.style.display = "none";
    if (gridInputs) {
      gridInputs.style.display = "block";
      gridInputs.classList.remove("fade-in-slide");
      void gridInputs.offsetWidth;
      gridInputs.classList.add("fade-in-slide");
    }
    if (singleRes) singleRes.style.display = "none";
    if (gridRes) {
      gridRes.style.display = "block";
      void gridRes.offsetWidth;
      gridRes.classList.add("fade-in-slide");
    }

    const slGrid = document.getElementById("sl-grid");
    if (slGrid) slGrid.value = document.getElementById("sl").value;

    const entry = parseFloat(document.getElementById("entry").value) || 0;
    const sl = parseFloat(document.getElementById("sl").value) || 0;
    if (entry > 0 && sl > 0) {
      const select = document.getElementById("pair");
      const pRound = select
        ? parseInt(
            select.options[select.selectedIndex].getAttribute("data-pround"),
          ) || 0
        : 0;
      const dist = Math.abs(entry - sl);
      document.getElementById("tp1").value = formatNumber(
        side === "long" ? entry + dist * 2 : entry - dist * 2,
        false,
        pRound,
      );
      document.getElementById("tp2").value = formatNumber(
        side === "long" ? entry + dist * 3 : entry - dist * 3,
        false,
        pRound,
      );
      document.getElementById("tp3").value = formatNumber(
        side === "long" ? entry + dist * 4 : entry - dist * 4,
        false,
        pRound,
      );
    }
  } else {
    if (btn) btn.classList.remove("active");
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

    const slGrid = document.getElementById("sl-grid");
    if (slGrid) document.getElementById("sl").value = slGrid.value;
  }
  calculate();
}

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
  { value: "BTC", price: 92000, round: 4, priceRound: 0 },
  { value: "ETH", price: 2400, round: 3, priceRound: 0 },
  { value: "SOL", price: 180, round: 2, priceRound: 0 },
  { value: "XRP", price: 2.4, round: 1, priceRound: 4 },
  { value: "PEPE", price: 0.000018, round: 0, priceRound: 8 },
  { value: "CUSTOM", price: 10, round: 2, priceRound: 4 },
];

function formatNumber(num, isCoinQty = false, customDecimals = null) {
  if (isCoinQty) return num.toString();
  const decimals = customDecimals !== null ? customDecimals : 6;
  return Number(parseFloat(num).toFixed(decimals)).toString();
}

function copyValue(elementId, btn) {
  const text = document.getElementById(elementId).innerText;
  if (text === "0.00" || text === "" || text === "0") return;

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add("show-tip", "copied");
    // ФИКС ЗАДЕРЖКИ: Увеличено до 2500мс для комфортного контроля галочки
    setTimeout(() => {
      btn.classList.remove("show-tip", "copied");
    }, 2500);
  });
}

function copyDirectText(elementId, btn) {
  const text = document.getElementById(elementId).innerText;
  if (text === "0" || text === "") return;

  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add("show-tip", "copied");
    // ФИКС ЗАДЕРЖКИ: Увеличено до 2500мс для комфортного контроля галочки
    setTimeout(() => {
      btn.classList.remove("show-tip", "copied");
    }, 2500);
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

function toggleGridMode() {
  isGridMode = !isGridMode;
  const btn = document.getElementById("btn-toggle-grid");
  if (btn) btn.classList.toggle("active", isGridMode);

  document.getElementById("copy-block").style.display = isGridMode
    ? "none"
    : "block";
  document.getElementById("grid-copy-block").style.display = isGridMode
    ? "block"
    : "none";
  btn.innerText = isGridMode
    ? "📋 Вернуть один вход"
    : "📊 Разбить на сетку (3 ведра)";
  calculate();
}
// КОНЕЦ ЧАСТИ 1
// НАЧАЛО ЧАСТИ 2
function drawChart(e, s, t, v = true) {
  const c = document.getElementById("rrChart");
  if (!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const isLight =
    document.documentElement.getAttribute("data-theme") === "light";

  // Ультрасовременные финтех-компоненты палитры Bybit PRO
  const axisColor = isLight
    ? "rgba(0, 0, 0, 0.12)"
    : "rgba(255, 255, 255, 0.05)";
  const textColor = isLight ? "#5f6368" : "#848e9c";
  const greenColor = isLight ? "#00b574" : "#0ecb81";
  const redColor = isLight ? "#ff4d4d" : "#f6465d";
  const entryColor = isLight ? "#1a73e8" : "#f7a600";

  if (!v || !e || !s || !t || e <= 0 || s <= 0 || t <= 0) {
    ctx.fillStyle = textColor;
    ctx.font = "500 13px sans-serif";
    ctx.fillText("Ожидание параметров модели риска...", 14, 28);
    return;
  }

  // Расчет дельт и процентов
  const sd = Math.abs(e - s),
    td = Math.abs(t - e);
  const sp = ((sd / e) * 100).toFixed(1),
    tp = ((td / e) * 100).toFixed(1);

  const w = c.width,
    h = c.height,
    barH = 6,
    barY = 64;

  const sw = (sd / (sd + td)) * w,
    tw = (td / (sd + td)) * w;

  const select = document.getElementById("pair");
  const pRound = select
    ? parseInt(
        select.options[select.selectedIndex].getAttribute("data-pround"),
      ) || 0
    : 2;

  // Форматирование строк котировок без моноширинных пробелов
  const entryPriceText = Number(e.toFixed(pRound)).toLocaleString();
  const slPriceText = Number(s.toFixed(pRound)).toLocaleString();
  const tpPriceText = Number(t.toFixed(pRound)).toLocaleString();
  const slDeltaText = Number(sd.toFixed(pRound)).toLocaleString();
  const tpDeltaText = Number(td.toFixed(pRound)).toLocaleString();

  let entryX = side === "long" ? sw : tw;

  // ==========================================================================
  // СЛОЙ 1: ФОНОВЫЕ ЭЛЕМЕНТЫ И КООРДИНАТНЫЕ ОСИ (Рисуем в первую очередь)
  // ==========================================================================

  // Выразительный и четкий сквозной пунктир (на светлой теме плотнее и темнее)
  ctx.strokeStyle = isLight
    ? "rgba(26, 115, 232, 0.45)"
    : "rgba(247, 166, 0, 0.25)";
  ctx.lineWidth = 0.5;
  ctx.setLineDash([2, 3]); // Шаг пунктира: 2px точка, 3px пропуск
  ctx.beginPath();
  ctx.moveTo(entryX, 6);
  ctx.lineTo(entryX, 134);
  ctx.stroke();
  ctx.setLineDash([]); // Сразу сбрасываем пунктир, чтобы не испортить другие линии

  // 1. ОТРИСОВКА СКВОЗНОЙ ГРАФИЧЕСКОЙ ШКАЛЫ
  const gradRed = ctx.createLinearGradient(0, barY, w, barY);
  const gradGreen = ctx.createLinearGradient(0, barY, w, barY);

  if (side === "long") {
    gradRed.addColorStop(0, "transparent");
    gradRed.addColorStop(
      sw / w,
      isLight ? "rgba(255, 77, 77, 0.25)" : "rgba(246, 70, 93, 0.35)",
    );
    gradGreen.addColorStop(
      sw / w,
      isLight ? "rgba(0, 181, 116, 0.3)" : "rgba(14, 203, 129, 0.35)",
    );
    gradGreen.addColorStop(1, "transparent");

    ctx.fillStyle = gradRed;
    ctx.fillRect(0, barY, sw, barH);
    ctx.fillStyle = gradGreen;
    ctx.fillRect(sw, barY, tw, barH);
  } else {
    gradGreen.addColorStop(0, "transparent");
    gradGreen.addColorStop(
      tw / w,
      isLight ? "rgba(0, 181, 116, 0.3)" : "rgba(14, 203, 129, 0.35)",
    );
    gradRed.addColorStop(
      tw / w,
      isLight ? "rgba(255, 77, 77, 0.25)" : "rgba(246, 70, 93, 0.35)",
    );
    gradRed.addColorStop(1, "transparent");

    ctx.fillStyle = gradGreen;
    ctx.fillRect(0, barY, tw, barH);
    ctx.fillStyle = gradRed;
    ctx.fillRect(tw, barY, sw, barH);
  }

  // Яркий аппаратный маркер-точка на пересечении шкал
  ctx.shadowBlur = 4;
  ctx.shadowColor = entryColor;
  ctx.fillStyle = entryColor;
  ctx.beginPath();
  ctx.arc(entryX, barY + barH / 2, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Тонкие боковые засечки шкалы по краям
  ctx.strokeStyle = axisColor;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(1, barY - 6);
  ctx.lineTo(1, barY + barH + 6);
  ctx.moveTo(w - 1, barY - 6);
  ctx.lineTo(w - 1, barY + barH + 6);
  ctx.stroke();

  // ==========================================================================
  // СЛОЙ 2: ПЕРЕДНИЙ ПЛАН — КАРТОЧКИ ГЛАССМОРФИЗМА (Перекрывают фон)
  // ==========================================================================

  function drawGlassTag(type, price, subText, x, y, bgCol, textColor, align) {
    ctx.font = "bold 12.5px sans-serif";
    const w1 = ctx.measureText(price).width;
    ctx.font = "bold 10px sans-serif";
    const w2 = ctx.measureText(subText).width;

    const maxW = Math.max(w1, w2);
    const padH = 10;
    const boxW = maxW + padH * 2 + 14;
    const boxH = 30;

    let boxX = x;
    if (align === "center") boxX = x - boxW / 2;
    if (align === "right") boxX = x - boxW;

    // Контрастная теневая подложка для светлой темы и неоновая аура для темной
    ctx.shadowBlur = isLight ? 5 : 6;
    ctx.shadowColor = isLight ? "rgba(0, 0, 0, 0.08)" : bgCol;
    if (isLight) {
      ctx.shadowOffsetY = 2; // Легкое смещение тени вниз на светлом фоне для объема
    }

    ctx.beginPath();
    ctx.roundRect(boxX, y, boxW, boxH, 6);

    // Плотный задний фон карточек для светлой темы исключает прозрачное размытие
    ctx.fillStyle = isLight
      ? "rgba(255, 255, 255, 0.98)"
      : "rgba(22, 25, 30, 0.6)";
    ctx.strokeStyle = isLight
      ? "rgba(0, 0, 0, 0.12)"
      : "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // Сброс теней и смещений для отрисовки текста
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const iX = boxX + padH + 3;
    const iY = y + boxH / 2;
    ctx.fillStyle = textColor;

    if (type === "tp") {
      ctx.beginPath();
      ctx.moveTo(iX, iY - 3.5);
      ctx.lineTo(iX + 4, iY + 3.5);
      ctx.lineTo(iX - 4, iY + 3.5);
      ctx.closePath();
      ctx.fill();
    } else if (type === "sl") {
      ctx.beginPath();
      ctx.moveTo(iX, iY + 3.5);
      ctx.lineTo(iX + 4, iY - 3.5);
      ctx.lineTo(iX - 4, iY - 3.5);
      ctx.closePath();
      ctx.fill();
    } else if (type === "entry") {
      ctx.beginPath();
      ctx.moveTo(iX, iY - 3.5);
      ctx.lineTo(iX + 3.5, iY);
      ctx.lineTo(iX, iY + 3.5);
      ctx.lineTo(iX - 3.5, iY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.textAlign = "left";
    ctx.font = "bold 12.5px sans-serif";
    ctx.fillStyle = isLight ? "#1a1c1e" : "#ffffff";
    ctx.fillText(price, boxX + padH + 14, y + 13);

    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = textColor;
    ctx.fillText(subText, boxX + padH + 14, y + 25);

    return boxW;
  }

  const slBg = isLight ? "rgba(197, 34, 31, 0.05)" : "rgba(246, 70, 93, 0.12)";
  const slTxtColor = isLight ? "#c5221f" : "#ff6b7e";
  const tpBg = isLight ? "rgba(19, 115, 51, 0.05)" : "rgba(14, 203, 129, 0.12)";
  const tpTxtColor = isLight ? "#137333" : "#26e096";
  const entryBg = isLight
    ? "rgba(26, 115, 232, 0.05)"
    : "rgba(247, 166, 0, 0.14)";

  // ВЕРХНИЙ УРОВЕНЬ (Y = 10, По краям — 100% защита от наездов)
  if (side === "long") {
    drawGlassTag(
      "sl",
      slPriceText,
      `SL -${sp}%`,
      4,
      10,
      slBg,
      slTxtColor,
      "left",
    );
    drawGlassTag(
      "tp",
      tpPriceText,
      `TP +${tp}%`,
      w - 4,
      10,
      tpBg,
      tpTxtColor,
      "right",
    );
  } else {
    drawGlassTag(
      "tp",
      tpPriceText,
      `TP +${tp}%`,
      4,
      10,
      tpBg,
      tpTxtColor,
      "left",
    );
    drawGlassTag(
      "sl",
      slPriceText,
      `SL -${sp}%`,
      w - 4,
      10,
      slBg,
      slTxtColor,
      "right",
    );
  }

  // НИЖНИЙ УРОВЕНЬ (Y = 94, Свободный горизонтальный коридор для цены Входа)
  const targetDeltaText =
    side === "long" ? `+${tpDeltaText}$` : `-${slDeltaText}$`;
  const entrySubText = `Зазор: ${side === "long" ? `-${slDeltaText}$` : `+${tpDeltaText}$`}`;

  // Рендерим парящую плашку входа под шкалой
  const currentTagW = drawGlassTag(
    "entry",
    entryPriceText,
    entrySubText,
    entryX,
    94,
    entryBg,
    entryColor,
    "center",
  );

  // Смещение подписи чистой финансовой дельты
  let textLabelX = entryX + currentTagW / 2 + 14;
  let textLabelAlign = "left";

  if (entryX > w - 130) {
    textLabelX = entryX - currentTagW / 2 - 14;
    textLabelAlign = "right";
  }

  // Финансовая цель рендерится поверх пунктирной оси
  ctx.textAlign = textLabelAlign;
  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = side === "long" ? greenColor : redColor;

  // Создаем небольшую чистую подложку под текст цели, чтобы пунктир не просвечивал
  const targetText = `Цель: ${targetDeltaText}`;
  const textW = ctx.measureText(targetText).width;
  ctx.fillStyle = isLight
    ? "rgba(240, 242, 255, 0.95)"
    : "rgba(23, 25, 30, 0.95)"; // Фон под цвет body для идеального скрытия
  let bgX = textLabelAlign === "left" ? textLabelX - 4 : textLabelX - textW - 4;
  ctx.fillRect(bgX, 103, textW + 8, 14);

  // Выводим сам текст цели
  ctx.fillStyle = side === "long" ? greenColor : redColor;
  ctx.fillText(targetText, textLabelX, 113);
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
    o.setAttribute("data-pround", p.priceRound);
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
  const select = document.getElementById("pair");
  let pRound = 2;
  if (select && select.selectedIndex >= 0) {
    pRound = parseInt(
      select.options[select.selectedIndex].getAttribute("data-pround"),
    );
    if (isNaN(pRound)) pRound = 2;
  }

  const entryInput = document.getElementById("entry");
  let eStr = entryInput.value;
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

  let e = parseFloat(eStr) || 0;
  if (e <= 0) return;

  const roundedEntry = formatNumber(e, false, pRound);
  if (entryInput.value !== roundedEntry) {
    entryInput.value = roundedEntry;
    e = parseFloat(roundedEntry);
  }

  const slVal = side === "long" ? e * 0.98 : e * 1.02;
  document.getElementById("sl").value = formatNumber(slVal, false, pRound);
  document.getElementById("sl-grid").value = formatNumber(slVal, false, pRound);

  const d = Math.abs(e - slVal);
  const tpV = side === "long" ? e + d * 3 : e - d * 3;
  document.getElementById("tp").value = formatNumber(tpV, false, pRound);

  document.getElementById("tp1").value = formatNumber(
    side === "long" ? e + d * 2 : e - d * 2,
    false,
    pRound,
  );
  document.getElementById("tp2").value = formatNumber(
    side === "long" ? e + d * 3 : e - d * 3,
    false,
    pRound,
  );
  document.getElementById("tp3").value = formatNumber(
    side === "long" ? e + d * 4 : e - d * 4,
    false,
    pRound,
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

  // Фикс рассинхронизации: если фьючерсы — считываем реальный статус кнопок направления из DOM
  if (m === "spot") {
    side = "long";
  } else {
    const shortBtn = document.getElementById("btn-short");
    if (shortBtn && shortBtn.classList.contains("active")) {
      side = "short";
    } else {
      side = "long";
    }
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

  const s = document.getElementById("pair");
  const eStr = document.getElementById("entry").value;
  let e = parseFloat(eStr) || 0;

  if (e > 0 && s.selectedIndex >= 0) {
    const pRound = parseInt(
      s.options[s.selectedIndex].getAttribute("data-pround"),
    );
    const roundedEntry = formatNumber(e, false, isNaN(pRound) ? 2 : pRound);
    document.getElementById("entry").value = roundedEntry;
    e = parseFloat(roundedEntry);

    const slVal = side === "long" ? e * 0.98 : e * 1.02;
    const d = Math.abs(e - slVal);
    const tpVal = side === "long" ? e + d * 3 : e - d * 3;

    document.getElementById("sl").value = formatNumber(slVal, false, pRound);
    document.getElementById("sl-grid").value = formatNumber(
      slVal,
      false,
      pRound,
    );
    document.getElementById("tp").value = formatNumber(tpVal, false, pRound);

    document.getElementById("tp1").value = formatNumber(
      side === "long" ? e + d * 2 : e - d * 2,
      false,
      pRound,
    );
    document.getElementById("tp2").value = formatNumber(
      side === "long" ? e + d * 3 : e - d * 3,
      false,
      pRound,
    );
    document.getElementById("tp3").value = formatNumber(
      side === "long" ? e + d * 4 : e - d * 4,
      false,
      pRound,
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
  if (riskInput) {
    riskInput.value = r;
  }
  calculate();
}

function applyRR(f) {
  const select = document.getElementById("pair");
  let pRound = 2;
  if (select && select.selectedIndex >= 0) {
    pRound =
      parseInt(
        select.options[select.selectedIndex].getAttribute("data-pround"),
      ) || 2;
  }

  const entryInput = document.getElementById("entry");
  const e = parseFloat(entryInput.value);
  if (isNaN(e) || e <= 0) return;

  const slStr = isTpGridMode
    ? document.getElementById("sl-grid").value
    : document.getElementById("sl").value;
  const sl = parseFloat(slStr) || (side === "long" ? e * 0.98 : e * 1.02);

  const d = Math.abs(e - sl);
  const tpV = side === "long" ? e + d * f : e - d * f;
  document.getElementById("tp").value = formatNumber(tpV, false, pRound);

  document.getElementById("tp1").value = formatNumber(
    side === "long" ? e + d * (f - 1) : e - d * (f - 1),
    false,
    pRound,
  );
  document.getElementById("tp2").value = formatNumber(
    side === "long" ? e + d * f : e - d * f,
    false,
    pRound,
  );
  document.getElementById("tp3").value = formatNumber(
    side === "long" ? e + d * (f + 1) : e - d * (f + 1),
    false,
    pRound,
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
        // Фикс поиска: вычленяем чистый процент из текста кнопки
        const btnVal = parseFloat(btn.innerText) || 0;
        btn.classList.toggle("active", btnVal === currentRisk);
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

  const entryInput = document.getElementById("entry");
  if (entryInput) {
    entryInput.addEventListener("change", handleEntryChange);
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

  const slStr = isTpGridMode
    ? document.getElementById("sl-grid").value
    : document.getElementById("sl").value;

  if (isTpGridMode) document.getElementById("sl").value = slStr;
  else document.getElementById("sl-grid").value = slStr;

  const tpStr = document.getElementById("tp").value;
  const riskPct = parseFloat(document.getElementById("risk-pct").value);
  const select = document.getElementById("pair");
  const tip = document.getElementById("tip-text");
  const copyBlock = document.getElementById("copy-block");

  const tp1Str = document.getElementById("tp1").value;
  const tp2Str = document.getElementById("tp2").value;
  const tp3Str = document.getElementById("tp3").value;

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

  const pRound = parseInt(
    select.options[select.selectedIndex].getAttribute("data-pround"),
  );
  const currentPRound = isNaN(pRound) ? 2 : pRound;

  let entry = parseFloat(entryStr) || 0;
  if (entry > 0) entry = parseFloat(entry.toFixed(currentPRound));

  let sl = parseFloat(slStr) || 0;
  if (sl > 0) sl = parseFloat(sl.toFixed(currentPRound));

  // СРЕДНЕВЗВЕШЕННЫЙ ТЕЙК: ВСЕГДА ЖЕСТКОЕ ПРАВИЛО 50% / 30% / 20%
  let tp = 0;
  if (isTpGridMode) {
    const tp1 = parseFloat(tp1Str) || 0;
    const tp2 = parseFloat(tp2Str) || 0;
    const tp3 = parseFloat(tp3Str) || 0;
    tp = (tp1 * 50 + tp2 * 30 + tp3 * 20) / 100;
  } else {
    tp = parseFloat(tpStr) || 0;
  }
  if (tp > 0) tp = parseFloat(tp.toFixed(currentPRound));

  let errorMsg = "";
  if (balance <= 0) {
    errorMsg = "Баланс должен быть больше 0";
    document.getElementById("group-balance").classList.add("has-error");
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
    document.getElementById("res-liq").innerText = formatNumber(
      liqPrice,
      false,
      currentPRound,
    );

    const isLiqDangerous = side === "long" ? sl <= liqPrice : sl >= liqPrice;
    if (isLiqDangerous) {
      if (copyBlock) copyBlock.classList.add("blocked");
      if (tip) {
        tip.className = "status-error";
        tip.innerHTML = `🛑 <span><b>КРИТИЧЕСКИЙ РИСК:</b> Выбранное плечо убьет маржу! Ликвидация (<b>${formatNumber(liqPrice, false, currentPRound)}</b>) наступит раньше, чем сработает Стоп-Лосс. Ордера заблокированы.</span>`;
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

  let v1_p = entry;
  let v2_p =
    side === "long"
      ? entry - Math.abs(entry - sl) * 0.35
      : entry + Math.abs(entry - sl) * 0.35;
  let v3_p =
    side === "long"
      ? entry - Math.abs(entry - sl) * 0.7
      : entry + Math.abs(entry - sl) * 0.7;

  document.getElementById("v1-price").innerText = formatNumber(
    v1_p,
    false,
    currentPRound,
  );
  document.getElementById("v2-price").innerText = formatNumber(
    v2_p,
    false,
    currentPRound,
  );
  document.getElementById("v3-price").innerText = formatNumber(
    v3_p,
    false,
    currentPRound,
  );
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
  document.getElementById("res-sl-val").innerText = formatNumber(
    sl,
    false,
    currentPRound,
  );
  document.getElementById("res-loss").innerText =
    "-" + netLoss.toFixed(2) + " USDT";
  document.getElementById("res-profit").innerText =
    (netProfit >= 0 ? "+" : "") + netProfit.toFixed(2) + " USDT";

  const singleTpRow = document.getElementById("res-single-tp-row");
  const gridTpBlock = document.getElementById("res-grid-tp-block");

  if (isTpGridMode) {
    if (singleTpRow) singleTpRow.style.display = "none";
    if (gridTpBlock) gridTpBlock.style.display = "block";

    document.getElementById("res-tp-val").innerText = formatNumber(
      tp,
      false,
      currentPRound,
    );

    const tp1_val = parseFloat(document.getElementById("tp1").value) || 0;
    const tp2_val = parseFloat(document.getElementById("tp2").value) || 0;
    const tp3_val = parseFloat(document.getElementById("tp3").value) || 0;

    document.getElementById("res-tp1-val").innerText = formatNumber(
      tp1_val,
      false,
      currentPRound,
    );
    document.getElementById("res-tp2-val").innerText = formatNumber(
      tp2_val,
      false,
      currentPRound,
    );
    document.getElementById("res-tp3-val").innerText = formatNumber(
      tp3_val,
      false,
      currentPRound,
    );

    // ВСЕГДА ВЫВОДИМ 50% / 30% / 20%
    document.getElementById("res-tp1-qty").innerText = formatNumber(
      (qty * 0.5).toFixed(roundDigits),
      true,
    );
    document.getElementById("res-tp2-qty").innerText = formatNumber(
      (qty * 0.3).toFixed(roundDigits),
      true,
    );
    document.getElementById("res-tp3-qty").innerText = formatNumber(
      (qty * 0.2).toFixed(roundDigits),
      true,
    );
  } else {
    if (singleTpRow) singleTpRow.style.display = "flex";
    if (gridTpBlock) gridTpBlock.style.display = "none";

    document.getElementById("res-tp-val").innerText = formatNumber(
      tp,
      false,
      currentPRound,
    );
  }

  if (typeof syncActiveButtonsState === "function") {
    syncActiveButtonsState();
  }
}

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

applyTheme(currentTheme);
// КОНЕЦ ЧАСТИ 5
