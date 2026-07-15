const WINDOW_PARAMS = new URLSearchParams(window.location.search);
const IS_PRIVATE_WINDOW = WINDOW_PARAMS.get('private') === '1';
const PRIVATE_PARTITION = WINDOW_PARAMS.get('partition') || `lumen-private-${Date.now()}`;
const BROWSER_PARTITION = IS_PRIVATE_WINDOW ? PRIVATE_PARTITION : 'persist:lumen-browser';
const SEARCH_ENGINES = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  brave: 'https://search.brave.com/search?q=',
  yandex: 'https://yandex.com/search/?text='
};
const NEW_TAB_BASE_URL = new URL('./new-tab.html', window.location.href).toString();

const AD_HIDE_CSS = `
  iframe[src*="doubleclick.net"],
  iframe[src*="googlesyndication.com"],
  iframe[id*="google_ads"],
  iframe[name*="google_ads"],
  [id^="ad-"],
  [id*="-ad-"],
  [id*="_ad_"],
  [class^="ad-"],
  [class*=" ad-"],
  [class*=" ads-"],
  [class*="advert"],
  [class*="sponsor"],
  [aria-label*="advertisement" i] {
    display: none !important;
    visibility: hidden !important;
  }
`;

const GOOGLE_DARK_CSS = `
  :root {
    color-scheme: dark !important;
    --lumen-google-bg: #000000;
    --lumen-google-panel: #050505;
    --lumen-google-panel-2: #0b0b0b;
    --lumen-google-text: #f4f4f4;
    --lumen-google-muted: #9a9a9a;
    --lumen-google-line: rgba(255, 255, 255, 0.16);
  }

  html,
  body,
  #viewport,
  #main,
  #cnt,
  #rcnt,
  #center_col,
  #rhs,
  #searchform,
  #sfcnt,
  #appbar,
  #hdtb,
  #top_nav,
  .sfbg,
  .minidiv .sfbg,
  .Lj9fsd,
  .f6F9Be,
  .yg51vc,
  .TQc1id,
  .Ww4FFb,
  .ULSxyf,
  .kp-wholepage,
  .commercial-unit-desktop-top,
  .commercial-unit-desktop-rhs {
    background: var(--lumen-google-bg) !important;
    color: var(--lumen-google-text) !important;
  }

  div,
  section,
  article,
  header,
  nav,
  aside,
  footer,
  g-section-with-header,
  .MjjYud,
  .g,
  .tF2Cxc,
  .yuRUbf,
  .N54PNb,
  .cUnQKe,
  .obcontainer,
  .I6TXqe,
  .osrp-blk,
  .ifM9O,
  .related-question-pair,
  .e9EfHf,
  .uMdZh {
    background-color: transparent !important;
    color: var(--lumen-google-text) !important;
  }

  .RNNXgb,
  .A8SBwf,
  textarea.gLFyf,
  input.gLFyf,
  input[name="q"],
  .aajZCb,
  .erkvQe,
  .G43f7e,
  .sbct,
  .xtSCL,
  .CqAVzb,
  .knowledge-panel,
  .kp-blk,
  .sATSHe,
  .Wnoohf,
  .UDZeY,
  .V3FYCf,
  .vIifob,
  .jtfYYd,
  .ULSxyf {
    background: var(--lumen-google-panel) !important;
    border-color: var(--lumen-google-line) !important;
    box-shadow: none !important;
    color: var(--lumen-google-text) !important;
  }

  input,
  textarea,
  select,
  button {
    color: var(--lumen-google-text) !important;
  }

  a,
  a:visited,
  .LC20lb,
  .DKV0Md,
  .yuRUbf a,
  .qLRx3b,
  .fl,
  .VuuXrf {
    color: #ffffff !important;
  }

  cite,
  .tjvcx,
  .qLRx3b cite,
  .TbwUpd,
  .NJjxre,
  .iUh30,
  .notranslate,
  .MUxGbd,
  .IsZvec,
  .VwiC3b,
  .hgKElc,
  .kno-rdesc,
  .s3v9rd,
  .yXK7lf,
  .BNeawe,
  .AP7Wnd,
  .aCOpRe {
    color: var(--lumen-google-muted) !important;
  }

  hr,
  g-inner-card,
  .mnr-c,
  .vk_c,
  .card-section,
  .Gx5Zad,
  .nGphre,
  .RzdJxc,
  .WGYX8,
  .TzHB6b,
  .ULSxyf,
  .commercial-unit-desktop-top {
    border-color: var(--lumen-google-line) !important;
  }

  .gb_A,
  .gb_B,
  .gb_C,
  .gb_D,
  .gb_E,
  .gb_F,
  svg,
  path {
    color: var(--lumen-google-text) !important;
    fill: currentColor !important;
  }

  .logo,
  img[alt="Google"],
  .lnXdpd {
    filter: grayscale(1) brightness(1.8) contrast(1.2) !important;
  }

  ::selection {
    background: #ffffff !important;
    color: #000000 !important;
  }

  ::-webkit-scrollbar {
    width: 12px !important;
    height: 12px !important;
    background: #000000 !important;
  }

  ::-webkit-scrollbar-thumb {
    background: #333333 !important;
    border: 3px solid #000000 !important;
  }
`;

const POPULAR_SITE_DARK_CSS = `
  :root { color-scheme: dark !important; }
  html, body, main, article, section, header, nav, aside, footer,
  div[class], div[id] {
    background-color: #000000 !important;
    color: #f4f4f4 !important;
    border-color: rgba(255,255,255,0.16) !important;
  }
  a, a:visited, h1, h2, h3, h4, h5, h6, strong, b {
    color: #ffffff !important;
  }
  p, li, span, small, label, time, td, th, code, pre {
    color: #d8d8d8 !important;
  }
  input, textarea, select, button, pre, code {
    background-color: #050505 !important;
    color: #ffffff !important;
    border-color: rgba(255,255,255,0.2) !important;
  }
  img, video {
    filter: brightness(0.92) contrast(1.04) !important;
  }
  ::selection {
    background: #ffffff !important;
    color: #000000 !important;
  }
`;

const DARK_SITE_HOSTS = ['github.com', 'wikipedia.org', 'youtube.com', 'reddit.com', 'stackoverflow.com'];
const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'gbraid',
  'wbraid',
  'yclid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'ref_src'
];
const PASSWORD_CAPTURE_PREFIX = '__LUMEN_PASSWORD_CAPTURE__';
const TRANSLATIONS = {
  en: {
    menu: 'MENU',
    settings: 'Settings',
    control: 'Control',
    searchSettings: 'Search settings',
    changesApply: 'Changes apply immediately.',
    done: 'Done',
    tabs: 'Tabs',
    history: 'History',
    downloads: 'Downloads',
    screenshots: 'Screenshots',
    shots: 'Shots',
    notes: 'Notes',
    passwords: 'Passwords',
    profiles: 'Profiles',
    workspace: 'Workspace',
    searchTabs: 'Search open tabs',
    restoreClosed: 'Restore closed',
    closeDuplicates: 'Close duplicates',
    searchHistory: 'Search history',
    clearHistory: 'Clear history',
    noTabs: 'No tabs',
    noHistory: 'No history',
    noDownloads: 'No downloads',
    noScreenshots: 'No screenshots',
    noBookmarks: 'No bookmarks',
    noPasswords: 'No saved passwords',
    noPageSelected: 'No page selected',
    searchPasswords: 'Search passwords',
    notePlaceholder: 'Write a note for this page',
    saveNote: 'Save note',
    passwordTitle: 'Title',
    passwordUrl: 'Site address',
    passwordUsername: 'Username / email',
    passwordValue: 'Password',
    passwordGenerate: 'Generate',
    passwordUseCurrent: 'Current page',
    passwordFill: 'Fill page',
    passwordSave: 'Save',
    passwordCopy: 'Copy',
    passwordEdit: 'Edit',
    passwordDelete: 'Delete',
    passwordStatusReady: 'Passwords are encrypted locally.',
    passwordSaved: 'Password saved.',
    passwordCopied: 'Password copied.',
    passwordFilled: 'Password filled on the page.',
    savePasswordQuestion: 'Save password?',
    savePasswordDetail: 'Save login for {host} locally in Lumen.',
    notNow: 'Not now',
    passwordFillUnavailable: 'No compatible login form found on this page.',
    passwordNeedsPage: 'Open a web page first.',
    passwordNeedsFields: 'Add a site address and password.',
    passwordEncryptionUnavailable: 'Password encryption is unavailable on this system.',
    newProfileName: 'New profile name',
    addProfile: 'Add profile',
    privateWindow: 'New private window',
    openFolder: 'Open folder',
    clearList: 'Clear list',
    open: 'Open',
    reveal: 'Finder',
    unknown: 'unknown',
    untitled: 'Untitled',
    searchOrAddress: 'Search or enter address',
    navGeneral: 'General',
    navAppearance: 'Appearance',
    navTabs: 'Tabs',
    navPrivacy: 'Privacy',
    navVpn: 'VPN',
    navCapture: 'Capture',
    navDeveloper: 'Developer',
    navLibrary: 'Library',
    navAbout: 'About',
    sectionNavigation: 'Navigation',
    sectionInterface: 'Interface',
    sectionBehavior: 'Behavior',
    sectionBlocking: 'Blocking',
    sectionVpn: 'Amnezia VPN',
    sectionScreenshots: 'Screenshots',
    sectionTools: 'Tools',
    sectionBookmarks: 'Bookmarks',
    sectionAbout: 'Lumen Browser',
    theme: 'Theme',
    themeHelp: 'Choose one of 10 tuned interface palettes.',
    startPageBackdrop: 'Start page backdrop',
    startPageBackdropHelp: 'Choose the animated wallpaper for the home and new-tab page.',
    language: 'Browser language',
    languageHelp: 'Switch the Lumen interface language immediately.',
    translateTarget: 'Translate target',
    translateTargetHelp: 'Used by the translate button in the address bar.',
    searchEngine: 'Default search engine',
    searchEngineHelp: 'Used by the address bar and new-tab search.',
    activeProfile: 'Active profile',
    activeProfileHelp: 'Groups history, notes, and restored tabs.',
    homePage: 'Home page',
    homePageHelp: 'Leave empty to use the Lumen new-tab page.',
    bookmarksBar: 'Bookmarks bar',
    bookmarksBarHelp: 'Keep saved pages one click away under the address bar.',
    compactTabs: 'Compact tabs',
    compactTabsHelp: 'Fit more open pages into the top bar.',
    defaultZoom: 'Default zoom',
    defaultZoomHelp: 'Apply page scale to all open tabs and future tabs.',
    motion: 'Motion',
    motionHelp: 'Enable interface transitions and animated new-tab background.',
    securityIndicator: 'Security indicator',
    securityIndicatorHelp: 'Show the connection marker inside the address bar.',
    openTabsNext: 'Open tabs next to current',
    openTabsNextHelp: 'New tabs appear beside the active tab instead of at the far right.',
    backgroundTabs: 'Open requested tabs in background',
    backgroundTabsHelp: 'Links that request a new tab will not steal focus.',
    adblock: 'Built-in ad blocker',
    adblockHelp: 'Block common ad and tracker requests before pages load.',
    privacyShield: 'Privacy Shield',
    privacyShieldHelp: 'Send privacy headers and block noisy permission requests like geolocation and notifications.',
    fingerprintProtection: 'Fingerprint protection',
    fingerprintProtectionHelp: 'Reduce common browser fingerprint signals on loaded pages.',
    cleanTrackingLinks: 'Clean tracking links',
    cleanTrackingLinksHelp: 'Remove common tracking parameters before pages open.',
    pageCache: 'Page cache',
    pageCacheHelp: 'Clear cached files without deleting cookies, history, or site logins.',
    clearCache: 'Clear cache',
    cacheCleared: 'Cache cleared at {time}. Cookies, history, and logins were kept.',
    allowlist: 'Adblock allowlist',
    allowlistHelp: 'One domain per line. Requests to these hosts will be allowed.',
    vpnAmnezia: 'Amnezia VPN',
    vpnAmneziaFound: 'Found: {path}',
    vpnAmneziaMissing: 'AmneziaVPN is not installed in a standard location. Open the installer or docs.',
    openAmnezia: 'Open Amnezia',
    amneziaDocs: 'Docs / install',
    vpnBrowserProxy: 'Browser proxy',
    vpnBrowserProxyHelp: 'Route Lumen tabs through a local SOCKS/HTTP proxy. The system Amnezia tunnel is controlled by the Amnezia app.',
    vpnProxyEndpoint: 'Proxy endpoint',
    vpnProxyEndpointHelp: 'Use the endpoint exposed by your VPN/proxy client, for example 127.0.0.1:1080.',
    vpnProxyBypass: 'Proxy bypass',
    vpnProxyBypassHelp: 'Hosts that should skip the browser proxy. Keep <local> for local network addresses.',
    vpnProxyStatus: 'Proxy status',
    vpnProxyDisabled: 'Browser proxy is disabled.',
    vpnProxyReady: 'Browser proxy is active: {rules}. Bypass: {bypass}.',
    vpnProxyWaiting: 'Browser proxy is enabled, but host and port are not complete yet.',
    screenshotsPanel: 'Open screenshots panel after capture',
    screenshotsPanelHelp: 'Right-click screenshots appear in the right workspace drawer immediately.',
    savedScreenshots: 'Saved screenshots',
    screenshotFolder: 'Screenshot folder',
    developerMenu: 'Developer context menu',
    developerMenuHelp: 'Add Inspect element and DevTools to right-click menus.',
    savedPages: 'Saved pages',
    browserVersion: 'Browser version',
    engine: 'Engine',
    system: 'System',
    userData: 'User data',
    keyboardShortcuts: 'Keyboard shortcuts',
    keyboardShortcutsHelp: 'Core browser commands available from the keyboard.',
    newWindow: 'New window',
    newTab: 'New tab',
    closeTab: 'Close tab',
    restoreClosedTab: 'Restore closed tab',
    back: 'Back',
    forward: 'Forward',
    reload: 'Reload',
    home: 'Home',
    focusAddress: 'Focus address bar',
    screenshot: 'Take screenshot',
    contextMenu: 'Right click',
    takeScreenshot: 'Screenshot',
    resetPreferences: 'Reset preferences',
    resetCounter: 'Reset blocked counter',
    clearBrowsingData: 'Clear browsing data',
    openDevtools: 'Open DevTools',
    pageSource: 'Page source',
    splitView: 'Split view',
    translatePage: 'Translate page',
    openBookmarks: 'Open bookmarks',
    clearBookmarks: 'Clear bookmarks',
    importBrowserData: 'Import browser data',
    importBrowserDataHelp: 'Import bookmarks and history from Chrome/Safari, or passwords from CSV export.',
    importChrome: 'Import Chrome',
    importSafari: 'Import Safari',
    importPasswordCsv: 'Import password CSV',
    importComplete: 'Imported {bookmarks} bookmarks, {history} history items, {passwords} passwords.',
    importCanceled: 'Import canceled.',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select all',
    bookmarkPage: 'Bookmark page',
    bookmarks: 'Bookmarks',
    bookmarksBarShort: 'Bookmarks bar',
    sidebar: 'Sidebar',
    readerMode: 'Reader mode',
    adblockShort: 'Ad blocker',
    screenshotCount: '{count} {word} saved locally.',
    bookmarkCount: '{count} {word}',
    blockedCount: '{count} blocked',
    screenshotWordOne: 'screenshot',
    screenshotWordMany: 'screenshots',
    bookmarkWordOne: 'bookmark',
    bookmarkWordMany: 'bookmarks'
  },
  ru: {
    menu: 'МЕНЮ',
    settings: 'Настройки',
    control: 'Управление',
    searchSettings: 'Поиск по настройкам',
    changesApply: 'Изменения применяются сразу.',
    done: 'Готово',
    tabs: 'Вкладки',
    history: 'История',
    downloads: 'Загрузки',
    screenshots: 'Скриншоты',
    shots: 'Скрины',
    notes: 'Заметки',
    passwords: 'Пароли',
    profiles: 'Профили',
    workspace: 'Рабочая область',
    searchTabs: 'Поиск открытых вкладок',
    restoreClosed: 'Восстановить закрытую',
    closeDuplicates: 'Закрыть дубликаты',
    searchHistory: 'Поиск по истории',
    clearHistory: 'Очистить историю',
    noTabs: 'Нет вкладок',
    noHistory: 'История пуста',
    noDownloads: 'Загрузок нет',
    noScreenshots: 'Скриншотов нет',
    noBookmarks: 'Закладок нет',
    noPasswords: 'Сохраненных паролей нет',
    noPageSelected: 'Страница не выбрана',
    searchPasswords: 'Поиск паролей',
    notePlaceholder: 'Заметка для этой страницы',
    saveNote: 'Сохранить заметку',
    passwordTitle: 'Название',
    passwordUrl: 'Адрес сайта',
    passwordUsername: 'Логин / email',
    passwordValue: 'Пароль',
    passwordGenerate: 'Новый',
    passwordUseCurrent: 'Текущая',
    passwordFill: 'Вставить',
    passwordSave: 'Сохранить',
    passwordCopy: 'Копия',
    passwordEdit: 'Править',
    passwordDelete: 'Удалить',
    passwordStatusReady: 'Пароли зашифрованы локально.',
    passwordSaved: 'Пароль сохранен.',
    passwordCopied: 'Пароль скопирован.',
    passwordFilled: 'Пароль вставлен на странице.',
    savePasswordQuestion: 'Сохранить пароль?',
    savePasswordDetail: 'Сохранить логин для {host} локально в Lumen.',
    notNow: 'Не сейчас',
    passwordFillUnavailable: 'На странице не найдено подходящее поле входа.',
    passwordNeedsPage: 'Сначала открой веб-страницу.',
    passwordNeedsFields: 'Добавь адрес сайта и пароль.',
    passwordEncryptionUnavailable: 'Шифрование паролей недоступно на этой системе.',
    newProfileName: 'Имя нового профиля',
    addProfile: 'Добавить профиль',
    privateWindow: 'Приватное окно',
    openFolder: 'Открыть папку',
    clearList: 'Очистить список',
    open: 'Открыть',
    reveal: 'Finder',
    unknown: 'неизвестно',
    untitled: 'Без названия',
    searchOrAddress: 'Поиск или адрес',
    navGeneral: 'Основные',
    navAppearance: 'Вид',
    navTabs: 'Вкладки',
    navPrivacy: 'Приватность',
    navVpn: 'VPN',
    navCapture: 'Снимки',
    navDeveloper: 'Код',
    navLibrary: 'Библиотека',
    navAbout: 'О браузере',
    sectionNavigation: 'Навигация',
    sectionInterface: 'Интерфейс',
    sectionBehavior: 'Поведение',
    sectionBlocking: 'Блокировка',
    sectionVpn: 'Amnezia VPN',
    sectionScreenshots: 'Скриншоты',
    sectionTools: 'Инструменты',
    sectionBookmarks: 'Закладки',
    sectionAbout: 'Lumen Browser',
    theme: 'Тема',
    themeHelp: 'Выбери одну из 10 настроенных палитр интерфейса.',
    startPageBackdrop: 'Заставка главной страницы',
    startPageBackdropHelp: 'Выбери анимированные обои для домашней и новой вкладки.',
    language: 'Язык браузера',
    languageHelp: 'Переключает язык интерфейса Lumen сразу.',
    translateTarget: 'Язык перевода',
    translateTargetHelp: 'Используется кнопкой перевода рядом с адресной строкой.',
    searchEngine: 'Поисковик по умолчанию',
    searchEngineHelp: 'Используется в адресной строке и на новой вкладке.',
    activeProfile: 'Активный профиль',
    activeProfileHelp: 'Группирует историю, заметки и восстановленные вкладки.',
    homePage: 'Домашняя страница',
    homePageHelp: 'Оставь пустым, чтобы открывать стартовую страницу Lumen.',
    bookmarksBar: 'Панель закладок',
    bookmarksBarHelp: 'Держит сохраненные страницы под адресной строкой.',
    compactTabs: 'Компактные вкладки',
    compactTabsHelp: 'Помещает больше открытых страниц в верхнюю панель.',
    defaultZoom: 'Масштаб по умолчанию',
    defaultZoomHelp: 'Применяется ко всем открытым и будущим вкладкам.',
    motion: 'Анимации',
    motionHelp: 'Включает переходы интерфейса и анимацию стартовой страницы.',
    securityIndicator: 'Индикатор безопасности',
    securityIndicatorHelp: 'Показывает маркер соединения внутри адресной строки.',
    openTabsNext: 'Открывать рядом с текущей',
    openTabsNextHelp: 'Новые вкладки появляются рядом с активной, а не в конце.',
    backgroundTabs: 'Открывать новые вкладки в фоне',
    backgroundTabsHelp: 'Ссылки, открывающие новую вкладку, не забирают фокус.',
    adblock: 'Встроенный адблокер',
    adblockHelp: 'Блокирует частые рекламные и трекинговые запросы до загрузки.',
    privacyShield: 'Privacy Shield',
    privacyShieldHelp: 'Отправляет privacy-заголовки и блокирует шумные запросы разрешений вроде геолокации и уведомлений.',
    fingerprintProtection: 'Защита от fingerprinting',
    fingerprintProtectionHelp: 'Уменьшает типовые сигналы цифрового отпечатка на загруженных страницах.',
    cleanTrackingLinks: 'Чистить tracking-ссылки',
    cleanTrackingLinksHelp: 'Удаляет частые tracking-параметры до открытия страниц.',
    pageCache: 'Кеш страниц',
    pageCacheHelp: 'Очищает кешированные файлы, не удаляя cookies, историю и входы на сайты.',
    clearCache: 'Очистить кеш',
    cacheCleared: 'Кеш очищен в {time}. Cookies, история и входы сохранены.',
    allowlist: 'Исключения адблокера',
    allowlistHelp: 'Один домен на строку. Запросы к этим хостам будут разрешены.',
    vpnAmnezia: 'Amnezia VPN',
    vpnAmneziaFound: 'Найдено: {path}',
    vpnAmneziaMissing: 'AmneziaVPN не найден в стандартном месте. Открой установщик или документацию.',
    openAmnezia: 'Открыть Amnezia',
    amneziaDocs: 'Документация / установка',
    vpnBrowserProxy: 'Proxy браузера',
    vpnBrowserProxyHelp: 'Пускает вкладки Lumen через локальный SOCKS/HTTP proxy. Системным туннелем Amnezia управляет приложение Amnezia.',
    vpnProxyEndpoint: 'Proxy endpoint',
    vpnProxyEndpointHelp: 'Укажи endpoint от VPN/proxy клиента, например 127.0.0.1:1080.',
    vpnProxyBypass: 'Обход proxy',
    vpnProxyBypassHelp: 'Хосты, которые не идут через proxy браузера. Оставь <local> для локальной сети.',
    vpnProxyStatus: 'Статус proxy',
    vpnProxyDisabled: 'Proxy браузера выключен.',
    vpnProxyReady: 'Proxy браузера активен: {rules}. Обход: {bypass}.',
    vpnProxyWaiting: 'Proxy браузера включен, но host и port пока не заполнены.',
    screenshotsPanel: 'Открывать скриншоты после снимка',
    screenshotsPanelHelp: 'Скриншоты из ПКМ сразу появляются в правой панели.',
    savedScreenshots: 'Сохраненные скриншоты',
    screenshotFolder: 'Папка скриншотов',
    developerMenu: 'Меню разработчика',
    developerMenuHelp: 'Добавляет Код элемента и DevTools в меню ПКМ.',
    savedPages: 'Сохраненные страницы',
    browserVersion: 'Версия браузера',
    engine: 'Движок',
    system: 'Система',
    userData: 'Данные пользователя',
    keyboardShortcuts: 'Команды и сочетания',
    keyboardShortcutsHelp: 'Основные команды браузера, доступные с клавиатуры.',
    newWindow: 'Новое окно',
    newTab: 'Новая вкладка',
    closeTab: 'Закрыть вкладку',
    restoreClosedTab: 'Восстановить вкладку',
    back: 'Назад',
    forward: 'Вперед',
    reload: 'Перезагрузить',
    home: 'Домой',
    focusAddress: 'Фокус на адресную строку',
    screenshot: 'Сделать скриншот',
    contextMenu: 'ПКМ',
    takeScreenshot: 'Скриншот',
    resetPreferences: 'Сбросить настройки',
    resetCounter: 'Сбросить счетчик',
    clearBrowsingData: 'Очистить данные',
    openDevtools: 'Открыть DevTools',
    pageSource: 'Код страницы',
    splitView: 'Разделить экран',
    translatePage: 'Перевести страницу',
    openBookmarks: 'Открыть закладки',
    clearBookmarks: 'Очистить закладки',
    importBrowserData: 'Импорт данных браузера',
    importBrowserDataHelp: 'Импортирует закладки и историю из Chrome/Safari или пароли из CSV-экспорта.',
    importChrome: 'Импорт Chrome',
    importSafari: 'Импорт Safari',
    importPasswordCsv: 'Импорт CSV паролей',
    importComplete: 'Импортировано: закладки {bookmarks}, история {history}, пароли {passwords}.',
    importCanceled: 'Импорт отменен.',
    cut: 'Вырезать',
    copy: 'Копировать',
    paste: 'Вставить',
    selectAll: 'Выбрать все',
    bookmarkPage: 'Добавить закладку',
    bookmarks: 'Закладки',
    bookmarksBarShort: 'Панель закладок',
    sidebar: 'Правая панель',
    readerMode: 'Режим чтения',
    adblockShort: 'Адблокер',
    screenshotCount: '{count} {word} сохранено локально.',
    bookmarkCount: '{count} {word}',
    blockedCount: '{count} заблокировано',
    screenshotWordOne: 'скриншот',
    screenshotWordMany: 'скриншотов',
    bookmarkWordOne: 'закладка',
    bookmarkWordMany: 'закладок'
  }
};

const elements = {
  windowMinimizeButton: document.querySelector('#windowMinimizeButton'),
  windowMaximizeButton: document.querySelector('#windowMaximizeButton'),
  windowCloseButton: document.querySelector('#windowCloseButton'),
  tabStrip: document.querySelector('#tabStrip'),
  newTabButton: document.querySelector('#newTabButton'),
  navForm: document.querySelector('#navForm'),
  backButton: document.querySelector('#backButton'),
  forwardButton: document.querySelector('#forwardButton'),
  reloadButton: document.querySelector('#reloadButton'),
  homeButton: document.querySelector('#homeButton'),
  translateButton: document.querySelector('#translateButton'),
  sidebarButton: document.querySelector('#sidebarButton'),
  omnibox: document.querySelector('#omnibox'),
  securityDot: document.querySelector('#securityDot'),
  bookmarkButton: document.querySelector('#bookmarkButton'),
  adblockButton: document.querySelector('#adblockButton'),
  adblockState: document.querySelector('#adblockState'),
  blockedCount: document.querySelector('#blockedCount'),
  settingsButton: document.querySelector('#settingsButton'),
  menuButton: document.querySelector('#menuButton'),
  appMenu: document.querySelector('#appMenu'),
  bookmarkBar: document.querySelector('#bookmarkBar'),
  webviewStage: document.querySelector('#webviewStage'),
  workspace: document.querySelector('.workspace'),
  sidePanel: document.querySelector('#sidePanel'),
  sideTitle: document.querySelector('#sideTitle'),
  closeSidebarButton: document.querySelector('#closeSidebarButton'),
  tabSearchInput: document.querySelector('#tabSearchInput'),
  tabManagerList: document.querySelector('#tabManagerList'),
  restoreClosedTabButton: document.querySelector('#restoreClosedTabButton'),
  closeDuplicateTabsButton: document.querySelector('#closeDuplicateTabsButton'),
  historySearchInput: document.querySelector('#historySearchInput'),
  historyList: document.querySelector('#historyList'),
  clearHistoryButton: document.querySelector('#clearHistoryButton'),
  downloadList: document.querySelector('#downloadList'),
  screenshotList: document.querySelector('#screenshotList'),
  openScreenshotsFolderButton: document.querySelector('#openScreenshotsFolderButton'),
  clearScreenshotsButton: document.querySelector('#clearScreenshotsButton'),
  noteMeta: document.querySelector('#noteMeta'),
  pageNoteInput: document.querySelector('#pageNoteInput'),
  saveNoteButton: document.querySelector('#saveNoteButton'),
  passwordSearchInput: document.querySelector('#passwordSearchInput'),
  passwordForm: document.querySelector('#passwordForm'),
  passwordTitleInput: document.querySelector('#passwordTitleInput'),
  passwordUrlInput: document.querySelector('#passwordUrlInput'),
  passwordUsernameInput: document.querySelector('#passwordUsernameInput'),
  passwordValueInput: document.querySelector('#passwordValueInput'),
  passwordGenerateButton: document.querySelector('#passwordGenerateButton'),
  passwordUseCurrentButton: document.querySelector('#passwordUseCurrentButton'),
  passwordFillButton: document.querySelector('#passwordFillButton'),
  passwordSaveButton: document.querySelector('#passwordSaveButton'),
  passwordStatus: document.querySelector('#passwordStatus'),
  passwordList: document.querySelector('#passwordList'),
  passwordSavePrompt: document.querySelector('#passwordSavePrompt'),
  passwordPromptTitle: document.querySelector('#passwordPromptTitle'),
  passwordPromptDetail: document.querySelector('#passwordPromptDetail'),
  passwordPromptSaveButton: document.querySelector('#passwordPromptSaveButton'),
  passwordPromptEditButton: document.querySelector('#passwordPromptEditButton'),
  passwordPromptDismissButton: document.querySelector('#passwordPromptDismissButton'),
  profileList: document.querySelector('#profileList'),
  profileForm: document.querySelector('#profileForm'),
  profileNameInput: document.querySelector('#profileNameInput'),
  privateWindowButton: document.querySelector('#privateWindowButton'),
  settingsDialog: document.querySelector('#settingsDialog'),
  settingsForm: document.querySelector('#settingsForm'),
  closeSettingsButton: document.querySelector('#closeSettingsButton'),
  settingsSearchInput: document.querySelector('#settingsSearchInput'),
  settingsSearchEngine: document.querySelector('#settingsSearchEngine'),
  settingsTheme: document.querySelector('#settingsTheme'),
  settingsStartPageBackdrop: document.querySelector('#settingsStartPageBackdrop'),
  settingsLanguage: document.querySelector('#settingsLanguage'),
  settingsTranslationTarget: document.querySelector('#settingsTranslationTarget'),
  settingsActiveProfile: document.querySelector('#settingsActiveProfile'),
  settingsHomePageUrl: document.querySelector('#settingsHomePageUrl'),
  settingsAdblockToggle: document.querySelector('#settingsAdblockToggle'),
  settingsAdblockAllowlist: document.querySelector('#settingsAdblockAllowlist'),
  settingsBookmarkBarToggle: document.querySelector('#settingsBookmarkBarToggle'),
  settingsCompactTabsToggle: document.querySelector('#settingsCompactTabsToggle'),
  settingsDefaultZoom: document.querySelector('#settingsDefaultZoom'),
  settingsMotionToggle: document.querySelector('#settingsMotionToggle'),
  settingsSecurityToggle: document.querySelector('#settingsSecurityToggle'),
  settingsPrivacyShieldToggle: document.querySelector('#settingsPrivacyShieldToggle'),
  settingsFingerprintToggle: document.querySelector('#settingsFingerprintToggle'),
  settingsStripTrackingToggle: document.querySelector('#settingsStripTrackingToggle'),
  settingsOpenTabsNextToCurrentToggle: document.querySelector('#settingsOpenTabsNextToCurrentToggle'),
  settingsOpenNewTabsInBackgroundToggle: document.querySelector('#settingsOpenNewTabsInBackgroundToggle'),
  settingsScreenshotsPanelToggle: document.querySelector('#settingsScreenshotsPanelToggle'),
  settingsDeveloperContextMenuToggle: document.querySelector('#settingsDeveloperContextMenuToggle'),
  settingsVpnStatus: document.querySelector('#settingsVpnStatus'),
  settingsOpenAmneziaButton: document.querySelector('#settingsOpenAmneziaButton'),
  settingsOpenAmneziaDocsButton: document.querySelector('#settingsOpenAmneziaDocsButton'),
  settingsVpnProxyToggle: document.querySelector('#settingsVpnProxyToggle'),
  settingsVpnProxyScheme: document.querySelector('#settingsVpnProxyScheme'),
  settingsVpnProxyHost: document.querySelector('#settingsVpnProxyHost'),
  settingsVpnProxyPort: document.querySelector('#settingsVpnProxyPort'),
  settingsVpnProxyBypass: document.querySelector('#settingsVpnProxyBypass'),
  settingsVpnProxyStatus: document.querySelector('#settingsVpnProxyStatus'),
  settingsBookmarkCount: document.querySelector('#settingsBookmarkCount'),
  settingsBlockedCount: document.querySelector('#settingsBlockedCount'),
  settingsBookmarkDetail: document.querySelector('#settingsBookmarkDetail'),
  settingsScreenshotDetail: document.querySelector('#settingsScreenshotDetail'),
  settingsScreenshotFolder: document.querySelector('#settingsScreenshotFolder'),
  settingsAppVersion: document.querySelector('#settingsAppVersion'),
  settingsEngineVersion: document.querySelector('#settingsEngineVersion'),
  settingsPlatformInfo: document.querySelector('#settingsPlatformInfo'),
  settingsUserDataPath: document.querySelector('#settingsUserDataPath'),
  settingsNewWindowButton: document.querySelector('#settingsNewWindowButton'),
  settingsPrivateWindowButton: document.querySelector('#settingsPrivateWindowButton'),
  settingsResetPreferencesButton: document.querySelector('#settingsResetPreferencesButton'),
  settingsResetAdblockButton: document.querySelector('#settingsResetAdblockButton'),
  settingsClearCacheButton: document.querySelector('#settingsClearCacheButton'),
  settingsCacheStatus: document.querySelector('#settingsCacheStatus'),
  settingsClearBrowsingDataButton: document.querySelector('#settingsClearBrowsingDataButton'),
  settingsOpenScreenshotsFolderButton: document.querySelector('#settingsOpenScreenshotsFolderButton'),
  settingsClearScreenshotsButton: document.querySelector('#settingsClearScreenshotsButton'),
  settingsOpenBookmarksButton: document.querySelector('#settingsOpenBookmarksButton'),
  settingsClearBookmarksButton: document.querySelector('#settingsClearBookmarksButton'),
  settingsImportStatus: document.querySelector('#settingsImportStatus'),
  settingsImportChromeButton: document.querySelector('#settingsImportChromeButton'),
  settingsImportSafariButton: document.querySelector('#settingsImportSafariButton'),
  settingsImportPasswordsButton: document.querySelector('#settingsImportPasswordsButton'),
  bookmarksDialog: document.querySelector('#bookmarksDialog'),
  closeBookmarksButton: document.querySelector('#closeBookmarksButton'),
  bookmarkList: document.querySelector('#bookmarkList')
};

const state = {
  tabs: [],
  activeTabId: null,
  settings: null,
  browserInfo: null,
  vpnStatus: null,
  passwords: [],
  passwordEditingId: null,
  pendingPasswordCapture: null,
  downloads: [],
  blockedTotal: 0,
  nextTabId: 1,
  draggedTabId: null,
  historyRecordedUrls: new Set(),
  noteDrafts: new Map(),
  noteEditorUrl: null,
  sessionSaveTimer: null
};

boot();

function getLanguage() {
  return state.settings?.language === 'en' ? 'en' : 'ru';
}

function t(key, replacements = {}) {
  const dictionary = TRANSLATIONS[getLanguage()] || TRANSLATIONS.ru;
  let value = dictionary[key] || TRANSLATIONS.en[key] || key;

  for (const [name, replacement] of Object.entries(replacements)) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }

  return value;
}

function setText(selector, key) {
  for (const element of document.querySelectorAll(selector)) {
    element.textContent = t(key);
  }
}

function setPlaceholder(selector, key) {
  for (const element of document.querySelectorAll(selector)) {
    element.placeholder = t(key);
  }
}

function applyLanguage() {
  document.documentElement.lang = getLanguage();

  setText('#menuButton', 'menu');
  setText('.settings-header .eyebrow', 'control');
  setText('.settings-header h2', 'settings');
  setText('.bookmarks-card .dialog-header .eyebrow', 'navLibrary');
  setText('.bookmarks-card .dialog-header h2', 'bookmarks');
  setText('.settings-note', 'changesApply');
  setText('#saveSettingsButton', 'done');
  setPlaceholder('#omnibox', 'searchOrAddress');
  setPlaceholder('#settingsSearchInput', 'searchSettings');
  setPlaceholder('#tabSearchInput', 'searchTabs');
  setPlaceholder('#historySearchInput', 'searchHistory');
  setPlaceholder('#pageNoteInput', 'notePlaceholder');
  setPlaceholder('#passwordSearchInput', 'searchPasswords');
  setPlaceholder('#passwordTitleInput', 'passwordTitle');
  setPlaceholder('#passwordUrlInput', 'passwordUrl');
  setPlaceholder('#passwordUsernameInput', 'passwordUsername');
  setPlaceholder('#passwordValueInput', 'passwordValue');
  setPlaceholder('#profileNameInput', 'newProfileName');

  const sideLabels = {
    tabs: 'tabs',
    history: 'history',
    downloads: 'downloads',
    screenshots: 'shots',
    notes: 'notes',
    passwords: 'passwords',
    profiles: 'profiles'
  };

  for (const [view, key] of Object.entries(sideLabels)) {
    setText(`[data-side-view="${view}"]`, key);
  }
  const activeSideView = document.querySelector('[data-side-panel].is-active')?.dataset.sidePanel || 'tabs';
  const sideTitleLabels = { ...sideLabels, screenshots: 'screenshots' };
  elements.sideTitle.textContent = t(sideTitleLabels[activeSideView] || 'workspace');

  const navLabels = {
    general: 'navGeneral',
    appearance: 'navAppearance',
    tabs: 'navTabs',
    privacy: 'navPrivacy',
    vpn: 'navVpn',
    capture: 'navCapture',
    developer: 'navDeveloper',
    library: 'navLibrary',
    about: 'navAbout'
  };

  for (const [section, key] of Object.entries(navLabels)) {
    setText(`[data-settings-section="${section}"]`, key);
  }

  const panelHeadings = {
    general: ['navGeneral', 'sectionNavigation'],
    appearance: ['navAppearance', 'sectionInterface'],
    tabs: ['navTabs', 'sectionBehavior'],
    privacy: ['navPrivacy', 'sectionBlocking'],
    vpn: ['navVpn', 'sectionVpn'],
    capture: ['navCapture', 'sectionScreenshots'],
    developer: ['navDeveloper', 'sectionTools'],
    library: ['navLibrary', 'sectionBookmarks'],
    about: ['navAbout', 'sectionAbout']
  };

  for (const [panel, [eyebrow, heading]] of Object.entries(panelHeadings)) {
    setText(`[data-settings-panel="${panel}"] .section-heading .eyebrow`, eyebrow);
    setText(`[data-settings-panel="${panel}"] .section-heading h3`, heading);
  }

  const settingRows = [
    ['default search engine duckduckgo google bing brave yandex', 'searchEngine', 'searchEngineHelp'],
    ['theme browser color palette pure black graphite terminal paper midnight matrix frost solar violet ember', 'theme', 'themeHelp'],
    ['start page backdrop wallpaper animation home new tab signal orbit rain waveform starfield radar quiet', 'startPageBackdrop', 'startPageBackdropHelp'],
    ['language interface russian english locale', 'language', 'languageHelp'],
    ['translate translation language target page', 'translateTarget', 'translateTargetHelp'],
    ['profile active personal work', 'activeProfile', 'activeProfileHelp'],
    ['home page homepage start page new tab', 'homePage', 'homePageHelp'],
    ['bookmarks bar show hide', 'bookmarksBar', 'bookmarksBarHelp'],
    ['compact tabs smaller dense tabs', 'compactTabs', 'compactTabsHelp'],
    ['zoom page scale size text default zoom', 'defaultZoom', 'defaultZoomHelp'],
    ['motion animation transitions start page', 'motion', 'motionHelp'],
    ['security indicator lock secure dot', 'securityIndicator', 'securityIndicatorHelp'],
    ['open tabs next to current adjacent order', 'openTabsNext', 'openTabsNextHelp'],
    ['background tabs links popups', 'backgroundTabs', 'backgroundTabsHelp'],
    ['ad blocker ads trackers', 'adblock', 'adblockHelp'],
    ['privacy shield do not track gpc permissions geolocation notifications', 'privacyShield', 'privacyShieldHelp'],
    ['fingerprint protection canvas navigator hardware privacy', 'fingerprintProtection', 'fingerprintProtectionHelp'],
    ['tracking params strip utm fbclid gclid clean links', 'cleanTrackingLinks', 'cleanTrackingLinksHelp'],
    ['cache clear cached files reload storage', 'pageCache', 'pageCacheHelp'],
    ['adblock allowlist whitelist domains', 'allowlist', 'allowlistHelp'],
    ['vpn amnezia status installed app client', 'vpnAmnezia', null],
    ['vpn proxy browser only toggle chromium', 'vpnBrowserProxy', 'vpnBrowserProxyHelp'],
    ['vpn proxy endpoint socks http host port', 'vpnProxyEndpoint', 'vpnProxyEndpointHelp'],
    ['vpn proxy bypass local domains exceptions', 'vpnProxyBypass', 'vpnProxyBypassHelp'],
    ['vpn proxy status active connection', 'vpnProxyStatus', null],
    ['open screenshots panel after capture right sidebar', 'screenshotsPanel', 'screenshotsPanelHelp'],
    ['screenshots saved count folder path', 'savedScreenshots', null],
    ['screenshots folder path pictures', 'screenshotFolder', null],
    ['inspect element code context menu devtools', 'developerMenu', 'developerMenuHelp'],
    ['bookmarks count saved pages', 'savedPages', null],
    ['import chrome safari bookmarks history passwords csv', 'importBrowserData', 'importBrowserDataHelp'],
    ['browser version app', 'browserVersion', null],
    ['chromium electron engine version', 'engine', null],
    ['platform os architecture node', 'system', null],
    ['user data settings path profile storage', 'userData', null],
    ['commands shortcuts keyboard hotkeys', 'keyboardShortcuts', 'keyboardShortcutsHelp']
  ];

  for (const [searchKey, titleKey, helperKey] of settingRows) {
    setText(`[data-settings-search="${searchKey}"] strong`, titleKey);
    if (helperKey) setText(`[data-settings-search="${searchKey}"] small`, helperKey);
  }

  const shortcutLabels = {
    newTab: 'newTab',
    newWindow: 'newWindow',
    privateWindow: 'privateWindow',
    closeTab: 'closeTab',
    restoreClosedTab: 'restoreClosedTab',
    focusAddress: 'focusAddress',
    back: 'back',
    forward: 'forward',
    reload: 'reload',
    bookmarkPage: 'bookmarkPage',
    bookmarks: 'bookmarks',
    sidebar: 'sidebar',
    settings: 'settings',
    screenshot: 'screenshot'
  };

  for (const [shortcut, key] of Object.entries(shortcutLabels)) {
    setText(`[data-shortcut-label="${shortcut}"]`, key);
  }

  setText('[data-shortcut-key="contextMenu"]', 'contextMenu');
  setText('[data-shortcut-key="takeScreenshot"]', 'takeScreenshot');

  setText('#settingsNewWindowButton', 'newWindow');
  setText('#settingsPrivateWindowButton', 'privateWindow');
  setText('#settingsResetPreferencesButton', 'resetPreferences');
  setText('#settingsResetAdblockButton', 'resetCounter');
  setText('#settingsClearCacheButton', 'clearCache');
  setText('#settingsClearBrowsingDataButton', 'clearBrowsingData');
  setText('#settingsOpenAmneziaButton', 'openAmnezia');
  setText('#settingsOpenAmneziaDocsButton', 'amneziaDocs');
  setText('#settingsOpenScreenshotsFolderButton, #openScreenshotsFolderButton', 'openFolder');
  setText('#settingsClearScreenshotsButton, #clearScreenshotsButton', 'clearList');
  setText('#settingsOpenBookmarksButton', 'openBookmarks');
  setText('#settingsClearBookmarksButton', 'clearBookmarks');
  setText('#settingsImportChromeButton', 'importChrome');
  setText('#settingsImportSafariButton', 'importSafari');
  setText('#settingsImportPasswordsButton', 'importPasswordCsv');
  setText('#saveNoteButton', 'saveNote');
  setText('#passwordGenerateButton', 'passwordGenerate');
  setText('#passwordUseCurrentButton', 'passwordUseCurrent');
  setText('#passwordFillButton', 'passwordFill');
  setText('#passwordSaveButton', 'passwordSave');
  setText('#passwordPromptSaveButton', 'passwordSave');
  setText('#passwordPromptEditButton', 'passwordEdit');
  setText('#passwordPromptDismissButton', 'notNow');
  setPasswordStatus('passwordStatusReady');
  setText('#profileForm .secondary-button', 'addProfile');
  setText('#privateWindowButton', 'privateWindow');
  setText('[data-command="new-tab"]', 'newTab');
  setText('[data-command="new-window"]', 'newWindow');
  setText('[data-command="new-private-window"]', 'privateWindow');
  setText('[data-command="close-tab"]', 'closeTab');
  setText('[data-command="restore-closed-tab"]', 'restoreClosedTab');
  setText('[data-command="back"]', 'back');
  setText('[data-command="forward"]', 'forward');
  setText('[data-command="reload"]', 'reload');
  setText('[data-command="home"]', 'home');
  setText('[data-command="cut"]', 'cut');
  setText('[data-command="copy"]', 'copy');
  setText('[data-command="paste"]', 'paste');
  setText('[data-command="select-all"]', 'selectAll');
  setText('[data-command="toggle-bookmark"]', 'bookmarkPage');
  setText('[data-command="toggle-bookmarks-panel"]', 'bookmarks');
  setText('[data-command="toggle-bookmarks-bar"]', 'bookmarksBarShort');
  setText('[data-command="password-manager"]', 'passwords');
  setText('[data-command="split-view"]', 'splitView');
  setText('[data-command="translate-page"]', 'translatePage');
  setText('[data-command="toggle-sidebar"]', 'sidebar');
  setText('[data-command="reader-mode"]', 'readerMode');
  setText('[data-command="toggle-adblock"]', 'adblockShort');
  setText('[data-command="reset-adblock"]', 'resetCounter');
  setText('[data-command="settings"]', 'settings');
  setText('[data-command="devtools"]', 'openDevtools');
  setText('[data-command="view-source"]', 'pageSource');

  updateAdblockUi();
  updateBookmarkButton();
  renderSidebar();
  refreshSettingsSummary();
  renderBrowserInfo();
  renderVpnStatus();
  renderPasswords();
}

async function boot() {
  state.settings = await window.lumen.getSettings();
  state.browserInfo = await window.lumen.getBrowserInfo();
  state.vpnStatus = await window.lumen.getVpnStatus();
  await window.lumen.ensurePartition(BROWSER_PARTITION);
  const stats = await window.lumen.getAdblockStats();
  state.blockedTotal = stats.total || 0;
  state.downloads = await window.lumen.getDownloads();
  state.passwords = await window.lumen.getPasswords();

  wireEvents();
  window.lumen.getWindowState().then(updateWindowControls).catch(() => {});
  setSidebarOpen(false);
  applyInterfacePreferences();
  applyLanguage();
  updateAdblockUi();
  renderBookmarks();
  renderSidebar();
  renderBrowserInfo();
  restoreSavedSession();

  window.lumen.onAdblockBlocked((event) => {
    state.blockedTotal = event.total;
    updateAdblockUi();
  });

  window.lumen.onAdblockReset((statsPayload) => {
    state.blockedTotal = statsPayload.total || 0;
    updateAdblockUi();
  });

  window.lumen.onNewTabRequest((url) => {
    if (url) createTab(url, { activate: !state.settings?.openNewTabsInBackground });
  });

  window.lumen.onSettingsChanged((settings) => {
    state.settings = settings;
    applyInterfacePreferences();
    applyLanguage();
    applyZoomToAllTabs();
    updateAdblockUi();
    renderBookmarks();
    updateBookmarkButton();
    refreshSettingsSummary();
    renderSidebar();
    renderVpnStatus();
  });

  window.lumen.onPasswordsChanged((passwords) => {
    state.passwords = passwords || [];
    renderPasswords();
  });

  window.lumen.onMenuCommand((command) => {
    runCommand(command);
  });

  window.lumen.onDownloadsUpdated((downloads) => {
    state.downloads = downloads;
    renderDownloads();
  });

  window.lumen.onScreenshotCreated((payload) => {
    if (payload?.settings) {
      state.settings = payload.settings;
    }

    renderScreenshots();
    refreshSettingsSummary();

    if (state.settings?.screenshotsPanelOnCapture !== false) {
      setSidebarOpen(true, 'screenshots');
    }
  });

  window.lumen.onWindowStateChanged((windowState) => {
    updateWindowControls(windowState);
  });
}

async function controlWindow(action) {
  const windowState = await window.lumen.controlWindow(action);
  updateWindowControls(windowState);
}

function updateWindowControls(windowState = {}) {
  const isMaximized = Boolean(windowState.maximized || windowState.fullscreen);
  elements.windowMaximizeButton.textContent = isMaximized ? '❐' : '□';
  elements.windowMaximizeButton.setAttribute('aria-label', isMaximized ? 'Restore' : 'Maximize');
  elements.windowMaximizeButton.title = isMaximized ? 'Restore' : 'Maximize';
}

function wireEvents() {
  elements.windowMinimizeButton.addEventListener('click', () => controlWindow('minimize'));
  elements.windowMaximizeButton.addEventListener('click', () => controlWindow('toggle-maximize'));
  elements.windowCloseButton.addEventListener('click', () => controlWindow('close'));
  elements.newTabButton.addEventListener('click', () => createTab(getNewTabUrl()));
  elements.tabStrip.addEventListener('dragover', (event) => {
    if (!state.draggedTabId || event.target.closest('.tab')) return;

    event.preventDefault();
    clearTabDropMarkers();
    elements.tabStrip.classList.add('is-drop-tail');
  });

  elements.tabStrip.addEventListener('drop', (event) => {
    if (!state.draggedTabId || event.target.closest('.tab')) return;

    event.preventDefault();
    const sourceId = Number(event.dataTransfer.getData('text/plain'));
    const previousRects = captureTabRects();
    const moved = moveTabToIndex(sourceId, state.tabs.length);

    state.draggedTabId = null;
    clearTabDropMarkers();
    renderTabs();
    if (moved) animateTabReorder(previousRects);
  });

  elements.tabStrip.addEventListener('dragleave', (event) => {
    if (!elements.tabStrip.contains(event.relatedTarget)) {
      elements.tabStrip.classList.remove('is-drop-tail');
    }
  });

  elements.navForm.addEventListener('submit', (event) => {
    event.preventDefault();
    navigateActiveTab(toNavigationUrl(elements.omnibox.value));
  });

  elements.backButton.addEventListener('click', () => runCommand('back'));
  elements.forwardButton.addEventListener('click', () => runCommand('forward'));
  elements.reloadButton.addEventListener('click', () => runCommand('reload'));
  elements.homeButton.addEventListener('click', () => runCommand('home'));
  elements.translateButton.addEventListener('click', () => runCommand('translate-page'));
  elements.bookmarkButton.addEventListener('click', () => runCommand('toggle-bookmark'));
  elements.adblockButton.addEventListener('click', () => runCommand('toggle-adblock'));
  elements.settingsButton.addEventListener('click', () => runCommand('settings'));
  elements.sidebarButton.addEventListener('click', () => runCommand('toggle-sidebar'));
  elements.menuButton.addEventListener('click', toggleMenu);

  elements.appMenu.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-command]');
    if (!button) return;
    closeMenu();
    runCommand(button.dataset.command);
  });

  document.addEventListener('click', (event) => {
    if (elements.appMenu.hidden) return;
    if (elements.appMenu.contains(event.target) || elements.menuButton.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      closeDialogs();
    }

    if (event.metaKey || event.ctrlKey) {
      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        runCommand('focus-omnibox');
      }

      if (event.shiftKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        runCommand('restore-closed-tab');
      }

      if (event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        runCommand('toggle-sidebar');
      }

      if (event.key === ',') {
        event.preventDefault();
        runCommand('settings');
      }
    }
  });

  elements.closeSidebarButton.addEventListener('click', () => setSidebarOpen(false));
  elements.tabSearchInput.addEventListener('input', renderTabManager);
  elements.historySearchInput.addEventListener('input', renderHistory);
  elements.restoreClosedTabButton.addEventListener('click', () => runCommand('restore-closed-tab'));
  elements.closeDuplicateTabsButton.addEventListener('click', closeDuplicateTabs);
  elements.openScreenshotsFolderButton.addEventListener('click', () => window.lumen.openScreenshotsFolder());
  elements.clearScreenshotsButton.addEventListener('click', clearScreenshots);
  elements.clearHistoryButton.addEventListener('click', async () => {
    state.settings = await window.lumen.clearHistory();
    renderHistory();
  });
  elements.saveNoteButton.addEventListener('click', saveCurrentNote);
  elements.pageNoteInput.addEventListener('input', () => {
    if (!state.noteEditorUrl) return;
    state.noteDrafts.set(state.noteEditorUrl, elements.pageNoteInput.value);
  });
  elements.passwordSearchInput.addEventListener('input', renderPasswords);
  elements.passwordForm.addEventListener('submit', savePasswordFromForm);
  elements.passwordGenerateButton.addEventListener('click', () => {
    elements.passwordValueInput.type = 'text';
    elements.passwordValueInput.value = generatePassword();
    setPasswordStatus('passwordStatusReady');
  });
  elements.passwordUseCurrentButton.addEventListener('click', fillPasswordFormFromCurrentPage);
  elements.passwordFillButton.addEventListener('click', () => fillPasswordForActivePage());
  elements.passwordPromptSaveButton.addEventListener('click', savePromptedPassword);
  elements.passwordPromptEditButton.addEventListener('click', editPromptedPassword);
  elements.passwordPromptDismissButton.addEventListener('click', dismissPasswordPrompt);
  elements.profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = elements.profileNameInput.value.trim();
    if (!name) return;
    state.settings = await window.lumen.addProfile(name);
    elements.profileNameInput.value = '';
    fillSettingsForm();
    renderProfiles();
  });
  elements.privateWindowButton.addEventListener('click', () => runCommand('new-private-window'));

  for (const button of document.querySelectorAll('[data-side-view]')) {
    button.addEventListener('click', () => showSideView(button.dataset.sideView));
  }

  elements.closeSettingsButton.addEventListener('click', () => elements.settingsDialog.close());
  elements.settingsForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveSettings({ close: true });
  });
  elements.settingsSearchInput.addEventListener('input', filterSettings);
  elements.settingsSearchEngine.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsTheme.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsStartPageBackdrop.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsLanguage.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsTranslationTarget.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsActiveProfile.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsHomePageUrl.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsAdblockToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsBookmarkBarToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsCompactTabsToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsDefaultZoom.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsMotionToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsSecurityToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsPrivacyShieldToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsFingerprintToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsStripTrackingToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsOpenTabsNextToCurrentToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsOpenNewTabsInBackgroundToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsScreenshotsPanelToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsDeveloperContextMenuToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsAdblockAllowlist.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsOpenAmneziaButton.addEventListener('click', async () => {
    elements.settingsOpenAmneziaButton.disabled = true;

    try {
      await window.lumen.openAmneziaVpn();
      await refreshVpnStatus();
    } finally {
      elements.settingsOpenAmneziaButton.disabled = false;
    }
  });
  elements.settingsOpenAmneziaDocsButton.addEventListener('click', () => window.lumen.openAmneziaDocs());
  elements.settingsVpnProxyToggle.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsVpnProxyScheme.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsVpnProxyHost.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsVpnProxyPort.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsVpnProxyBypass.addEventListener('change', () => saveSettings({ close: false }));
  elements.settingsNewWindowButton.addEventListener('click', () => runCommand('new-window'));
  elements.settingsPrivateWindowButton.addEventListener('click', () => runCommand('new-private-window'));
  elements.settingsResetPreferencesButton.addEventListener('click', async () => {
    state.settings = await window.lumen.resetPreferences();
    applyInterfacePreferences();
    applyLanguage();
    applyZoomToAllTabs();
    fillSettingsForm();
    await refreshVpnStatus();
    renderBookmarks();
  });
  elements.settingsResetAdblockButton.addEventListener('click', async () => {
    await window.lumen.resetAdblockStats();
    refreshSettingsSummary();
  });
  elements.settingsClearCacheButton.addEventListener('click', clearCacheFromSettings);
  elements.settingsClearBrowsingDataButton.addEventListener('click', async () => {
    await window.lumen.clearBrowsingData();
    state.blockedTotal = 0;
    elements.settingsCacheStatus.textContent = t('cacheCleared', {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    updateAdblockUi();
    refreshSettingsSummary();
  });
  elements.settingsOpenScreenshotsFolderButton.addEventListener('click', () => window.lumen.openScreenshotsFolder());
  elements.settingsClearScreenshotsButton.addEventListener('click', clearScreenshots);
  elements.settingsOpenBookmarksButton.addEventListener('click', () => {
    elements.settingsDialog.close();
    openBookmarks();
  });
  elements.settingsClearBookmarksButton.addEventListener('click', async () => {
    state.settings = await window.lumen.clearBookmarks();
    renderBookmarks();
    updateBookmarkButton();
    refreshSettingsSummary();
  });
  elements.settingsImportChromeButton.addEventListener('click', () => importBrowserData('chrome'));
  elements.settingsImportSafariButton.addEventListener('click', () => importBrowserData('safari'));
  elements.settingsImportPasswordsButton.addEventListener('click', importPasswordCsv);

  for (const button of document.querySelectorAll('[data-settings-section]')) {
    button.addEventListener('click', () => showSettingsSection(button.dataset.settingsSection));
  }

  for (const button of document.querySelectorAll('.settings-card [data-command]')) {
    button.addEventListener('click', () => runCommand(button.dataset.command));
  }

  elements.closeBookmarksButton.addEventListener('click', () => elements.bookmarksDialog.close());
}

async function runCommand(command) {
  switch (command) {
    case 'new-tab':
      createTab(getNewTabUrl());
      break;
    case 'new-window':
      await window.lumen.createWindow();
      break;
    case 'new-private-window':
      await window.lumen.createPrivateWindow();
      break;
    case 'close-tab':
      if (state.activeTabId) closeTab(state.activeTabId);
      break;
    case 'restore-closed-tab':
      await restoreClosedTab();
      break;
    case 'back':
      goBack();
      break;
    case 'forward':
      goForward();
      break;
    case 'reload':
      reloadOrStop();
      break;
    case 'home':
      navigateActiveTab(getHomePageUrl());
      break;
    case 'focus-omnibox':
      elements.omnibox.focus();
      elements.omnibox.select();
      break;
    case 'cut':
      runEditCommand('cut');
      break;
    case 'copy':
      runEditCommand('copy');
      break;
    case 'paste':
      runEditCommand('paste');
      break;
    case 'select-all':
      runEditCommand('selectAll');
      break;
    case 'view-source':
      openPageSource();
      break;
    case 'devtools':
      openActiveDevTools();
      break;
    case 'toggle-sidebar':
      setSidebarOpen(elements.sidePanel.hidden);
      break;
    case 'password-manager':
      setSidebarOpen(true, 'passwords');
      break;
    case 'split-view':
      toggleSplitView();
      break;
    case 'translate-page':
      translateActivePage();
      break;
    case 'reader-mode':
      openReaderMode();
      break;
    case 'toggle-bookmark':
      await toggleCurrentBookmark();
      break;
    case 'toggle-bookmarks-panel':
      openBookmarks();
      break;
    case 'toggle-bookmarks-bar':
      state.settings = await window.lumen.updateBookmarksBar(!state.settings.bookmarksBarVisible);
      renderBookmarks();
      break;
    case 'toggle-adblock':
      state.settings = await window.lumen.updateAdblock(!state.settings.adblockEnabled);
      updateAdblockUi();
      break;
    case 'reset-adblock':
      await window.lumen.resetAdblockStats();
      break;
    case 'settings':
      openSettings();
      break;
  }
}

function createBrowserWebview(url, tabId, pane = 'primary') {
  const webview = document.createElement('webview');
  webview.setAttribute('partition', BROWSER_PARTITION);
  webview.setAttribute('src', url);
  webview.setAttribute('allowpopups', 'true');
  webview.dataset.tabId = String(tabId);
  webview.dataset.pane = pane;
  return webview;
}

function createTab(url, options = {}) {
  const { activate = true } = options;
  const id = state.nextTabId;
  state.nextTabId += 1;

  const webview = createBrowserWebview(url, id);

  const tab = {
    id,
    title: t('newTab'),
    url,
    profile: state.settings?.activeProfile || 'personal',
    loading: false,
    webview
  };

  const insertIndex = getNewTabInsertIndex();
  state.tabs.splice(insertIndex, 0, tab);
  elements.webviewStage.appendChild(webview);
  bindWebview(tab);
  syncWebviewOrder();

  if (activate || !state.activeTabId) {
    activateTab(id);
  } else {
    webview.hidden = true;
  }

  renderTabs();
  renderSidebar();
  scheduleSessionSave();
}

function bindWebview(tab) {
  tab.webview.addEventListener('will-navigate', (event) => {
    redirectCleanNavigation(tab.webview, event);
  });

  tab.webview.addEventListener('did-start-loading', () => {
    tab.loading = true;
    updateNavigationUi();
    renderTabs();
  });

  tab.webview.addEventListener('did-stop-loading', () => {
    tab.loading = false;
    updateNavigationUi();
    renderTabs();
    injectAdHidingCss(tab);
    injectGoogleDarkTheme(tab);
    injectPopularSiteDarkTheme(tab);
    injectPrivacyShield(tab.webview);
    recordHistoryForTab(tab);
    scheduleSessionSave();
  });

  tab.webview.addEventListener('dom-ready', () => {
    applyTabZoom(tab);
    injectAdHidingCss(tab);
    injectGoogleDarkTheme(tab);
    injectPopularSiteDarkTheme(tab);
    injectPrivacyShield(tab.webview);
    injectPasswordCapture(tab);
  });

  tab.webview.addEventListener('console-message', (event) => {
    handleWebviewConsoleMessage(tab, event.message);
  });

  tab.webview.addEventListener('page-title-updated', (event) => {
    tab.title = event.title || readableTitle(tab.url);
    renderTabs();
    updateBookmarkButton();
  });

  tab.webview.addEventListener('did-navigate', (event) => {
    tab.url = event.url;
    tab.title = tab.webview.getTitle() || readableTitle(event.url);
    renderTabs();
    updateNavigationUi();
    updateBookmarkButton();
    renderSidebar();
    scheduleSessionSave();
  });

  tab.webview.addEventListener('did-navigate-in-page', (event) => {
    tab.url = event.url;
    updateNavigationUi();
    updateBookmarkButton();
    renderSidebar();
    scheduleSessionSave();
  });

  tab.webview.addEventListener('did-fail-load', (event) => {
    if (event.errorCode === -3) return;
    tab.loading = false;
    tab.title = getLanguage() === 'en' ? 'Load failed' : 'Ошибка загрузки';
    renderTabs();
    updateNavigationUi();
  });
}

function getNewTabInsertIndex() {
  if (!state.settings?.openTabsNextToCurrent || !state.activeTabId) {
    return state.tabs.length;
  }

  const activeIndex = state.tabs.findIndex((tab) => tab.id === state.activeTabId);
  return activeIndex === -1 ? state.tabs.length : activeIndex + 1;
}

function renderTabs() {
  elements.tabStrip.innerHTML = '';

  for (const tab of state.tabs) {
    const tabElement = document.createElement('div');
    tabElement.className = `tab${tab.id === state.activeTabId ? ' is-active' : ''}`;
    tabElement.draggable = true;
    tabElement.dataset.tabId = String(tab.id);

    if (state.draggedTabId === tab.id) {
      tabElement.classList.add('is-dragging');
    }

    tabElement.addEventListener('dragstart', (event) => {
      state.draggedTabId = tab.id;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(tab.id));
      tabElement.classList.add('is-dragging');
    });

    tabElement.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      clearTabDropMarkers();

      const placement = getTabDropPlacement(event, tabElement);
      tabElement.dataset.dropPlacement = placement;
      tabElement.classList.add(placement === 'after' ? 'is-drop-after' : 'is-drop-before');
    });

    tabElement.addEventListener('dragleave', () => {
      tabElement.classList.remove('is-drop-before', 'is-drop-after');
      delete tabElement.dataset.dropPlacement;
    });

    tabElement.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const sourceId = Number(event.dataTransfer.getData('text/plain'));
      const placement = tabElement.dataset.dropPlacement || getTabDropPlacement(event, tabElement);
      const previousRects = captureTabRects();
      const moved = moveTab(sourceId, tab.id, placement);

      state.draggedTabId = null;
      clearTabDropMarkers();
      renderTabs();
      if (moved) animateTabReorder(previousRects);
    });

    tabElement.addEventListener('dragend', () => {
      state.draggedTabId = null;
      clearTabDropMarkers();
      renderTabs();
    });

    const activateButton = document.createElement('button');
    activateButton.className = 'tab-activate';
    activateButton.type = 'button';
    activateButton.ariaLabel = tab.title;
    activateButton.addEventListener('click', () => activateTab(tab.id));

    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.loading ? `${tab.title}...` : tab.title;

    const close = document.createElement('button');
    close.className = 'tab-close';
    close.type = 'button';
    close.ariaLabel = 'Close tab';
    close.textContent = 'x';
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });

    activateButton.append(title);
    tabElement.append(activateButton, close);
    elements.tabStrip.appendChild(tabElement);
  }
}

function activateTab(id) {
  state.activeTabId = id;

  for (const tab of state.tabs) {
    const active = tab.id === id;
    tab.webview.hidden = !active;
    if (tab.splitWebview) {
      tab.splitWebview.hidden = !active;
    }
  }

  updateSplitLayout();
  updateNavigationUi();
  updateBookmarkButton();
  renderSidebar();
  renderTabs();
}

function closeTab(id) {
  const index = state.tabs.findIndex((tab) => tab.id === id);
  if (index === -1) return;

  const [closed] = state.tabs.splice(index, 1);
  if (!IS_PRIVATE_WINDOW && !isNewTabUrl(closed.url)) {
    window.lumen.addClosedTab({
      title: closed.title,
      url: closed.url,
      profile: closed.profile
    });
  }
  closed.webview.remove();
  if (closed.splitWebview) {
    closed.splitWebview.remove();
  }

  if (state.tabs.length === 0) {
    createTab(getNewTabUrl());
    return;
  }

  if (state.activeTabId === id) {
    const nextTab = state.tabs[Math.max(0, index - 1)];
    activateTab(nextTab.id);
  }

  renderTabs();
  renderSidebar();
  scheduleSessionSave();
}

function moveTab(sourceId, targetId, placement = 'before') {
  if (!sourceId || sourceId === targetId) return;

  const sourceIndex = state.tabs.findIndex((tab) => tab.id === sourceId);
  let targetIndex = state.tabs.findIndex((tab) => tab.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return;

  const [sourceTab] = state.tabs.splice(sourceIndex, 1);
  targetIndex = state.tabs.findIndex((tab) => tab.id === targetId);
  state.tabs.splice(placement === 'after' ? targetIndex + 1 : targetIndex, 0, sourceTab);

  syncWebviewOrder();
  scheduleSessionSave();
  return true;
}

function moveTabToIndex(sourceId, targetIndex) {
  const sourceIndex = state.tabs.findIndex((tab) => tab.id === sourceId);
  if (sourceIndex === -1) return false;

  const [sourceTab] = state.tabs.splice(sourceIndex, 1);
  const insertionIndex = Math.max(0, Math.min(targetIndex, state.tabs.length));
  state.tabs.splice(insertionIndex, 0, sourceTab);

  syncWebviewOrder();
  scheduleSessionSave();
  return true;
}

function syncWebviewOrder() {
  for (const tab of state.tabs) {
    elements.webviewStage.appendChild(tab.webview);
    if (tab.splitWebview) {
      elements.webviewStage.appendChild(tab.splitWebview);
    }
  }
}

function toggleSplitView() {
  const tab = getActiveTab();
  if (!tab) return;

  if (tab.splitWebview) {
    closeSplitView(tab);
    return;
  }

  tab.splitUrl = getNewTabUrl();
  tab.splitWebview = createBrowserWebview(tab.splitUrl, tab.id, 'secondary');
  elements.webviewStage.appendChild(tab.splitWebview);
  bindSplitWebview(tab);
  updateSplitLayout();
  scheduleSessionSave();
}

function closeSplitView(tab) {
  if (!tab?.splitWebview) return;
  tab.splitWebview.remove();
  tab.splitWebview = null;
  tab.splitUrl = '';
  updateSplitLayout();
}

function bindSplitWebview(tab) {
  tab.splitWebview.addEventListener('will-navigate', (event) => {
    redirectCleanNavigation(tab.splitWebview, event);
  });

  tab.splitWebview.addEventListener('dom-ready', () => {
    applyTabZoom({ webview: tab.splitWebview });
    injectAdHidingCss({ webview: tab.splitWebview });
    injectGoogleDarkTheme({ webview: tab.splitWebview, url: tab.splitUrl });
    injectPopularSiteDarkTheme({ webview: tab.splitWebview, url: tab.splitUrl });
    injectPrivacyShield(tab.splitWebview);
    injectPasswordCapture({ ...tab, webview: tab.splitWebview });
  });

  tab.splitWebview.addEventListener('did-stop-loading', () => {
    tab.splitUrl = tab.splitWebview.getURL() || tab.splitUrl;
    injectAdHidingCss({ webview: tab.splitWebview });
    injectGoogleDarkTheme({ webview: tab.splitWebview, url: tab.splitUrl });
    injectPopularSiteDarkTheme({ webview: tab.splitWebview, url: tab.splitUrl });
    injectPrivacyShield(tab.splitWebview);
  });

  tab.splitWebview.addEventListener('did-navigate', (event) => {
    tab.splitUrl = event.url;
  });

  tab.splitWebview.addEventListener('did-navigate-in-page', (event) => {
    tab.splitUrl = event.url;
  });

  tab.splitWebview.addEventListener('console-message', (event) => {
    handleWebviewConsoleMessage(tab, event.message);
  });
}

function updateSplitLayout() {
  const activeTab = getActiveTab();
  const splitActive = Boolean(activeTab?.splitWebview);
  elements.webviewStage.classList.toggle('is-split', splitActive);

  for (const tab of state.tabs) {
    tab.webview.classList.toggle('is-primary-pane', splitActive && tab.id === state.activeTabId);
    tab.webview.classList.remove('is-secondary-pane');

    if (tab.splitWebview) {
      tab.splitWebview.classList.toggle('is-secondary-pane', splitActive && tab.id === state.activeTabId);
      tab.splitWebview.classList.remove('is-primary-pane');
    }
  }
}

function getTabDropPlacement(event, tabElement) {
  const rect = tabElement.getBoundingClientRect();
  return event.clientX > rect.left + rect.width / 2 ? 'after' : 'before';
}

function clearTabDropMarkers() {
  elements.tabStrip.classList.remove('is-drop-tail');

  for (const tabElement of elements.tabStrip.querySelectorAll('.tab')) {
    tabElement.classList.remove('is-drop-before', 'is-drop-after');
    delete tabElement.dataset.dropPlacement;
  }
}

function captureTabRects() {
  const rects = new Map();

  for (const tabElement of elements.tabStrip.querySelectorAll('.tab')) {
    rects.set(tabElement.dataset.tabId, tabElement.getBoundingClientRect());
  }

  return rects;
}

function animateTabReorder(previousRects) {
  for (const tabElement of elements.tabStrip.querySelectorAll('.tab')) {
    const previousRect = previousRects.get(tabElement.dataset.tabId);
    if (!previousRect) continue;

    const nextRect = tabElement.getBoundingClientRect();
    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;

    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) continue;

    tabElement.style.transition = 'none';
    tabElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    requestAnimationFrame(() => {
      tabElement.style.transition = '';
      tabElement.style.transform = '';
    });
  }
}

function restoreSavedSession() {
  if (IS_PRIVATE_WINDOW) {
    createTab(getNewTabUrl());
    return;
  }

  const savedTabs = (state.settings?.savedSession || []).filter((tab) => tab.url && !isNewTabUrl(tab.url));

  if (savedTabs.length === 0) {
    createTab(getNewTabUrl());
    return;
  }

  let activeRestored = false;

  for (const savedTab of savedTabs) {
    const shouldActivate = savedTab.active && !activeRestored;
    createTab(savedTab.url, { activate: shouldActivate });
    const restored = getActiveTab();
    if (restored && shouldActivate) {
      restored.title = savedTab.title || restored.title;
      activeRestored = true;
    }
  }

  if (!activeRestored && state.tabs[0]) {
    activateTab(state.tabs[0].id);
  }
}

function scheduleSessionSave() {
  if (IS_PRIVATE_WINDOW) return;

  clearTimeout(state.sessionSaveTimer);
  state.sessionSaveTimer = setTimeout(() => {
    const tabs = state.tabs
      .filter((tab) => tab.url && !isNewTabUrl(tab.url))
      .map((tab) => ({
        title: tab.title,
        url: tab.url,
        profile: tab.profile,
        active: tab.id === state.activeTabId,
        savedAt: new Date().toISOString()
      }));
    window.lumen.saveSession(tabs);
  }, 350);
}

function recordHistoryForTab(tab) {
  if (IS_PRIVATE_WINDOW || !tab.url || isNewTabUrl(tab.url)) return;
  if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) return;

  const key = `${tab.url}:${tab.title}`;
  if (state.historyRecordedUrls.has(key)) return;
  state.historyRecordedUrls.add(key);

  window.lumen.addHistory({
    title: tab.title || readableTitle(tab.url),
    url: tab.url,
    profile: tab.profile || state.settings?.activeProfile,
    visitedAt: new Date().toISOString()
  });
}

async function restoreClosedTab() {
  const result = await window.lumen.popClosedTab();
  if (result?.settings) {
    state.settings = result.settings;
  }

  if (result?.tab?.url) {
    createTab(result.tab.url);
  }

  renderSidebar();
}

function navigateActiveTab(url) {
  const tab = getActiveTab();
  if (!tab) return;
  tab.webview.loadURL(stripTrackingParams(url));
}

function goBack() {
  const tab = getActiveTab();
  if (tab?.webview.canGoBack()) tab.webview.goBack();
}

function goForward() {
  const tab = getActiveTab();
  if (tab?.webview.canGoForward()) tab.webview.goForward();
}

function reloadOrStop() {
  const tab = getActiveTab();
  if (!tab) return;

  if (tab.loading) {
    tab.webview.stop();
    return;
  }

  tab.webview.reload();
}

function runEditCommand(command) {
  const activeElement = document.activeElement;
  const isLocalEditable =
    activeElement &&
    (activeElement.matches('input, textarea') || activeElement.isContentEditable);

  if (isLocalEditable) {
    const documentCommand = command === 'selectAll' ? 'selectAll' : command;
    document.execCommand(documentCommand);
    return;
  }

  const tab = getActiveTab();
  if (!tab) return;

  if (typeof tab.webview[command] === 'function') {
    tab.webview[command]();
  }
}

function openActiveDevTools() {
  const tab = getActiveTab();
  if (!tab) return;
  tab.webview.openDevTools();
}

function openPageSource() {
  const tab = getActiveTab();
  if (!tab || isNewTabUrl(tab.url)) return;

  if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
    createTab(`view-source:${tab.url}`);
  }
}

async function openReaderMode() {
  const tab = getActiveTab();
  if (!tab || isNewTabUrl(tab.url)) return;

  try {
    const page = await tab.webview.executeJavaScript(
      `(() => ({
        title: document.title || location.href,
        url: location.href,
        text: (document.querySelector('article')?.innerText || document.body?.innerText || '').replace(/\\n{3,}/g, '\\n\\n').trim()
      }))()`,
      true
    );

    const readerHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
      page.title
    )}</title><style>
      body{margin:0;background:#000;color:#f4f4f4;font:18px/1.7 ui-serif,Georgia,serif}
      main{width:min(820px,calc(100vw - 48px));margin:56px auto}
      h1{font:700 34px/1.15 ui-monospace,Menlo,monospace;margin:0 0 8px}
      a{color:#fff} .url{color:#999;font:12px ui-monospace,Menlo,monospace;margin-bottom:32px}
      pre{white-space:pre-wrap;font:inherit}
    </style></head><body><main><h1>${escapeHtml(page.title)}</h1><div class="url">${escapeHtml(
      page.url
    )}</div><pre>${escapeHtml(page.text || 'Reader content is unavailable for this page.')}</pre></main></body></html>`;

    createTab(`data:text/html;charset=utf-8,${encodeURIComponent(readerHtml)}`);
  } catch {
    // Reader mode is best-effort for cross-origin and protected pages.
  }
}

function applyTabZoom(tab) {
  const zoom = Number(state.settings?.defaultZoomFactor || 1);
  if (Number.isFinite(zoom) && typeof tab.webview.setZoomFactor === 'function') {
    tab.webview.setZoomFactor(zoom);
  }
}

function applyZoomToAllTabs() {
  for (const tab of state.tabs) {
    applyTabZoom(tab);
  }
}

function updateNavigationUi() {
  const tab = getActiveTab();

  if (!tab) {
    elements.omnibox.value = '';
    return;
  }

  const currentUrl = tab.webview.getURL() || tab.url;
  tab.url = currentUrl;

  elements.omnibox.value = isNewTabUrl(currentUrl) ? '' : currentUrl;
  elements.backButton.disabled = !tab.webview.canGoBack();
  elements.forwardButton.disabled = !tab.webview.canGoForward();
  elements.reloadButton.textContent = tab.loading ? '×' : '↻';
  elements.securityDot.classList.toggle('is-secure', currentUrl.startsWith('https://'));
}

function updateAdblockUi() {
  const enabled = Boolean(state.settings?.adblockEnabled);
  elements.adblockButton.classList.toggle('is-off', !enabled);
  elements.adblockState.textContent = enabled ? 'AD' : 'OFF';
  elements.blockedCount.textContent = compactCount(state.blockedTotal);
  elements.settingsAdblockToggle.checked = enabled;
  refreshSettingsSummary();
}

function renderBookmarks() {
  const visible = Boolean(state.settings?.bookmarksBarVisible);
  elements.bookmarkBar.hidden = !visible;
  elements.settingsBookmarkBarToggle.checked = visible;
  elements.bookmarkBar.innerHTML = '';
  elements.bookmarkList.innerHTML = '';
  refreshSettingsSummary();

  const bookmarks = state.settings?.bookmarks || [];

  if (bookmarks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'bookmark-empty';
    empty.textContent = t('noBookmarks');
    elements.bookmarkBar.appendChild(empty);
    elements.bookmarkList.appendChild(empty.cloneNode(true));
    return;
  }

  for (const bookmark of bookmarks) {
    elements.bookmarkBar.appendChild(createBookmarkBarItem(bookmark));
    elements.bookmarkList.appendChild(createBookmarkListItem(bookmark));
  }
}

function createBookmarkBarItem(bookmark) {
  const button = document.createElement('button');
  button.className = 'bookmark-chip';
  button.type = 'button';
  button.textContent = bookmark.title;
  button.addEventListener('click', () => navigateActiveTab(bookmark.url));
  return button;
}

function createBookmarkListItem(bookmark) {
  const row = document.createElement('div');
  row.className = 'bookmark-row';

  const openButton = document.createElement('button');
  openButton.className = 'bookmark-open';
  openButton.type = 'button';
  openButton.addEventListener('click', () => {
    navigateActiveTab(bookmark.url);
    elements.bookmarksDialog.close();
  });

  const title = document.createElement('strong');
  title.textContent = bookmark.title;

  const url = document.createElement('span');
  url.textContent = bookmark.url;

  const remove = document.createElement('button');
  remove.className = 'bookmark-remove';
  remove.type = 'button';
  remove.ariaLabel = 'Remove bookmark';
  remove.textContent = 'x';
  remove.addEventListener('click', async () => {
    state.settings = await window.lumen.removeBookmark(bookmark.id);
    renderBookmarks();
    updateBookmarkButton();
  });

  openButton.append(title, url);
  row.append(openButton, remove);
  return row;
}

async function toggleCurrentBookmark() {
  const tab = getActiveTab();
  if (!tab || isNewTabUrl(tab.url)) return;

  const existing = getBookmarkForUrl(tab.url);
  if (existing) {
    state.settings = await window.lumen.removeBookmark(existing.id);
  } else {
    state.settings = await window.lumen.addBookmark({
      title: tab.title || readableTitle(tab.url),
      url: tab.url
    });
  }

  renderBookmarks();
  updateBookmarkButton();
}

function updateBookmarkButton() {
  const tab = getActiveTab();
  const saved = Boolean(tab && getBookmarkForUrl(tab.url));
  elements.bookmarkButton.classList.toggle('is-saved', saved);
  elements.bookmarkButton.textContent = saved ? 'B' : '*';
}

function getBookmarkForUrl(url) {
  return (state.settings?.bookmarks || []).find((bookmark) => bookmark.url === url);
}

function setSidebarOpen(open, view = null) {
  elements.sidePanel.hidden = !open;
  elements.workspace.classList.toggle('has-sidebar', open);
  elements.sidebarButton.classList.toggle('is-saved', open);

  if (view) {
    showSideView(view);
  }

  if (open) {
    renderSidebar();
  }
}

function showSideView(view) {
  const labels = {
    tabs: t('tabs'),
    history: t('history'),
    downloads: t('downloads'),
    screenshots: t('screenshots'),
    notes: t('notes'),
    passwords: t('passwords'),
    profiles: t('profiles')
  };

  elements.sideTitle.textContent = labels[view] || t('workspace');

  for (const button of document.querySelectorAll('[data-side-view]')) {
    button.classList.toggle('is-active', button.dataset.sideView === view);
  }

  for (const panel of document.querySelectorAll('[data-side-panel]')) {
    panel.classList.toggle('is-active', panel.dataset.sidePanel === view);
  }

  renderSidebar();
}

function renderSidebar() {
  if (!elements.sidePanel || elements.sidePanel.hidden) return;
  renderTabManager();
  renderHistory();
  renderDownloads();
  renderScreenshots();
  renderNoteEditor();
  renderPasswords();
  renderProfiles();
}

function renderTabManager() {
  const query = elements.tabSearchInput.value.trim().toLowerCase();
  elements.tabManagerList.innerHTML = '';

  const tabs = state.tabs.filter((tab) => {
    const haystack = `${tab.title} ${tab.url}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  if (tabs.length === 0) {
    elements.tabManagerList.appendChild(createSideEmpty(t('noTabs')));
    return;
  }

  for (const tab of tabs) {
    const row = createSideRow(tab.title, tab.url, () => activateTab(tab.id));
    row.classList.toggle('is-active', tab.id === state.activeTabId);

    const close = document.createElement('button');
    close.className = 'side-row-action';
    close.type = 'button';
    close.textContent = 'x';
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });
    row.appendChild(close);
    elements.tabManagerList.appendChild(row);
  }
}

function renderHistory() {
  const query = elements.historySearchInput.value.trim().toLowerCase();
  elements.historyList.innerHTML = '';

  const history = (state.settings?.history || []).filter((entry) => {
    const haystack = `${entry.title} ${entry.url} ${entry.profile}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  if (history.length === 0) {
    elements.historyList.appendChild(createSideEmpty(t('noHistory')));
    return;
  }

  for (const entry of history.slice(0, 150)) {
    elements.historyList.appendChild(
      createSideRow(entry.title, `${new Date(entry.visitedAt).toLocaleString()} · ${entry.url}`, () =>
        createTab(entry.url)
      )
    );
  }
}

function renderDownloads() {
  elements.downloadList.innerHTML = '';

  if (state.downloads.length === 0) {
    elements.downloadList.appendChild(createSideEmpty(t('noDownloads')));
    return;
  }

  for (const download of state.downloads) {
    const received = formatBytes(download.receivedBytes || 0);
    const total = download.totalBytes ? formatBytes(download.totalBytes) : t('unknown');
    elements.downloadList.appendChild(createSideRow(download.filename, `${download.state} · ${received} / ${total}`, null));
  }
}

function renderScreenshots() {
  elements.screenshotList.innerHTML = '';

  const screenshots = state.settings?.screenshots || [];
  if (screenshots.length === 0) {
    elements.screenshotList.appendChild(createSideEmpty(t('noScreenshots')));
    return;
  }

  for (const screenshot of screenshots) {
    const card = document.createElement('article');
    card.className = 'screenshot-card';

    const preview = document.createElement('button');
    preview.className = 'screenshot-preview';
    preview.type = 'button';
    preview.addEventListener('click', () => window.lumen.openPath(screenshot.path));

    const image = document.createElement('img');
    image.alt = screenshot.title || t('screenshots');
    image.src = filePathToUrl(screenshot.path);
    preview.appendChild(image);

    const meta = document.createElement('div');
    meta.className = 'screenshot-meta';

    const title = document.createElement('strong');
    title.textContent = screenshot.title || screenshot.filename || t('screenshots');

    const detail = document.createElement('span');
    const dimensions = screenshot.width && screenshot.height ? `${screenshot.width}x${screenshot.height}` : screenshot.filename;
    detail.textContent = `${new Date(screenshot.createdAt).toLocaleString()} · ${dimensions}`;

    const actions = document.createElement('div');
    actions.className = 'screenshot-actions';

    const openButton = document.createElement('button');
    openButton.className = 'secondary-button';
    openButton.type = 'button';
    openButton.textContent = t('open');
    openButton.addEventListener('click', () => window.lumen.openPath(screenshot.path));

    const revealButton = document.createElement('button');
    revealButton.className = 'secondary-button';
    revealButton.type = 'button';
    revealButton.textContent = t('reveal');
    revealButton.addEventListener('click', () => window.lumen.revealPath(screenshot.path));

    actions.append(openButton, revealButton);
    meta.append(title, detail, actions);
    card.append(preview, meta);
    elements.screenshotList.appendChild(card);
  }
}

function renderNoteEditor({ force = false } = {}) {
  const tab = getActiveTab();
  const url = tab?.url || '';

  if (!tab || isNewTabUrl(url)) {
    if (state.noteEditorUrl && document.activeElement === elements.pageNoteInput) {
      state.noteDrafts.set(state.noteEditorUrl, elements.pageNoteInput.value);
    }

    state.noteEditorUrl = null;
    elements.noteMeta.textContent = t('noPageSelected');
    elements.pageNoteInput.value = '';
    elements.pageNoteInput.disabled = true;
    elements.saveNoteButton.disabled = true;
    return;
  }

  if (state.noteEditorUrl && state.noteEditorUrl !== url && document.activeElement === elements.pageNoteInput) {
    state.noteDrafts.set(state.noteEditorUrl, elements.pageNoteInput.value);
  }

  elements.noteMeta.textContent = `${tab.title} · ${url}`;
  elements.pageNoteInput.disabled = false;
  elements.saveNoteButton.disabled = false;

  const sameUrl = state.noteEditorUrl === url;
  state.noteEditorUrl = url;

  if (!force && sameUrl && document.activeElement === elements.pageNoteInput) {
    state.noteDrafts.set(url, elements.pageNoteInput.value);
    return;
  }

  elements.pageNoteInput.value = state.noteDrafts.has(url)
    ? state.noteDrafts.get(url)
    : state.settings?.notes?.[url]?.note || '';
}

function renderPasswords() {
  if (!elements.passwordList) return;

  const query = elements.passwordSearchInput.value.trim().toLowerCase();
  const activeIdentity = getActiveWebIdentity();
  elements.passwordList.innerHTML = '';

  const passwords = (state.passwords || []).filter((entry) => {
    const haystack = `${entry.title} ${entry.username} ${entry.hostname} ${entry.origin}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  if (passwords.length === 0) {
    elements.passwordList.appendChild(createSideEmpty(t('noPasswords')));
    return;
  }

  for (const entry of passwords) {
    elements.passwordList.appendChild(createPasswordCard(entry, activeIdentity));
  }
}

function createPasswordCard(entry, activeIdentity) {
  const card = document.createElement('article');
  card.className = 'password-card';
  card.classList.toggle('is-active', isSamePasswordSite(entry, activeIdentity));

  const main = document.createElement('button');
  main.className = 'password-card-main';
  main.type = 'button';
  main.addEventListener('click', () => fillPasswordForActivePage(entry));

  const title = document.createElement('strong');
  title.textContent = entry.title || entry.hostname || t('untitled');

  const detail = document.createElement('span');
  detail.textContent = `${entry.username || t('unknown')} · ${entry.hostname || entry.origin}`;

  const actions = document.createElement('div');
  actions.className = 'password-card-actions';

  const fillButton = createPasswordAction('passwordFill', () => fillPasswordForActivePage(entry));
  const copyButton = createPasswordAction('passwordCopy', async () => {
    await window.lumen.copyPassword(entry.id);
    setPasswordStatus('passwordCopied');
  });
  const editButton = createPasswordAction('passwordEdit', () => editPassword(entry));
  const deleteButton = createPasswordAction('passwordDelete', async () => {
    state.passwords = await window.lumen.removePassword(entry.id);
    if (state.passwordEditingId === entry.id) resetPasswordForm();
    renderPasswords();
  });

  deleteButton.classList.add('danger-button');
  main.append(title, detail);
  actions.append(fillButton, copyButton, editButton, deleteButton);
  card.append(main, actions);
  return card;
}

function createPasswordAction(labelKey, action) {
  const button = document.createElement('button');
  button.className = 'secondary-button';
  button.type = 'button';
  button.textContent = t(labelKey);
  button.addEventListener('click', action);
  return button;
}

async function editPassword(entry) {
  const secret = await window.lumen.getPasswordSecret(entry.id);
  state.passwordEditingId = entry.id;
  elements.passwordTitleInput.value = entry.title || '';
  elements.passwordUrlInput.value = entry.origin || '';
  elements.passwordUsernameInput.value = entry.username || '';
  elements.passwordValueInput.type = 'password';
  elements.passwordValueInput.value = secret;
  setPasswordStatus('passwordStatusReady');
}

async function savePasswordFromForm(event) {
  event.preventDefault();

  const url = elements.passwordUrlInput.value.trim();
  const password = elements.passwordValueInput.value;

  if (!url || !password) {
    setPasswordStatus('passwordNeedsFields');
    return;
  }

  try {
    state.passwords = await window.lumen.savePassword({
      id: state.passwordEditingId,
      title: elements.passwordTitleInput.value,
      url,
      username: elements.passwordUsernameInput.value,
      password
    });
    resetPasswordForm();
    setPasswordStatus('passwordSaved');
    renderPasswords();
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();
    setPasswordStatus(message.includes('encrypt') ? 'passwordEncryptionUnavailable' : 'passwordNeedsFields');
  }
}

async function fillPasswordFormFromCurrentPage() {
  const identity = getActiveWebIdentity();
  const tab = getActiveTab();

  if (!identity.origin || !tab || isNewTabUrl(tab.url)) {
    setPasswordStatus('passwordNeedsPage');
    return;
  }

  const existing = getBestPasswordForActivePage();
  state.passwordEditingId = existing?.id || null;
  elements.passwordTitleInput.value = existing?.title || tab.title || readableTitle(tab.url);
  elements.passwordUrlInput.value = existing?.origin || identity.origin;
  elements.passwordUsernameInput.value = existing?.username || '';
  elements.passwordValueInput.type = 'password';
  elements.passwordValueInput.value = existing ? await window.lumen.getPasswordSecret(existing.id) : '';
  setPasswordStatus('passwordStatusReady');
}

async function fillPasswordForActivePage(entry = null) {
  const target = entry || getBestPasswordForActivePage();

  if (!target) {
    setPasswordStatus('passwordNeedsPage');
    return;
  }

  const tab = getActiveTab();
  if (!tab || isNewTabUrl(tab.url)) {
    setPasswordStatus('passwordNeedsPage');
    return;
  }

  const secret = await window.lumen.getPasswordSecret(target.id);
  const filled = await fillActiveLoginForm(target, secret);
  setPasswordStatus(filled ? 'passwordFilled' : 'passwordFillUnavailable');
}

async function fillActiveLoginForm(entry, secret) {
  const tab = getActiveTab();
  if (!tab) return false;

  return tab.webview.executeJavaScript(
    `(() => {
      const username = ${JSON.stringify(entry.username || '')};
      const password = ${JSON.stringify(secret)};
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return !element.disabled && !element.readOnly && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const dispatch = (element) => {
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const passwordInput = Array.from(document.querySelectorAll('input[type="password"]')).find(visible);
      if (!passwordInput) return false;
      const scope = passwordInput.form || passwordInput.closest('form') || document;
      const loginTypes = new Set(['', 'text', 'email', 'tel', 'url']);
      const loginInput = Array.from(scope.querySelectorAll('input')).find((input) => {
        const type = (input.getAttribute('type') || 'text').toLowerCase();
        const meta = [input.name, input.id, input.autocomplete, input.placeholder].join(' ').toLowerCase();
        return input !== passwordInput && loginTypes.has(type) && visible(input) && !/(search|captcha|code|otp|token|2fa|verification)/.test(meta);
      });
      if (loginInput && username) {
        loginInput.focus();
        loginInput.value = username;
        dispatch(loginInput);
      }
      passwordInput.focus();
      passwordInput.value = password;
      dispatch(passwordInput);
      return true;
    })()`,
    true
  );
}

function getBestPasswordForActivePage() {
  const identity = getActiveWebIdentity();
  if (!identity.origin) return null;

  return (
    (state.passwords || []).find((entry) => entry.origin === identity.origin) ||
    (state.passwords || []).find((entry) => entry.hostname === identity.hostname) ||
    null
  );
}

function getActiveWebIdentity() {
  const tab = getActiveTab();
  if (!tab || isNewTabUrl(tab.url)) return { origin: '', hostname: '' };
  return getUrlIdentity(tab.webview?.getURL?.() || tab.url);
}

function getUrlIdentity(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
      return { origin: '', hostname: '' };
    }

    return {
      origin: parsed.origin,
      hostname: parsed.hostname.replace(/^www\./, '')
    };
  } catch {
    return { origin: '', hostname: '' };
  }
}

function isSamePasswordSite(entry, identity) {
  return Boolean(identity?.origin && (entry.origin === identity.origin || entry.hostname === identity.hostname));
}

function resetPasswordForm() {
  state.passwordEditingId = null;
  elements.passwordTitleInput.value = '';
  elements.passwordUrlInput.value = '';
  elements.passwordUsernameInput.value = '';
  elements.passwordValueInput.type = 'password';
  elements.passwordValueInput.value = '';
  setPasswordStatus('passwordStatusReady');
}

function setPasswordStatus(key) {
  elements.passwordStatus.textContent = t(key);
}

function generatePassword(length = 18) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=';
  const bytes = new Uint32Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

function showPasswordPrompt(payload) {
  const identity = getUrlIdentity(payload.url);
  if (!identity.origin || !payload.password) return;

  state.pendingPasswordCapture = {
    ...payload,
    origin: identity.origin,
    hostname: identity.hostname
  };
  elements.passwordPromptTitle.textContent = t('savePasswordQuestion');
  elements.passwordPromptDetail.textContent = t('savePasswordDetail', {
    host: identity.hostname || identity.origin
  });
  elements.passwordSavePrompt.hidden = false;
}

function dismissPasswordPrompt() {
  state.pendingPasswordCapture = null;
  elements.passwordSavePrompt.hidden = true;
}

async function savePromptedPassword() {
  if (!state.pendingPasswordCapture) return;

  const payload = state.pendingPasswordCapture;
  state.passwords = await window.lumen.savePassword({
    title: payload.title,
    url: payload.origin || payload.url,
    username: payload.username,
    password: payload.password
  });
  dismissPasswordPrompt();
  renderPasswords();
}

function editPromptedPassword() {
  if (!state.pendingPasswordCapture) return;

  const payload = state.pendingPasswordCapture;
  elements.passwordTitleInput.value = payload.title || payload.hostname || '';
  elements.passwordUrlInput.value = payload.origin || payload.url || '';
  elements.passwordUsernameInput.value = payload.username || '';
  elements.passwordValueInput.type = 'password';
  elements.passwordValueInput.value = payload.password || '';
  setSidebarOpen(true, 'passwords');
  elements.passwordSavePrompt.hidden = true;
}

function renderProfiles() {
  elements.profileList.innerHTML = '';

  for (const profile of state.settings?.profiles || []) {
    const button = document.createElement('button');
    button.className = `profile-chip${profile === state.settings.activeProfile ? ' is-active' : ''}`;
    button.type = 'button';
    button.textContent = profile;
    button.addEventListener('click', async () => {
      state.settings = await window.lumen.updatePreferences({ activeProfile: profile });
      fillSettingsForm();
      renderProfiles();
    });
    elements.profileList.appendChild(button);
  }
}

function createSideRow(title, detail, action) {
  const row = document.createElement('button');
  row.className = 'side-row';
  row.type = 'button';
  row.disabled = typeof action !== 'function';
  if (action) row.addEventListener('click', action);

  const strong = document.createElement('strong');
  strong.textContent = title || t('untitled');

  const small = document.createElement('span');
  small.textContent = detail || '';

  row.append(strong, small);
  return row;
}

function createSideEmpty(text) {
  const empty = document.createElement('div');
  empty.className = 'side-empty';
  empty.textContent = text;
  return empty;
}

async function saveCurrentNote() {
  const tab = getActiveTab();
  if (!tab || isNewTabUrl(tab.url)) return;
  const noteUrl = state.noteEditorUrl || tab.url;
  const note = elements.pageNoteInput.value;
  state.settings = await window.lumen.updateNote({
    url: noteUrl,
    note
  });
  state.noteDrafts.delete(noteUrl);
  state.noteEditorUrl = noteUrl;
  renderNoteEditor({ force: true });
}

function closeDuplicateTabs() {
  const seen = new Set();

  for (const tab of [...state.tabs]) {
    if (!tab.url || isNewTabUrl(tab.url)) continue;

    if (seen.has(tab.url)) {
      closeTab(tab.id);
    } else {
      seen.add(tab.url);
    }
  }
}

async function clearScreenshots() {
  state.settings = await window.lumen.clearScreenshots();
  renderScreenshots();
  refreshSettingsSummary();
}

async function clearCacheFromSettings() {
  elements.settingsClearCacheButton.disabled = true;

  try {
    const result = await window.lumen.clearCache();
    const clearedAt = result?.clearedAt ? new Date(result.clearedAt) : new Date();
    elements.settingsCacheStatus.textContent = t('cacheCleared', {
      time: clearedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } finally {
    elements.settingsClearCacheButton.disabled = false;
  }
}

async function importBrowserData(source) {
  const buttons = [elements.settingsImportChromeButton, elements.settingsImportSafariButton, elements.settingsImportPasswordsButton];
  buttons.forEach((button) => {
    button.disabled = true;
  });

  try {
    const result = await window.lumen.importBrowserData(source);
    if (result?.settings) {
      state.settings = result.settings;
      renderBookmarks();
      renderHistory();
      refreshSettingsSummary();
    }

    elements.settingsImportStatus.textContent = t('importComplete', {
      bookmarks: result?.bookmarksImported || 0,
      history: result?.historyImported || 0,
      passwords: 0
    });
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

async function importPasswordCsv() {
  const buttons = [elements.settingsImportChromeButton, elements.settingsImportSafariButton, elements.settingsImportPasswordsButton];
  buttons.forEach((button) => {
    button.disabled = true;
  });

  try {
    const result = await window.lumen.importPasswordCsv();
    state.passwords = await window.lumen.getPasswords();
    renderPasswords();
    elements.settingsImportStatus.textContent = result?.canceled
      ? t('importCanceled')
      : t('importComplete', { bookmarks: 0, history: 0, passwords: result?.imported || 0 });
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

function openSettings() {
  closeMenu();
  fillSettingsForm();
  showSettingsSection('general');
  filterSettings();
  refreshVpnStatus();
  elements.settingsDialog.showModal();
  elements.settingsSearchInput.focus();
}

function fillSettingsForm() {
  elements.settingsActiveProfile.innerHTML = '';
  for (const profile of state.settings.profiles || ['personal']) {
    const option = document.createElement('option');
    option.value = profile;
    option.textContent = profile;
    elements.settingsActiveProfile.appendChild(option);
  }

  elements.settingsActiveProfile.value = state.settings.activeProfile || 'personal';
  elements.settingsSearchEngine.value = state.settings.searchEngine || 'duckduckgo';
  elements.settingsTheme.value = state.settings.theme || 'pure-black';
  elements.settingsStartPageBackdrop.value = state.settings.startPageBackdrop || 'signal-grid';
  elements.settingsLanguage.value = getLanguage();
  elements.settingsTranslationTarget.value = state.settings.translationTargetLanguage || 'ru';
  elements.settingsHomePageUrl.value = state.settings.homePageUrl || '';
  elements.settingsAdblockToggle.checked = Boolean(state.settings.adblockEnabled);
  elements.settingsAdblockAllowlist.value = (state.settings.adblockAllowlist || []).join('\n');
  elements.settingsBookmarkBarToggle.checked = Boolean(state.settings.bookmarksBarVisible);
  elements.settingsCompactTabsToggle.checked = Boolean(state.settings.compactTabs);
  elements.settingsDefaultZoom.value = String(state.settings.defaultZoomFactor || 1);
  elements.settingsMotionToggle.checked = state.settings.motionEnabled !== false;
  elements.settingsSecurityToggle.checked = state.settings.securityIndicatorVisible !== false;
  elements.settingsPrivacyShieldToggle.checked = state.settings.privacyShieldEnabled !== false;
  elements.settingsFingerprintToggle.checked = state.settings.fingerprintProtectionEnabled !== false;
  elements.settingsStripTrackingToggle.checked = state.settings.stripTrackingParamsEnabled !== false;
  elements.settingsOpenTabsNextToCurrentToggle.checked = state.settings.openTabsNextToCurrent !== false;
  elements.settingsOpenNewTabsInBackgroundToggle.checked = Boolean(state.settings.openNewTabsInBackground);
  elements.settingsScreenshotsPanelToggle.checked = state.settings.screenshotsPanelOnCapture !== false;
  elements.settingsDeveloperContextMenuToggle.checked = state.settings.developerContextMenuEnabled !== false;
  elements.settingsVpnProxyToggle.checked = Boolean(state.settings.vpnProxyEnabled);
  elements.settingsVpnProxyScheme.value = state.settings.vpnProxyScheme || 'socks5';
  elements.settingsVpnProxyHost.value = state.settings.vpnProxyHost || '127.0.0.1';
  elements.settingsVpnProxyPort.value = state.settings.vpnProxyPort || '';
  elements.settingsVpnProxyBypass.value = state.settings.vpnProxyBypass || '<local>';
  refreshSettingsSummary();
  renderBrowserInfo();
  renderVpnStatus();
}

async function saveSettings({ close = false } = {}) {
  state.settings = await window.lumen.updateAdblock(elements.settingsAdblockToggle.checked);
  state.settings = await window.lumen.updateBookmarksBar(elements.settingsBookmarkBarToggle.checked);
  state.settings = await window.lumen.updatePreferences({
    activeProfile: elements.settingsActiveProfile.value,
    adblockAllowlist: elements.settingsAdblockAllowlist.value.split('\n'),
    compactTabs: elements.settingsCompactTabsToggle.checked,
    developerContextMenuEnabled: elements.settingsDeveloperContextMenuToggle.checked,
    defaultZoomFactor: Number(elements.settingsDefaultZoom.value),
    fingerprintProtectionEnabled: elements.settingsFingerprintToggle.checked,
    homePageUrl: elements.settingsHomePageUrl.value,
    language: elements.settingsLanguage.value,
    motionEnabled: elements.settingsMotionToggle.checked,
    openNewTabsInBackground: elements.settingsOpenNewTabsInBackgroundToggle.checked,
    openTabsNextToCurrent: elements.settingsOpenTabsNextToCurrentToggle.checked,
    privacyShieldEnabled: elements.settingsPrivacyShieldToggle.checked,
    searchEngine: elements.settingsSearchEngine.value,
    securityIndicatorVisible: elements.settingsSecurityToggle.checked,
    screenshotsPanelOnCapture: elements.settingsScreenshotsPanelToggle.checked,
    startPageBackdrop: elements.settingsStartPageBackdrop.value,
    stripTrackingParamsEnabled: elements.settingsStripTrackingToggle.checked,
    theme: elements.settingsTheme.value,
    translationTargetLanguage: elements.settingsTranslationTarget.value,
    vpnProxyBypass: elements.settingsVpnProxyBypass.value,
    vpnProxyEnabled: elements.settingsVpnProxyToggle.checked,
    vpnProxyHost: elements.settingsVpnProxyHost.value,
    vpnProxyPort: elements.settingsVpnProxyPort.value,
    vpnProxyScheme: elements.settingsVpnProxyScheme.value
  });
  applyInterfacePreferences();
  applyLanguage();
  applyZoomToAllTabs();
  applyPrivacyShieldToOpenTabs();
  updateAdblockUi();
  renderBookmarks();
  renderScreenshots();
  refreshSettingsSummary();
  await refreshVpnStatus();

  if (close) {
    elements.settingsDialog.close();
  }
}

function refreshSettingsSummary() {
  const bookmarkCount = state.settings?.bookmarks?.length || 0;
  const screenshotCount = state.settings?.screenshots?.length || 0;
  const bookmarkWord = pluralize(bookmarkCount, t('bookmarkWordOne'), t('bookmarkWordMany'));
  const screenshotWord = pluralize(screenshotCount, t('screenshotWordOne'), t('screenshotWordMany'));

  elements.settingsBookmarkCount.textContent = t('bookmarkCount', { count: bookmarkCount, word: bookmarkWord });
  elements.settingsBookmarkDetail.textContent = t('screenshotCount', {
    count: bookmarkCount,
    word: bookmarkWord
  });
  elements.settingsBlockedCount.textContent = t('blockedCount', { count: compactCount(state.blockedTotal) });
  elements.settingsScreenshotDetail.textContent = t('screenshotCount', {
    count: screenshotCount,
    word: screenshotWord
  });
}

function renderBrowserInfo() {
  if (!state.browserInfo) return;

  elements.settingsAppVersion.textContent = `${state.browserInfo.name} ${state.browserInfo.version}`;
  elements.settingsEngineVersion.textContent = `Chromium ${state.browserInfo.chromium} / Electron ${state.browserInfo.electron}`;
  elements.settingsPlatformInfo.textContent = `${state.browserInfo.platform} / Node ${state.browserInfo.node}`;
  elements.settingsUserDataPath.textContent = state.browserInfo.userDataPath;
  elements.settingsScreenshotFolder.textContent = state.browserInfo.screenshotDirectory;
}

async function refreshVpnStatus() {
  state.vpnStatus = await window.lumen.getVpnStatus();
  renderVpnStatus();
}

function renderVpnStatus() {
  if (!elements.settingsVpnStatus || !elements.settingsVpnProxyStatus) return;

  if (state.vpnStatus?.amneziaInstalled) {
    elements.settingsVpnStatus.textContent = t('vpnAmneziaFound', {
      path: state.vpnStatus.amneziaPath
    });
  } else {
    elements.settingsVpnStatus.textContent = t('vpnAmneziaMissing');
  }

  if (!state.settings?.vpnProxyEnabled) {
    elements.settingsVpnProxyStatus.textContent = t('vpnProxyDisabled');
    return;
  }

  const proxyRules = state.vpnStatus?.proxyRules;
  const proxyBypassRules = state.vpnStatus?.proxyBypassRules || state.settings?.vpnProxyBypass || '<local>';

  elements.settingsVpnProxyStatus.textContent = proxyRules
    ? t('vpnProxyReady', { rules: proxyRules, bypass: proxyBypassRules })
    : t('vpnProxyWaiting');
}

function showSettingsSection(sectionName) {
  if (elements.settingsSearchInput.value) {
    elements.settingsSearchInput.value = '';
  }

  for (const button of document.querySelectorAll('[data-settings-section]')) {
    button.classList.toggle('is-active', button.dataset.settingsSection === sectionName);
  }

  for (const panel of document.querySelectorAll('[data-settings-panel]')) {
    panel.hidden = false;
    panel.classList.toggle('is-active', panel.dataset.settingsPanel === sectionName);
  }
}

function filterSettings() {
  const query = elements.settingsSearchInput.value.trim().toLowerCase();
  const panels = document.querySelectorAll('[data-settings-panel]');

  document.querySelector('.settings-layout').classList.toggle('is-searching', Boolean(query));

  if (!query) {
    const activeSection =
      document.querySelector('[data-settings-section].is-active')?.dataset.settingsSection || 'general';

    for (const row of document.querySelectorAll('[data-settings-search]')) {
      row.hidden = false;
    }

    for (const panel of panels) {
      panel.hidden = false;
      panel.classList.toggle('is-active', panel.dataset.settingsPanel === activeSection);
    }

    return;
  }

  for (const panel of panels) {
    let panelHasMatch = false;

    for (const row of panel.querySelectorAll('[data-settings-search]')) {
      const haystack = `${row.dataset.settingsSearch || ''} ${row.textContent || ''}`.toLowerCase();
      const matches = !query || haystack.includes(query);
      row.hidden = !matches;
      panelHasMatch = panelHasMatch || matches;
    }

    const panelMatches = !query || panelHasMatch;
    panel.hidden = !panelMatches;
    panel.classList.toggle('is-active', panelMatches);
  }
}

function applyInterfacePreferences() {
  document.body.classList.toggle('compact-tabs', Boolean(state.settings?.compactTabs));
  document.body.classList.toggle('reduce-motion', state.settings?.motionEnabled === false);
  document.body.classList.toggle('hide-security-indicator', state.settings?.securityIndicatorVisible === false);
  document.body.classList.remove(
    'theme-pure-black',
    'theme-graphite',
    'theme-terminal',
    'theme-paper-white',
    'theme-midnight',
    'theme-cyber-matrix',
    'theme-frost',
    'theme-solar',
    'theme-violet-noir',
    'theme-ember'
  );
  document.body.classList.add(`theme-${state.settings?.theme || 'pure-black'}`);
}

function openBookmarks() {
  closeMenu();
  renderBookmarks();
  elements.bookmarksDialog.showModal();
}

function toggleMenu() {
  if (!elements.appMenu.hidden) {
    closeMenu();
    return;
  }

  elements.appMenu.hidden = false;
  positionAppMenu();
}

function closeMenu() {
  elements.appMenu.hidden = true;
}

function positionAppMenu() {
  const buttonRect = elements.menuButton.getBoundingClientRect();
  const menuRect = elements.appMenu.getBoundingClientRect();
  const margin = 8;
  const left = Math.max(margin, Math.min(window.innerWidth - menuRect.width - margin, buttonRect.right - menuRect.width));
  const top = Math.max(margin, Math.min(window.innerHeight - menuRect.height - margin, buttonRect.bottom + margin));

  elements.appMenu.style.left = `${left}px`;
  elements.appMenu.style.right = 'auto';
  elements.appMenu.style.top = `${top}px`;
}

function closeDialogs() {
  setSidebarOpen(false);
  if (elements.settingsDialog.open) elements.settingsDialog.close();
  if (elements.bookmarksDialog.open) elements.bookmarksDialog.close();
}

function handleWebviewConsoleMessage(tab, message) {
  if (typeof message !== 'string' || !message.startsWith(PASSWORD_CAPTURE_PREFIX)) return;

  try {
    const payload = JSON.parse(message.slice(PASSWORD_CAPTURE_PREFIX.length));
    showPasswordPrompt({
      title: payload.title || tab.title,
      url: payload.url || tab.url,
      username: payload.username,
      password: payload.password
    });
  } catch {
    // Ignore malformed page messages.
  }
}

function injectPasswordCapture(tab) {
  if (!tab?.webview || isNewTabUrl(tab.webview.getURL() || tab.url)) return;

  tab.webview
    .executeJavaScript(
      `(() => {
        if (window.__lumenPasswordCaptureInstalled) return;
        window.__lumenPasswordCaptureInstalled = true;
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return !element.disabled && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        };
        const findLogin = (scope, passwordInput) => {
          const loginTypes = new Set(['', 'text', 'email', 'tel', 'url']);
          return Array.from(scope.querySelectorAll('input')).find((input) => {
            const type = (input.getAttribute('type') || 'text').toLowerCase();
            const meta = [input.name, input.id, input.autocomplete, input.placeholder].join(' ').toLowerCase();
            return input !== passwordInput && loginTypes.has(type) && visible(input) && !/(search|captcha|code|otp|token|2fa|verification)/.test(meta);
          });
        };
        document.addEventListener('submit', (event) => {
          const scope = event.target instanceof HTMLFormElement ? event.target : document;
          const passwordInput = Array.from(scope.querySelectorAll('input[type="password"]')).find(visible);
          if (!passwordInput || !passwordInput.value) return;
          const loginInput = findLogin(scope, passwordInput);
          const payload = {
            title: document.title || location.hostname,
            url: location.href,
            username: loginInput?.value || '',
            password: passwordInput.value
          };
          console.info('${PASSWORD_CAPTURE_PREFIX}' + JSON.stringify(payload));
        }, true);
      })()`,
      true
    )
    .catch(() => {});
}

function injectPrivacyShield(webview) {
  if (!state.settings?.privacyShieldEnabled || !state.settings?.fingerprintProtectionEnabled || !webview) return;

  webview
    .executeJavaScript(
      `(() => {
        const define = (target, key, value) => {
          try { Object.defineProperty(target, key, { get: () => value, configurable: true }); } catch {}
        };
        define(navigator, 'webdriver', undefined);
        define(navigator, 'doNotTrack', '1');
        define(navigator, 'globalPrivacyControl', true);
        define(navigator, 'hardwareConcurrency', Math.min(8, navigator.hardwareConcurrency || 4));
        define(navigator, 'deviceMemory', Math.min(8, navigator.deviceMemory || 4));
        define(navigator, 'languages', ['ru-RU', 'ru', 'en-US', 'en']);
        if (!window.__lumenCanvasShield) {
          window.__lumenCanvasShield = true;
          const original = HTMLCanvasElement.prototype.toDataURL;
          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            try {
              const context = this.getContext('2d');
              if (context && this.width && this.height) {
                const image = context.getImageData(0, 0, Math.min(1, this.width), Math.min(1, this.height));
                image.data[0] = image.data[0] ^ 1;
                context.putImageData(image, 0, 0);
              }
            } catch {}
            return original.apply(this, args);
          };
        }
      })()`,
      true
    )
    .catch(() => {});
}

function applyPrivacyShieldToOpenTabs() {
  for (const tab of state.tabs) {
    injectPrivacyShield(tab.webview);
    if (tab.splitWebview) injectPrivacyShield(tab.splitWebview);
  }
}

function redirectCleanNavigation(webview, event) {
  const cleanUrl = stripTrackingParams(event.url);
  if (cleanUrl === event.url) return;

  event.preventDefault();
  webview.loadURL(cleanUrl);
}

function stripTrackingParams(url) {
  if (!state.settings?.stripTrackingParamsEnabled) return url;

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return url;

    let changed = false;
    for (const param of TRACKING_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.delete(param);
        changed = true;
      }
    }

    return changed ? parsed.toString() : url;
  } catch {
    return url;
  }
}

function translateActivePage() {
  const tab = getActiveTab();
  if (!tab || isNewTabUrl(tab.url)) return;

  const url = tab.webview.getURL() || tab.url;
  if (!/^https?:\/\//i.test(url)) return;

  const target = state.settings?.translationTargetLanguage || (getLanguage() === 'ru' ? 'ru' : 'en');
  createTab(`https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(target)}&u=${encodeURIComponent(url)}`);
}

function injectAdHidingCss(tab) {
  if (!state.settings?.adblockEnabled) return;
  tab.webview.insertCSS(AD_HIDE_CSS).catch(() => {});
}

function injectGoogleDarkTheme(tab) {
  if (!isGoogleSearchUrl(tab.webview.getURL() || tab.url)) return;
  tab.webview.insertCSS(GOOGLE_DARK_CSS).catch(() => {});
  tab.webview
    .executeJavaScript(
      `(() => {
        document.documentElement.style.colorScheme = 'dark';
        document.body?.style.setProperty('background', '#000000', 'important');
      })()`,
      true
    )
    .catch(() => {});
}

function injectPopularSiteDarkTheme(tab) {
  const url = tab.webview.getURL() || tab.url;
  if (isGoogleSearchUrl(url) || !isPopularDarkSiteUrl(url)) return;
  tab.webview.insertCSS(POPULAR_SITE_DARK_CSS).catch(() => {});
}

function isGoogleSearchUrl(url) {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return false;

    const normalizedHost = hostname.toLowerCase();
    return normalizedHost.startsWith('www.google.') || /^google\.[a-z.]+$/.test(normalizedHost);
  } catch {
    return false;
  }
}

function isPopularDarkSiteUrl(url) {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    const normalizedHost = hostname.toLowerCase().replace(/^www\./, '');
    return DARK_SITE_HOSTS.some((host) => normalizedHost === host || normalizedHost.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function toNavigationUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return getNewTabUrl();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return `${getSearchEngineUrl()}${encodeURIComponent(trimmed)}`;
}

function getNewTabUrl() {
  const url = new URL(NEW_TAB_BASE_URL);
  url.searchParams.set('search', state.settings?.searchEngine || 'duckduckgo');
  url.searchParams.set('lang', getLanguage());
  url.searchParams.set('theme', state.settings?.theme || 'pure-black');
  url.searchParams.set('backdrop', state.settings?.startPageBackdrop || 'signal-grid');

  if (state.settings?.motionEnabled === false) {
    url.searchParams.set('motion', '0');
  }

  return url.toString();
}

function getHomePageUrl() {
  const homepage = state.settings?.homePageUrl?.trim();
  if (!homepage) return getNewTabUrl();
  return toNavigationUrl(homepage);
}

function getSearchEngineUrl() {
  return SEARCH_ENGINES[state.settings?.searchEngine] || SEARCH_ENGINES.duckduckgo;
}

function readableTitle(url) {
  if (isNewTabUrl(url)) return t('newTab');

  try {
    const parsed = new URL(url);
    return parsed.hostname || url;
  } catch {
    return url;
  }
}

function isNewTabUrl(url) {
  try {
    return new URL(url).pathname.endsWith('/new-tab.html');
  } catch {
    return url.endsWith('/new-tab.html');
  }
}

function compactCount(value) {
  if (value < 1000) return String(value);
  if (value < 1000000) return `${Math.floor(value / 100) / 10}k`;
  return `${Math.floor(value / 100000) / 10}m`;
}

function pluralize(value, singular, plural) {
  return value === 1 ? singular : plural;
}

function formatBytes(value) {
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function filePathToUrl(filePath) {
  return `file://${encodeURI(filePath).replaceAll('#', '%23').replaceAll('?', '%3F')}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getActiveTab() {
  return state.tabs.find((tab) => tab.id === state.activeTabId);
}
