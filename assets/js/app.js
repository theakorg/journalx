
// ==== Confirm Delete (dialog) ====
let pendingDeleteId = null;
const confirmDlg = document.getElementById('confirmDeleteDialog');
function askDelete(id){ pendingDeleteId = id; confirmDlg?.showModal(); }
confirmDlg?.addEventListener('close', () => {
  if (confirmDlg.returnValue === 'ok' && pendingDeleteId){ handleDelete(pendingDeleteId); }
  pendingDeleteId = null;
});


const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const refs = {
  themeToggle: document.getElementById("themeToggle"),
  languageSelect: document.getElementById("languageSelect"),
  form: document.getElementById("tradeForm"),
  formAccordion: document.getElementById("formAccordion"),
  submitBtn: document.getElementById("submitBtn"),
  cancelEdit: document.getElementById("cancelEdit"),
  resetForm: document.getElementById("resetForm"),
  formTitle: document.getElementById("formTitle"),
  marketType: document.getElementById("marketType"),
  side: document.getElementById("side"),
  filterMarket: document.getElementById("filterMarket"),
  filterExchange: document.getElementById("filterExchange"),
  filterSearch: document.getElementById("filterSearch"),
  addDemo: document.getElementById("addDemo"),
  exportXlsx: document.getElementById("exportXlsx"),
  importExcel: document.getElementById("importExcelFile"),
  pnlDisplaySelect: document.getElementById("pnlDisplaySelect"),
  digitsModeSelect: document.getElementById("digitsModeSelect"),
  clearAll: document.getElementById("clearAll"),
  tradesTableBody: document.querySelector("#tradesTable tbody"),
  metricTrades: document.getElementById("metricTrades"),
  metricWinRate: document.getElementById("metricWinRate"),
  metricNetPnl: document.getElementById("metricNetPnl"),
  paginationInfo: document.getElementById("paginationInfo"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  pageSize: document.getElementById("pageSize"),
  statusMsg: document.getElementById("status-msg")
};
const detailsModal = {
  container: document.getElementById("detailsModal"),
  backdrop: document.querySelector("#detailsModal .modal__backdrop"),
  close: document.getElementById("modalClose"),
  strategyRow: document.getElementById("modalStrategyRow"),
  strategy: document.getElementById("modalStrategy"),
  emotionRow: document.getElementById("modalEmotionRow"),
  emotion: document.getElementById("modalEmotion"),
  notesRow: document.getElementById("modalNotesRow"),
  notes: document.getElementById("modalNotes"),
  empty: document.getElementById("modalEmpty")
};
let modalIsOpen = false;
const MODAL_TRANSITION_MS = 240;

const insightsRefs = {
  summary: {
    totalTrades: document.getElementById("insightTotalTrades"),
    wins: document.getElementById("insightWins"),
    losses: document.getElementById("insightLosses"),
    winRate: document.getElementById("insightWinRate"),
    net: document.getElementById("insightNetPnl"),
    avgNet: document.getElementById("insightAvgNet"),
    avgPct: document.getElementById("insightAvgPct"),
    best: document.getElementById("insightBestTrade"),
    worst: document.getElementById("insightWorstTrade"),
    profitFactor: document.getElementById("insightProfitFactor"),
    avgHold: document.getElementById("insightAvgHold"),
    totalVolume: document.getElementById("insightTotalVolume")
  },
  grids: {
    market: document.getElementById("insightMarketGrid"),
    side: document.getElementById("insightSideGrid"),
    exchange: document.getElementById("insightExchangeGrid")
  },
  chart: {
    canvas: document.getElementById("insightsPnlChart"),
    empty: document.getElementById("insightsChartEmpty")
  },
  monthlyBody: document.getElementById("insightMonthlyBody"),
  view: document.getElementById("view-stats")
};

const sections = {
  journal: document.getElementById("view-journal"),
  stats: document.getElementById("view-stats"),
  settings: document.getElementById("view-settings")
};

const state = {
  themeKey: "journal_theme",
  storageKey: "tradingJournal_v1",
  languageKey: "journal_language",
  pnlDisplayKey: "journal_pnl_display",
  digitsModeKey: "journal_digits_mode",
  currentTheme: "dark",
  currentLang: "en",
  pnlDisplayMode: "net",
  digitsMode: "en",
  translations: {},
  loadedTranslations: {},
  languageDefaultLocale: "en-US",
  numberLocale: "en-US",
  trades: [],
  currentPage: 1,
  pageSize: Number(refs.pageSize?.value) || 5,
  totalPages: 0,
  statusTimeout: null,
  insightsChartData: [],
  insightsChartDirty: false,
  insightsChart: null,
  chartDefaultsApplied: false
};

const DEMO_BASE_TRADES = [
  {
    symbol: "BTC/USDT",
    exchange: "Binance",
    marketType: "Spot",
    side: "Long",
    timeframe: "4h",
    orderType: "Limit",
    volume: 0.015,
    entry: 60000,
    entryDate: "2025/10/18",
    entryTime: "00:00:00",
    close: 61200,
    exitDate: "2025/10/18",
    exitTime: "01:58:01",
    sl: 59200,
    tp: 61800,
    leverage: null,
    fee: 3.2,
    strategy: "Trend follower",
    emotion: "Calm",
    notes: "Sample trade following an uptrend breakout"
  },
  {
    symbol: "ETH/USDT",
    exchange: "Bybit",
    marketType: "Futures",
    side: "Short",
    timeframe: "15m",
    orderType: "Market",
    volume: 0.5,
    entry: 3420,
    entryDate: "2025/05/05",
    entryTime: "00:00:00",
    close: 3310,
    exitDate: "2025/05/05",
    exitTime: "23:59:23",
    sl: 3460,
    tp: 3300,
    leverage: 15,
    fee: 2.1,
    strategy: "EMA200 rejection",
    emotion: "Alert",
    notes: "Use to test moving-average rejection setups"
  },
  {
    symbol: "SOL/USDT",
    exchange: "OKX",
    marketType: "Futures",
    side: "Long",
    timeframe: "30m",
    orderType: "Limit",
    volume: 10,
    entry: 145.5,
    entryDate: "2025/01/01",
    entryTime: "00:00:00",
    close: 144.2,
    exitDate: "2025/01/01",
    exitTime: "23:59:23",
    sl: 143,
    tp: 152,
    leverage: 10,
    fee: 1.6,
    strategy: "Fake breakout",
    emotion: "Rush",
    notes: "Note for testing false breakout reactions"
  }
];

const headerAliases = {
  symbol: ['Symbol', '????'],
  exchange: ['Exchange', '?????', 'Exchange Name', 'ExchangeName', 'Exchange_Name'],
  marketType: ['Market', '?????'],
  side: ['Side', '???'],
  timeframe: ['TF', '????', 'Timeframe'],
  orderType: ['Order', '??? ?????'],
  volume: ['Vol', '???', 'Volume'],
  entry: ['Entry', 'Entry Price', '???? ????'],
  entryDate: ['Entry Date', '????? ????'],
  entryTime: ['Entry Time', '???? ????'],
  exitDate: ['Exit Date', '????? ????'],
  exitTime: ['Exit Time', '???? ????'],
  close: ['Close', 'Close Price', '???? ????'],
  sl: ['SL', 'Stop Loss', '?? ???'],
  tp: ['TP', 'Take Profit', '?? ???'],
  leverage: ['Lev', 'Leverage', '????'],
  fee: ['Fee', '??????'],
  strategy: ['Strategy', '????????'],
  emotion: ['Emotion', '?????'],
  notes: ['Notes', '???????']
};

const EXPORT_HEADERS = {
  index: '#',
  symbol: 'Symbol',
  exchange: 'Exchange',
  marketType: 'Market',
  side: 'Side',
  entry: 'Entry Price',
  entryDate: 'Entry Date',
  entryTime: 'Entry Time',
  close: 'Exit Price',
  exitDate: 'Exit Date',
  exitTime: 'Exit Time',
  sl: 'SL',
  tp: 'TP',
  leverage: 'Leverage',
  volume: 'Size',
  fee: 'Fee',
  pnl: 'PNL',
  timeframe: 'Timeframe',
  orderType: 'Order Type',
  strategy: 'Strategy',
  emotion: 'Emotion',
  notes: 'Notes'
};

const numericFieldIds = ["volume", "entry", "close", "sl", "tp", "leverage", "fee"];
const DATE_LENGTH = 10;

function getTranslationValue(key) {
  return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), state.translations);
}

function t(key, vars = {}) {
  const value = getTranslationValue(key);
  if (typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? ""));
  }
  if (Array.isArray(value)) {
    return value;
  }
  return value !== undefined ? value : key;
}

function formatNumber(value, options = {}) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  const abs = Math.abs(num);
  const maximumFractionDigits = options.maximumFractionDigits ?? (abs < 1 ? 4 : abs < 100 ? 3 : 2);
  return new Intl.NumberFormat(state.numberLocale, { ...options, maximumFractionDigits }).format(num);
}

function formatPercent(value, options = {}) {
  if (!Number.isFinite(value)) return "-";
  const { maximumFractionDigits = 2 } = options;
  const formatted = formatNumber(value, { maximumFractionDigits });
  if (formatted === "-") return "-";
  return `${formatted}%`;
}

const colorHelperCtx = document.createElement('canvas').getContext('2d');
function colorWithAlpha(color, alpha = 1) {
  if (!colorHelperCtx) return color;
  try {
    colorHelperCtx.fillStyle = color;
    const computed = colorHelperCtx.fillStyle;
    if (!computed.startsWith('rgb')) return color;
    const parts = computed
      .replace(/^rgba?\(/, '')
      .replace(/\)$/, '')
      .split(',')
      .map((part) => Number(part.trim()));
    const [r, g, b, existingAlpha = 1] = parts;
    const finalAlpha = typeof alpha === 'number' ? alpha : existingAlpha;
    return `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
  } catch (err) {
    return color;
  }
}

function formatInteger(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return new Intl.NumberFormat(state.numberLocale, { maximumFractionDigits: 0 }).format(num);
}

const DIGIT_LOCALES = {
  en: "en-US",
  fa: "fa-IR"
};

const DIGIT_MAPS = {
  fa: {
    "0": "\u06F0",
    "1": "\u06F1",
    "2": "\u06F2",
    "3": "\u06F3",
    "4": "\u06F4",
    "5": "\u06F5",
    "6": "\u06F6",
    "7": "\u06F7",
    "8": "\u06F8",
    "9": "\u06F9"
  },
  en: {
    "\u06F0": "0",
    "\u06F1": "1",
    "\u06F2": "2",
    "\u06F3": "3",
    "\u06F4": "4",
    "\u06F5": "5",
    "\u06F6": "6",
    "\u06F7": "7",
    "\u06F8": "8",
    "\u06F9": "9"
  }
};

function updateNumberLocale() {
  const fallback = state.languageDefaultLocale || "en-US";
  state.numberLocale = DIGIT_LOCALES[state.digitsMode] || fallback;
}

function convertDigits(value, mode = state.digitsMode) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (!str) return str;
  const maps = DIGIT_MAPS[mode];
  if (mode === "fa" && maps) {
    return str.replace(/[0-9]/g, (digit) => maps[digit] ?? digit);
  }
  if (mode === "en" && maps) {
    return str.replace(/[\u06F0-\u06F9]/g, (digit) => maps[digit] ?? digit);
  }
  return str;
}

const VALUE_TONE_CLASSES = ['value-positive', 'value-negative', 'value-neutral'];
function applyValueTone(element, raw) {
  if (!element) return;
  element.classList.remove(...VALUE_TONE_CLASSES);
  if (!Number.isFinite(raw)) return;
  if (raw > 0) {
    element.classList.add('value-positive');
  } else if (raw < 0) {
    element.classList.add('value-negative');
  } else {
    element.classList.add('value-neutral');
  }
}

const WIN_RATE_CLASSES = ['win-good', 'win-mid', 'win-low'];
function applyWinRateTone(element, value) {
  if (!element) return;
  element.classList.remove(...WIN_RATE_CLASSES);
  if (!Number.isFinite(value)) return;
  if (value >= 60) {
    element.classList.add('win-good');
  } else if (value >= 40) {
    element.classList.add('win-mid');
  } else {
    element.classList.add('win-low');
  }
}

function formatText(value, { empty = "-" } = {}) {
  if (!hasValue(value)) return empty;
  return convertDigits(value);
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function fillSelectWithOptions(select, items, allKey) {
  if (!select) return;
  const previous = select.value || 'all';
  select.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = 'all';
  if (allKey) {
    allOption.dataset.i18n = allKey;
    const label = t(allKey);
    allOption.textContent = convertDigits(typeof label === 'string' ? label : 'All');
  } else {
    allOption.textContent = convertDigits('All');
  }
  select.appendChild(allOption);

  items.forEach((item) => {
    if (item === null || item === undefined) return;
    const option = document.createElement('option');
    if (typeof item === 'object') {
      option.value = item.value ?? '';
      option.textContent = convertDigits(item.label ?? String(item.value ?? ''));
    } else {
      option.value = item;
      option.textContent = convertDigits(String(item));
    }
    select.appendChild(option);
  });

  if ([...select.options].some((option) => option.value === previous)) {
    select.value = previous;
  } else {
    select.value = 'all';
  }
}

function updateFilterOptions() {
  if (!refs.filterMarket || !refs.filterExchange) return;
  const markets = Array.from(
    new Set(state.trades.map((t) => (t.marketType || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const marketItems = markets.map((market) => ({
    value: market,
    label: getMarketLabel(market === 'Futures' ? 'Futures' : 'Spot')
  }));
  const exchanges = Array.from(
    new Set(state.trades.map((t) => (t.exchange || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  const exchangeItems = exchanges.map((exchange) => ({
    value: exchange,
    label: exchange
  }));
  fillSelectWithOptions(refs.filterMarket, marketItems, 'filters.market.options.all');
  fillSelectWithOptions(refs.filterExchange, exchangeItems, 'filters.exchange.options.all');
}

function buildTradeHaystack(trade) {
  const values = [
    trade.symbol, trade.exchange, trade.marketType, trade.side,
    trade.timeframe, trade.orderType, trade.strategy, trade.emotion, trade.notes,
    trade.entryDate, trade.entryTime, trade.exitDate, trade.exitTime,
    trade.volume, trade.entry, trade.close, trade.fee,
    trade.sl, trade.tp, trade.leverage,
    trade.pnl?.net, trade.pnl?.pct
  ];
  return values
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map((value) => String(value).toLowerCase())
    .join(' ');
}

function applyTheme(theme) {
  const effectiveTheme = "dark";
  state.currentTheme = effectiveTheme;
  document.documentElement.setAttribute("data-theme", effectiveTheme);
  localStorage.setItem(state.themeKey, effectiveTheme);
  updateThemeButton();
  state.insightsChartDirty = true;
  if (insightsRefs.view && !insightsRefs.view.hasAttribute('hidden')) {
    maybeDrawInsightsChart(true);
  }
}

function toggleTheme() {
  applyTheme("dark");
}

function updateThemeButton() {
  if (!refs.themeToggle) return;
  const key = state.currentTheme === "dark" ? "theme.dark" : "theme.light";
  const label = t(key);
  if (typeof label === "string") refs.themeToggle.textContent = convertDigits(label);
}

function setPnlDisplayMode(mode) {
  const next = mode === "pct" ? "pct" : "net";
  state.pnlDisplayMode = next;
  localStorage.setItem(state.pnlDisplayKey, next);
  if (refs.pnlDisplaySelect) refs.pnlDisplaySelect.value = next;
  render();
}

function setDigitsMode(mode, { silent = false } = {}) {
  const next = mode === "fa" ? "fa" : "en";
  state.digitsMode = next;
  localStorage.setItem(state.digitsModeKey, next);
  if (refs.digitsModeSelect) refs.digitsModeSelect.value = next;
  updateNumberLocale();
  if (!silent) {
    const previousStatus = refs.statusMsg?.textContent || '';
    applyTranslations();
    updateFilterOptions();
    render();
    if (previousStatus) {
      refs.statusMsg.textContent = convertDigits(previousStatus);
    }
  }
}

async function loadTranslations(lang) {
  if (state.loadedTranslations[lang]) {
    return state.loadedTranslations[lang];
  }
  const response = await fetch(`assets/i18n/${lang}.json`);
  if (!response.ok) throw new Error("Failed to load translations");
  const data = await response.json();
  state.loadedTranslations[lang] = data;
  return data;
}

function applyTranslations() {
  $$("[data-i18n]").forEach((el) => {
    const translation = t(el.dataset.i18n);
    if (typeof translation === "string") el.textContent = convertDigits(translation);
  });

  $$("[data-i18n-placeholder]").forEach((el) => {
    const translation = t(el.dataset.i18nPlaceholder);
    if (typeof translation === "string") el.setAttribute("placeholder", convertDigits(translation));
  });

  updateThemeButton();
}

async function setLanguage(lang) {
  try {
    const translations = await loadTranslations(lang);
    state.translations = translations;
    state.currentLang = lang;
    state.languageDefaultLocale = translations?.meta?.numberLocale || (lang === "en-US" ? "fa-IR" : "en-US");
    updateNumberLocale();
    document.documentElement.lang = lang;
    document.documentElement.dir = translations?.meta?.direction || "ltr";
    if (translations?.meta?.title) document.title = convertDigits(translations.meta.title);
    localStorage.setItem(state.languageKey, lang);
    if (refs.languageSelect) refs.languageSelect.value = lang;
    if (refs.pnlDisplaySelect) refs.pnlDisplaySelect.value = state.pnlDisplayMode;
    if (refs.digitsModeSelect) refs.digitsModeSelect.value = state.digitsMode;
    applyTranslations();
    updateFilterOptions();
    setStatus();
    render();
  } catch (err) {
    console.error(err);
    if (lang !== "en") {
      await setLanguage("en");
    }
  }
}

function setStatus(key) {
  if (!refs.statusMsg) return;
  clearTimeout(state.statusTimeout);
  const message = key ? t(key) : t("status.ready");
  if (typeof message === "string") refs.statusMsg.textContent = convertDigits(message);
  if (key && key !== "status.ready") {
    state.statusTimeout = setTimeout(() => {
      const ready = t("status.ready");
      if (typeof ready === "string") refs.statusMsg.textContent = convertDigits(ready);
    }, 2500);
  }
}

function loadTrades() {
  try {
    const stored = JSON.parse(localStorage.getItem(state.storageKey)) || [];
    state.trades = stored.map((trade) => {
      const item = { ...trade };
      if (!item.id) {
        item.id = window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random());
      }
      if (!item.createdAt) item.createdAt = Date.now();
      if (item.marketType !== 'Futures') {
        item.side = 'Long';
        item.leverage = null;
      } else if (!item.side) {
        item.side = 'Long';
      }
      item.pnl = computePNL(item);
      return item;
    });
  } catch (err) {
    console.error(err);
    state.trades = [];
  }
}

function saveTrades() {
  localStorage.setItem(state.storageKey, JSON.stringify(state.trades));
}

function normalizeNumericString(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/,/g, ".").replace(/\s+/g, "");
}

function sanitizeNumericInput(element) {
  if (!element) return;
  element.setAttribute("inputmode", "decimal");
  element.addEventListener("input", () => {
    let val = element.value.replace(/[^\d.,-]/g, "");
    if (val.includes("-")) {
      const negative = val.startsWith("-") ? "-" : "";
      val = negative + val.replace(/-/g, "");
    }
    const dotParts = val.split(".");
    if (dotParts.length > 2) {
      val = dotParts.shift() + "." + dotParts.join("");
    }
    const commaParts = val.split(",");
    if (commaParts.length > 1) {
      val = commaParts.shift() + "." + commaParts.join("");
    }
    element.value = val;
  });
}

function applyNumericGuards() {
  numericFieldIds.forEach((id) => sanitizeNumericInput(document.getElementById(id)));
}

function toNumber(value) {
  const numeric = normalizeNumericString(value);
  const num = Number(numeric);
  return Number.isFinite(num) ? num : 0;
}

function computePNL({ marketType, side, entry, close, volume, leverage, fee }) {
  entry = Number(entry) || 0;
  close = Number(close) || 0;
  volume = Number(volume) || 0;
  leverage = Number(leverage) || 1;
  fee = Number(fee) || 0;

  if (entry === 0 || volume === 0) return { gross: 0, net: 0, pct: 0 };

  const normalizedSide = side === "Short" ? "Short" : "Long";
  const direction = marketType === "Futures" && normalizedSide === "Short" ? -1 : 1;

  // ===== SPOT =====
  if (marketType === "Spot") {
    const gross = (close - entry) * volume;
    const pct = entry ? ((close - entry) / entry) * 100 : 0;
    const net = gross - fee;
    return { gross, net, pct };
  }

  // ===== FUTURES =====
  if (marketType === "Futures") {
    const margin = (entry * volume) / leverage;
    const priceChange = ((close - entry) / entry) * direction;
    const gross = priceChange * leverage * margin;
    const pct = priceChange * leverage * 100;
    const net = gross - fee;
    return { gross, net, pct };
  }

  return { gross: 0, net: 0, pct: 0 };
}

function toggleFuturesFields() {
  const isFutures = refs.marketType?.value === "Futures";
  $$('.only-futures').forEach((el) => {
    el.style.display = isFutures ? "flex" : "none";
  });
  if (refs.side) {
    refs.side.required = Boolean(isFutures);
    if (!isFutures) {
      refs.side.value = "Long";
    }
  }
  const leverageInput = getInput('leverage');
  if (!isFutures && leverageInput) {
    leverageInput.value = '';
  }
}

function setActiveView(view) {
  Object.entries(sections).forEach(([name, section]) => {
    if (!section) return;
    if (name === view) {
      section.removeAttribute("hidden");
    } else {
      section.setAttribute("hidden", "true");
    }
  });

  $$("[data-view]").forEach((btn) => {
    if (btn.dataset.view === view) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (view === "stats") {
    requestAnimationFrame(() => maybeDrawInsightsChart(true));
  }
}

function getMarketLabel(type) {
  const label = type === "Futures"
    ? t("form.fields.marketType.options.futures")
    : t("form.fields.marketType.options.spot");
  return typeof label === "string" ? convertDigits(label) : label;
}

function getSideLabel(side) {
  const label = side === "Short"
    ? t("form.fields.side.options.short")
    : t("form.fields.side.options.long");
  return typeof label === "string" ? convertDigits(label) : label;
}

function render() {
  updateFilterOptions();
  if (modalIsOpen) closeDetailsModal();

  if (!refs.tradesTableBody) return;

  const selectedMarket = (refs.filterMarket?.value || 'all').toLowerCase();
  const selectedExchange = (refs.filterExchange?.value || 'all').toLowerCase();
  const query = (refs.filterSearch?.value || '').trim().toLowerCase();
  const tokens = query ? query.split(/\s+/).filter(Boolean) : [];
  const pnlHeaderLabelKey = state.pnlDisplayMode === 'pct' ? 'table.headers.pnlPct' : 'table.headers.pnl';
  const pnlHeaderText = t(pnlHeaderLabelKey);
  const pnlHeader = document.querySelector('#tradesTable thead th[data-column="pnl"]');
  if (pnlHeader && typeof pnlHeaderText === "string") {
    pnlHeader.textContent = convertDigits(pnlHeaderText);
  }
  const pnlDataLabelSource = typeof pnlHeaderText === "string" ? pnlHeaderText : t('table.headers.pnl');
  const pnlDataLabel = convertDigits(pnlDataLabelSource);

  const filtered = state.trades.filter((trade) => {
    const market = (trade.marketType || '').toLowerCase();
    const exchange = (trade.exchange || '').toLowerCase();
    if (selectedMarket !== 'all' && market !== selectedMarket) return false;
    if (selectedExchange !== 'all' && exchange !== selectedExchange) return false;
    if (!tokens.length) return true;
    const haystack = buildTradeHaystack(trade);
    return tokens.every((token) => haystack.includes(token));
  });

  let wins = 0;
  let netSum = 0;
  let pctSum = 0;
  filtered.forEach((trade) => {
    const net = trade.pnl?.net || 0;
    const pct = Number.isFinite(trade.pnl?.pct) ? trade.pnl.pct : 0;
    if (net > 0) wins += 1;
    netSum += net;
    pctSum += pct;
  });

  const sorted = filtered.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  state.totalPages = sorted.length ? Math.ceil(sorted.length / state.pageSize) : 0;
  if (!state.totalPages) {
    state.currentPage = 1;
  } else {
    state.currentPage = Math.min(Math.max(state.currentPage, 1), state.totalPages);
  }

  const startIndex = state.totalPages ? (state.currentPage - 1) * state.pageSize : 0;
  const pageItems = state.totalPages ? sorted.slice(startIndex, startIndex + state.pageSize) : [];

  refs.tradesTableBody.innerHTML = '';
  const detailsButtonLabelSource = t('modals.openLabel');
  const detailsButtonLabel = convertDigits(typeof detailsButtonLabelSource === 'string' ? detailsButtonLabelSource : 'Details');
  const headerText = (key, fallback) => {
    const translated = t(key);
    const text = typeof translated === 'string' ? translated : fallback;
    return convertDigits(text);
  };
  const detailsIcon = '<svg class="icon icon--details" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.675 6.675 0 0 0 8 1.333Zm0 10a.833.833 0 1 1 .833-.833A.833.833 0 0 1 8 11.333Zm1.18-6.5-1.047 3.52a.5.5 0 0 1-.958-.004L6.667 7.5a.667.667 0 1 1 1.284-.391l.083.271.658-2.215a.667.667 0 1 1 1.225.352Z"></path></svg>';

  pageItems.forEach((trade, index) => {
    const tr = document.createElement('tr');
    tr.dataset.id = trade.id;
    const pnlNet = trade.pnl?.net || 0;
    const pnlPct = Number.isFinite(trade.pnl?.pct) ? trade.pnl.pct : 0;
    const pnlClass = pnlNet > 0 ? 'pnl-pos' : pnlNet < 0 ? 'pnl-neg' : 'pnl-zero';
    const leverageRaw = trade.marketType === 'Futures'
      ? (hasValue(trade.leverage) ? formatNumber(trade.leverage, { maximumFractionDigits: 2 }) : '-')
      : '-';
    const rowNumber = startIndex + index + 1;
    const hasDetails = [trade.strategy, trade.emotion, trade.notes].some(hasValue);
    const detailsCellHtml = hasDetails
      ? `<button class="icon-btn details-btn" type="button" data-id="${trade.id}" aria-label="${detailsButtonLabel}" title="${detailsButtonLabel}">${detailsIcon}</button>`
      : '<span class="placeholder">-</span>';
    const slDisplay = hasValue(trade.sl) ? formatNumber(trade.sl) : '-';
    const tpDisplay = hasValue(trade.tp) ? formatNumber(trade.tp) : '-';
    const slHtml = hasValue(trade.sl)
      ? `<span class="value-negative">${convertDigits(slDisplay)}</span>`
      : '<span class="placeholder">-</span>';
    const tpHtml = hasValue(trade.tp)
      ? `<span class="value-positive">${convertDigits(tpDisplay)}</span>`
      : '<span class="placeholder">-</span>';
    const slTpHtml = `${slHtml} / ${tpHtml}`;
    const volumeDisplay = hasValue(trade.volume) ? formatNumber(trade.volume) : '-';
    const feeDisplay = hasValue(trade.fee) ? formatNumber(trade.fee) : '-';
    const entryDisplay = formatNumber(trade.entry);
    const closeDisplay = formatNumber(trade.close);

    let rawPnlDisplay;
    if (state.pnlDisplayMode === 'pct') {
      const formatted = formatNumber(pnlPct, { maximumFractionDigits: 2 });
      rawPnlDisplay = formatted === "-" ? "-" : `${formatted}%`;
    } else {
      rawPnlDisplay = formatNumber(pnlNet);
    }

    const rowNumberDisplay = convertDigits(formatInteger(rowNumber));
    const symbolDisplay = formatText(trade.symbol, { empty: '-' });
    const exchangeDisplay = formatText(trade.exchange, { empty: '-' });
    const entryDateDisplay = formatText(trade.entryDate);
    const entryTimeDisplay = formatText(trade.entryTime);
    const exitDateDisplay = formatText(trade.exitDate);
    const exitTimeDisplay = formatText(trade.exitTime);
    const timeframeDisplay = formatText(trade.timeframe, { empty: '-' });
    const leverageDisplay = convertDigits(leverageRaw);
    const slTpDisplay = convertDigits(`${slDisplay} / ${tpDisplay}`);
    const sideDisplay = trade.marketType === 'Futures'
      ? getSideLabel(trade.side)
      : convertDigits('-');
    const volumeDisplayConverted = convertDigits(volumeDisplay);
    const feeDisplayConverted = convertDigits(feeDisplay);
    const entryDisplayConverted = convertDigits(entryDisplay);
    const closeDisplayConverted = convertDigits(closeDisplay);
    const pnlDisplayValue = convertDigits(rawPnlDisplay);
    const symbolHeader = headerText('table.headers.symbol', 'Symbol');
    const exchangeHeader = headerText('table.headers.exchange', 'Exchange');
    const marketHeader = headerText('table.headers.market', 'Market');
    const sideHeader = headerText('table.headers.side', 'Side');
    const entryHeader = headerText('table.headers.entry', 'Entry');
    const entryDateHeader = headerText('table.headers.entryDate', 'Entry Date');
    const entryTimeHeader = headerText('table.headers.entryTime', 'Entry Time');
    const closeHeader = headerText('table.headers.close', 'Close');
    const exitDateHeader = headerText('table.headers.exitDate', 'Exit Date');
    const exitTimeHeader = headerText('table.headers.exitTime', 'Exit Time');
    const slTpHeader = headerText('table.headers.slTp', 'SL / TP');
    const leverageHeader = headerText('table.headers.leverage', 'Leverage');
    const volumeHeader = headerText('table.headers.volume', 'Size');
    const feeHeader = headerText('table.headers.fee', 'Fee');
    const timeframeHeader = headerText('table.headers.timeframe', 'Timeframe');
    const detailsHeader = headerText('table.headers.details', 'Details');
    const actionsHeader = headerText('table.headers.actions', 'Actions');

    tr.innerHTML = `
      <td data-label="#">${rowNumberDisplay}</td>
      <td data-label="${symbolHeader}">${symbolDisplay}</td>
      <td data-label="${exchangeHeader}">${exchangeDisplay}</td>
      <td data-label="${marketHeader}">${trade.marketType === 'Futures' ? `<span class="pill futures">${getMarketLabel('Futures')}</span>` : `<span class="pill spot">${getMarketLabel('Spot')}</span>`}</td>
      <td data-label="${sideHeader}">${sideDisplay}</td>
      <td data-label="${entryHeader}">${entryDisplayConverted}</td>
      <td data-label="${entryDateHeader}">${entryDateDisplay}</td>
      <td data-label="${entryTimeHeader}">${entryTimeDisplay}</td>
      <td data-label="${closeHeader}">${closeDisplayConverted}</td>
      <td data-label="${exitDateHeader}">${exitDateDisplay}</td>
      <td data-label="${exitTimeHeader}">${exitTimeDisplay}</td>
      <td data-label="${slTpHeader}">${slTpHtml}</td>
      <td data-label="${leverageHeader}">${leverageDisplay}</td>
      <td data-label="${volumeHeader}">${volumeDisplayConverted}</td>
      <td data-label="${feeHeader}">${feeDisplayConverted}</td>
      <td data-label="${pnlDataLabel}" class="${pnlClass}">${pnlDisplayValue}</td>
      <td data-label="${timeframeHeader}">${timeframeDisplay}</td>
      <td data-label="${detailsHeader}">${detailsCellHtml}</td>
      <td data-label="${actionsHeader}" class="actions-cell"></td>
    `;

    refs.tradesTableBody.appendChild(tr);
    // === Build Actions buttons (DOM) ===
    try {
      const actCell = tr.querySelector(`td[data-label="${actionsHeader}"]`);
      if (actCell) {
        actCell.innerHTML = '';
        const mkBtn = (cls, svg, key) => {
          const b = document.createElement('button');
          b.className = `icon-btn action-btn ${cls}`;
          b.type = 'button';
          b.dataset[key] = trade.id;
          const labelKey = cls === 'edit' ? 'table.actions.edit' : 'table.actions.delete';
          const fallback = cls === 'edit' ? 'Edit' : 'Delete';
          const label = convertDigits(t(labelKey) || fallback);
          b.setAttribute('title', label);
          b.setAttribute('aria-label', label);
          b.innerHTML = svg;
          return b;
        };
        const editSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M3 14.25V17h2.75l8.09-8.09-2.75-2.75L3 14.25Zm12.81-7.06c.3-.3.3-.77 0-1.06l-1.94-1.94a.75.75 0 0 0-1.06 0l-1.22 1.22 2.75 2.75 1.47-1.47Z"/></svg>`;
        const delSvg  = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2.75A1.75 1.75 0 0 1 8.75 1h2.5A1.75 1.75 0 0 1 13 2.75V3.5h3.25a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1 0-1.5H7v-.75Zm-2.5 4h11l-.72 9.04A2.75 2.75 0 0 1 12.04 18H7.96a2.75 2.75 0 0 1-2.74-2.21L4.5 6.75Z"/></svg>`;
        actCell.appendChild(mkBtn('edit', editSvg, 'edit'));
        actCell.appendChild(mkBtn('del',  delSvg,  'del'));
      }
    } catch(e) {}

    // Build details button (always) inside the details cell (DOM-based, robust to template corruption)
    try {
      const detailsCell = tr.querySelector(`td[data-label="${detailsHeader}"]`);
      if (detailsCell) {
        detailsCell.innerHTML = '';
        if (hasDetails) {
          const btn = document.createElement('button');
          btn.className = 'icon-btn details-btn';
          btn.type = 'button';
          btn.setAttribute('title', detailsButtonLabel);
          btn.setAttribute('aria-label', detailsButtonLabel);
          btn.dataset.id = trade.id;
          btn.innerHTML = `${detailsIcon}`;
          detailsCell.appendChild(btn);
        } else {
          detailsCell.innerHTML = '<span class="placeholder">-</span>';
        }
      }
    } catch (e) {}


    const detailsBtn = tr.querySelector('.details-btn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => openDetailsModal(trade));
    }
  });

  if (refs.pageSize) refs.pageSize.value = String(state.pageSize);
  updatePaginationControls();

  if (refs.metricTrades) refs.metricTrades.textContent = convertDigits(formatInteger(filtered.length));
  if (refs.metricWinRate) {
    const winrate = filtered.length ? (wins / filtered.length) * 100 : 0;
    const winDisplay = formatPercent(winrate, { maximumFractionDigits: 1 });
    refs.metricWinRate.textContent = convertDigits(winDisplay);
    applyWinRateTone(refs.metricWinRate, winrate);
  }
  if (refs.metricNetPnl) {
    let rawMetric = 0;
    let display = '-';
    if (state.pnlDisplayMode === 'pct') {
      const avgPct = filtered.length ? pctSum / filtered.length : 0;
      const formatted = formatNumber(avgPct, { maximumFractionDigits: 2 });
      display = formatted === "-" ? "-" : `${formatted}%`;
      rawMetric = avgPct;
    } else {
      display = formatNumber(netSum);
      rawMetric = netSum;
    }
    refs.metricNetPnl.textContent = convertDigits(display);
    applyValueTone(refs.metricNetPnl, rawMetric);
  }

  renderInsights(state.trades);

  $$('#tradesTable [data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit');
      const trade = state.trades.find((item) => item.id === id);
      if (!trade) return;
      enterEditMode(trade);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  $$('#tradesTable [data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del');
      state.trades = state.trades.filter((trade) => trade.id !== id);
      saveTrades();
      render();
      setStatus('status.tradeDeleted');
    });
  });
}

function setInsightValue(element, value, { title, raw, winRate } = {}) {
  if (!element) return;
  element.textContent = convertDigits(value);
  if (title) {
    element.setAttribute('title', convertDigits(title));
  } else {
    element.removeAttribute('title');
  }
  applyValueTone(element, raw);
  applyWinRateTone(element, winRate);
}

function renderBreakdownCards(container, items) {
  if (!container) return;
  container.innerHTML = '';
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'metric-label';
    empty.textContent = convertDigits(t('insights.common.noData'));
    container.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    const label = document.createElement('span');
    label.className = 'metric-label';
    label.textContent = convertDigits(item.title ?? '');
    const value = document.createElement('span');
    value.className = 'metric-value';
    value.textContent = convertDigits(item.value ?? '');
    applyValueTone(value, item.rawValue);
    applyWinRateTone(value, item.winRate);
    card.append(label, value);
    if (Array.isArray(item.details)) {
      item.details.forEach((detail) => {
        const detailLine = document.createElement('span');
        detailLine.className = 'metric-detail';
        const labelEl = document.createElement('span');
        labelEl.className = 'metric-detail__label';
        labelEl.textContent = convertDigits(detail.label ?? '');
        detailLine.appendChild(labelEl);
        if (detail.value !== undefined) {
          const valueEl = document.createElement('span');
          valueEl.className = 'metric-detail__value';
          valueEl.textContent = convertDigits(detail.value ?? '');
          applyValueTone(valueEl, detail.raw);
          applyWinRateTone(valueEl, detail.winRate);
          detailLine.appendChild(valueEl);
        }
        card.appendChild(detailLine);
      });
    }
    container.appendChild(card);
  });
}

function buildGroupedStats(trades, getKey, getLabel) {
  const map = new Map();
  trades.forEach((trade) => {
    const key = getKey(trade);
    if (!key) return;
    const label = getLabel ? getLabel(key, trade) : key;
    if (!label) return;
    if (!map.has(key)) {
      map.set(key, { key, label, count: 0, wins: 0, net: 0, pct: 0 });
    }
    const bucket = map.get(key);
    bucket.count += 1;
    const net = trade.pnl?.net || 0;
    if (net > 0) bucket.wins += 1;
    bucket.net += net;
    if (Number.isFinite(trade.pnl?.pct)) bucket.pct += trade.pnl.pct;
  });
  return Array.from(map.values());
}

function parseTradeDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const trimmedDate = String(dateStr).trim();
  if (!trimmedDate) return null;
  let normalizedDate = trimmedDate.replace(/\./g, '-').replace(/\//g, '-');
  const parts = normalizedDate.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    normalizedDate = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  let normalizedTime = timeStr ? String(timeStr).trim() : '';
  if (normalizedTime && /^\d{1}:\d{2}$/.test(normalizedTime)) {
    normalizedTime = normalizedTime.padStart(5, '0');
  }
  if (normalizedTime && /^\d{2}:\d{2}$/.test(normalizedTime)) {
    normalizedTime = `${normalizedTime}:00`;
  }
  if (!normalizedTime) normalizedTime = '00:00:00';
  const isoCandidate = `${normalizedDate}T${normalizedTime}`;
  const isoDate = new Date(isoCandidate);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;
  const fallback = new Date(`${normalizedDate} ${normalizedTime}`);
  if (!Number.isNaN(fallback.getTime())) return fallback;
  const plain = new Date(normalizedDate);
  return Number.isNaN(plain.getTime()) ? null : plain;
}

function getTradeChronoDate(trade) {
  const exit = parseTradeDateTime(trade.exitDate, trade.exitTime);
  if (exit) return exit;
  const entry = parseTradeDateTime(trade.entryDate, trade.entryTime);
  if (entry) return entry;
  if (trade.createdAt) {
    const created = new Date(trade.createdAt);
    if (!Number.isNaN(created.getTime())) return created;
  }
  return null;
}

function computeHoldDurationHours(trade) {
  const start = parseTradeDateTime(trade.entryDate, trade.entryTime);
  const end = parseTradeDateTime(trade.exitDate, trade.exitTime);
  if (!start || !end) return null;
  const diff = end.getTime() - start.getTime();
  if (!Number.isFinite(diff) || diff < 0) return null;
  return diff / (1000 * 60 * 60);
}

function buildInsightsChartData(trades) {
  let cumulative = 0;
  return trades
    .slice()
    .sort((a, b) => {
      const da = getTradeChronoDate(a);
      const db = getTradeChronoDate(b);
      const ta = da ? da.getTime() : a.createdAt || 0;
      const tb = db ? db.getTime() : b.createdAt || 0;
      return ta - tb;
    })
    .map((trade) => {
      const date = getTradeChronoDate(trade);
      if (!date) return null;
      cumulative += trade.pnl?.net || 0;
      return { date, value: cumulative };
    })
    .filter(Boolean);
}

function formatMonthLabel(key) {
  const [year, month] = key.split('-').map((part) => Number(part));
  if (!year || !month) return key;
  return convertDigits(`${year}/${String(month).padStart(2, '0')}`);
}

function formatDateYMD(date, includeDay = true) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const output = includeDay ? `${y}/${m}/${d}` : `${y}/${m}`;
  return convertDigits(output);
}

function renderInsights(trades) {
  if (!insightsRefs.summary.totalTrades) return;
  const total = trades.length;
  let wins = 0;
  let losses = 0;
  let netSum = 0;
  let pctSum = 0;
  let positiveSum = 0;
  let negativeSum = 0;
  const holdSamples = [];
  let totalVolume = 0;
  let bestTrade = null;
  let worstTrade = null;

  trades.forEach((trade) => {
    const net = trade.pnl?.net || 0;
    const pct = Number.isFinite(trade.pnl?.pct) ? trade.pnl.pct : 0;
    if (net > 0) wins += 1;
    else if (net < 0) losses += 1;
    netSum += net;
    pctSum += pct;
    if (net > 0) positiveSum += net;
    if (net < 0) negativeSum += net;
    if (!bestTrade || net > (bestTrade.pnl?.net || -Infinity)) bestTrade = trade;
    if (!worstTrade || net < (worstTrade.pnl?.net || Infinity)) worstTrade = trade;
    const hold = computeHoldDurationHours(trade);
    if (Number.isFinite(hold)) holdSamples.push(hold);
    if (hasValue(trade.volume)) {
      const vol = Number(trade.volume);
      if (Number.isFinite(vol)) totalVolume += vol;
    }
  });

  const winRate = total ? (wins / total) * 100 : 0;
  const avgNet = total ? netSum / total : 0;
  const avgPct = total ? pctSum / total : 0;
  const profitFactor = positiveSum > 0 && negativeSum < 0 ? positiveSum / Math.abs(negativeSum) : null;
  const avgHold = holdSamples.length ? holdSamples.reduce((sum, value) => sum + value, 0) / holdSamples.length : null;

  setInsightValue(insightsRefs.summary.totalTrades, formatInteger(total));
  setInsightValue(insightsRefs.summary.wins, formatInteger(wins));
  setInsightValue(insightsRefs.summary.losses, formatInteger(losses));
  setInsightValue(insightsRefs.summary.winRate, formatPercent(winRate, { maximumFractionDigits: 1 }), { winRate });
  setInsightValue(insightsRefs.summary.net, formatNumber(netSum), { raw: netSum });
  setInsightValue(insightsRefs.summary.avgNet, formatNumber(avgNet), { raw: avgNet });
  setInsightValue(insightsRefs.summary.avgPct, formatPercent(avgPct, { maximumFractionDigits: 2 }), { raw: avgPct });

  const bestNet = bestTrade?.pnl?.net;
  const worstNet = worstTrade?.pnl?.net;
  const bestTitle = bestTrade ? `${bestTrade.symbol || '-'} | ${bestTrade.exchange || '-'}` : undefined;
  const worstTitle = worstTrade ? `${worstTrade.symbol || '-'} | ${worstTrade.exchange || '-'}` : undefined;
  const bestDisplay = Number.isFinite(bestNet) ? formatNumber(bestNet) : "-";
  const worstDisplay = Number.isFinite(worstNet) ? formatNumber(worstNet) : "-";
  setInsightValue(insightsRefs.summary.best, bestDisplay, { title: bestTitle, raw: Number.isFinite(bestNet) ? bestNet : undefined });
  setInsightValue(insightsRefs.summary.worst, worstDisplay, { title: worstTitle, raw: Number.isFinite(worstNet) ? worstNet : undefined });

  let profitDisplay = "-";
  if (profitFactor !== null) {
    profitDisplay = formatNumber(profitFactor, { maximumFractionDigits: 2 });
  } else if (positiveSum > 0 && losses === 0) {
    profitDisplay = "Inf";
  } else if (positiveSum === 0 && losses > 0) {
    profitDisplay = "0";
  }
  setInsightValue(insightsRefs.summary.profitFactor, profitDisplay);

  setInsightValue(
    insightsRefs.summary.avgHold,
    Number.isFinite(avgHold) ? formatNumber(avgHold, { maximumFractionDigits: 2 }) : "-"
  );
  setInsightValue(insightsRefs.summary.totalVolume, formatNumber(totalVolume));

  const marketStats = buildGroupedStats(
    trades,
    (trade) => {
      const value = (trade.marketType || '').trim().toLowerCase();
      if (value === 'futures') return 'Futures';
      if (value === 'spot') return 'Spot';
      if (trade.marketType) return trade.marketType;
      return 'Spot';
    },
    (key) => {
      if (typeof key === "string") {
        const lower = key.toLowerCase();
        if (lower === "futures") return getMarketLabel("Futures");
        if (lower === "spot") return getMarketLabel("Spot");
        return key;
      }
      return String(key ?? "-");
    }
  );
  const marketCards = marketStats
    .sort((a, b) => {
      // Ensure Spot appears before Futures using the internal key, then fallback to net descending
      const priority = { Spot: -1, Futures: 1 };
      const aPriority = priority[a.key] ?? 0;
      const bPriority = priority[b.key] ?? 0;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b.net - a.net;
    })
    .map((item) => {
      const avg = item.count ? item.net / item.count : 0;
      const win = item.count ? (item.wins / item.count) * 100 : 0;
      return {
        title: item.label,
        value: formatNumber(item.net),
        rawValue: item.net,
        details: [
          { label: t('insights.common.trades'), value: formatInteger(item.count) },
          { label: t('insights.common.winRate'), value: formatPercent(win, { maximumFractionDigits: 1 }), winRate: win },
          { label: t('insights.common.avgPnl'), value: formatNumber(avg), raw: avg }
        ]
      };
    });
  renderBreakdownCards(insightsRefs.grids.market, marketCards);

  const sideStats = buildGroupedStats(
    trades,
    (trade) => {
      const market = (trade.marketType || '').trim().toLowerCase();
      if (market !== 'futures') return null;
      const value = (trade.side || '').trim().toLowerCase();
      if (value === 'short') return 'Short';
      return 'Long';
    },
    (key) => getSideLabel(key)
  );
  const sideCards = sideStats
    .sort((a, b) => {
      const priority = { Long: -1, Short: 1 };
      const aPriority = priority[a.key] ?? 0;
      const bPriority = priority[b.key] ?? 0;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return b.net - a.net;
    })
    .map((item) => {
      const avg = item.count ? item.net / item.count : 0;
      const win = item.count ? (item.wins / item.count) * 100 : 0;
      return {
        title: item.label,
        value: formatNumber(item.net),
        rawValue: item.net,
        details: [
          { label: t('insights.common.trades'), value: formatInteger(item.count) },
          { label: t('insights.common.winRate'), value: formatPercent(win, { maximumFractionDigits: 1 }), winRate: win },
          { label: t('insights.common.avgPnl'), value: formatNumber(avg), raw: avg }
        ]
      };
    });
  renderBreakdownCards(insightsRefs.grids.side, sideCards);

  const exchangeStats = buildGroupedStats(
    trades,
    (trade) => {
      const name = (trade.exchange || '').trim();
      return name || '__unknown__';
    },
    (key) => (key === '__unknown__' ? t('insights.common.unknown') : key)
  );
  const exchangeCards = exchangeStats
    .sort((a, b) => b.net - a.net)
    .slice(0, 6)
    .map((item) => {
      const avg = item.count ? item.net / item.count : 0;
      const win = item.count ? (item.wins / item.count) * 100 : 0;
      return {
        title: item.label,
        value: formatNumber(item.net),
        rawValue: item.net,
        details: [
          { label: t('insights.common.trades'), value: formatInteger(item.count) },
          { label: t('insights.common.avgPnl'), value: formatNumber(avg), raw: avg },
          { label: t('insights.common.winRate'), value: formatPercent(win, { maximumFractionDigits: 1 }), winRate: win }
        ]
      };
    });
  renderBreakdownCards(insightsRefs.grids.exchange, exchangeCards);

  if (insightsRefs.monthlyBody) {
    const monthlyMap = new Map();
    trades.forEach((trade) => {
      const date = getTradeChronoDate(trade);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { key, count: 0, wins: 0, net: 0 });
      }
      const bucket = monthlyMap.get(key);
      bucket.count += 1;
      const net = trade.pnl?.net || 0;
      bucket.net += net;
      if (net > 0) bucket.wins += 1;
    });

    const monthlyEntries = Array.from(monthlyMap.values()).sort((a, b) => a.key.localeCompare(b.key));
    insightsRefs.monthlyBody.innerHTML = '';
    if (!monthlyEntries.length) {
      const emptyRow = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = convertDigits(t('insights.common.noData'));
      emptyRow.appendChild(cell);
      insightsRefs.monthlyBody.appendChild(emptyRow);
    } else {
      monthlyEntries.slice(-12).reverse().forEach((entry) => {
        const winMonthly = entry.count ? (entry.wins / entry.count) * 100 : 0;
        const row = document.createElement('tr');
        const periodCell = document.createElement('td');
        periodCell.textContent = convertDigits(formatMonthLabel(entry.key));
        row.appendChild(periodCell);

        const tradesCell = document.createElement('td');
        tradesCell.textContent = convertDigits(formatInteger(entry.count));
        row.appendChild(tradesCell);

        const netCell = document.createElement('td');
        netCell.textContent = convertDigits(formatNumber(entry.net));
        applyValueTone(netCell, entry.net);
        row.appendChild(netCell);

        const winCell = document.createElement('td');
        winCell.textContent = convertDigits(formatPercent(winMonthly, { maximumFractionDigits: 1 }));
        applyWinRateTone(winCell, winMonthly);
        row.appendChild(winCell);

        insightsRefs.monthlyBody.appendChild(row);
      });
    }
  }

  state.insightsChartData = buildInsightsChartData(trades);
  state.insightsChartDirty = true;
  maybeDrawInsightsChart();
}

function maybeDrawInsightsChart(force = false) {
  const canvas = insightsRefs.chart.canvas;
  const wrapper = canvas?.parentElement;
  const empty = insightsRefs.chart.empty;
  if (!canvas || !empty) return;

  const isVisible = insightsRefs.view && !insightsRefs.view.hasAttribute('hidden');
  if (!force && !isVisible) return;

  const ChartLib = window.Chart;
  if (!ChartLib) {
    console.warn('Chart.js not found. Skipping chart render.');
    return;
  }

  if (!state.insightsChartDirty && state.insightsChart && !force) {
    return;
  }

  if (!state.insightsChartData.length) {
    empty.hidden = false;
    if (wrapper) wrapper.style.display = 'none';
    canvas.style.display = 'none';
    if (state.insightsChart) {
      state.insightsChart.destroy();
      state.insightsChart = null;
    }
    state.insightsChartDirty = false;
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue('--accent')?.trim() || '#50b5ff';
  const border = styles.getPropertyValue('--border')?.trim() || '#3a3f51';
  const textColor = styles.getPropertyValue('--text')?.trim() || '#e8ecf1';
  const muted = styles.getPropertyValue('--muted')?.trim() || '#a0a8be';

  if (!state.chartDefaultsApplied) {
    ChartLib.defaults.font.family = "'Vazir','Inter',system-ui,-apple-system,'Segoe UI',sans-serif";
    ChartLib.defaults.color = muted;
    state.chartDefaultsApplied = true;
  }

  const labels = state.insightsChartData.map((point) => formatDateYMD(point.date));
  const dataPoints = state.insightsChartData.map((point) => Number(point.value.toFixed(2)));
  const minY = Math.min(...dataPoints);
  const maxY = Math.max(...dataPoints);
  const span = maxY - minY;
  const padding = span ? span * 0.08 : Math.max(Math.abs(maxY || 0) * 0.08, 1);
  const suggestedMin = minY - padding;
  const suggestedMax = maxY + padding;

  const dataset = {
    data: dataPoints,
    fill: true,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBorderWidth: 2,
    pointBorderColor: colorWithAlpha(accent, 0.6),
    pointBackgroundColor: colorWithAlpha(accent, 0.18),
    borderColor: accent,
    borderWidth: 2.5,
    tension: 0.32,
    backgroundColor(context) {
      const { chart } = context;
      const { ctx: chartCtx, chartArea } = chart;
      if (!chartArea) return colorWithAlpha(accent, 0.18);
      const gradient = chartCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, colorWithAlpha(accent, 0.28));
      gradient.addColorStop(1, colorWithAlpha(accent, 0.04));
      return gradient;
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: state.insightsChart ? 450 : 700,
      easing: 'easeOutQuart'
    },
    interaction: {
      mode: 'index',
      intersect: false
    },
    layout: {
      padding: {
        top: 12,
        left: 8,
        right: 16,
        bottom: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: colorWithAlpha(border, 0.2),
          borderDash: [4, 6],
          drawTicks: false
        },
        ticks: {
          color: textColor,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
          font: {
            family: ChartLib.defaults.font.family,
            size: 11
          }
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: colorWithAlpha(border, 0.25),
          drawTicks: false
        },
        ticks: {
          color: textColor,
          padding: 8,
          font: {
            family: ChartLib.defaults.font.family,
            size: 11
          },
          callback: (value) => formatNumber(value, { maximumFractionDigits: 2 })
        },
        border: {
          display: false
        },
        suggestedMin,
        suggestedMax
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: colorWithAlpha('#000', 0.85),
        borderColor: colorWithAlpha(accent, 0.45),
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (items) => items[0]?.label ?? '',
          label: (context) => formatNumber(context.parsed.y)
        }
      }
    }
  };

  empty.hidden = true;
  if (wrapper) wrapper.style.display = 'block';
  canvas.style.display = 'block';
  ChartLib.defaults.color = muted;

  if (state.insightsChart) {
    const chart = state.insightsChart;
    chart.data.labels = labels;
    Object.assign(chart.data.datasets[0], dataset);
    chart.options.animation = options.animation;
    chart.options.layout = options.layout;
    chart.options.scales.x = options.scales.x;
    chart.options.scales.y = options.scales.y;
    chart.options.plugins.tooltip = options.plugins.tooltip;
    chart.update();
  } else {
    state.insightsChart = new ChartLib(canvas, {
      type: 'line',
      data: { labels, datasets: [dataset] },
      options
    });
  }

  state.insightsChartDirty = false;
}

function updatePaginationControls() {
  if (refs.paginationInfo) {
    const info = state.totalPages
      ? t("pagination.info", {
          current: formatInteger(state.currentPage),
          total: formatInteger(state.totalPages)
        })
      : t("pagination.info", { current: "0", total: "0" });
    if (typeof info === "string") refs.paginationInfo.textContent = convertDigits(info);
  }
  if (refs.prevPage) refs.prevPage.disabled = !state.totalPages || state.currentPage <= 1;
  if (refs.nextPage) refs.nextPage.disabled = !state.totalPages || state.currentPage >= state.totalPages;
}

function getInput(id) {
  return document.getElementById(id);
}

function resetFormContent() {
  if (!refs.form) return;
  refs.form.reset();
  ["entryDate", "entryTime", "exitDate", "exitTime"].forEach((id) => {
    const el = getInput(id);
    if (el) el.value = "";
  });
  refs.form.removeAttribute('data-editing');
  toggleFuturesFields();
  if (refs.submitBtn) refs.submitBtn.textContent = convertDigits(t('form.actions.submit') || '');
  if (refs.formTitle) refs.formTitle.textContent = convertDigits(t('form.title') || '');
}

function populateInput(id, value) {
  const el = getInput(id);
  if (el !== null && el !== undefined) el.value = value ?? '';
}

function enterEditMode(trade) {
  if (!refs.form) return;
  populateInput('symbol', trade.symbol || '');
  populateInput('exchange', trade.exchange || '');
  populateInput('marketType', trade.marketType || 'Spot');
  populateInput('side', trade.side || 'Long');
  populateInput('timeframe', trade.timeframe || '');
  populateInput('orderType', trade.orderType || 'Limit');
  populateInput('volume', trade.volume ?? '');
  populateInput('entry', trade.entry ?? '');
  populateInput('entryDate', trade.entryDate ?? '');
  populateInput('entryTime', trade.entryTime ?? '');
  populateInput('close', trade.close ?? '');
  populateInput('exitDate', trade.exitDate ?? '');
  populateInput('exitTime', trade.exitTime ?? '');
  populateInput('sl', trade.sl ?? '');
  populateInput('tp', trade.tp ?? '');
  populateInput('leverage', trade.leverage ?? '');
  populateInput('fee', trade.fee ?? '');
  populateInput('strategy', trade.strategy ?? '');
  populateInput('emotion', trade.emotion ?? '');
  populateInput('notes', trade.notes ?? '');
  refs.form.setAttribute('data-editing', trade.id);
  toggleFuturesFields();
  if (refs.formAccordion) refs.formAccordion.open = true;
  if (refs.submitBtn) refs.submitBtn.textContent = convertDigits(t('form.actions.update') || '');
  if (refs.formTitle) {
    const title = t('form.title');
    const editLabel = t('table.actions.edit');
    const displayTitle = convertDigits(title || '');
    const displayEdit = convertDigits(editLabel || '');
    const symbolPart = trade.symbol ? `: ${formatText(trade.symbol, { empty: '' })}` : '';
    refs.formTitle.textContent = `${displayTitle} - ${displayEdit}${symbolPart}`;
  }
}

function getDemoTrades() {
  const overrides = t('demo.trades');
  return DEMO_BASE_TRADES.map((base, index) => {
    const extra = Array.isArray(overrides) ? overrides[index] || {} : {};
    const trade = {
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random()),
      createdAt: Date.now(),
      ...base,
      strategy: extra.strategy || base.strategy,
      emotion: extra.emotion || base.emotion || '',
      notes: extra.notes || base.notes || ''
    };
    if (extra.entryDate) trade.entryDate = extra.entryDate;
    if (extra.entryTime) trade.entryTime = extra.entryTime;
    if (extra.exitDate) trade.exitDate = extra.exitDate;
    if (extra.exitTime) trade.exitTime = extra.exitTime;
    trade.pnl = computePNL(trade);
    return trade;
  });
}

function openDetailsModal(trade){ if(!detailsModal.container){ detailsModal.container = document.getElementById('detailsModal'); detailsModal.backdrop = document.querySelector('#detailsModal .modal__backdrop'); detailsModal.close = document.getElementById('modalClose'); detailsModal.strategyRow = document.getElementById('modalStrategyRow'); detailsModal.strategy = document.getElementById('modalStrategy'); detailsModal.emotionRow = document.getElementById('modalEmotionRow'); detailsModal.emotion = document.getElementById('modalEmotion'); detailsModal.notesRow = document.getElementById('modalNotesRow'); detailsModal.notes = document.getElementById('modalNotes'); detailsModal.empty = document.getElementById('modalEmpty'); }
  const hasStrategy = hasValue(trade?.strategy);
  const hasEmotion = hasValue(trade?.emotion);
  const hasNotes = hasValue(trade?.notes);

  if (detailsModal.strategyRow) {
    detailsModal.strategyRow.hidden = !hasStrategy;
    if (hasStrategy && detailsModal.strategy) detailsModal.strategy.textContent = trade.strategy;
  }
  if (detailsModal.emotionRow) {
    detailsModal.emotionRow.hidden = !hasEmotion;
    if (hasEmotion && detailsModal.emotion) detailsModal.emotion.textContent = trade.emotion;
  }
  if (detailsModal.notesRow) {
    detailsModal.notesRow.hidden = !hasNotes;
    if (hasNotes && detailsModal.notes) detailsModal.notes.textContent = trade.notes;
  }

  const hasAny = hasStrategy || hasEmotion || hasNotes;
  if (detailsModal.empty) detailsModal.empty.hidden = hasAny;

  detailsModal.container.hidden = false;
  requestAnimationFrame(() => {
    detailsModal.container.classList.add('modal--open');
  });
  modalIsOpen = true;
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  if (detailsModal.close) detailsModal.close.focus();
}

function closeDetailsModal() {
  if (!detailsModal.container || !modalIsOpen) return;
  detailsModal.container.classList.remove('modal--open');
  modalIsOpen = false;
  setTimeout(() => {
    if (!modalIsOpen && detailsModal.container) {
      detailsModal.container.hidden = true;
    }
  }, MODAL_TRANSITION_MS);
  document.documentElement.classList.remove('modal-open');
  document.body.style.overflow = '';
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!refs.form) return;
  const entryDateValue = (getInput('entryDate')?.value || '').trim();
  const exitDateValue = (getInput('exitDate')?.value || '').trim();
  if ((entryDateValue && entryDateValue.length !== DATE_LENGTH) || (exitDateValue && exitDateValue.length !== DATE_LENGTH)) {
    alert(convertDigits(t('errors.dateLength') || ''));
    return;
  }

  const marketType = getInput('marketType')?.value || 'Spot';
  const sideValue = marketType === 'Futures'
    ? (getInput('side')?.value || 'Long')
    : 'Long';
  const leverageValue = marketType === 'Futures' && getInput('leverage')?.value
    ? toNumber(getInput('leverage')?.value)
    : null;

  const data = {
    id: refs.form.getAttribute('data-editing') || (window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random())),
    createdAt: refs.form.getAttribute('data-editing')
      ? state.trades.find((item) => item.id === refs.form.getAttribute('data-editing'))?.createdAt || Date.now()
      : Date.now(),
    symbol: (getInput('symbol')?.value || '').trim(),
    exchange: (getInput('exchange')?.value || '').trim(),
    marketType,
    side: sideValue,
    timeframe: (getInput('timeframe')?.value || '').trim(),
    orderType: getInput('orderType')?.value || 'Limit',
    volume: toNumber(getInput('volume')?.value),
    entry: toNumber(getInput('entry')?.value),
    entryDate: entryDateValue,
    entryTime: (getInput('entryTime')?.value || '').trim(),
    close: toNumber(getInput('close')?.value),
    exitDate: exitDateValue,
    exitTime: (getInput('exitTime')?.value || '').trim(),
    sl: toNumber(getInput('sl')?.value),
    tp: toNumber(getInput('tp')?.value),
    leverage: leverageValue,
    fee: toNumber(getInput('fee')?.value),
    strategy: (getInput('strategy')?.value || '').trim(),
    emotion: (getInput('emotion')?.value || '').trim(),
    notes: (getInput('notes')?.value || '').trim()
  };

  data.pnl = computePNL(data);

  const editingId = refs.form.getAttribute('data-editing');
  if (editingId) {
    const index = state.trades.findIndex((item) => item.id === editingId);
    if (index > -1) state.trades[index] = data;
    setStatus('status.tradeUpdated');
  } else {
    state.trades.push(data);
    state.currentPage = 1;
    setStatus('status.tradeSaved');
  }

  saveTrades();
  render();
  resetFormContent();
}

function handleClearAll() {
  const confirmMessage = convertDigits(t('confirm.clearAll') || '');
  const confirmed = window.confirm(confirmMessage);
  if (!confirmed) return;
  state.trades = [];
  state.currentPage = 1;
  saveTrades();
  render();
  setStatus('status.allCleared');
}

function exportXlsx() {
  if (typeof XLSX === 'undefined') return;
  const data = state.trades.map((trade, index) => ({
    [EXPORT_HEADERS.index]: index + 1,
    [EXPORT_HEADERS.symbol]: trade.symbol || '',
    [EXPORT_HEADERS.exchange]: trade.exchange || '',
    [EXPORT_HEADERS.marketType]: trade.marketType || '',
    [EXPORT_HEADERS.side]: trade.side || '',
    [EXPORT_HEADERS.entry]: trade.entry || 0,
    [EXPORT_HEADERS.entryDate]: trade.entryDate || '',
    [EXPORT_HEADERS.entryTime]: trade.entryTime || '',
    [EXPORT_HEADERS.close]: trade.close || 0,
    [EXPORT_HEADERS.exitDate]: trade.exitDate || '',
    [EXPORT_HEADERS.exitTime]: trade.exitTime || '',
    [EXPORT_HEADERS.sl]: hasValue(trade.sl) ? trade.sl : '',
    [EXPORT_HEADERS.tp]: hasValue(trade.tp) ? trade.tp : '',
    [EXPORT_HEADERS.leverage]: hasValue(trade.leverage) ? trade.leverage : '',
    [EXPORT_HEADERS.volume]: hasValue(trade.volume) ? trade.volume : '',
    [EXPORT_HEADERS.fee]: hasValue(trade.fee) ? trade.fee : '',
    [EXPORT_HEADERS.pnl]: trade.pnl?.net || 0,
    [EXPORT_HEADERS.timeframe]: trade.timeframe || '',
    [EXPORT_HEADERS.orderType]: trade.orderType || '',
    [EXPORT_HEADERS.strategy]: trade.strategy || '',
    [EXPORT_HEADERS.emotion]: trade.emotion || '',
    [EXPORT_HEADERS.notes]: trade.notes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Journal');
  XLSX.writeFile(workbook, 'trading_journal.xlsx');
  setStatus('status.xlsxExported');
}

function resolveColumn(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

function normaliseSide(value) {
  const side = String(value || '').trim().toLowerCase();
  if (!side) return 'Long';
  if (side.includes('short') || side.includes('sell')) return 'Short';
  return 'Long';
}

function normaliseMarket(value) {
  const market = String(value || '').trim().toLowerCase();
  if (market.includes('future')) return 'Futures';
  return 'Spot';
}

function handleExcelImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    state.trades = rows.map((row) => {
      const trade = {
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random()),
        createdAt: Date.now(),
        symbol: resolveColumn(row, headerAliases.symbol),
        exchange: resolveColumn(row, headerAliases.exchange),
        marketType: normaliseMarket(resolveColumn(row, headerAliases.marketType)),
        side: normaliseSide(resolveColumn(row, headerAliases.side)),
        timeframe: resolveColumn(row, headerAliases.timeframe),
        orderType: resolveColumn(row, headerAliases.orderType) || 'Limit',
        volume: toNumber(resolveColumn(row, headerAliases.volume)),
        entry: toNumber(resolveColumn(row, headerAliases.entry)),
        entryDate: resolveColumn(row, headerAliases.entryDate),
        entryTime: resolveColumn(row, headerAliases.entryTime),
        close: toNumber(resolveColumn(row, headerAliases.close)),
        exitDate: resolveColumn(row, headerAliases.exitDate),
        exitTime: resolveColumn(row, headerAliases.exitTime),
        sl: toNumber(resolveColumn(row, headerAliases.sl)),
        tp: toNumber(resolveColumn(row, headerAliases.tp)),
        leverage: toNumber(resolveColumn(row, headerAliases.leverage)) || null,
        fee: toNumber(resolveColumn(row, headerAliases.fee)),
        strategy: resolveColumn(row, headerAliases.strategy),
        emotion: resolveColumn(row, headerAliases.emotion),
        notes: resolveColumn(row, headerAliases.notes)
      };
      trade.entryDate = (trade.entryDate || '').toString().trim();
      trade.entryTime = (trade.entryTime || '').toString().trim();
      trade.exitDate = (trade.exitDate || '').toString().trim();
      trade.exitTime = (trade.exitTime || '').toString().trim();
      if (trade.entryDate && trade.entryDate.length !== DATE_LENGTH) trade.entryDate = trade.entryDate.slice(0, DATE_LENGTH);
      if (trade.exitDate && trade.exitDate.length !== DATE_LENGTH) trade.exitDate = trade.exitDate.slice(0, DATE_LENGTH);
      if (trade.leverage === 0) trade.leverage = null;
      if (trade.marketType !== 'Futures') {
        trade.side = 'Long';
        trade.leverage = null;
      } else if (!trade.side) {
        trade.side = 'Long';
      }
      trade.pnl = computePNL(trade);
      return trade;
    });
    state.currentPage = 1;
    saveTrades();
    render();
    setStatus('status.excelImported');
  };
  reader.readAsArrayBuffer(file);
  event.target.value = '';
}

function initNavigation() {
  $$("[data-view]").forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (!view) return;
      setActiveView(view);
    });
  });
}

function initEvents() {
  refs.themeToggle?.addEventListener('click', toggleTheme);
  refs.languageSelect?.addEventListener('change', (event) => {
    setLanguage(event.target.value || 'en');
  });
  refs.pnlDisplaySelect?.addEventListener('change', (event) => {
    setPnlDisplayMode(event.target.value || 'net');
  });
  refs.digitsModeSelect?.addEventListener('change', (event) => {
    setDigitsMode(event.target.value || 'en');
  });

  refs.form?.addEventListener('submit', handleFormSubmit);
  refs.cancelEdit?.addEventListener('click', () => {
    resetFormContent();
    setStatus('status.editCanceled');
  });
  refs.resetForm?.addEventListener('click', () => {
    resetFormContent();
    setStatus('status.formCleared');
  });

  refs.marketType?.addEventListener('change', toggleFuturesFields);

  refs.filterMarket?.addEventListener('change', () => {
    state.currentPage = 1;
    render();
  });
  refs.filterExchange?.addEventListener('change', () => {
    state.currentPage = 1;
    render();
  });
  refs.filterSearch?.addEventListener('input', () => {
    state.currentPage = 1;
    render();
  });

  refs.pageSize?.addEventListener('change', () => {
    state.pageSize = Number(refs.pageSize.value) || 5;
    state.currentPage = 1;
    render();
  });

  refs.prevPage?.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage -= 1;
      render();
    }
  });

  refs.nextPage?.addEventListener('click', () => {
    if (state.totalPages && state.currentPage < state.totalPages) {
      state.currentPage += 1;
      render();
    }
  });

  refs.addDemo?.addEventListener('click', () => {
    state.trades = state.trades.concat(getDemoTrades());
    state.currentPage = 1;
    saveTrades();
    render();
    setStatus('status.demoAdded');
  });

  refs.exportXlsx?.addEventListener('click', exportXlsx);

// Delegation for details/actions (robust to rerenders)
refs.tradesTableBody?.addEventListener('click', (evt) => {
  const details = evt.target.closest?.('.details-btn');
  if (details) {
    const id = details.closest('tr')?.dataset?.id;
    const trade = state.trades.find(x => x.id === id);
    if (trade) openDetailsModal(trade);
    return;
  }
  const btn = evt.target.closest?.('.action-btn');
  if (!btn) return;
  const id = btn.dataset.edit || btn.dataset.del || btn.closest('tr')?.dataset?.id;
  if (!id) return;
  if (btn.classList.contains('edit')) {
    const trade = state.trades.find(x => x.id === id);
    if (trade) startEdit(trade);
  } else if (btn.classList.contains('del')) {
    askDelete(id);
  }
});

  // Event delegation for details buttons
  refs.tradesTableBody?.addEventListener('click', (evt) => {
    const el = evt.target.closest ? evt.target.closest('.details-btn') : null;
    if (!el) return;
    const id = el.dataset.id || el.closest('tr')?.dataset?.id;
    const trade = state.trades.find((x) => x.id === id);
    if (trade) openDetailsModal(trade);
  });
  refs.importExcel?.addEventListener('change', handleExcelImport);
  refs.clearAll?.addEventListener('click', handleClearAll);
  detailsModal.close?.addEventListener('click', closeDetailsModal);
  detailsModal.backdrop?.addEventListener('click', (event) => {
    if (event.target === detailsModal.backdrop) closeDetailsModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDetailsModal();
  });
}

async function init() {
  applyTheme('dark');

  const savedPnlDisplay = localStorage.getItem(state.pnlDisplayKey);
  state.pnlDisplayMode = savedPnlDisplay === 'pct' ? 'pct' : 'net';
  if (refs.pnlDisplaySelect) refs.pnlDisplaySelect.value = state.pnlDisplayMode;

  const savedDigitsMode = localStorage.getItem(state.digitsModeKey) || state.digitsMode;
  setDigitsMode(savedDigitsMode, { silent: true });
  if (refs.digitsModeSelect) refs.digitsModeSelect.value = state.digitsMode;

  loadTrades();
  initNavigation();
  initEvents();
  toggleFuturesFields();
  applyNumericGuards();
  if (refs.pageSize) refs.pageSize.value = String(state.pageSize);
  setActiveView('journal');

  window.addEventListener('resize', () => {
    if (insightsRefs.view && insightsRefs.view.hasAttribute('hidden')) {
      state.insightsChartDirty = true;
    } else {
      maybeDrawInsightsChart(true);
    }
  });

  const savedLang = localStorage.getItem(state.languageKey) || 'en';
  await setLanguage(savedLang);
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('service-worker.js');
  } catch (error) {
    console.error('Service worker registration failed', error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await init();
  registerServiceWorker();
});

(function () {
  const MIN_W = 1024;
  const MIN_H = 700;
  const BLOCK_TEXT_H1 = 'Access Denied';
  const BLOCK_TEXT_P  = 'To Keep Traders Safe From Late-Night Emotions, Access Is Limited To Desktop Only';

  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

  const mq = window.matchMedia('(max-width: 1024px)');

  function vw() {
    const vv = window.visualViewport;
    return vv ? Math.round(vv.width) : window.innerWidth;
  }
  function vh() {
    const vv = window.visualViewport;
    return vv ? Math.round(vv.height) : window.innerHeight;
  }
  function shouldBlock() {
    return (
      isMobileUA ||
      isTouch ||
      mq.matches ||
      vw() < MIN_W ||
      vh() < MIN_H
    );
  }

  let overlayEl = null;
  function ensureOverlay() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.id = 'jx-deny';
    overlayEl.style.position = 'fixed';
    overlayEl.style.inset = '0';
    overlayEl.style.background = '#111';
    overlayEl.style.color = '#f55';
    overlayEl.style.fontFamily = 'monospace';
    overlayEl.style.display = 'none';
    overlayEl.style.alignItems = 'center';
    overlayEl.style.justifyContent = 'center';
    overlayEl.style.textAlign = 'center';
    overlayEl.style.padding = '24px';
    overlayEl.style.zIndex = '2147483647';

    const box = document.createElement('div');
    box.style.maxWidth = '420px';
    box.innerHTML = `
      <img src="assets/logos/logo.svg" alt="JournalX Logo" width="100" height="100" style="margin-bottom:16px">
      <h1 style="font-size:28px;margin:16px 0 8px">` + BLOCK_TEXT_H1 + `</h1>
      <p style="font-size:15px;color:#bbb;line-height:1.5">` + BLOCK_TEXT_P + `</p>
    `;
    overlayEl.appendChild(box);

    if (document.body) document.body.appendChild(overlayEl);
    else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlayEl));
    return overlayEl;
  }

  function hideBodyChildrenExcept(el) {
    const kids = Array.from(document.body.children);
    for (const k of kids) {
      if (k === el) continue;
      if (!k.dataset) k.dataset = {};
      if (!k.dataset.prevDisplay) k.dataset.prevDisplay = k.style.display || '';
      k.style.display = 'none';
    }
    if (!document.body.dataset.prevOverflow) document.body.dataset.prevOverflow = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';
  }
  function restoreBodyChildren(el) {
    const kids = Array.from(document.body.children);
    for (const k of kids) {
      if (k === el) continue;
      if (k.dataset && 'prevDisplay' in k.dataset) {
        k.style.display = k.dataset.prevDisplay;
        delete k.dataset.prevDisplay;
      } else {
        k.style.display = '';
      }
    }
    if (document.body.dataset && 'prevOverflow' in document.body.dataset) {
      document.body.style.overflow = document.body.dataset.prevOverflow;
      delete document.body.dataset.prevOverflow;
    } else {
      document.body.style.overflow = '';
    }
  }

  function applyGuard() {
    const ov = ensureOverlay();
    if (shouldBlock()) {
      ov.style.display = 'flex';
      hideBodyChildrenExcept(ov);
      if (window.stop) try { window.stop(); } catch (_) {}
    } else {
      ov.style.display = 'none';
      restoreBodyChildren(ov);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGuard);
  } else {
    applyGuard();
  }

  window.addEventListener('resize', applyGuard);
  window.addEventListener('orientationchange', applyGuard);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', applyGuard);
  try { mq.addEventListener('change', applyGuard); } catch { mq.addListener(applyGuard); }

  let count = 0;
  const poll = setInterval(() => {
    applyGuard();
    if (++count > 12) clearInterval(poll);
  }, 500);
})();


