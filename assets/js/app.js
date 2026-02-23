function toOptionalNumber(value) {
  const sanitized = sanitizeDecimalInput(value);
  if (!sanitized) return null;
  const num = Number(sanitized);
  return Number.isFinite(num) ? num : null;
}

function isTradeClosed(trade) {
  if (!trade) return false;
  const close = toOptionalNumber(trade.close);
  return close !== null && close > 0;
}
let pendingDeleteId = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const CONTACT_ENDPOINT = "https://contact-journalx.theakorg.workers.dev";
const TELEGRAM_EXPORT_ENDPOINT = "https://export-journalx.theakorg.workers.dev";
const APP_ASSET_VERSION = "2.0.0";
const RUNTIME_ASSET_SEED = (() => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('refresh') || APP_ASSET_VERSION;
  } catch (err) {
    return APP_ASSET_VERSION;
  }
})();

const MODES = Object.freeze({
  CRYPTO: 'crypto',
  FOREX: 'forex'
});
const MODE_STORAGE_KEY = 'journal_mode';
const STORAGE_KEYS = Object.freeze({
  crypto: 'tradingJournal_crypto_v1',
  forex: 'tradingJournal_forex_v1'
});
const PNL_DISPLAY_KEYS = Object.freeze({
  crypto: 'journal_pnl_display_crypto',
  forex: 'journal_pnl_display_forex'
});

const TRANSLATION_FALLBACKS = {
  en: {
    "modals.deviceWarning.title": "JournalX Isn’t Supported On This Device",
    "modals.deviceWarning.description": "Our Journal Is Currently Only Available On The Desktop Version Steadily, And Isn’t Stable On Mobile Yet, But We Promise You’ll See Us On Your Phones Soon",
    "modals.deviceWarning.action": "Okay",
    "modals.update.title": "JournalX Update",
    "modals.update.description": "Don’t Forget To Backup Your Transaction Data Before Updating. To Do This, Just Tap On 'Get Data', Because If You Don’t, You Might Lose Everything. So Please Be Extra Careful",
    "modals.update.confirm": "Okay, Update It",
    "settings.update.button": "Update JournalX"
  },
  fa: {
    "modals.deviceWarning.title": "ژورنال ایکس رو این دستگاه پشتیبانی نمیشه",
    "modals.deviceWarning.description": "ژورنالمون الان فقط روی نسخه دسکتاپ به صورت پایدار در دسترسه و توی نسخه موبایل پایدار نیست اما قول میدیم که بزودی مارو روی گوشیاتون ببینین",
    "modals.deviceWarning.action": "اوکیه",
    "modals.update.title": "بروزرسانی ژورنال ایکس",
    "modals.update.description": "فراموش نکن قبل از بروزرسانی از تمام داده های معاملاتیت رو داشته باشی و برای اینکار کافیه روی دریافت اطلاعات بزنی، چون گه نزنی ممکنه همه چیو از دست بدی پس لطفا خیلی مراقبت کن",
    "modals.update.confirm": "اوکیه بروزش کن",
    "settings.update.button": "بروزرسانی ژورنال ایکس"
  }
};

const refs = {
  themeToggle: document.getElementById("themeToggle"),
  languageSelect: document.getElementById("languageSelect"),
  modeSelect: document.getElementById("modeSelect"),
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
  feeDisplay: document.getElementById("fee"),
  entryFeeHidden: document.getElementById("entryFee"),
  exitFeeHidden: document.getElementById("exitFee"),
  fundingFeeHidden: document.getElementById("fundingFee"),
  tradesTableBody: document.querySelector("#tradesTable tbody"),
  metricTrades: document.getElementById("metricTrades"),
  metricWinRate: document.getElementById("metricWinRate"),
  metricNetPnl: document.getElementById("metricNetPnl"),
  paginationInfo: document.getElementById("paginationInfo"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  pageSize: document.getElementById("pageSize"),
  statusMsg: document.getElementById("status-msg"),
  contactButton: document.getElementById("contactSupportButton"),
  telegramConnectButton: document.getElementById("telegramConnectButton"),
  telegramStatusNote: document.getElementById("telegramStatusNote")
  ,
  updateAppButton: document.getElementById("updateAppButton")
};
const datalistRefs = {
  symbols: document.getElementById("symbolsList"),
  exchanges: document.getElementById("exchangesList"),
  timeframes: document.getElementById("timeframesList"),
  leverage: document.getElementById("leverageList"),
  strategies: document.getElementById("strategiesList")
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
  empty: document.getElementById("modalEmpty"),
  list: document.getElementById("modalDetailsList"),
  sendButton: document.getElementById("detailsTelegramButton"),
  actions: document.getElementById("modalDetailsActions"),
  currentTrade: null
};
const contactModal = {
  container: null,
  backdrop: null,
  close: null,
  form: null,
  textarea: null,
  cancel: null,
  submit: null
};
const telegramModal = {
  container: null,
  backdrop: null,
  close: null,
  steps: [],
  panels: [],
  step1Action: null,
  form: null,
  input: null,
  finish: null,
  successId: null,
  currentStep: 1
};
const deviceModal = {
  container: null,
  backdrop: null,
  close: null,
  confirm: null
};
const deleteModal = {
  container: null,
  backdrop: null,
  close: null,
  cancel: null,
  confirm: null,
  title: null,
  description: null
};
const clearModal = {
  container: null,
  backdrop: null,
  close: null,
  cancel: null,
  confirm: null,
  title: null,
  description: null
};
const exportModal = {
  container: null,
  backdrop: null,
  close: null,
  local: null,
  telegram: null,
  hint: null
};
const updateModal = {
  container: null,
  backdrop: null,
  close: null,
  cancel: null,
  confirm: null
};
const modeModal = {
  container: null,
  backdrop: null,
  close: null,
  actions: []
};
const feeModal = {
  container: null,
  backdrop: null,
  close: null,
  form: null,
  entry: null,
  exit: null,
  funding: null,
  total: null,
  cancel: null,
  fundingWrapper: null
};
const toastState = {
  container: null
};
let modalIsOpen = false;
const MODAL_TRANSITION_MS = 240;
let feeModalOpen = false;
let deleteModalOpen = false;
let clearModalOpen = false;

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

const TRADE_DETAIL_FIELDS = [
  { key: 'symbol', labelKey: 'modals.details.fields.symbol', getter: (trade) => trade.symbol },
  { key: 'exchange', labelKey: 'modals.details.fields.exchange', getter: (trade) => trade.exchange },
  { key: 'side', labelKey: 'modals.details.fields.side', getter: (trade) => (trade.marketType === 'Futures' || trade.marketType === 'Forex') ? getSideLabel(trade.side) : '-' },
  { key: 'timeframe', labelKey: 'modals.details.fields.timeframe', getter: (trade) => trade.timeframe },
  { key: 'orderType', labelKey: 'modals.details.fields.orderType', getter: (trade) => trade.orderType },
  { key: 'volume', labelKey: 'modals.details.fields.volume', getter: (trade) => hasValue(trade.volume) ? formatNumber(trade.volume) : '-' },
  { key: 'leverage', labelKey: 'modals.details.fields.leverage', getter: (trade) => (trade.marketType === 'Futures' || trade.marketType === 'Forex') && hasValue(trade.leverage) ? formatNumber(trade.leverage) : '-' },
  { key: 'entryPrice', labelKey: 'modals.details.fields.entryPrice', getter: (trade) => hasValue(trade.entry) ? formatTradePrice(trade, trade.entry) : '-' },
  { key: 'entryDate', labelKey: 'modals.details.fields.entryDate', getter: (trade) => trade.entryDate || '-' },
  { key: 'entryTime', labelKey: 'modals.details.fields.entryTime', getter: (trade) => trade.entryTime || '-' },
  { key: 'closePrice', labelKey: 'modals.details.fields.closePrice', getter: (trade) => hasValue(trade.close) ? formatTradePrice(trade, trade.close) : '-' },
  { key: 'exitDate', labelKey: 'modals.details.fields.exitDate', getter: (trade) => trade.exitDate || '-' },
  { key: 'exitTime', labelKey: 'modals.details.fields.exitTime', getter: (trade) => trade.exitTime || '-' },
  { key: 'sl', labelKey: 'modals.details.fields.sl', getter: (trade) => hasValue(trade.sl) ? formatTradePrice(trade, trade.sl) : '-' },
  { key: 'tp', labelKey: 'modals.details.fields.tp', getter: (trade) => hasValue(trade.tp) ? formatTradePrice(trade, trade.tp) : '-' },
  { key: 'fee', labelKey: 'modals.details.fields.fee', getter: (trade) => {
    const totalFee = getTotalFee(trade);
    return totalFee ? formatNumber(totalFee) : '-';
  }},
  { key: 'pnlNet', labelKey: 'modals.details.fields.pnlNet', getter: (trade) => {
    const net = trade.pnl?.net;
    return Number.isFinite(net) ? formatNumber(net) : '-';
  }},
  { key: 'pnlPct', labelKey: 'modals.details.fields.pnlPct', getter: (trade) => {
    const pct = trade.pnl?.pct;
    return Number.isFinite(pct) ? formatPercent(pct) : '-';
  }},
  { key: 'pnlPips', labelKey: 'modals.details.fields.pnlPips', getter: (trade) => {
    const pips = trade.pnl?.pips;
    return Number.isFinite(pips) ? formatNumber(pips, { maximumFractionDigits: 1 }) : '-';
  }, modes: [MODES.FOREX] }
];

const exportValueToText = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isNaN(value)) return '';
  return String(value);
};

const state = {
  themeKey: "journal_theme",
  modeKey: MODE_STORAGE_KEY,
  storageKey: STORAGE_KEYS.crypto,
  languageKey: "journal_language",
  pnlDisplayKey: PNL_DISPLAY_KEYS.crypto,
  digitsModeKey: "journal_digits_mode",
  telegramUserIdKey: "telegram_userid",
  currentTheme: "dark",
  currentLang: "en",
  currentMode: MODES.CRYPTO,
  pnlDisplayMode: "net",
  digitsMode: "en",
  translations: {},
  loadedTranslations: {},
  languageDefaultLocale: "en-US",
  numberLocale: "en-US",
  trades: [],
  orderCounter: 0,
  currentPage: 1,
  pageSize: Number(refs.pageSize?.value) || 5,
  isMobileDevice: false,
  deviceWarningShown: false,
  totalPages: 0,
  statusTimeout: null,
  insightsChartData: [],
  insightsChartDirty: false,
  insightsChart: null,
  chartDefaultsApplied: false,
  telegramUserId: "",
  isOnline: typeof navigator !== "undefined" ? navigator.onLine !== false : true
};

function detectMobileDevice() {
  if (navigator?.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
    return navigator.userAgentData.mobile;
  }
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isTouchableMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  const pattern = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Kindle|Silk/i;
  return pattern.test(ua) || isTouchableMac;
}

function isForexMode() {
  return state.currentMode === MODES.FOREX;
}

function getStorageKeyForMode(mode) {
  return STORAGE_KEYS[mode] || STORAGE_KEYS.crypto;
}

function getPnlDisplayKeyForMode(mode) {
  return PNL_DISPLAY_KEYS[mode] || PNL_DISPLAY_KEYS.crypto;
}

function isFuturesSelected() {
  return refs.marketType?.value === "Futures" || refs.marketType?.value === "Forex";
}

function normalizeOrderValue(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getMaxOrderValue(trades = state.trades) {
  return trades.reduce((max, trade) => {
    const order = normalizeOrderValue(trade?.order);
    return order !== null && order > max ? order : max;
  }, 0);
}

function syncOrderCounter(trades = state.trades) {
  state.orderCounter = getMaxOrderValue(trades);
}

function nextOrderValue() {
  const current = normalizeOrderValue(state.orderCounter);
  const base = current !== null ? current : getMaxOrderValue();
  const next = base + 1;
  state.orderCounter = next;
  return next;
}

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
    fundingFee: null,
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
    fundingFee: 0.6,
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
    close: 146.9,
    exitDate: "2025/01/01",
    exitTime: "23:59:23",
    sl: 143,
    tp: 152,
    leverage: 10,
    fee: 1.6,
    fundingFee: 0.4,
    strategy: "Fake breakout",
    emotion: "Rush",
    notes: "Note for testing false breakout reactions"
  }
];

const DEMO_FOREX_TRADES = [
  {
    symbol: "EUR/USD",
    exchange: "IC Markets",
    marketType: "Forex",
    side: "Long",
    timeframe: "1h",
    orderType: "Market",
    volume: 0.5,
    entry: 1.0865,
    entryDate: "2025/10/18",
    entryTime: "09:30:00",
    close: 1.0892,
    exitDate: "2025/10/18",
    exitTime: "14:10:00",
    sl: 1.0835,
    tp: 1.0900,
    leverage: 30,
    fee: 2.4,
    fundingFee: -0.6,
    strategy: "London breakout",
    emotion: "Focused",
    notes: "Sample FX trade with swap and commission"
  },
  {
    symbol: "USD/JPY",
    exchange: "Pepperstone",
    marketType: "Forex",
    side: "Short",
    timeframe: "30m",
    orderType: "Limit",
    volume: 0.2,
    entry: 147.62,
    entryDate: "2025/09/05",
    entryTime: "11:12:00",
    close: 147.10,
    exitDate: "2025/09/05",
    exitTime: "16:44:00",
    sl: 148.05,
    tp: 146.90,
    leverage: 20,
    fee: 1.2,
    fundingFee: -0.3,
    strategy: "Supply zone",
    emotion: "Calm",
    notes: "JPY pair example with 2-decimal pip size"
  },
  {
    symbol: "GBP/USD",
    exchange: "XM",
    marketType: "Forex",
    side: "Long",
    timeframe: "4h",
    orderType: "Market",
    volume: 0.1,
    entry: 1.2630,
    entryDate: "2025/07/21",
    entryTime: "08:00:00",
    close: 1.2686,
    exitDate: "2025/07/21",
    exitTime: "20:00:00",
    sl: 1.2580,
    tp: 1.2700,
    leverage: 10,
    fee: 0.6,
    fundingFee: -0.2,
    strategy: "Trend continuation",
    emotion: "Patient",
    notes: "Example of swing-style FX trade"
  }
];

const DEFAULT_FOREX_SYMBOLS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'CHF/JPY', 'NZD/JPY', 'CAD/JPY',
  'EUR/CHF', 'GBP/CHF', 'AUD/CAD', 'AUD/CHF', 'AUD/NZD', 'EUR/AUD', 'EUR/CAD',
  'GBP/AUD', 'GBP/CAD', 'NZD/CAD', 'NZD/CHF'
];

const headerAliases = {
  symbol: ['Symbol', 'نماد'],
  exchange: ['Exchange', 'صرافی', 'Exchange Name', 'ExchangeName', 'Exchange_Name'],
  side: ['Side', 'سمت'],
  timeframe: ['TF', 'بازه', 'Timeframe', 'Time Frame'],
  orderType: ['Order', 'نوع سفارش', 'Order Type'],
  volume: ['Vol', 'حجم', 'Volume', 'Size', 'Size (Qty)', 'Qty', 'Quantity', 'Order Size', 'Position Size', 'Lot', 'Lots', 'Lot Size'],
  entry: ['Entry', 'Entry Price', 'قیمت ورود', 'Open', 'Open Price'],
  entryDate: ['Entry Date', 'تاریخ ورود', 'Open Date'],
  entryTime: ['Entry Time', 'زمان ورود', 'Open Time'],
  exitDate: ['Exit Date', 'تاریخ خروج', 'Close Date', 'Exit'],
  exitTime: ['Exit Time', 'زمان خروج', 'Close Time'],
  close: ['Close', 'Close Price', 'قیمت خروج', 'Exit Price', 'Exit', 'Close Price (USDT)'],
  sl: ['SL', 'Stop Loss', 'حد ضرر', 'Stop', 'Stop Price', 'Stop Loss Price', 'SL Price', 'Stop-Loss'],
  tp: ['TP', 'Take Profit', 'حد سود', 'TP Price', 'Take Profit Price', 'Take-Profit'],
  leverage: ['Lev', 'Leverage', 'اهرم'],
  fee: ['Fee', 'کارمزد', 'Commission', 'Trading Fee'],
  entryFee: ['Entry Fee', 'کارمزد ورود', 'Fee Entry', 'Maker Fee', 'Entry Commission', 'Commission (Open)', 'Open Commission', 'Commission Open'],
  exitFee: ['Exit Fee', 'کارمزد خروج', 'Fee Exit', 'Taker Fee', 'Exit Commission', 'Commission (Close)', 'Close Commission', 'Commission Close'],
  fundingFee: ['Funding Fee', 'Funding', 'Funding Fees', 'Funding Cost', 'Funding Rate', 'سواپ', 'Swap', 'Rollover', 'Overnight'],
  strategy: ['Strategy', 'استراتژی'],
  emotion: ['Emotion', 'احساس'],
  notes: ['Notes', 'یادداشت', 'Comment', 'Comments'],
  pips: ['Pips', 'Pip', 'Pip Result', 'Pip Gain', 'Pip Loss']
};

const HEADER_KEY_CACHE = new WeakMap();

function normalizeHeaderKey(key) {
  return String(key ?? '')
    .trim()
    .toLowerCase()
    .replace(/\u200c/g, '')
    .replace(/[()]/g, '')
    .replace(/[\s\-_]+/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '');
}

function mapRowKeys(row) {
  if (!row || typeof row !== 'object') return {};
  const cached = HEADER_KEY_CACHE.get(row);
  if (cached) return cached;
  const map = {};
  Object.keys(row).forEach((rawKey) => {
    const normalized = normalizeHeaderKey(rawKey);
    if (!normalized) return;
    const existing = map[normalized];
    const value = row[rawKey];
    if (existing === undefined || existing === '') {
      map[normalized] = value;
    }
  });
  HEADER_KEY_CACHE.set(row, map);
  return map;
}

const EXPORT_HEADERS = {
  index: '#',
  symbol: 'Symbol',
  exchange: 'Exchange',
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
  entryFee: 'Entry Fee',
  exitFee: 'Exit Fee',
  fundingFee: 'Funding Fee',
  fee: 'Fee',
  pnl: 'PNL',
  pips: 'Pips',
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
  const fallback = TRANSLATION_FALLBACKS[state.currentLang]?.[key];
  if (typeof fallback === "string") {
    return fallback.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? ""));
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

function ensureToastContainer() {
  if (toastState.container) return toastState.container;
  const host = document.createElement('div');
  host.className = 'toast-host';
  document.body.appendChild(host);
  toastState.container = host;
  return host;
}

function showToast(message, { type = 'error', timeout = 3200 } = {}) {
  const host = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = convertDigits(message || '');
  host.appendChild(toast);
  const remove = () => {
    toast.classList.add('toast--closing');
    setTimeout(() => toast.remove(), 360);
  };
  toast.addEventListener('click', remove);
  setTimeout(remove, timeout);
}

function updateTelegramUi() {
  const connected = Boolean(state.telegramUserId);
  if (refs.telegramConnectButton) {
    const key = connected ? 'settings.telegram.buttonConnected' : 'settings.telegram.buttonConnect';
    const label = t(key);
    const fallback = connected ? 'Connected' : 'Connect';
    refs.telegramConnectButton.textContent = convertDigits(typeof label === 'string' ? label : fallback);
    refs.telegramConnectButton.classList.toggle('btn--connected', connected);
  }
  if (refs.telegramStatusNote) {
    const key = connected ? 'settings.telegram.status.connected' : 'settings.telegram.status.disconnected';
    let message = t(key);
    const fallbackConnected = `Saved user ID: ${state.telegramUserId || ''}`;
    if (connected) {
      if (typeof message === 'string') {
        message = message.replace('{id}', convertDigits(state.telegramUserId || ''));
      } else {
        message = fallbackConnected;
      }
    }
    const fallback = connected ? fallbackConnected : 'Not connected yet';
    refs.telegramStatusNote.textContent = convertDigits(typeof message === 'string' ? message : fallback);
  }
  if (detailsModal.sendButton) {
    detailsModal.sendButton.hidden = !connected;
    if (!connected) detailsModal.sendButton.removeAttribute('disabled');
  }
}

function applyTelegramUserId(value, { notify = true } = {}) {
  const previous = state.telegramUserId;
  state.telegramUserId = value;
  if (value) {
    localStorage.setItem(state.telegramUserIdKey, value);
  } else {
    localStorage.removeItem(state.telegramUserIdKey);
  }
  updateTelegramUi();
  updateExportModalState();
  if (!notify) return;
  if (value && !previous) setStatus('status.telegramConnected');
  else if (value && previous && value !== previous) setStatus('status.telegramUserUpdated');
}

function refreshOnlineStatus() {
  state.isOnline = typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  updateExportModalState();
}

function buildTradeDetailRows(trade) {
  if (!trade) return [];
  return TRADE_DETAIL_FIELDS.filter((field) => {
    if (Array.isArray(field.modes) && !field.modes.includes(state.currentMode)) return false;
    return true;
  }).map((field) => {
    const labelKey = (field.key === 'volume' && isForexMode())
      ? 'modals.details.fields.volumeForex'
      : field.labelKey;
    const rawLabel = t(labelKey);
    const label = typeof rawLabel === 'string' ? rawLabel : field.labelKey;
    const rawValue = typeof field.getter === 'function' ? field.getter(trade) : trade[field.key];
    const value = formatDetailCellValue(rawValue);
    return { key: field.key, label: convertDigits(label), value };
  }).filter((row) => row.value !== undefined);
}

function formatDetailCellValue(value) {
  if (value === null || value === undefined) return convertDigits('-');
  if (typeof value === 'string') return convertDigits(value || '-');
  if (typeof value === 'number') return convertDigits(formatNumber(value));
  return convertDigits(String(value));
}

function renderTradeDetailRows(trade) {
  if (!detailsModal.list) return;
  const rows = buildTradeDetailRows(trade);
  detailsModal.list.innerHTML = '';
  if (!rows.length) {
    detailsModal.list.style.display = 'none';
    return;
  }
  detailsModal.list.style.display = '';
  rows.forEach(({ label, value }) => {
    const row = document.createElement('div');
    row.className = 'modal-details__row';
    const labelEl = document.createElement('span');
    labelEl.className = 'modal-details__label';
    labelEl.textContent = label;
    const valueEl = document.createElement('p');
    valueEl.className = 'modal-details__value';
    valueEl.textContent = value;
    row.appendChild(labelEl);
    row.appendChild(valueEl);
    detailsModal.list.appendChild(row);
  });
}

function buildTradeDetailsMessage(trade) {
  if (!trade) return '';

  const dash = convertDigits('-');
  const labelText = (key, fallback) => {
    const raw = t(key);
    return convertDigits(typeof raw === 'string' ? raw : fallback);
  };
  const makeRow = (labelKey, fallback, value) => {
    const label = labelText(labelKey, fallback);
    const safeValue = hasValue(value) || value === 0 ? value : dash;
    return { label, value: convertDigits(safeValue) };
  };
  const formatNumberOrDash = (value, options) => (hasValue(value) ? formatNumber(value, options) : '-');
  const formatPercentOrDash = (value, options) => (Number.isFinite(value) ? formatPercent(value, options) : '-');

  const overviewRows = [
    makeRow('modals.details.fields.symbol', 'Symbol', trade.symbol),
    makeRow('modals.details.fields.exchange', 'Exchange', trade.exchange),
    makeRow(
      'modals.details.fields.side',
      'Side',
      (trade.marketType === 'Futures' || trade.marketType === 'Forex') && hasValue(trade.side) ? getSideLabel(trade.side) : '-'
    ),
    makeRow('modals.details.fields.timeframe', 'Timeframe', trade.timeframe),
    makeRow('modals.details.fields.orderType', 'Order Type', hasValue(trade.orderType) ? getOrderTypeLabel(trade.orderType) : '-')
  ];

  const entryExitRows = [
    makeRow('modals.details.fields.entryPrice', 'Entry Price', hasValue(trade.entry) ? formatTradePrice(trade, trade.entry) : '-'),
    makeRow('modals.details.fields.entryDate', 'Entry Date', trade.entryDate),
    makeRow('modals.details.fields.entryTime', 'Entry Time', trade.entryTime),
    makeRow('modals.details.fields.closePrice', 'Exit Price', hasValue(trade.close) ? formatTradePrice(trade, trade.close) : '-'),
    makeRow('modals.details.fields.exitDate', 'Exit Date', trade.exitDate),
    makeRow('modals.details.fields.exitTime', 'Exit Time', trade.exitTime),
    makeRow('modals.details.fields.sl', 'Stop Loss', hasValue(trade.sl) ? formatTradePrice(trade, trade.sl) : '-'),
    makeRow('modals.details.fields.tp', 'Take Profit', hasValue(trade.tp) ? formatTradePrice(trade, trade.tp) : '-')
  ];

  const totalFeeValue = getTotalFee(trade);
  const statsRows = [
    makeRow(
      trade.marketType === 'Forex' ? 'modals.details.fields.volumeForex' : 'modals.details.fields.volume',
      'Size',
      formatNumberOrDash(trade.volume)
    ),
    makeRow(
      'modals.details.fields.leverage',
      'Leverage',
      (trade.marketType === 'Futures' || trade.marketType === 'Forex') && hasValue(trade.leverage)
        ? formatNumber(trade.leverage, { maximumFractionDigits: 2 })
        : '-'
    ),
    makeRow('modals.details.fields.fee', 'Total Fee', formatNumber(totalFeeValue)),
    makeRow('modals.details.fields.pnlNet', 'Net PNL', formatNumberOrDash(trade.pnl?.net)),
    makeRow('modals.details.fields.pnlPct', 'PNL %', formatPercentOrDash(trade.pnl?.pct))
  ];
  if (trade.marketType === 'Forex') {
    statsRows.push(
      makeRow('modals.details.fields.pnlPips', 'Pips', Number.isFinite(trade.pnl?.pips) ? formatNumber(trade.pnl.pips, { maximumFractionDigits: 1 }) : '-')
    );
  }

  const sections = [
    { emoji: '🧾', titleKey: 'modals.details.title', fallback: 'Trade Overview', rows: overviewRows },
    { emoji: '🎯', titleKey: 'modals.details.sectionEntryExit', fallback: 'Entry & Exit', rows: entryExitRows },
    { emoji: '💰', titleKey: 'modals.details.sectionStats', fallback: 'Performance', rows: statsRows }
  ];

  const lines = [];
  sections.forEach((section) => {
    if (!section.rows || !section.rows.length) return;
    if (lines.length) lines.push('');
    const title = labelText(section.titleKey, section.fallback);
    lines.push(`${section.emoji} ${title}`);
    section.rows.forEach((row) => {
      lines.push(`${row.label}: ${row.value}`);
    });
  });

  const extraLines = [];
  if (hasValue(trade?.strategy)) {
    const label = labelText('modals.strategy', 'Strategy');
    extraLines.push(`🧠 ${label}: ${convertDigits(trade.strategy)}`);
  }
  if (hasValue(trade?.emotion)) {
    const label = labelText('modals.emotion', 'Emotion');
    extraLines.push(`🧭 ${label}: ${convertDigits(trade.emotion)}`);
  }
  if (hasValue(trade?.notes)) {
    const label = labelText('modals.notes', 'Notes');
    extraLines.push(`📝 ${label}: ${convertDigits(trade.notes)}`);
  }
  if (extraLines.length) {
    if (lines.length) lines.push('');
    extraLines.forEach((line) => lines.push(line));
  }

  let message = lines.join('\n').trim();
  if (!message) {
    const fallback = labelText('modals.details.emptyMessage', 'Trade details');
    message = `${fallback}\n${JSON.stringify(trade ?? {}, null, 2)}`;
  }
  return convertDigits(message, state.digitsMode).trim();
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

function normalizeFeeValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getEntryFee(trade) {
  if (!trade) return 0;
  const parsed = normalizeFeeValue(trade.entryFee);
  return parsed ?? 0;
}

function getExitFee(trade) {
  if (!trade) return 0;
  const parsed = normalizeFeeValue(trade.exitFee);
  return parsed ?? 0;
}

function getFundingFee(trade) {
  if (!trade) return 0;
  const parsed = normalizeFeeValue(trade.fundingFee);
  return parsed ?? 0;
}

function getTotalFee(trade) {
  const entry = getEntryFee(trade);
  const exit = getExitFee(trade);
  const funding = getFundingFee(trade);
  const total = entry + exit + funding;
  if (total !== 0) return total;
  if (trade && hasValue(trade.fee)) {
    const fallback = Number(trade.fee);
    return Number.isFinite(fallback) ? fallback : 0;
  }
  return 0;
}

function setFeeHiddenValues(entry, exit, funding = '') {
  let entryStr = sanitizeDecimalInput(entry);
  let exitStr = sanitizeDecimalInput(exit);
  let fundingStr = sanitizeDecimalInput(funding);
  if (parseDecimalToBigInt(entryStr).value === 0n) entryStr = '';
  if (parseDecimalToBigInt(exitStr).value === 0n) exitStr = '';
  if (parseDecimalToBigInt(fundingStr).value === 0n) fundingStr = '';
  if (refs.entryFeeHidden) refs.entryFeeHidden.value = entryStr;
  if (refs.exitFeeHidden) refs.exitFeeHidden.value = exitStr;
  if (refs.fundingFeeHidden) refs.fundingFeeHidden.value = fundingStr;
  updateFeeDisplay();
}

function updateFeeDisplay() {
  if (!refs.feeDisplay) return;
  const entryRaw = sanitizeDecimalInput(refs.entryFeeHidden?.value);
  const exitRaw = sanitizeDecimalInput(refs.exitFeeHidden?.value);
  const fundingRaw = sanitizeDecimalInput(refs.fundingFeeHidden?.value);
  const hasAny = Boolean(entryRaw) || Boolean(exitRaw) || Boolean(fundingRaw);
  if (!hasAny) {
    refs.feeDisplay.value = '';
    refs.feeDisplay.dataset.total = '';
    if (refs.feeDisplay.dataset.entry) delete refs.feeDisplay.dataset.entry;
    if (refs.feeDisplay.dataset.exit) delete refs.feeDisplay.dataset.exit;
    if (refs.feeDisplay.dataset.funding) delete refs.feeDisplay.dataset.funding;
    return;
  }
  const subtotal = addDecimalStrings(entryRaw || '0', exitRaw || '0');
  const totalStr = addDecimalStrings(subtotal, fundingRaw || '0');
  refs.feeDisplay.dataset.total = totalStr;
  refs.feeDisplay.dataset.entry = entryRaw || '';
  refs.feeDisplay.dataset.exit = exitRaw || '';
  refs.feeDisplay.dataset.funding = fundingRaw || '';
  refs.feeDisplay.value = convertDigits(totalStr);
}

function updateFeeModalTotal() {
  if (!feeModal.total) return;
  const entry = sanitizeDecimalInput(feeModal.entry?.value || '');
  const exit = sanitizeDecimalInput(feeModal.exit?.value || '');
  const funding = sanitizeDecimalInput(feeModal.funding?.value || '');
  const hasAny = Boolean(entry) || Boolean(exit) || Boolean(funding);
  const subtotal = addDecimalStrings(entry || '0', exit || '0');
  const totalStr = hasAny ? addDecimalStrings(subtotal, funding || '0') : '0';
  feeModal.total.textContent = convertDigits(totalStr);
}

function openFeeModal() {
  if (!ensureFeeModal()) return;
  const entryValue = refs.entryFeeHidden?.value || '';
  const exitValue = refs.exitFeeHidden?.value || '';
  const fundingValue = refs.fundingFeeHidden?.value || '';
  const isFutures = isFuturesSelected();
  feeModal.previous = {
    entry: entryValue,
    exit: exitValue,
    funding: fundingValue
  };
  if (feeModal.entry) feeModal.entry.value = convertDigits(entryValue);
  if (feeModal.exit) feeModal.exit.value = convertDigits(exitValue);
  if (feeModal.funding) {
    feeModal.funding.value = convertDigits(isFutures ? fundingValue : '');
    feeModal.funding.disabled = !isFutures;
  }
  if (feeModal.fundingWrapper) {
    feeModal.fundingWrapper.hidden = !isFutures;
  }
  updateFeeModalTotal();
  feeModal.container.hidden = false;
  requestAnimationFrame(() => feeModal.container.classList.add('modal--open'));
  feeModalOpen = true;
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  feeModal.entry?.focus();
}

function closeFeeModal(save) {
  if (!feeModalOpen || !feeModal.container) return;
  feeModal.container.classList.remove('modal--open');
  feeModalOpen = false;
  setTimeout(() => {
    if (!feeModalOpen && feeModal.container) feeModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!modalIsOpen && !deleteModalOpen && !clearModalOpen) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  const isFutures = isFuturesSelected();
  if (save) {
    const entry = sanitizeDecimalInput(feeModal.entry?.value || '');
    const exit = sanitizeDecimalInput(feeModal.exit?.value || '');
    const funding = isFutures ? sanitizeDecimalInput(feeModal.funding?.value || '') : '';
    setFeeHiddenValues(entry, exit, funding);
  } else {
    if (feeModal.entry) feeModal.entry.value = convertDigits(feeModal.previous?.entry || '');
    if (feeModal.exit) feeModal.exit.value = convertDigits(feeModal.previous?.exit || '');
    if (feeModal.funding) {
      const prevFunding = isFutures ? feeModal.previous?.funding || '' : '';
      feeModal.funding.value = convertDigits(prevFunding);
    }
    updateFeeModalTotal();
    updateFeeDisplay();
  }
  if (feeModal.funding) feeModal.funding.disabled = !isFutures;
  if (feeModal.fundingWrapper) feeModal.fundingWrapper.hidden = !isFutures;
  requestAnimationFrame(() => refs.feeDisplay?.focus());
}

function initFeeModal() {
  feeModal.container = document.getElementById("feeModal");
  feeModal.backdrop = feeModal.container?.querySelector(".modal__backdrop");
  feeModal.close = document.getElementById("feeModalClose");
  feeModal.form = document.getElementById("feeModalForm");
  feeModal.entry = document.getElementById("modalEntryFee");
  feeModal.exit = document.getElementById("modalExitFee");
  feeModal.funding = document.getElementById("modalFundingFee");
  feeModal.total = document.getElementById("feeModalTotal");
  feeModal.cancel = feeModal.container?.querySelector("[data-fee-action='cancel']");
  feeModal.fundingWrapper = feeModal.container?.querySelector("[data-fee-funding]");
  if (!feeModal.container || feeModal.container.dataset.initialized) return;
  sanitizeNumericInput(feeModal.entry);
  sanitizeNumericInput(feeModal.exit);
  sanitizeNumericInput(feeModal.funding);
  feeModal.entry?.addEventListener('input', updateFeeModalTotal);
  feeModal.exit?.addEventListener('input', updateFeeModalTotal);
  feeModal.funding?.addEventListener('input', updateFeeModalTotal);
  feeModal.backdrop?.addEventListener('click', () => closeFeeModal(false));
  feeModal.close?.addEventListener('click', () => closeFeeModal(false));
  feeModal.cancel?.addEventListener('click', () => closeFeeModal(false));
  feeModal.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    closeFeeModal(true);
  });
  if (feeModal.total) feeModal.total.textContent = convertDigits('0');
  const isFutures = isFuturesSelected();
  if (feeModal.fundingWrapper) feeModal.fundingWrapper.hidden = !isFutures;
  if (feeModal.funding) {
    feeModal.funding.disabled = !isFutures;
    if (!isFutures) feeModal.funding.value = '';
  }
  feeModal.container.dataset.initialized = 'true';
}

function ensureFeeModal() {
  if (!feeModal.container) initFeeModal();
  return Boolean(feeModal.container);
}

function openDeleteModal() {
  if (!ensureDeleteModal()) return;
  deleteModal.container.hidden = false;
  requestAnimationFrame(() => deleteModal.container.classList.add('modal--open'));
  deleteModalOpen = true;
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  deleteModal.confirm?.focus();
}

function closeDeleteModal(save) {
  if (!deleteModalOpen || !deleteModal.container) return;
  deleteModal.container.classList.remove('modal--open');
  deleteModalOpen = false;
  setTimeout(() => {
    if (!deleteModalOpen && deleteModal.container) deleteModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!modalIsOpen && !feeModalOpen && !clearModalOpen) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  if (save && pendingDeleteId) {
    handleDelete(pendingDeleteId);
  }
  pendingDeleteId = null;
}

function initDeleteModal() {
  deleteModal.container = document.getElementById("deleteModal");
  deleteModal.backdrop = deleteModal.container?.querySelector(".modal__backdrop");
  deleteModal.close = document.getElementById("deleteModalClose");
  deleteModal.cancel = deleteModal.container?.querySelector("[data-delete-action='cancel']");
  deleteModal.confirm = deleteModal.container?.querySelector("[data-delete-action='confirm']");
  deleteModal.title = document.getElementById("deleteModalTitle");
  deleteModal.description = deleteModal.container?.querySelector(".modal-delete__description");
  if (!deleteModal.container || deleteModal.container.dataset.initialized) return;
  deleteModal.backdrop?.addEventListener('click', () => closeDeleteModal(false));
  deleteModal.close?.addEventListener('click', () => closeDeleteModal(false));
  deleteModal.cancel?.addEventListener('click', () => closeDeleteModal(false));
  deleteModal.confirm?.addEventListener('click', () => closeDeleteModal(true));
  deleteModal.container.dataset.initialized = 'true';
}

function ensureDeleteModal() {
  if (!deleteModal.container) initDeleteModal();
  return Boolean(deleteModal.container);
}

function openClearModal() {
  if (!ensureClearModal()) return;
  const titleText = t('modals.clear.title');
  if (clearModal.title && typeof titleText === 'string') clearModal.title.textContent = convertDigits(titleText);
  const descText = t('modals.clear.description');
  if (clearModal.description && typeof descText === 'string') clearModal.description.textContent = convertDigits(descText);
  clearModal.container.hidden = false;
  requestAnimationFrame(() => clearModal.container.classList.add('modal--open'));
  clearModalOpen = true;
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  clearModal.confirm?.focus();
}

function closeClearModal(save) {
  if (!clearModalOpen || !clearModal.container) return;
  clearModal.container.classList.remove('modal--open');
  clearModalOpen = false;
  setTimeout(() => {
    if (!clearModalOpen && clearModal.container) clearModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!modalIsOpen && !feeModalOpen && !deleteModalOpen) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  if (save) performClearAll();
  requestAnimationFrame(() => refs.clearAll?.focus());
}

function initClearModal() {
  clearModal.container = document.getElementById('clearModal');
  clearModal.backdrop = clearModal.container?.querySelector('.modal__backdrop');
  clearModal.close = document.getElementById('clearModalClose');
  clearModal.cancel = clearModal.container?.querySelector('[data-clear-action="cancel"]');
  clearModal.confirm = clearModal.container?.querySelector('[data-clear-action="confirm"]');
  clearModal.title = document.getElementById('clearModalTitle');
  clearModal.description = clearModal.container?.querySelector('.modal-delete__description');
  if (!clearModal.container || clearModal.container.dataset.initialized) return;
  clearModal.backdrop?.addEventListener('click', () => closeClearModal(false));
  clearModal.close?.addEventListener('click', () => closeClearModal(false));
  clearModal.cancel?.addEventListener('click', () => closeClearModal(false));
  clearModal.confirm?.addEventListener('click', () => closeClearModal(true));
  clearModal.container.dataset.initialized = 'true';
}

function ensureClearModal() {
  if (!clearModal.container) initClearModal();
  return Boolean(clearModal.container);
}

function refreshFeeRefs() {
  refs.feeDisplay = document.getElementById("fee");
  refs.entryFeeHidden = document.getElementById("entryFee");
  refs.exitFeeHidden = document.getElementById("exitFee");
  refs.fundingFeeHidden = document.getElementById("fundingFee");
}

function askDelete(id) {
  pendingDeleteId = id;
  openDeleteModal();
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
    label: getMarketLabel(market === 'Forex' ? 'Forex' : market === 'Futures' ? 'Futures' : 'Spot')
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

function updateDatalistOptions() {
  if (!datalistRefs.symbols) return;
  const baseSymbols = collectUniqueTextValues('symbol');
  const defaults = isForexMode() ? DEFAULT_FOREX_SYMBOLS : [];
  const mergedSymbols = Array.from(new Set([...(defaults || []), ...(baseSymbols || [])]));
  setDatalistOptions(datalistRefs.symbols, mergedSymbols);
  setDatalistOptions(datalistRefs.exchanges, collectUniqueTextValues('exchange'));
  setDatalistOptions(datalistRefs.timeframes, collectUniqueTextValues('timeframe'));
  setDatalistOptions(datalistRefs.leverage, collectUniqueNumericValues('leverage'));
  setDatalistOptions(datalistRefs.strategies, collectUniqueTextValues('strategy'));
}

function resolveMode(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === MODES.FOREX) return MODES.FOREX;
  return MODES.CRYPTO;
}

function applyModeState(mode, { persist = true } = {}) {
  const next = resolveMode(mode);
  state.currentMode = next;
  state.storageKey = getStorageKeyForMode(next);
  state.pnlDisplayKey = getPnlDisplayKeyForMode(next);
  document.documentElement.setAttribute('data-mode', next);
  if (persist) {
    localStorage.setItem(state.modeKey, next);
  }
  if (refs.modeSelect) refs.modeSelect.value = next;
}

function loadPnlDisplayMode() {
  const saved = localStorage.getItem(state.pnlDisplayKey);
  const valid = isForexMode()
    ? (saved === 'pips' ? 'pips' : 'net')
    : (saved === 'pct' ? 'pct' : 'net');
  state.pnlDisplayMode = valid;
  if (refs.pnlDisplaySelect) refs.pnlDisplaySelect.value = state.pnlDisplayMode;
}

function setMode(mode, { persist = true, refresh = true } = {}) {
  const previous = state.currentMode;
  applyModeState(mode, { persist });
  if (!refresh) return;
  loadPnlDisplayMode();
  updatePnlDisplayOptionsForMode();
  applyModeToForm();
  updateFormLabelsForMode();
  updateInsightsLabelsForMode();
  updateTableLabelsForMode();
  updateMetricLabelsForMode();
  refreshModalTranslations();
  updateDatalistOptions();
  if (previous !== state.currentMode) {
    resetFormContent();
  }
  loadTrades();
  state.currentPage = 1;
  render();
  updateFeeDisplay();
  updateFeeModalTotal();
}

function refreshModalTranslations() {
  const feeTitle = document.getElementById('feeModalTitle');
  const feeDescriptionEl = document.querySelector('.modal-fee__description');
  const feeEntryLabel = document.querySelector('.modal-fee__field span.modal-fee__label');
  const feeExitLabel = document.querySelectorAll('.modal-fee__field span.modal-fee__label')[1];
  const feeFundingLabel = document.querySelector('[data-fee-funding] .modal-fee__label');
  const feeEntryInput = document.getElementById('modalEntryFee');
  const feeExitInput = document.getElementById('modalExitFee');
  const feeFundingInput = document.getElementById('modalFundingFee');
  const feeTotalLabel = document.querySelector('.modal-fee__summary-label');
  const feeCancelBtn = document.querySelector('[data-fee-action="cancel"]');
  const feeSaveBtn = document.querySelector('#feeModalForm .btn.primary');

  const deleteTitle = document.getElementById('deleteModalTitle');
  const deleteDescription = document.querySelector('#deleteModal .modal-delete__description');
  const deleteCancelBtn = document.querySelector('[data-delete-action="cancel"]');
  const deleteConfirmBtn = document.querySelector('[data-delete-action="confirm"]');

  const clearTitle = document.getElementById('clearModalTitle');
  const clearDescription = document.querySelector('#clearModal .modal-delete__description');
  const clearCancelBtn = document.querySelector('[data-clear-action="cancel"]');
  const clearConfirmBtn = document.querySelector('[data-clear-action="confirm"]');

  const isFx = isForexMode();
  const entryKey = isFx ? 'modals.fee.entryLabelForex' : 'modals.fee.entryLabel';
  const exitKey = isFx ? 'modals.fee.exitLabelForex' : 'modals.fee.exitLabel';
  const fundingKey = isFx ? 'modals.fee.fundingLabelForex' : 'modals.fee.fundingLabel';
  if (feeTitle) feeTitle.textContent = convertDigits(t('modals.fee.title') || 'Split Trading Fees');
  if (feeDescriptionEl) feeDescriptionEl.textContent = convertDigits(t('modals.fee.description') || 'Track entry and exit fees separately. Leave a field blank if it does not apply.');
  if (feeEntryLabel) feeEntryLabel.textContent = convertDigits(t(entryKey) || 'Entry Fee');
  if (feeExitLabel) feeExitLabel.textContent = convertDigits(t(exitKey) || 'Exit Fee');
  if (feeFundingLabel) feeFundingLabel.textContent = convertDigits(t(fundingKey) || 'Funding Fee');
  const entryPlaceholder = convertDigits(t('modals.fee.entryPlaceholder') || '0');
  const exitPlaceholder = convertDigits(t('modals.fee.exitPlaceholder') || '0');
  const fundingPlaceholder = convertDigits(t('modals.fee.fundingPlaceholder') || '0');
  if (feeEntryInput) feeEntryInput.placeholder = entryPlaceholder;
  if (feeExitInput) feeExitInput.placeholder = exitPlaceholder;
  if (feeFundingInput) feeFundingInput.placeholder = fundingPlaceholder;
  if (feeTotalLabel) feeTotalLabel.textContent = convertDigits(t('modals.fee.totalLabel') || 'Total Fee');
  if (feeCancelBtn) feeCancelBtn.textContent = convertDigits(t('common.cancel') || 'Cancel');
  if (feeSaveBtn) feeSaveBtn.textContent = convertDigits(t('common.save') || 'Save');

  if (deleteTitle) deleteTitle.textContent = convertDigits(t('modals.delete.title') || 'Delete trade?');
  if (deleteDescription) deleteDescription.textContent = convertDigits(t('modals.delete.description') || 'This action cannot be undone. Are you sure?');
  if (deleteCancelBtn) deleteCancelBtn.textContent = convertDigits(t('common.cancel') || 'Cancel');
  if (deleteConfirmBtn) deleteConfirmBtn.textContent = convertDigits(t('common.delete') || 'Delete');

  if (clearTitle) clearTitle.textContent = convertDigits(t('modals.clear.title') || 'Clear all trades?');
  if (clearDescription) clearDescription.textContent = convertDigits(t('modals.clear.description') || 'All saved trades will be removed permanently. Continue?');
  if (clearCancelBtn) clearCancelBtn.textContent = convertDigits(t('common.cancel') || 'Cancel');
  if (clearConfirmBtn) clearConfirmBtn.textContent = convertDigits(t('common.clearAll') || 'Clear All');

  const deviceTitle = document.getElementById('deviceWarningTitle');
  const deviceDescription = document.querySelector('.device-modal__description');
  const deviceAction = document.querySelector('[data-device-action="close"]');
  if (deviceTitle) deviceTitle.textContent = convertDigits(t('modals.deviceWarning.title') || deviceTitle.textContent || 'JournalX is not stable on mobile yet');
  if (deviceDescription) deviceDescription.textContent = convertDigits(t('modals.deviceWarning.description') || deviceDescription.textContent || 'Please switch to the desktop version for the best experience.');
  if (deviceAction) deviceAction.textContent = convertDigits(t('modals.deviceWarning.action') || deviceAction.textContent || 'Understood');

  const updateTitle = document.getElementById('updateModalTitle');
  const updateDescription = document.querySelector('.modal-update__description');
  const updateCancel = document.querySelector('[data-update-action="cancel"]');
  const updateConfirm = document.querySelector('[data-update-action="confirm"]');
  if (updateTitle) updateTitle.textContent = convertDigits(t('modals.update.title') || updateTitle.textContent || 'JournalX Update');
  if (updateDescription) updateDescription.textContent = convertDigits(t('modals.update.description') || updateDescription.textContent || 'Updating will remove all saved data. Please back up first.');
  if (updateCancel) updateCancel.textContent = convertDigits(t('common.cancel') || updateCancel.textContent || 'Cancel');
  if (updateConfirm) updateConfirm.textContent = convertDigits(t('modals.update.confirm') || updateConfirm.textContent || 'Update now');
}

function collectUniqueTextValues(key) {
  const map = new Map();
  state.trades.forEach((trade) => {
    const raw = trade[key];
    if (!hasValue(raw)) return;
    const text = convertDigits(String(raw).trim(), 'en');
    if (!text) return;
    const normalized = text.toLowerCase();
    if (!map.has(normalized)) map.set(normalized, text);
  });
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

function collectUniqueNumericValues(key) {
  const map = new Map();
  state.trades.forEach((trade) => {
    const raw = trade[key];
    if (!hasValue(raw)) return;
    const text = sanitizeDecimalInput(raw);
    if (!text) return;
    if (!map.has(text)) map.set(text, text);
  });
  return Array.from(map.values()).sort((a, b) => Number(a) - Number(b));
}

function setDatalistOptions(list, values) {
  if (!list) return;
  list.innerHTML = '';
  const fragment = document.createDocumentFragment();
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = convertDigits(value);
    fragment.appendChild(option);
  });
  list.appendChild(fragment);
}

function parseDateParts(raw) {
  if (!raw) return null;
  const value = convertDigits(raw, 'en').replace(/\u200c/g, '').trim();
  if (!value) return null;
  const parts = value.match(/\d+/g);
  if (!parts || parts.length < 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function parseTimeParts(raw) {
  if (!raw) return null;
  const value = convertDigits(raw, 'en').replace(/\u200c/g, '').trim();
  if (!value) return null;
  const parts = value.match(/\d+/g);
  if (!parts || !parts.length) return null;
  const [hourStr, minuteStr = '0', secondStr = '0'] = parts;
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return null;
  const safeMinute = Number.isFinite(minute) ? Math.min(Math.max(minute, 0), 59) : 0;
  const safeSecond = Number.isFinite(second) ? Math.min(Math.max(second, 0), 59) : 0;
  return { hour, minute: safeMinute, second: safeSecond };
}

function makeTimestamp(dateParts, timeParts) {
  if (!dateParts) return null;
  const { year, month, day } = dateParts;
  const { hour = 0, minute = 0, second = 0 } = timeParts || {};
  const candidate = new Date(year, month - 1, day, hour, minute, second);
  if (!Number.isFinite(candidate.getTime())) return null;
  if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return null;
  return candidate.getTime();
}

function computeCreatedAtFromTrade(trade, fallback = Date.now()) {
  if (!trade) return fallback;
  const entryDateParts = parseDateParts(trade.entryDate);
  const entryTimeParts = parseTimeParts(trade.entryTime);
  const entryTimestamp = makeTimestamp(entryDateParts, entryTimeParts);
  if (entryTimestamp !== null) return entryTimestamp;

  const exitDateParts = parseDateParts(trade.exitDate);
  const exitTimeParts = parseTimeParts(trade.exitTime);
  const exitTimestamp = makeTimestamp(exitDateParts, exitTimeParts);
  if (exitTimestamp !== null) return exitTimestamp;

  return Number.isFinite(fallback) ? fallback : Date.now();
}

function buildTradeHaystack(trade) {
  const values = [
    trade.symbol, trade.exchange, trade.marketType, trade.side,
    trade.timeframe, trade.orderType, trade.strategy, trade.emotion, trade.notes,
    trade.entryDate, trade.entryTime, trade.exitDate, trade.exitTime,
    trade.volume, trade.entry, trade.close,
    getEntryFee(trade), getExitFee(trade), getTotalFee(trade),
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
  const next = isForexMode()
    ? (mode === "pips" ? "pips" : "net")
    : (mode === "pct" ? "pct" : "net");
  state.pnlDisplayMode = next;
  localStorage.setItem(state.pnlDisplayKey, next);
  if (refs.pnlDisplaySelect) refs.pnlDisplaySelect.value = next;
  updateMetricLabelsForMode();
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
  updateFeeDisplay();
  updateFeeModalTotal();
}

async function loadTranslations(lang) {
  if (state.loadedTranslations[lang]) {
    return state.loadedTranslations[lang];
  }
  const response = await fetch(`assets/i18n/${lang}.json?v=${RUNTIME_ASSET_SEED}`);
  if (!response.ok) throw new Error("Failed to load translations");
  const data = await response.json();
  state.loadedTranslations[lang] = data;
  return data;
}

function applyTranslations() {
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const translation = t(key);
    if (typeof translation === "string" && translation !== key) {
      el.textContent = convertDigits(translation);
    }
  });

  $$("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    const translation = t(key);
    if (typeof translation === "string" && translation !== key) {
      el.setAttribute("placeholder", convertDigits(translation));
    }
  });

  updateThemeButton();
  updateFormLabelsForMode();
  updatePnlDisplayOptionsForMode();
  updateInsightsLabelsForMode();
  updateTableLabelsForMode();
  updateMetricLabelsForMode();
  refreshModalTranslations();
  updateTelegramUi();
  updateExportModalState();
}

function updateFormLabelsForMode() {
  const isFx = isForexMode();
  const symbolInput = getInput('symbol');
  if (symbolInput) {
    const key = isFx ? 'form.fields.symbol.placeholderForex' : 'form.fields.symbol.placeholder';
    const placeholder = t(key);
    symbolInput.placeholder = convertDigits(typeof placeholder === 'string' ? placeholder : '');
  }
  const exchangeInput = getInput('exchange');
  if (exchangeInput) {
    const key = isFx ? 'form.fields.exchange.placeholderForex' : 'form.fields.exchange.placeholder';
    const placeholder = t(key);
    exchangeInput.placeholder = convertDigits(typeof placeholder === 'string' ? placeholder : '');
  }
  const timeframeInput = getInput('timeframe');
  if (timeframeInput) {
    const key = isFx ? 'form.fields.timeframe.placeholderForex' : 'form.fields.timeframe.placeholder';
    const placeholder = t(key);
    timeframeInput.placeholder = convertDigits(typeof placeholder === 'string' ? placeholder : '');
  }
  const volumeLabel = document.querySelector('label[for="volume"]');
  const feeLabel = document.querySelector('label[for="fee"]');
  const volumeKey = isFx ? 'form.fields.volume.labelForex' : 'form.fields.volume.label';
  const volumePlaceholderKey = isFx ? 'form.fields.volume.placeholderForex' : 'form.fields.volume.placeholder';
  const feeKey = isFx ? 'form.fields.fee.labelForex' : 'form.fields.fee.label';
  const feePlaceholderKey = isFx ? 'form.fields.fee.placeholderForex' : 'form.fields.fee.placeholder';

  if (volumeLabel) {
    const label = t(volumeKey);
    volumeLabel.textContent = convertDigits(typeof label === 'string' ? label : 'Size');
  }
  const volumeInput = getInput('volume');
  if (volumeInput) {
    const placeholder = t(volumePlaceholderKey);
    volumeInput.placeholder = convertDigits(typeof placeholder === 'string' ? placeholder : '');
  }
  if (feeLabel) {
    const label = t(feeKey);
    feeLabel.textContent = convertDigits(typeof label === 'string' ? label : 'Fee');
  }
  const feeInput = getInput('fee');
  if (feeInput) {
    const placeholder = t(feePlaceholderKey);
    feeInput.placeholder = convertDigits(typeof placeholder === 'string' ? placeholder : '');
  }
}

function updateInsightsLabelsForMode() {
  const avgPctLabel = document.querySelector('[data-i18n="insights.summary.avgPct"]');
  if (!avgPctLabel) return;
  if (isForexMode()) {
    const label = t('insights.summary.avgPips');
    avgPctLabel.textContent = convertDigits(typeof label === 'string' ? label : 'Avg Pips');
  } else {
    const label = t('insights.summary.avgPct');
    avgPctLabel.textContent = convertDigits(typeof label === 'string' ? label : 'Avg PNL');
  }
  const marketLabel = document.querySelector('[data-i18n="insights.breakdown.market"]');
  if (marketLabel) {
    if (isForexMode()) {
      const label = t('insights.breakdown.pair');
      marketLabel.textContent = convertDigits(typeof label === 'string' ? label : 'By Pair');
    } else {
      const label = t('insights.breakdown.market');
      marketLabel.textContent = convertDigits(typeof label === 'string' ? label : 'By Market');
    }
  }
}

function updatePnlDisplayOptionsForMode() {
  if (!refs.pnlDisplaySelect) return;
  const select = refs.pnlDisplaySelect;
  const options = isForexMode()
    ? [
        { value: 'net', labelKey: 'settings.pnlDisplay.options.netForex', fallback: 'Money' },
        { value: 'pips', labelKey: 'settings.pnlDisplay.options.pips', fallback: 'Pips' }
      ]
    : [
        { value: 'net', labelKey: 'settings.pnlDisplay.options.net', fallback: 'USDT' },
        { value: 'pct', labelKey: 'settings.pnlDisplay.options.pct', fallback: 'Percent' }
      ];
  select.innerHTML = '';
  options.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.value;
    const label = t(item.labelKey);
    option.textContent = convertDigits(typeof label === 'string' ? label : item.fallback);
    select.appendChild(option);
  });
  if (!options.some((opt) => opt.value === state.pnlDisplayMode)) {
    state.pnlDisplayMode = options[0].value;
    localStorage.setItem(state.pnlDisplayKey, state.pnlDisplayMode);
  }
  select.value = state.pnlDisplayMode;
}

function updateTableLabelsForMode() {
  const volumeHeader = document.querySelector('#tradesTable thead th[data-i18n="table.headers.volume"]');
  const feeHeader = document.querySelector('#tradesTable thead th[data-i18n="table.headers.fee"]');
  if (volumeHeader) {
    const key = isForexMode() ? 'table.headers.volumeForex' : 'table.headers.volume';
    const label = t(key);
    volumeHeader.textContent = convertDigits(typeof label === 'string' ? label : 'Size');
  }
  if (feeHeader) {
    const key = isForexMode() ? 'table.headers.feeForex' : 'table.headers.fee';
    const label = t(key);
    feeHeader.textContent = convertDigits(typeof label === 'string' ? label : 'Fee');
  }
}

function updateMetricLabelsForMode() {
  const netLabel = document.querySelector('[data-i18n="metrics.netPnl.label"]');
  if (!netLabel) return;
  if (isForexMode()) {
    const key = state.pnlDisplayMode === 'pips' ? 'metrics.netPips.label' : 'metrics.netPnlForex.label';
    const label = t(key);
    netLabel.textContent = convertDigits(typeof label === 'string' ? label : 'Net PNL');
  } else {
    const label = t('metrics.netPnl.label');
    netLabel.textContent = convertDigits(typeof label === 'string' ? label : 'Net PNL');
  }
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
    updateFeeDisplay();
    updateFeeModalTotal();
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
    state.trades = stored.map((trade, index) => {
      const item = { ...trade };
      if (!item.id) {
        item.id = window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random());
      }
      if (!item.createdAt) item.createdAt = Date.now();
      const existingOrder = normalizeOrderValue(item.order);
      item.order = existingOrder !== null ? existingOrder : index + 1;
      let entryFee = normalizeFeeValue(item.entryFee);
      let exitFee = normalizeFeeValue(item.exitFee);
      let fundingFee = normalizeFeeValue(item.fundingFee);
      let totalFee = (entryFee ?? 0) + (exitFee ?? 0) + (fundingFee ?? 0);
      if (totalFee === 0) {
        const legacyFee = Number(item.fee);
        if (Number.isFinite(legacyFee) && legacyFee !== 0) {
          totalFee = legacyFee;
          entryFee = legacyFee;
          exitFee = 0;
          fundingFee = 0;
        }
      }
      item.entryFee = entryFee;
      item.exitFee = exitFee;
      item.fundingFee = fundingFee;
      item.fee = totalFee;
      const isDirectional = item.marketType === 'Futures' || item.marketType === 'Forex';
      if (!isDirectional) {
        item.side = null;
        item.leverage = null;
        item.fundingFee = null;
      } else if (!item.side) {
        item.side = 'Long';
      }
      item.pnl = computePNL(item);
      item.closed = isTradeClosed(item);
      return item;
    });
    syncOrderCounter();
  } catch (err) {
    console.error(err);
    state.trades = [];
    syncOrderCounter();
  }
}

function saveTrades() {
  localStorage.setItem(state.storageKey, JSON.stringify(state.trades));
}

function normalizeNumericString(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/,/g, ".").replace(/\s+/g, "");
}

function sanitizeDecimalInput(value) {
  if (value === null || value === undefined) return '';
  let str = typeof value === 'number' ? String(value) : String(value);
  str = convertDigits(str, 'en');
  str = normalizeNumericString(str);
  str = str.replace(/[^0-9.\-]/g, '');
  if (!str) return '';
  if (str === '-' || str === '.') return '';
  if (str.startsWith('+')) str = str.slice(1);
  return str;
}

function parseDecimalToBigInt(value) {
  const sanitized = sanitizeDecimalInput(value);
  if (!sanitized) return { value: 0n, scale: 0 };
  let sign = 1n;
  let text = sanitized;
  if (text.startsWith('-')) {
    sign = -1n;
    text = text.slice(1);
  }
  const parts = text.split('.');
  const intPart = parts[0] || '0';
  const fracPartRaw = parts[1] || '';
  const digits = (intPart === '0' && !fracPartRaw ? '0' : intPart) + fracPartRaw;
  const scale = fracPartRaw.length;
  const big = BigInt(digits || '0');
  return { value: big * sign, scale };
}

function formatBigIntDecimal(bigValue, scale) {
  if (scale === 0) return bigValue.toString();
  const negative = bigValue < 0n;
  let abs = negative ? -bigValue : bigValue;
  const padded = abs.toString().padStart(scale + 1, '0');
  const intPart = padded.slice(0, -scale) || '0';
  let fracPart = padded.slice(-scale);
  fracPart = fracPart.replace(/0+$/, '');
  let result = fracPart ? `${intPart}.${fracPart}` : intPart;
  if (negative && result !== '0') result = `-${result}`;
  return result;
}

function addDecimalStrings(a, b) {
  const values = [a, b];
  let maxScale = 0;
  const parsed = values.map((value) => {
    const parsedValue = parseDecimalToBigInt(value);
    if (parsedValue.scale > maxScale) maxScale = parsedValue.scale;
    return parsedValue;
  });
  if (maxScale === 0) {
    const total = parsed.reduce((acc, item) => acc + item.value, 0n);
    return total.toString();
  }
  const total = parsed.reduce((acc, item) => {
    const factor = 10n ** BigInt(maxScale - item.scale);
    return acc + item.value * factor;
  }, 0n);
  return formatBigIntDecimal(total, maxScale);
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

function toOptionalNumber(value) {
  const sanitized = sanitizeDecimalInput(value);
  if (!sanitized) return null;
  const num = Number(sanitized);
  return Number.isFinite(num) ? num : null;
}

function formatDateInputValue(value) {
  const digits = convertDigits(value || '', 'en').replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`;
  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6)}`;
}

function formatTimeInputValue(value, { finalize = false } = {}) {
  let digits = convertDigits(value || '', 'en').replace(/\D/g, '').slice(0, 6);
  if (!digits) return '';
  let hours = digits.slice(0, 2);
  const minutesRaw = digits.slice(2, 4);
  const secondsRaw = digits.slice(4, 6);

  if (!minutesRaw) {
    if (finalize) {
      hours = hours.padStart(2, '0');
      return `${hours}:00`;
    }
    return hours;
  }

  let minutes = minutesRaw;
  if (finalize) {
    hours = hours.padStart(2, '0');
    minutes = minutes.padEnd(2, '0').slice(0, 2);
  }

  if (!secondsRaw) {
    return finalize ? `${hours}:${minutes}` : `${hours}:${minutes}`;
  }

  let seconds = secondsRaw;
  if (finalize) {
    seconds = seconds.padEnd(2, '0').slice(0, 2);
  }
  return `${hours}:${minutes}:${seconds}`;
}

function normalizeForexSymbol(raw) {
  if (!raw) return '';
  return String(raw).toUpperCase().replace(/\s+/g, '').replace('-', '/');
}

function parseForexPair(symbol) {
  const normalized = normalizeForexSymbol(symbol);
  if (!normalized) return { base: '', quote: '' };
  if (normalized.includes('/')) {
    const [base, quote] = normalized.split('/').map((part) => part.replace(/[^A-Z]/g, ''));
    return { base: base || '', quote: quote || '' };
  }
  const letters = normalized.replace(/[^A-Z]/g, '');
  if (letters.length >= 6) {
    return { base: letters.slice(0, 3), quote: letters.slice(3, 6) };
  }
  return { base: '', quote: '' };
}

function getForexPipSize(symbol) {
  const { quote } = parseForexPair(symbol);
  if (quote === 'JPY') return 0.01;
  return 0.0001;
}

function getForexPriceDecimals(symbol) {
  const { quote } = parseForexPair(symbol);
  return quote === 'JPY' ? 3 : 5;
}

function formatForexPrice(value, symbol) {
  const decimals = getForexPriceDecimals(symbol);
  return formatNumber(value, { maximumFractionDigits: decimals });
}

function isForexTrade(trade) {
  return trade?.marketType === 'Forex';
}

function formatTradePrice(trade, value) {
  if (!Number.isFinite(Number(value))) return "-";
  if (isForexTrade(trade)) return formatForexPrice(value, trade.symbol);
  return formatNumber(value);
}

const NUMERIC_CONTROL_KEYS = new Set(['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter']);
function allowNumericKey(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (NUMERIC_CONTROL_KEYS.has(event.key)) return;
  if (/^[0-9]$/.test(event.key)) return;
  event.preventDefault();
}

function attachDateMask(id) {
  const input = getInput(id);
  if (!input || input.dataset.maskAttached === 'true') return;
  input.addEventListener('keydown', allowNumericKey);
  input.addEventListener('input', () => {
    const formatted = formatDateInputValue(input.value);
    input.value = convertDigits(formatted);
  });
  input.addEventListener('blur', () => {
    const formatted = formatDateInputValue(input.value);
    input.value = convertDigits(formatted);
  });
  input.dataset.maskAttached = 'true';
}

function attachTimeMask(id) {
  const input = getInput(id);
  if (!input || input.dataset.maskAttached === 'true') return;
  input.addEventListener('keydown', allowNumericKey);
  input.addEventListener('input', () => {
    const formatted = formatTimeInputValue(input.value, { finalize: false });
    input.value = convertDigits(formatted);
  });
  input.addEventListener('blur', () => {
    const formatted = formatTimeInputValue(input.value, { finalize: true });
    input.value = formatted ? convertDigits(formatted) : '';
  });
  input.dataset.maskAttached = 'true';
}

function initInputMasks() {
  attachDateMask('entryDate');
  attachDateMask('exitDate');
  attachTimeMask('entryTime');
  attachTimeMask('exitTime');
}

function refreshDateTimeInputs() {
  ['entryDate', 'exitDate'].forEach((id) => {
    const input = getInput(id);
    if (!input) return;
    const formatted = formatDateInputValue(input.value);
    input.value = formatted ? convertDigits(formatted) : '';
  });
  ['entryTime', 'exitTime'].forEach((id) => {
    const input = getInput(id);
    if (!input) return;
    const formatted = formatTimeInputValue(input.value, { finalize: false });
    input.value = formatted ? convertDigits(formatted) : '';
  });
}

function computePNL({ marketType, side, entry, close, volume, leverage, fee, entryFee, exitFee, fundingFee, symbol }) {
  entry = Number(entry) || 0;
  close = Number(close);
  volume = Number(volume) || 0;
  leverage = Number(leverage) || 1;
  const hasClose = Number.isFinite(close) && close > 0;
  const entryCost = Number(entryFee) || 0;
  const exitCost = Number(exitFee) || 0;
  const fundingCost = Number(fundingFee) || 0;
  let totalFee = entryCost + exitCost + fundingCost;
  if (totalFee === 0) {
    totalFee = Number(fee) || 0;
  }

  if (!hasClose || entry === 0 || volume === 0) {
    return { gross: 0, net: 0, pct: 0, open: !hasClose };
  }

  const normalizedSide = side === "Short" ? "Short" : "Long";
  const direction = marketType === "Futures" && normalizedSide === "Short" ? -1 : 1;

  if (marketType === "Spot") {
    const gross = (close - entry) * volume;
    const pct = entry ? ((close - entry) / entry) * 100 : 0;
    const net = gross - totalFee;
    return { gross, net, pct };
  }

  if (marketType === "Futures") {
    const margin = (entry * volume) / leverage;
    const priceChange = ((close - entry) / entry) * direction;
    const gross = priceChange * leverage * margin;
    const pct = priceChange * leverage * 100;
    const net = gross - totalFee;
    return { gross, net, pct };
  }

  if (marketType === "Forex") {
    const normalizedSide = side === "Short" ? "Short" : "Long";
    const fxDirection = normalizedSide === "Short" ? -1 : 1;
    const pipSize = getForexPipSize(symbol);
    const pipMove = pipSize ? ((close - entry) / pipSize) * fxDirection : 0;
    const units = volume * 100000;
    const gross = (close - entry) * units * fxDirection;
    const net = gross - totalFee;
    return { gross, net, pct: 0, pips: pipMove };
  }

  return { gross: 0, net: 0, pct: 0 };
}

function toggleFuturesFields() {
  const isFutures = refs.marketType?.value === "Futures";
  const showDirection = isFutures || isForexMode();
  const showLeverage = isFutures || isForexMode();
  const showFunding = isFutures || isForexMode();

  $$('.only-direction').forEach((el) => {
    el.style.display = showDirection ? "flex" : "none";
  });
  $$('.only-leverage').forEach((el) => {
    el.style.display = showLeverage ? "flex" : "none";
  });

  if (refs.side) {
    refs.side.required = Boolean(showDirection);
    if (!showDirection) {
      refs.side.value = "Long";
    }
  }
  const leverageInput = getInput('leverage');
  if (!showLeverage && leverageInput) {
    leverageInput.value = '';
  }
  if (!showFunding) {
    if (refs.fundingFeeHidden) {
      setFeeHiddenValues(refs.entryFeeHidden?.value, refs.exitFeeHidden?.value, '');
    }
    if (feeModal.funding) {
      feeModal.funding.value = '';
      feeModal.funding.disabled = true;
    }
  } else if (feeModal.funding) {
    feeModal.funding.disabled = false;
    if (refs.fundingFeeHidden) {
      feeModal.funding.value = convertDigits(refs.fundingFeeHidden.value || '');
    }
  }
  if (feeModal.fundingWrapper) {
    feeModal.fundingWrapper.hidden = !showFunding;
  }
}

function applyModeToForm() {
  const isForex = isForexMode();
  $$('.only-crypto').forEach((el) => {
    el.style.display = isForex ? 'none' : 'flex';
  });
  if (refs.filterMarket) {
    const wrapper = refs.filterMarket.closest('.input-select') || refs.filterMarket.parentElement;
    if (wrapper) wrapper.style.display = isForex ? 'none' : '';
  }
  if (refs.marketType) {
    const forexOption = refs.marketType.querySelector('option[value="Forex"]');
    if (forexOption) {
      forexOption.hidden = !isForex;
      forexOption.disabled = !isForex;
    }
    if (isForex) {
      refs.marketType.value = 'Forex';
      refs.marketType.setAttribute('disabled', 'true');
    } else {
      refs.marketType.removeAttribute('disabled');
      if (!['Spot', 'Futures'].includes(refs.marketType.value)) {
        refs.marketType.value = 'Spot';
      }
    }
  }
  toggleFuturesFields();
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
    : type === "Forex"
      ? t("form.fields.marketType.options.forex")
      : t("form.fields.marketType.options.spot");
  return typeof label === "string" ? convertDigits(label) : label;
}

function getSideLabel(side) {
  const label = side === "Short"
    ? t("form.fields.side.options.short")
    : t("form.fields.side.options.long");
  return typeof label === "string" ? convertDigits(label) : label;
}

function getOrderTypeLabel(type) {
  const normalized = (type || '').toLowerCase();
  let key = 'limit';
  if (normalized === 'market') key = 'market';
  else if (normalized === 'stop') key = 'stop';
  const label = t(`form.fields.orderType.options.${key}`);
  if (typeof label === 'string') return convertDigits(label);
  return convertDigits(type || '-');
}

function render() {
  updateFilterOptions();
  if (modalIsOpen) closeDetailsModal();

  if (!refs.tradesTableBody) return;

  const selectedMarket = (refs.filterMarket?.value || 'all').toLowerCase();
  const selectedExchange = (refs.filterExchange?.value || 'all').toLowerCase();
  const query = (refs.filterSearch?.value || '').trim().toLowerCase();
  const tokens = query ? query.split(/\s+/).filter(Boolean) : [];
  const pnlHeaderLabelKey = state.pnlDisplayMode === 'pct'
    ? 'table.headers.pnlPct'
    : state.pnlDisplayMode === 'pips'
      ? 'table.headers.pnlPips'
      : (isForexMode() ? 'table.headers.pnlMoney' : 'table.headers.pnl');
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

  const ensureClosed = (trade) => {
    const closed = Boolean(trade.closed ?? isTradeClosed(trade));
    trade.closed = closed;
    return closed;
  };

  const closedTrades = filtered.filter((trade) => ensureClosed(trade));

  let wins = 0;
  let netSum = 0;
  let pctSum = 0;
  let pipsSum = 0;
  closedTrades.forEach((trade) => {
    const net = trade.pnl?.net || 0;
    const pct = Number.isFinite(trade.pnl?.pct) ? trade.pnl.pct : 0;
    const pips = Number.isFinite(trade.pnl?.pips) ? trade.pnl.pips : 0;
    if (net > 0) wins += 1;
    netSum += net;
    pctSum += pct;
    pipsSum += pips;
  });

  const sorted = filtered.slice().sort((a, b) => {
    const orderA = normalizeOrderValue(a.order);
    const orderB = normalizeOrderValue(b.order);
    if (orderA !== null && orderB !== null && orderA !== orderB) {
      return orderB - orderA;
    }
    if (orderA !== null && orderB === null) return -1;
    if (orderA === null && orderB !== null) return 1;
    const createdA = Number(a.createdAt) || 0;
    const createdB = Number(b.createdAt) || 0;
    if (createdA !== createdB) return createdB - createdA;
    return (b.symbol || '').localeCompare(a.symbol || '', undefined, { sensitivity: 'base' });
  });
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
    const adjustedKey = isForexMode() && key === 'table.headers.volume'
      ? 'table.headers.volumeForex'
      : isForexMode() && key === 'table.headers.fee'
        ? 'table.headers.feeForex'
        : key;
    const translated = t(adjustedKey);
    const text = typeof translated === 'string' ? translated : fallback;
    return convertDigits(text);
  };
  const detailsIcon = '<svg class="icon icon--details" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.675 6.675 0 0 0 8 1.333Zm0 10a.833.833 0 1 1 .833-.833A.833.833 0 0 1 8 11.333Zm1.18-6.5-1.047 3.52a.5.5 0 0 1-.958-.004L6.667 7.5a.667.667 0 1 1 1.284-.391l.083.271.658-2.215a.667.667 0 1 1 1.225.352Z"></path></svg>';

  pageItems.forEach((trade, index) => {
    const tr = document.createElement('tr');
    tr.dataset.id = trade.id;
    const isClosed = ensureClosed(trade);
    const pnlNet = isClosed ? trade.pnl?.net || 0 : 0;
    const pnlPct = isClosed && Number.isFinite(trade.pnl?.pct) ? trade.pnl.pct : 0;
    const pnlPips = isClosed && Number.isFinite(trade.pnl?.pips) ? trade.pnl.pips : 0;
    const pnlToneValue = state.pnlDisplayMode === 'pips' ? pnlPips : pnlNet;
    const pnlClass = isClosed
      ? (pnlToneValue > 0 ? 'pnl-pos' : pnlToneValue < 0 ? 'pnl-neg' : 'pnl-zero')
      : 'pnl-zero';
    const leverageRaw = trade.marketType === 'Futures' || trade.marketType === 'Forex'
      ? (hasValue(trade.leverage) ? formatNumber(trade.leverage, { maximumFractionDigits: 2 }) : '-')
      : '-';
    const rowNumber = startIndex + index + 1;
    const hasDetails = [trade.strategy, trade.emotion, trade.notes].some(hasValue);
    const detailsCellHtml = hasDetails
      ? `<button class="icon-btn details-btn" type="button" data-id="${trade.id}" aria-label="${detailsButtonLabel}" title="${detailsButtonLabel}">${detailsIcon}</button>`
      : '<span class="placeholder">-</span>';
    const slDisplay = hasValue(trade.sl) ? formatTradePrice(trade, trade.sl) : '-';
    const tpDisplay = hasValue(trade.tp) ? formatTradePrice(trade, trade.tp) : '-';
    const slHtml = hasValue(trade.sl)
      ? `<span class="value-negative">${convertDigits(slDisplay)}</span>`
      : '<span class="placeholder">-</span>';
    const tpHtml = hasValue(trade.tp)
      ? `<span class="value-positive">${convertDigits(tpDisplay)}</span>`
      : '<span class="placeholder">-</span>';
    const slTpHtml = `${slHtml} / ${tpHtml}`;
    const volumeDisplay = hasValue(trade.volume) ? formatNumber(trade.volume) : '-';
    const totalFeeValue = getTotalFee(trade);
    const feeDisplay = totalFeeValue !== 0 ? formatNumber(totalFeeValue) : '-';
    const entryDisplay = formatTradePrice(trade, trade.entry);
    const closeDisplay = isClosed ? formatTradePrice(trade, trade.close) : '-';

    let rawPnlDisplay;
    if (!isClosed) {
      const zeroText = formatNumber(0, { maximumFractionDigits: 2 });
      rawPnlDisplay = state.pnlDisplayMode === 'pct'
        ? `${zeroText === "-" ? "0" : zeroText}%`
        : zeroText;
    } else if (state.pnlDisplayMode === 'pct') {
      const formatted = formatNumber(pnlPct, { maximumFractionDigits: 2 });
      rawPnlDisplay = formatted === "-" ? "-" : `${formatted}%`;
    } else if (state.pnlDisplayMode === 'pips') {
      const formatted = formatNumber(pnlPips, { maximumFractionDigits: 1 });
      rawPnlDisplay = formatted === "-" ? "-" : formatted;
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
    const sideDisplay = trade.marketType === 'Futures' || trade.marketType === 'Forex'
      ? getSideLabel(trade.side)
      : convertDigits('-');
    const volumeDisplayConverted = convertDigits(volumeDisplay);
    const feeDisplayConverted = convertDigits(feeDisplay);
    const entryDisplayConverted = convertDigits(entryDisplay);
    const closeDisplayConverted = convertDigits(closeDisplay);
    const pnlDisplayValue = convertDigits(rawPnlDisplay);
    const symbolHeader = headerText('table.headers.symbol', 'Symbol');
    const exchangeHeader = headerText('table.headers.exchange', 'Exchange');
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

  if (refs.metricTrades) refs.metricTrades.textContent = convertDigits(formatInteger(closedTrades.length));
  if (refs.metricWinRate) {
    const closedCount = closedTrades.length;
    const winrate = closedCount ? (wins / closedCount) * 100 : 0;
    const winDisplay = formatPercent(winrate, { maximumFractionDigits: 1 });
    refs.metricWinRate.textContent = convertDigits(winDisplay);
    applyWinRateTone(refs.metricWinRate, winrate);
  }
  if (refs.metricNetPnl) {
    const closedCount = closedTrades.length;
    let rawMetric = null;
    let display = '-';
    if (closedCount) {
      if (state.pnlDisplayMode === 'pct') {
        const avgPct = pctSum / closedCount;
        const formatted = formatNumber(avgPct, { maximumFractionDigits: 2 });
        display = formatted === "-" ? "-" : `${formatted}%`;
        rawMetric = avgPct;
      } else if (state.pnlDisplayMode === 'pips') {
        display = formatNumber(pipsSum, { maximumFractionDigits: 1 });
        rawMetric = pipsSum;
      } else {
        display = formatNumber(netSum);
        rawMetric = netSum;
      }
    }
    refs.metricNetPnl.textContent = convertDigits(display);
    applyValueTone(refs.metricNetPnl, rawMetric);
  }

  renderInsights(state.trades);
  updateDatalistOptions();

  $$('#tradesTable [data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit');
      const trade = state.trades.find((item) => item.id === id);
      if (!trade) return;
      enterEditMode(trade);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!isTradeClosed(trade)) return;
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
    .filter((trade) => isTradeClosed(trade))
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
  const closedTrades = trades.filter((trade) => {
    const closed = Boolean(trade.closed ?? isTradeClosed(trade));
    trade.closed = closed;
    return closed;
  });

  const total = closedTrades.length;
  let wins = 0;
  let losses = 0;
  let netSum = 0;
  let pctSum = 0;
  let pipsSum = 0;
  let positiveSum = 0;
  let negativeSum = 0;
  const holdSamples = [];
  let totalVolume = 0;
  let bestTrade = null;
  let worstTrade = null;

  closedTrades.forEach((trade) => {
    const net = trade.pnl?.net || 0;
    const pct = Number.isFinite(trade.pnl?.pct) ? trade.pnl.pct : 0;
    const pips = Number.isFinite(trade.pnl?.pips) ? trade.pnl.pips : 0;
    if (net > 0) {
      wins += 1;
      if (!bestTrade || net > (bestTrade.pnl?.net ?? -Infinity)) {
        bestTrade = trade;
      }
    } else if (net < 0) {
      losses += 1;
      if (!worstTrade || net < (worstTrade.pnl?.net ?? Infinity)) {
        worstTrade = trade;
      }
    }
    netSum += net;
    pctSum += pct;
    pipsSum += pips;
    if (net > 0) positiveSum += net;
    if (net < 0) negativeSum += net;
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
  const avgPips = total ? pipsSum / total : 0;
  const profitFactor = positiveSum > 0 && negativeSum < 0 ? positiveSum / Math.abs(negativeSum) : null;
  const avgHold = holdSamples.length ? holdSamples.reduce((sum, value) => sum + value, 0) / holdSamples.length : null;

  setInsightValue(insightsRefs.summary.totalTrades, formatInteger(total));
  setInsightValue(insightsRefs.summary.wins, formatInteger(wins));
  setInsightValue(insightsRefs.summary.losses, formatInteger(losses));
  setInsightValue(insightsRefs.summary.winRate, formatPercent(winRate, { maximumFractionDigits: 1 }), { winRate });
  setInsightValue(insightsRefs.summary.net, formatNumber(netSum), { raw: netSum });
  setInsightValue(insightsRefs.summary.avgNet, formatNumber(avgNet), { raw: avgNet });
  if (isForexMode()) {
    setInsightValue(insightsRefs.summary.avgPct, formatNumber(avgPips, { maximumFractionDigits: 1 }), { raw: avgPips });
  } else {
    setInsightValue(insightsRefs.summary.avgPct, formatPercent(avgPct, { maximumFractionDigits: 2 }), { raw: avgPct });
  }

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
    profitDisplay = "0";
  } else if (positiveSum === 0 && losses > 0) {
    profitDisplay = "0";
  }
  setInsightValue(insightsRefs.summary.profitFactor, profitDisplay);

  setInsightValue(
    insightsRefs.summary.avgHold,
    Number.isFinite(avgHold) ? formatNumber(avgHold, { maximumFractionDigits: 2 }) : "-"
  );
  setInsightValue(insightsRefs.summary.totalVolume, formatNumber(totalVolume));

  const marketStats = isForexMode()
    ? buildGroupedStats(
        closedTrades,
        (trade) => {
          const symbol = (trade.symbol || '').trim();
          return symbol || '__unknown__';
        },
        (key) => (key === '__unknown__' ? t('insights.common.unknown') : key)
      )
    : buildGroupedStats(
        closedTrades,
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
    closedTrades,
    (trade) => {
      const market = (trade.marketType || '').trim().toLowerCase();
      if (market !== 'futures' && market !== 'forex') return null;
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
    closedTrades,
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
    closedTrades.forEach((trade) => {
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

  state.insightsChartData = buildInsightsChartData(closedTrades);
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
  const dynamicPadding = span ? span * 0.12 : 0;
  const absolutePadding = Math.max(Math.abs(maxY || 0), Math.abs(minY || 0)) * 0.12;
  const padding = Math.max(dynamicPadding, absolutePadding, 10);
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
        top: 16,
        left: 12,
        right: 20,
        bottom: 28
      }
    },
    scales: {
      x: {
        offset: true,
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
          padding: 14,
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
          padding: 12,
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

function readTextInput(id) {
  const value = getInput(id)?.value || '';
  return convertDigits(String(value), 'en').trim();
}

function resetFormContent() {
  if (!refs.form) return;
  refs.form.reset();
  ["entryDate", "entryTime", "exitDate", "exitTime"].forEach((id) => {
    const el = getInput(id);
    if (el) el.value = "";
  });
  setFeeHiddenValues('', '', '');
  refs.form.removeAttribute('data-editing');
  applyModeToForm();
  if (refs.submitBtn) refs.submitBtn.textContent = convertDigits(t('form.actions.submit') || '');
  if (refs.formTitle) refs.formTitle.textContent = convertDigits(t('form.title') || '');
}

function populateInput(id, value) {
  const el = getInput(id);
  if (el === null || el === undefined) return;
  if (id === 'entryDate' || id === 'exitDate') {
    const formatted = formatDateInputValue(value);
    el.value = formatted ? convertDigits(formatted) : '';
    return;
  }
  if (id === 'entryTime' || id === 'exitTime') {
    const formatted = formatTimeInputValue(value, { finalize: true });
    el.value = formatted ? convertDigits(formatted) : '';
    return;
  }
  el.value = value ?? '';
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
  populateInput('strategy', trade.strategy ?? '');
  populateInput('emotion', trade.emotion ?? '');
  populateInput('notes', trade.notes ?? '');
  let entryFeeValue = getEntryFee(trade);
  let exitFeeValue = getExitFee(trade);
  let fundingFeeValue = getFundingFee(trade);
  if (entryFeeValue === 0 && exitFeeValue === 0 && fundingFeeValue === 0) {
    const totalFee = Number(trade.fee);
    if (Number.isFinite(totalFee) && totalFee !== 0) {
      entryFeeValue = totalFee;
    }
  }
  setFeeHiddenValues(entryFeeValue, exitFeeValue, fundingFeeValue);
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
  const currentCounter = normalizeOrderValue(state.orderCounter);
  let orderSeed = currentCounter !== null ? currentCounter : getMaxOrderValue();
  const baseTrades = isForexMode() ? DEMO_FOREX_TRADES : DEMO_BASE_TRADES;
  const trades = baseTrades.map((base, index) => {
    const extra = Array.isArray(overrides) ? overrides[index] || {} : {};
    const trade = {
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random()),
      ...base,
      strategy: extra.strategy || base.strategy,
      emotion: extra.emotion || base.emotion || '',
      notes: extra.notes || base.notes || ''
    };
    if (extra.entryDate) trade.entryDate = extra.entryDate;
    if (extra.entryTime) trade.entryTime = extra.entryTime;
    if (extra.exitDate) trade.exitDate = extra.exitDate;
    if (extra.exitTime) trade.exitTime = extra.exitTime;
    let entryFee = normalizeFeeValue(extra.entryFee);
    if (entryFee === null) entryFee = normalizeFeeValue(base.entryFee);
    if (entryFee === null) entryFee = normalizeFeeValue(base.fee);
    let exitFee = normalizeFeeValue(extra.exitFee);
    if (exitFee === null) exitFee = normalizeFeeValue(base.exitFee);
    let fundingFee = normalizeFeeValue(extra.fundingFee);
    if (fundingFee === null) fundingFee = normalizeFeeValue(base.fundingFee);
    let totalFee = (entryFee ?? 0) + (exitFee ?? 0) + (fundingFee ?? 0);
    if (totalFee === 0) {
      const fallbackFee = normalizeFeeValue(base.fee);
      if (fallbackFee) {
        totalFee = fallbackFee;
        entryFee = fallbackFee;
        exitFee = 0;
        fundingFee = 0;
      }
    }
    trade.entryFee = entryFee;
    trade.exitFee = exitFee;
    trade.fundingFee = fundingFee;
    trade.fee = totalFee;
    if (trade.marketType !== 'Futures' && trade.marketType !== 'Forex') {
      trade.side = null;
      trade.fundingFee = null;
    }
    orderSeed += 1;
    trade.order = orderSeed;
    trade.createdAt = computeCreatedAtFromTrade(trade, Date.now() + index);
    trade.pnl = computePNL(trade);
    trade.closed = isTradeClosed(trade);
    return trade;
  });
  state.orderCounter = orderSeed;
  return trades;
}

function openDetailsModal(trade) {
  if (!detailsModal.container) return;
  detailsModal.currentTrade = trade;
  renderTradeDetailRows(trade);
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
  updateTelegramUi();

  detailsModal.container.hidden = false;
  requestAnimationFrame(() => detailsModal.container.classList.add('modal--open'));
  modalIsOpen = true;
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  detailsModal.close?.focus();
}

function closeDetailsModal() {
  if (!detailsModal.container || !modalIsOpen) return;
  detailsModal.container.classList.remove('modal--open');
  modalIsOpen = false;
  setTimeout(() => {
    if (!modalIsOpen && detailsModal.container) detailsModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!anyModalOpen()) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  detailsModal.currentTrade = null;
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!refs.form) return;
  const entryDateValue = formatDateInputValue(getInput('entryDate')?.value);
  const exitDateValue = formatDateInputValue(getInput('exitDate')?.value);
  const entryTimeValue = formatTimeInputValue(getInput('entryTime')?.value, { finalize: true });
  const exitTimeValue = formatTimeInputValue(getInput('exitTime')?.value, { finalize: true });
  if ((entryDateValue && entryDateValue.length !== DATE_LENGTH) || (exitDateValue && exitDateValue.length !== DATE_LENGTH)) {
    alert(convertDigits(t('errors.dateLength') || ''));
    return;
  }

  const marketType = isForexMode() ? 'Forex' : (getInput('marketType')?.value || 'Spot');
  const needsDirection = marketType === 'Futures' || marketType === 'Forex';
  const sideValue = needsDirection
    ? (getInput('side')?.value || 'Long')
    : null;
  const leverageValue = needsDirection && getInput('leverage')?.value
    ? toNumber(getInput('leverage')?.value)
    : null;
  const editingId = refs.form.getAttribute('data-editing');
  const existingTrade = editingId
    ? state.trades.find((item) => item.id === editingId)
    : null;

  if (getInput('entryDate')) getInput('entryDate').value = entryDateValue ? convertDigits(entryDateValue) : '';
  if (getInput('exitDate')) getInput('exitDate').value = exitDateValue ? convertDigits(exitDateValue) : '';
  if (getInput('entryTime')) getInput('entryTime').value = entryTimeValue ? convertDigits(entryTimeValue) : '';
  if (getInput('exitTime')) getInput('exitTime').value = exitTimeValue ? convertDigits(exitTimeValue) : '';

  const rawSymbol = readTextInput('symbol');
  const normalizedSymbol = isForexMode() ? (normalizeForexSymbol(rawSymbol) || rawSymbol) : rawSymbol;
  const data = {
    id: editingId || (window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random())),
    symbol: normalizedSymbol,
    exchange: readTextInput('exchange'),
    marketType,
    side: sideValue,
    timeframe: readTextInput('timeframe'),
    orderType: getInput('orderType')?.value || 'Limit',
    volume: toNumber(getInput('volume')?.value),
    entry: toNumber(getInput('entry')?.value),
    entryDate: entryDateValue,
    entryTime: entryTimeValue,
    close: toNumber(getInput('close')?.value),
    exitDate: exitDateValue,
    exitTime: exitTimeValue,
    sl: toNumber(getInput('sl')?.value),
    tp: toNumber(getInput('tp')?.value),
    leverage: leverageValue,
    entryFee: toOptionalNumber(refs.entryFeeHidden?.value),
    exitFee: toOptionalNumber(refs.exitFeeHidden?.value),
    fundingFee: needsDirection
      ? toOptionalNumber(refs.fundingFeeHidden?.value)
      : null,
    strategy: readTextInput('strategy'),
    emotion: readTextInput('emotion'),
    notes: readTextInput('notes')
  };

  const existingOrder = existingTrade ? normalizeOrderValue(existingTrade.order) : null;
  if (existingOrder !== null) {
    data.order = existingOrder;
    if (!Number.isFinite(state.orderCounter) || state.orderCounter < existingOrder) {
      state.orderCounter = existingOrder;
    }
  } else {
    data.order = nextOrderValue();
  }

  data.createdAt = computeCreatedAtFromTrade(
    data,
    existingTrade?.createdAt ?? Date.now()
  );
  data.pnl = computePNL(data);
  data.closed = isTradeClosed(data);
  data.fee = getTotalFee(data);

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

function handleDelete(id) {
  if (!id) return;
  const index = state.trades.findIndex((item) => item.id === id);
  if (index === -1) return;
  state.trades.splice(index, 1);
  syncOrderCounter();
  saveTrades();
  render();
  setStatus('status.tradeDeleted');
}

function performClearAll() {
  state.trades = [];
  state.orderCounter = 0;
  syncOrderCounter();
  state.currentPage = 1;
  saveTrades();
  render();
  setStatus('status.allCleared');
}

function buildExportRows() {
  const toText = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isNaN(value)) return '';
    return String(value);
  };

  const data = state.trades.map((trade, index) => {
    const isDirectional = trade.marketType === 'Futures' || trade.marketType === 'Forex';
    const sideValue = isDirectional ? (toText(trade.side) || '-') : '-';
    const leverageValue = isDirectional
      ? (hasValue(trade.leverage) ? toText(trade.leverage) : '-')
      : '-';
    const entryFeeText = hasValue(trade.entryFee) ? toText(trade.entryFee) : '';
    const exitFeeText = hasValue(trade.exitFee) ? toText(trade.exitFee) : '';
    const fundingFeeText = isDirectional
      ? (hasValue(trade.fundingFee) ? toText(trade.fundingFee) : '-')
      : '-';
    const totalFeeValue = getTotalFee(trade);

    return {
      [EXPORT_HEADERS.index]: toText(index + 1),
      [EXPORT_HEADERS.symbol]: toText(trade.symbol),
      [EXPORT_HEADERS.exchange]: toText(trade.exchange),
      [EXPORT_HEADERS.side]: sideValue,
      [EXPORT_HEADERS.entry]: toText(trade.entry),
      [EXPORT_HEADERS.entryDate]: toText(trade.entryDate),
      [EXPORT_HEADERS.entryTime]: toText(trade.entryTime),
      [EXPORT_HEADERS.close]: toText(trade.close),
      [EXPORT_HEADERS.exitDate]: toText(trade.exitDate),
      [EXPORT_HEADERS.exitTime]: toText(trade.exitTime),
      [EXPORT_HEADERS.sl]: toText(hasValue(trade.sl) ? trade.sl : ''),
      [EXPORT_HEADERS.tp]: toText(hasValue(trade.tp) ? trade.tp : ''),
      [EXPORT_HEADERS.leverage]: leverageValue,
      [EXPORT_HEADERS.volume]: toText(hasValue(trade.volume) ? trade.volume : ''),
      [EXPORT_HEADERS.entryFee]: entryFeeText,
      [EXPORT_HEADERS.exitFee]: exitFeeText,
      [EXPORT_HEADERS.fundingFee]: fundingFeeText,
      [EXPORT_HEADERS.fee]: totalFeeValue ? toText(totalFeeValue) : '',
      [EXPORT_HEADERS.pnl]: trade.closed ? toText(trade.pnl?.net ?? '') : '',
      [EXPORT_HEADERS.pips]: trade.closed ? toText(trade.pnl?.pips ?? '') : '',
      [EXPORT_HEADERS.timeframe]: toText(trade.timeframe),
      [EXPORT_HEADERS.orderType]: toText(trade.orderType),
      [EXPORT_HEADERS.strategy]: toText(trade.strategy),
      [EXPORT_HEADERS.emotion]: toText(trade.emotion),
      [EXPORT_HEADERS.notes]: toText(trade.notes)
    };
  });

  return state.trades.map((trade, index) => {
    const isDirectional = trade.marketType === 'Futures' || trade.marketType === 'Forex';
    const sideValue = isDirectional ? (toText(trade.side) || '-') : '-';
    const leverageValue = isDirectional
      ? (hasValue(trade.leverage) ? toText(trade.leverage) : '-')
      : '-';
    const entryFeeText = hasValue(trade.entryFee) ? toText(trade.entryFee) : '';
    const exitFeeText = hasValue(trade.exitFee) ? toText(trade.exitFee) : '';
    const fundingFeeText = isDirectional
      ? (hasValue(trade.fundingFee) ? toText(trade.fundingFee) : '-')
      : '-';
    const totalFeeValue = getTotalFee(trade);

    return {
      [EXPORT_HEADERS.index]: toText(index + 1),
      [EXPORT_HEADERS.symbol]: toText(trade.symbol),
      [EXPORT_HEADERS.exchange]: toText(trade.exchange),
      [EXPORT_HEADERS.side]: sideValue,
      [EXPORT_HEADERS.entry]: toText(trade.entry),
      [EXPORT_HEADERS.entryDate]: toText(trade.entryDate),
      [EXPORT_HEADERS.entryTime]: toText(trade.entryTime),
      [EXPORT_HEADERS.close]: toText(trade.close),
      [EXPORT_HEADERS.exitDate]: toText(trade.exitDate),
      [EXPORT_HEADERS.exitTime]: toText(trade.exitTime),
      [EXPORT_HEADERS.sl]: toText(hasValue(trade.sl) ? trade.sl : ''),
      [EXPORT_HEADERS.tp]: toText(hasValue(trade.tp) ? trade.tp : ''),
      [EXPORT_HEADERS.leverage]: leverageValue,
      [EXPORT_HEADERS.volume]: toText(hasValue(trade.volume) ? trade.volume : ''),
      [EXPORT_HEADERS.entryFee]: entryFeeText,
      [EXPORT_HEADERS.exitFee]: exitFeeText,
      [EXPORT_HEADERS.fundingFee]: fundingFeeText,
      [EXPORT_HEADERS.fee]: totalFeeValue ? toText(totalFeeValue) : '',
      [EXPORT_HEADERS.pnl]: trade.closed ? toText(trade.pnl?.net ?? '') : '',
      [EXPORT_HEADERS.pips]: trade.closed ? toText(trade.pnl?.pips ?? '') : '',
      [EXPORT_HEADERS.timeframe]: toText(trade.timeframe),
      [EXPORT_HEADERS.orderType]: toText(trade.orderType),
      [EXPORT_HEADERS.strategy]: toText(trade.strategy),
      [EXPORT_HEADERS.emotion]: toText(trade.emotion),
      [EXPORT_HEADERS.notes]: toText(trade.notes)
    };
  });
}

function buildExportWorksheet() {
  if (typeof XLSX === 'undefined') return null;
  const worksheet = XLSX.utils.json_to_sheet(buildExportRows());
  Object.keys(worksheet).forEach((cellRef) => {
    if (cellRef[0] === '!') return;
    const cell = worksheet[cellRef];
    if (!cell) return;
    cell.v = toText(cell.v);
    cell.w = cell.v;
    cell.t = 's';
    cell.z = '@';
  });
  return worksheet;
}

function buildExportWorkbook() {
  const worksheet = buildExportWorksheet();
  if (!worksheet || typeof XLSX === 'undefined') return null;
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Journal');
  return workbook;
}

function buildExportFilename() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const modeTag = isForexMode() ? 'Forex' : 'Crypto';
  return `JournalX-${modeTag}-${y}-${m}-${d}-${hh}-${mm}-${ss}.xlsx`;
}

function buildExportMessage() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  const fallbackMode = isForexMode() ? 'Forex' : 'Crypto';
  const count = Number.isFinite(state.trades.length) ? String(state.trades.length) : '0';
  const englishMessage = `JournalX export | ${fallbackMode} | ${count} trades | ${timestamp}`;
  if (state.currentLang === 'fa') {
    const faMode = isForexMode() ? 'فارکس' : 'کریپتو';
    const faMessage = `خروجی ژورنال ایکس | ${faMode} | ${count} معامله | ${timestamp}`;
    return convertDigits(faMessage, state.digitsMode);
  }
  return convertDigits(englishMessage, state.digitsMode);
}

function buildExportRows() {
  return state.trades.map((trade, index) => {
    const isDirectional = trade.marketType === 'Futures' || trade.marketType === 'Forex';
    const sideValue = isDirectional ? (exportValueToText(trade.side) || '-') : '-';
    const leverageValue = isDirectional
      ? (hasValue(trade.leverage) ? exportValueToText(trade.leverage) : '-')
      : '-';
    const entryFeeText = hasValue(trade.entryFee) ? exportValueToText(trade.entryFee) : '';
    const exitFeeText = hasValue(trade.exitFee) ? exportValueToText(trade.exitFee) : '';
    const fundingFeeText = isDirectional
      ? (hasValue(trade.fundingFee) ? exportValueToText(trade.fundingFee) : '-')
      : '-';
    const totalFeeValue = getTotalFee(trade);

    return {
      [EXPORT_HEADERS.index]: exportValueToText(index + 1),
      [EXPORT_HEADERS.symbol]: exportValueToText(trade.symbol),
      [EXPORT_HEADERS.exchange]: exportValueToText(trade.exchange),
      [EXPORT_HEADERS.side]: sideValue,
      [EXPORT_HEADERS.entry]: exportValueToText(trade.entry),
      [EXPORT_HEADERS.entryDate]: exportValueToText(trade.entryDate),
      [EXPORT_HEADERS.entryTime]: exportValueToText(trade.entryTime),
      [EXPORT_HEADERS.close]: exportValueToText(trade.close),
      [EXPORT_HEADERS.exitDate]: exportValueToText(trade.exitDate),
      [EXPORT_HEADERS.exitTime]: exportValueToText(trade.exitTime),
      [EXPORT_HEADERS.sl]: exportValueToText(hasValue(trade.sl) ? trade.sl : ''),
      [EXPORT_HEADERS.tp]: exportValueToText(hasValue(trade.tp) ? trade.tp : ''),
      [EXPORT_HEADERS.leverage]: leverageValue,
      [EXPORT_HEADERS.volume]: exportValueToText(hasValue(trade.volume) ? trade.volume : ''),
      [EXPORT_HEADERS.entryFee]: entryFeeText,
      [EXPORT_HEADERS.exitFee]: exitFeeText,
      [EXPORT_HEADERS.fundingFee]: fundingFeeText,
      [EXPORT_HEADERS.fee]: totalFeeValue ? exportValueToText(totalFeeValue) : '',
      [EXPORT_HEADERS.pnl]: trade.closed ? exportValueToText(trade.pnl?.net ?? '') : '',
      [EXPORT_HEADERS.pips]: trade.closed ? exportValueToText(trade.pnl?.pips ?? '') : '',
      [EXPORT_HEADERS.timeframe]: exportValueToText(trade.timeframe),
      [EXPORT_HEADERS.orderType]: exportValueToText(trade.orderType),
      [EXPORT_HEADERS.strategy]: exportValueToText(trade.strategy),
      [EXPORT_HEADERS.emotion]: exportValueToText(trade.emotion),
      [EXPORT_HEADERS.notes]: exportValueToText(trade.notes)
    };
  });
}

function buildExportWorksheet() {
  if (typeof XLSX === 'undefined') return null;
  const worksheet = XLSX.utils.json_to_sheet(buildExportRows());
  Object.keys(worksheet).forEach((cellRef) => {
    if (cellRef[0] === '!') return;
    const cell = worksheet[cellRef];
    if (!cell) return;
    cell.v = exportValueToText(cell.v);
    cell.w = cell.v;
    cell.t = 's';
    cell.z = '@';
  });
  return worksheet;
}

function buildExportWorkbook() {
  if (typeof XLSX === 'undefined') return null;
  const worksheet = buildExportWorksheet();
  if (!worksheet) return null;
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Journal');
  return workbook;
}

function buildExportFilename() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const modeTag = isForexMode() ? 'Forex' : 'Crypto';
  return `JournalX-${modeTag}-${y}-${m}-${d}-${hh}-${mm}-${ss}.xlsx`;
}

function exportXlsx() {
  const workbook = buildExportWorkbook();
  if (!workbook || typeof XLSX === 'undefined') return;
  XLSX.writeFile(workbook, buildExportFilename());
  setStatus('status.xlsxExported');
}

function resolveColumn(row, keys) {
  if (!row || !Array.isArray(keys)) return '';
  const normalizedMap = mapRowKeys(row);
  for (const key of keys) {
    const normalizedKey = normalizeHeaderKey(key);
    if (!normalizedKey) continue;
    if (Object.prototype.hasOwnProperty.call(normalizedMap, normalizedKey)) {
      const value = normalizedMap[normalizedKey];
      if (value !== undefined && value !== '') return value;
      if (value === 0) return value;
    }
    if (row[key] !== undefined && row[key] !== '') return row[key];
    if (row[key] === 0) return row[key];
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
  if (market.includes('forex') || market.includes('fx')) return 'Forex';
  if (isForexMode()) return 'Forex';
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
    const fallbackBase = Date.now();
    state.trades = rows.map((row, index) => {
      let entryFeeValue = toOptionalNumber(resolveColumn(row, headerAliases.entryFee));
      let exitFeeValue = toOptionalNumber(resolveColumn(row, headerAliases.exitFee));
      let fundingFeeValue = toOptionalNumber(resolveColumn(row, headerAliases.fundingFee));
      const totalFeeValue = toOptionalNumber(resolveColumn(row, headerAliases.fee));
      let feeSum = (entryFeeValue ?? 0) + (exitFeeValue ?? 0) + (fundingFeeValue ?? 0);
      if (feeSum === 0 && totalFeeValue !== null && totalFeeValue !== undefined && totalFeeValue !== 0) {
        entryFeeValue = totalFeeValue;
        exitFeeValue = null;
        fundingFeeValue = null;
        feeSum = totalFeeValue;
      }
      const trade = {
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now() + Math.random()),
        originalIndex: index,
        order: index + 1,
        symbol: resolveColumn(row, headerAliases.symbol),
        exchange: resolveColumn(row, headerAliases.exchange),
        marketType: isForexMode() ? 'Forex' : normaliseMarket(resolveColumn(row, headerAliases.marketType)),
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
        entryFee: entryFeeValue,
        exitFee: exitFeeValue,
        fundingFee: fundingFeeValue,
        fee: feeSum,
        strategy: resolveColumn(row, headerAliases.strategy),
        emotion: resolveColumn(row, headerAliases.emotion),
        notes: resolveColumn(row, headerAliases.notes)
      };
      if (trade.marketType === 'Forex' && trade.symbol) {
        trade.symbol = normalizeForexSymbol(trade.symbol) || trade.symbol;
      }
      trade.entryDate = (trade.entryDate || '').toString().trim();
      trade.entryTime = (trade.entryTime || '').toString().trim();
      trade.exitDate = (trade.exitDate || '').toString().trim();
      trade.exitTime = (trade.exitTime || '').toString().trim();
      if (trade.entryDate && trade.entryDate.length !== DATE_LENGTH) trade.entryDate = trade.entryDate.slice(0, DATE_LENGTH);
      if (trade.exitDate && trade.exitDate.length !== DATE_LENGTH) trade.exitDate = trade.exitDate.slice(0, DATE_LENGTH);
      if (trade.leverage === 0) trade.leverage = null;
      const isDirectional = trade.marketType === 'Futures' || trade.marketType === 'Forex';
      if (!isDirectional) {
        trade.side = null;
        trade.leverage = null;
        trade.fundingFee = null;
      } else if (!trade.side) {
        trade.side = 'Long';
      }
      trade.createdAt = computeCreatedAtFromTrade(
        trade,
        fallbackBase + index
      );
      trade.pnl = computePNL(trade);
      trade.closed = isTradeClosed(trade);
      return trade;
    });
    state.trades.sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
    state.trades.forEach((trade) => delete trade.originalIndex);
    syncOrderCounter();
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
  initInputMasks();
  refs.themeToggle?.addEventListener('click', toggleTheme);
  refs.languageSelect?.addEventListener('change', (event) => {
    setLanguage(event.target.value || 'en');
  });
  refs.modeSelect?.addEventListener('change', (event) => {
    setMode(event.target.value || MODES.CRYPTO, { persist: true, refresh: true });
  });
  refs.pnlDisplaySelect?.addEventListener('change', (event) => {
    setPnlDisplayMode(event.target.value || 'net');
  });
  refs.digitsModeSelect?.addEventListener('change', (event) => {
    setDigitsMode(event.target.value || 'en');
  });

  refs.form?.addEventListener('submit', handleFormSubmit);
  refs.feeDisplay?.addEventListener('click', (event) => {
    event.preventDefault();
    openFeeModal();
  });
  refs.feeDisplay?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFeeModal();
    }
  });
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
    const demoTrades = getDemoTrades();
    state.trades = state.trades.concat(demoTrades);
    syncOrderCounter();
    state.currentPage = 1;
    saveTrades();
    render();
    setStatus('status.demoAdded');
  });

  refs.exportXlsx?.addEventListener('click', openExportModal);
  refs.contactButton?.addEventListener('click', openContactModal);
  refs.telegramConnectButton?.addEventListener('click', () => {
    const step = state.telegramUserId ? 2 : 1;
    openTelegramModal(step);
  });
  refs.updateAppButton?.addEventListener('click', openUpdateModal);
  detailsModal.sendButton?.addEventListener('click', sendTradeDetailsToTelegram);

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

  refs.importExcel?.addEventListener('change', handleExcelImport);
  refs.clearAll?.addEventListener('click', openClearModal);
  detailsModal.close?.addEventListener('click', closeDetailsModal);
  detailsModal.backdrop?.addEventListener('click', (event) => {
    if (event.target === detailsModal.backdrop) closeDetailsModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (contactModal.container && !contactModal.container.hidden) { closeContactModal(); return; }
    if (modeModal.container && !modeModal.container.hidden) { closeModeModal(); return; }
    if (telegramModal.container && !telegramModal.container.hidden) { closeTelegramModal(); return; }
    if (deviceModal.container && !deviceModal.container.hidden) { closeDeviceModal(); return; }
    if (exportModal.container && !exportModal.container.hidden) { closeExportModal(); return; }
    if (clearModalOpen) { closeClearModal(false); return; }
    if (deleteModalOpen) { closeDeleteModal(false); return; }
    if (feeModalOpen) { closeFeeModal(false); return; }
    closeDetailsModal();
  });
}

async function init() {
  applyTheme('dark');
  state.isMobileDevice = detectMobileDevice();

  const savedMode = localStorage.getItem(state.modeKey);
  applyModeState(savedMode || MODES.CRYPTO, { persist: Boolean(savedMode) });
  loadPnlDisplayMode();
  if (refs.pnlDisplaySelect) refs.pnlDisplaySelect.value = state.pnlDisplayMode;

  const savedDigitsMode = localStorage.getItem(state.digitsModeKey) || state.digitsMode;
  setDigitsMode(savedDigitsMode, { silent: true });
  if (refs.digitsModeSelect) refs.digitsModeSelect.value = state.digitsMode;

  state.telegramUserId = localStorage.getItem(state.telegramUserIdKey) || '';
  updateTelegramUi();

  refreshFeeRefs();
  initFeeModal();
  initDeleteModal();
  initContactModal();
  initUpdateModal();
  initModeModal();
  initTelegramModal();
  initDeviceModal();
  initExportModal();
  updateFeeDisplay();
  updateExportModalState();

  loadTrades();
  initNavigation();
  initEvents();
  applyModeToForm();
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
  window.addEventListener('online', refreshOnlineStatus);
  window.addEventListener('offline', refreshOnlineStatus);

  const savedLang = localStorage.getItem(state.languageKey) || 'en';
  await setLanguage(savedLang);
  updatePnlDisplayOptionsForMode();
  updateFormLabelsForMode();
  if (!savedMode) openModeModal();
  maybeShowDeviceWarning();
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

function initModeModal() {
  modeModal.container = document.getElementById("modeModal");
  modeModal.backdrop = modeModal.container?.querySelector(".modal__backdrop");
  modeModal.close = document.getElementById("modeModalClose");
  modeModal.actions = Array.from(modeModal.container?.querySelectorAll('[data-mode]') || []);
  if (!modeModal.container || modeModal.container.dataset.initialized) return;
  modeModal.backdrop?.addEventListener('click', () => closeModeModal());
  modeModal.close?.addEventListener('click', () => closeModeModal());
  modeModal.actions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextMode = btn.dataset.mode;
      setMode(nextMode, { persist: true, refresh: true });
      closeModeModal();
    });
  });
  modeModal.container.dataset.initialized = 'true';
}

function ensureModeModal() {
  if (!modeModal.container) initModeModal();
  return Boolean(modeModal.container);
}

function openModeModal() {
  if (!ensureModeModal()) return;
  modeModal.container.hidden = false;
  requestAnimationFrame(() => modeModal.container.classList.add('modal--open'));
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeModeModal() {
  if (!modeModal.container) return;
  modeModal.container.classList.remove('modal--open');
  setTimeout(() => {
    if (modeModal.container) modeModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!anyModalOpen()) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

function initContactModal() {
  contactModal.container = document.getElementById("contactModal");
  contactModal.backdrop = contactModal.container?.querySelector(".modal__backdrop");
  contactModal.close = document.getElementById("contactModalClose");
  contactModal.form = document.getElementById("contactForm");
  contactModal.textarea = document.getElementById("contactMessage");
  contactModal.cancel = contactModal.container?.querySelector("[data-contact-action='cancel']");
  contactModal.submit = contactModal.container?.querySelector("[data-contact-action='submit']");
  if (!contactModal.container || contactModal.container.dataset.initialized) return;
  contactModal.backdrop?.addEventListener('click', () => closeContactModal());
  contactModal.close?.addEventListener('click', () => closeContactModal());
  contactModal.cancel?.addEventListener('click', () => closeContactModal());
  contactModal.form?.addEventListener('submit', handleContactSubmit);
  contactModal.container.dataset.initialized = 'true';
}

function ensureContactModal() {
  if (!contactModal.container) initContactModal();
  return Boolean(contactModal.container);
}

function openContactModal() {
  if (!ensureContactModal()) return;
  if (contactModal.textarea) contactModal.textarea.value = '';
  contactModal.container.hidden = false;
  requestAnimationFrame(() => contactModal.container.classList.add('modal--open'));
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  contactModal.textarea?.focus();
}

function closeContactModal() {
  if (!contactModal.container) return;
  contactModal.container.classList.remove('modal--open');
  setTimeout(() => {
    if (contactModal.container) contactModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!anyModalOpen()) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();
  if (!contactModal.textarea) return;
  const rawValue = contactModal.textarea.value || '';
  if (!rawValue.trim()) {
    contactModal.textarea.focus();
    return;
  }
  try {
    contactModal.submit?.setAttribute('disabled', 'true');
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ text: rawValue })
    });
    const ok = response.ok;
    if (!ok) throw new Error(`Contact request failed: ${response.status}`);
    closeContactModal();
    showToast(convertDigits(t('status.contactSent') || 'Message sent'), { type: 'success' });
  } catch (err) {
    console.error('Contact submit failed', err);
    showToast(convertDigits(t('errors.contactFailed') || 'Unable to send message'));
  } finally {
    contactModal.submit?.removeAttribute('disabled');
  }
}
function initUpdateModal() {
  updateModal.container = document.getElementById("updateModal");
  updateModal.backdrop = updateModal.container?.querySelector(".modal__backdrop");
  updateModal.close = document.getElementById("updateModalClose");
  updateModal.cancel = updateModal.container?.querySelector("[data-update-action='cancel']");
  updateModal.confirm = updateModal.container?.querySelector("[data-update-action='confirm']");
  if (!updateModal.container || updateModal.container.dataset.initialized) return;
  updateModal.backdrop?.addEventListener('click', () => closeUpdateModal());
  updateModal.close?.addEventListener('click', () => closeUpdateModal());
  updateModal.cancel?.addEventListener('click', () => closeUpdateModal());
  updateModal.confirm?.addEventListener('click', handleUpdateConfirm);
  updateModal.container.dataset.initialized = 'true';
}

function ensureUpdateModal() {
  if (!updateModal.container) initUpdateModal();
  return Boolean(updateModal.container);
}

function openUpdateModal() {
  if (!ensureUpdateModal()) return;
  updateModal.container.hidden = false;
  requestAnimationFrame(() => updateModal.container.classList.add('modal--open'));
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeUpdateModal() {
  if (!updateModal.container) return;
  updateModal.container.classList.remove('modal--open');
  setTimeout(() => {
    if (updateModal.container) updateModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!anyModalOpen()) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

async function handleUpdateConfirm() {
  if (!ensureUpdateModal()) return;
  updateModal.confirm?.setAttribute('disabled', 'true');
  try {
    localStorage.clear();
  } catch (err) {
    console.error('localStorage clear failed', err);
  }
  try {
    sessionStorage.clear();
  } catch (err) {
    // ignore
  }
  try {
    await Promise.all([
      clearIndexedDBDatabases(),
      deleteAllCaches(),
      unregisterAllServiceWorkers()
    ]);
  } catch (err) {
    console.error('Update cleanup failed', err);
  } finally {
    updateModal.confirm?.removeAttribute('disabled');
  }
  closeUpdateModal();
  const nextUrl = buildBypassReloadUrl();
  window.location.replace(nextUrl);
}
async function deleteAllCaches() {
  let cleared = false;
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      cleared = true;
    } catch (err) {
      console.error('Cache clearing failed', err);
    }
  }
  if (!cleared) {
    await clearCachesViaServiceWorker();
  }
}

async function clearCachesViaServiceWorker() {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration?.active || navigator.serviceWorker.controller;
    if (!worker) return false;
    const response = await sendMessageToServiceWorker(worker, { type: 'CLEAR_JOURNALX_CACHES' }, 5000);
    return Boolean(response?.success);
  } catch (err) {
    console.error('Service worker cache clearing failed', err);
    return false;
  }
}

function sendMessageToServiceWorker(worker, message, timeout = 4000) {
  return new Promise((resolve) => {
    if (!worker || typeof worker.postMessage !== 'function') {
      resolve(false);
      return;
    }
    const channel = new MessageChannel();
    const timer = setTimeout(() => {
      resolve(false);
    }, timeout);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      resolve(event.data);
    };
    try {
      worker.postMessage(message, [channel.port2]);
    } catch (err) {
      clearTimeout(timer);
      console.error('Failed to message service worker', err);
      resolve(false);
    }
  });
}

async function unregisterAllServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  try {
    if (navigator.serviceWorker.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    } else if (navigator.serviceWorker.getRegistration) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) await reg.unregister();
    }
  } catch (err) {
    console.error('Service worker unregister failed', err);
  }
}

function deleteIndexedDbByName(name) {
  return new Promise((resolve) => {
    if (!name || !('indexedDB' in window)) {
      resolve();
      return;
    }
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    try {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = finish;
      request.onerror = finish;
      request.onblocked = finish;
    } catch (err) {
      console.error('deleteDatabase failed', name, err);
      finish();
    }
  });
}

async function clearIndexedDBDatabases() {
  if (!('indexedDB' in window)) return;
  const names = new Set();
  const FALLBACK_NAMES = [
    ...Object.values(STORAGE_KEYS),
    'workbox-precache-v2',
    'workbox-precache-v3',
    'workbox-precache-v4'
  ];
  FALLBACK_NAMES.forEach((name) => names.add(name));
  if (typeof indexedDB.databases === 'function') {
    try {
      const dbs = await indexedDB.databases();
      dbs.forEach((db) => {
        if (db?.name) names.add(db.name);
      });
    } catch (err) {
      console.warn('indexedDB.databases not supported', err);
    }
  }
  await Promise.all([...names].map((name) => deleteIndexedDbByName(name)));
}

function buildBypassReloadUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('refresh', Date.now().toString());
    return url.toString();
  } catch (err) {
    return window.location.href.split('#')[0] + `?refresh=${Date.now()}`;
  }
}
function initDeviceModal() {
  deviceModal.container = document.getElementById("deviceWarningModal");
  deviceModal.backdrop = deviceModal.container?.querySelector(".modal__backdrop");
  deviceModal.close = document.getElementById("deviceWarningClose");
  deviceModal.confirm = deviceModal.container?.querySelector("[data-device-action='close']");
  if (!deviceModal.container || deviceModal.container.dataset.initialized) return;
  deviceModal.backdrop?.addEventListener('click', () => closeDeviceModal());
  deviceModal.close?.addEventListener('click', () => closeDeviceModal());
  deviceModal.confirm?.addEventListener('click', () => closeDeviceModal());
  deviceModal.container.dataset.initialized = 'true';
}

function ensureDeviceModal() {
  if (!deviceModal.container) initDeviceModal();
  return Boolean(deviceModal.container);
}

function openDeviceModal() {
  if (!ensureDeviceModal()) return;
  deviceModal.container.hidden = false;
  requestAnimationFrame(() => deviceModal.container.classList.add('modal--open'));
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeDeviceModal() {
  if (!deviceModal.container) return;
  deviceModal.container.classList.remove('modal--open');
  setTimeout(() => {
    if (deviceModal.container) deviceModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!anyModalOpen()) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

function maybeShowDeviceWarning() {
  if (!state.isMobileDevice || state.deviceWarningShown) return;
  state.deviceWarningShown = true;
  openDeviceModal();
}
function initTelegramModal() {
  telegramModal.container = document.getElementById("telegramModal");
  telegramModal.backdrop = telegramModal.container?.querySelector(".modal__backdrop");
  telegramModal.close = document.getElementById("telegramModalClose");
  telegramModal.steps = Array.from(document.querySelectorAll('[data-telegram-step-indicator]'));
  telegramModal.panels = Array.from(document.querySelectorAll('.telegram-step-panel'));
  telegramModal.step1Action = document.getElementById("telegramStep1Action");
  telegramModal.form = document.getElementById("telegramModalForm");
  telegramModal.input = document.getElementById("telegramModalInput");
  telegramModal.finish = document.querySelector('[data-telegram-action="finish"]');
  telegramModal.successId = document.getElementById("telegramSuccessId");
  if (!telegramModal.container || telegramModal.container.dataset.initialized) return;
  telegramModal.step1Action?.addEventListener('click', () => setTelegramStep(2));
  telegramModal.form?.addEventListener('submit', handleTelegramSubmit);
  telegramModal.finish?.addEventListener('click', () => closeTelegramModal());
  telegramModal.backdrop?.addEventListener('click', () => closeTelegramModal());
  telegramModal.close?.addEventListener('click', () => closeTelegramModal());
  telegramModal.container.dataset.initialized = 'true';
}

function ensureTelegramModal() {
  if (!telegramModal.container) initTelegramModal();
  return Boolean(telegramModal.container);
}

function openTelegramModal(step = 1) {
  if (!ensureTelegramModal()) return;
  setTelegramStep(step);
  telegramModal.container.hidden = false;
  requestAnimationFrame(() => telegramModal.container.classList.add('modal--open'));
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  if (step === 2) telegramModal.input?.focus();
}

function closeTelegramModal() {
  if (!telegramModal.container) return;
  telegramModal.container.classList.remove('modal--open');
  setTimeout(() => {
    if (telegramModal.container) telegramModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!anyModalOpen()) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

function setTelegramStep(step) {
  telegramModal.currentStep = step;
  telegramModal.panels.forEach((panel) => {
    panel.hidden = panel.dataset.step !== String(step);
  });
  telegramModal.steps.forEach((indicator) => {
    const idx = Number(indicator.dataset.telegramStepIndicator);
    indicator.classList.toggle('is-active', idx === step);
    indicator.classList.toggle('is-completed', idx < step);
  });
  if (step === 2 && telegramModal.input) {
    telegramModal.input.value = convertDigits(state.telegramUserId || '');
    telegramModal.input.focus();
  }
  if (step === 3 && telegramModal.successId) {
    telegramModal.successId.textContent = convertDigits(state.telegramUserId || '-');
  }
}

function handleTelegramSubmit(event) {
  event.preventDefault();
  if (!telegramModal.input) return;
  const raw = telegramModal.input.value || '';
  const normalized = convertDigits(raw, 'en').replace(/[^0-9]/g, '');
  if (!normalized) {
    showToast(convertDigits(t('errors.telegramUserIdRequired') || 'Enter your Telegram user ID'));
    telegramModal.input.focus();
    return;
  }
  applyTelegramUserId(normalized);
  setTelegramStep(3);
}
function initExportModal() {
  exportModal.container = document.getElementById("exportChoiceModal");
  exportModal.backdrop = exportModal.container?.querySelector(".modal__backdrop");
  exportModal.close = document.getElementById("exportModalClose");
  exportModal.local = exportModal.container?.querySelector("[data-export-action='local']");
  exportModal.telegram = document.getElementById("exportTelegramButton");
  exportModal.hint = document.getElementById("exportTelegramHint");
  if (!exportModal.container || exportModal.container.dataset.initialized) return;
  exportModal.backdrop?.addEventListener('click', () => closeExportModal());
  exportModal.close?.addEventListener('click', () => closeExportModal());
  exportModal.local?.addEventListener('click', () => {
    closeExportModal();
    exportXlsx();
  });
  exportModal.telegram?.addEventListener('click', () => sendExportToTelegram());
  exportModal.container.dataset.initialized = 'true';
}

function ensureExportModal() {
  if (!exportModal.container) initExportModal();
  return Boolean(exportModal.container);
}

function openExportModal() {
  if (!ensureExportModal()) return;
  updateExportModalState();
  exportModal.container.hidden = false;
  requestAnimationFrame(() => exportModal.container.classList.add('modal--open'));
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}

function closeExportModal() {
  if (!exportModal.container) return;
  exportModal.container.classList.remove('modal--open');
  setTimeout(() => {
    if (exportModal.container) exportModal.container.hidden = true;
  }, MODAL_TRANSITION_MS);
  if (!anyModalOpen()) {
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

function updateExportModalState() {
  if (!exportModal.telegram || !exportModal.hint) return;
  const disabled = !state.telegramUserId || !state.isOnline;
  exportModal.telegram.disabled = disabled;
  const hintKey = !state.telegramUserId
    ? 'modals.export.hintMissingId'
    : (!state.isOnline ? 'modals.export.hintOffline' : 'modals.export.hint');
  const message = t(hintKey);
  exportModal.hint.textContent = convertDigits(typeof message === 'string' ? message : '');
}
async function sendExportToTelegram() {
  if (!state.telegramUserId || !state.isOnline) {
    showToast(convertDigits(t('errors.telegramExportFailed') || 'Unable to send'), { type: 'error' });
    return;
  }
  try {
    const workbook = XLSX ? buildExportWorkbook() : null;
    if (!workbook) return;
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = buildExportFilename();
    const formData = new FormData();
    formData.append('userid', state.telegramUserId);
    formData.append('file', blob, filename);
    formData.append('text', buildExportMessage());
    const response = await fetch(TELEGRAM_EXPORT_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
    const ok = response.type === 'opaque' || response.ok;
    if (!ok) throw new Error(`Export failed ${response.status}`);
    closeExportModal();
    setStatus('status.telegramExported');
  } catch (error) {
    console.error('Telegram export failed', error);
    showToast(convertDigits(t('errors.telegramExportFailed') || 'Unable to send export'));
  }
}

async function sendTradeDetailsToTelegram() {
  if (!state.telegramUserId || !detailsModal.currentTrade || detailsModal.sendButton?.disabled) return;
  try {
    detailsModal.sendButton?.setAttribute('disabled', 'true');
    const message = buildTradeDetailsMessage(detailsModal.currentTrade);
    const formData = new FormData();
    formData.append('userid', state.telegramUserId);
    formData.append('text', message);
    const response = await fetch(TELEGRAM_EXPORT_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });
    const ok = response.type === 'opaque' || response.ok;
    if (!ok) throw new Error(`Details send failed ${response.status}`);
    showToast(convertDigits(t('status.telegramDetailsSent') || 'Sent to Telegram'), { type: 'success' });
  } catch (error) {
    console.error('trade details telegram error', error);
    showToast(convertDigits(t('errors.telegramDetailsFailed') || 'Unable to send trade details'));
  } finally {
    detailsModal.sendButton?.removeAttribute('disabled');
  }
}
function anyModalOpen() {
  const nodes = [
    detailsModal.container,
    feeModal.container,
    deleteModal.container,
    contactModal.container,
    updateModal.container,
    modeModal.container,
    telegramModal.container,
    deviceModal.container,
    exportModal.container,
    document.getElementById('clearModal')
  ];
  return nodes.some((node) => node && !node.hidden && node.classList?.contains('modal--open'));
}
