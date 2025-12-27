class ArcMain {
constructor() {
this.isInitialized = false;
this.startupTime = null;
this.modules = {
utils: null,
router: null,
audio: null,
commands: null,
validator: null,
sandbox: null,
ai: null,
nlp: null,
suggest: null,
glass: null,
parallax: null,
physics: null,
ui: null,
timeTravel: null
};
this.init();
}

init() {
if (this.isInitialized) return;
this.isInitialized = true;
this.startupTime = performance.now();

console.log('🚀 Arc Command Hub - Starting Initialization...');
this.showLoadingScreen();
this.loadModules();
this.setupEventListeners();
this.initializeApplication();
this.hideLoadingScreen();
this.startPerformanceMonitoring();
}

showLoadingScreen() {
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.innerHTML = `
<div class="loading-container">
<div class="quantum-logo">
<i class="fas fa-brain quantum-icon"></i>
<span>آرکا</span>
</div>
<div class="loading-progress">
<div class="progress-bar" id="loading-progress-bar"></div>
</div>
<div class="loading-text" id="loading-text">در حال بارگذاری سیستم...</div>
<div class="loading-details">
<span class="detail-item"><i class="fas fa-microchip"></i> Core Modules</span>
<span class="detail-item"><i class="fas fa-robot"></i> AI Engine</span>
<span class="detail-item"><i class="fas fa-shield-alt"></i> Security System</span>
<span class="detail-item"><i class="fas fa-bolt"></i> Performance Optimization</span>
</div>
</div>
`;
document.body.appendChild(loadingScreen);
document.body.style.overflow = 'hidden';

// Simulate progress
let progress = 0;
const progressBar = document.getElementById('loading-progress-bar');
const loadingText = document.getElementById('loading-text');
const progressInterval = setInterval(() => {
progress += Math.random() * 5;
if (progress >= 100) {
progress = 100;
clearInterval(progressInterval);
setTimeout(() => {
loadingScreen.style.opacity = '0';
setTimeout(() => {
document.body.removeChild(loadingScreen);
document.body.style.overflow = 'auto';
}, 300);
}, 300);
}

progressBar.style.width = `${progress}%`;
loadingText.textContent = this.getLoadingMessage(progress);
}, 100);
}

getLoadingMessage(progress) {
const messages = [
{ min: 0, max: 20, text: 'بارگذاری هسته سیستم...' },
{ min: 20, max: 40, text: 'فعال‌سازی ماژول‌های امنیتی...' },
{ min: 40, max: 60, text: 'راه‌اندازی هوش مصنوعی...' },
{ min: 60, max: 80, text: 'بهینه‌سازی عملکرد...' },
{ min: 80, max: 100, text: 'آماده‌سازی رابط کاربری...' }
];

return messages.find(m => progress >= m.min && progress < m.max)?.text || 'در حال نهایی‌سازی...';
}

hideLoadingScreen() {
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
loadingScreen.style.opacity = '0';
setTimeout(() => {
if (loadingScreen.parentNode) {
loadingScreen.parentNode.removeChild(loadingScreen);
}
document.body.style.overflow = 'auto';
}, 300);
}
}

loadModules() {
console.log('📦 Loading Core Modules...');
const modules = [
{ name: 'utils', path: 'utils.js', required: true },
{ name: 'router', path: 'router.js', required: true },
{ name: 'audio', path: 'audio-manager.js', required: true },
{ name: 'commands', path: '../../commands/command-db.js', required: true },
{ name: 'validator', path: '../../security/validator.js', required: true },
{ name: 'sandbox', path: '../../security/sandbox.js', required: true },
{ name: 'ai', path: '../../ai/ai-engine.js', required: true },
{ name: 'nlp', path: '../../ai/nlp-processor.js', required: true },
{ name: 'suggest', path: '../../ai/suggest-engine.js', required: true },
{ name: 'glass', path: '../../ui/glass-effects.js', required: true },
{ name: 'parallax', path: '../../ui/parallax.js', required: true },
{ name: 'physics', path: '../../ui/physics.js', required: true },
{ name: 'ui', path: '../../ui/micro-interactions.js', required: true },
{ name: 'timeTravel', path: '../../commands/time-travel.js', required: true }
];

modules.forEach(module => {
try {
// Check if module is already loaded via script tags
if (window[`arc${module.name.charAt(0).toUpperCase() + module.name.slice(1)}`]) {
this.modules[module.name] = window[`arc${module.name.charAt(0).toUpperCase() + module.name.slice(1)}`];
console.log(`✅ Module loaded via script: ${module.name}`);
return;
}

// If not loaded, try to load dynamically (for development)
console.log(`⏳ Loading module: ${module.name}`);
} catch (error) {
if (module.required) {
console.error(`❌ Failed to load required module: ${module.name}`, error);
this.showError(`خطا در بارگذاری ماژول: ${module.name}`);
} else {
console.warn(`⚠️ Optional module failed to load: ${module.name}`, error);
}
}
});
}

setupEventListeners() {
// System events
document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
window.addEventListener('error', this.handleGlobalError.bind(this));
window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

// Custom events
document.addEventListener('arc:systemReady', this.handleSystemReady.bind(this));
document.addEventListener('arc:commandExecuted', this.handleCommandExecuted.bind(this));
document.addEventListener('arc:aiResponse', this.handleAIResponse.bind(this));
document.addEventListener('arc:securityAlert', this.handleSecurityAlert.bind(this));

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
document.body.classList.add('mobile-device');
}
}

handleVisibilityChange() {
if (document.visibilityState === 'visible') {
console.log('👁️ Tab is now visible');
this.resumeApplication();
} else {
console.log('🙈 Tab is now hidden');
this.pauseApplication();
}
}

resumeApplication() {
// Resume animations and updates
window.arcParallax?.updateParallaxIntensity(1);
window.arcPhysics?.startAnimation();
this.startPerformanceMonitoring();
}

pauseApplication() {
// Pause non-essential processes
window.arcParallax?.updateParallaxIntensity(0.2);
window.arcPhysics?.stopAnimation();
clearInterval(this.performanceMonitor);
}

handleBeforeUnload(e) {
// Warn if there are unsaved commands
const unsavedCommands = window.arcExecutor?.commandHistory?.filter(c => !c.saved) || [];
if (unsavedCommands.length > 0) {
const message = `شما ${unsavedCommands.length} دستور اجرا شده دارید که ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید خارج شوید؟`;
e.returnValue = message;
return message;
}
}

handleGlobalError(e) {
console.error('🚨 Global Error:', e.message, e.filename, e.lineno);
window.arcUtils?.showError(`خطای سیستم: ${e.message}`);
this.logError('global_error', e.message, {
filename: e.filename,
lineno: e.lineno,
colno: e.colno
});
}

handleUnhandledRejection(e) {
console.error('🚨 Unhandled Promise Rejection:', e.reason);
window.arcUtils?.showError(`خطای نامشخص: ${e.reason?.message || 'Unknown error'}`);
this.logError('unhandled_rejection', e.reason?.message || 'Unknown error', {
stack: e.reason?.stack
});
}

handleSystemReady() {
console.log('✅ System is ready');
window.arcUtils?.showSuccess('سیستم با موفقیت راه‌اندازی شد');
this.runStartupChecks();
}

handleCommandExecuted(e) {
const detail = e.detail;
console.log('⚡ Command executed:', detail.command);
this.trackUserEngagement('command_execution');
}

handleAIResponse(e) {
console.log('🧠 AI response received');
this.trackUserEngagement('ai_interaction');
}

handleSecurityAlert(e) {
const detail = e.detail;
console.log('🔒 Security alert:', detail.message);
if (detail.severity === 'high') {
window.arcUtils?.showError(`هشدار امنیتی: ${detail.message}`);
}
}

initializeApplication() {
console.log('⚙️ Initializing Application...');
this.setupTheme();
this.setupLanguage();
this.loadUserData();
this.setupAnalytics();
this.runStartupChecks();
this.showWelcomeMessage();
this.triggerSystemReady();

// Performance logging
const initTime = performance.now() - this.startupTime;
console.log(`✨ Application initialized in ${initTime.toFixed(2)}ms`);
window.arcUtils?.trackEvent('Performance', 'Initialization', `${initTime.toFixed(2)}ms`);
}

setupTheme() {
// Get saved theme or use system preference
const savedTheme = localStorage.getItem('arka-theme') || 
(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

document.body.className = '';
document.body.classList.add(`${savedTheme}-theme`);

// Setup theme toggle
const themeToggle = document.getElementById('mode-toggle');
if (themeToggle) {
themeToggle.addEventListener('click', () => {
const currentTheme = document.body.className.includes('dark') ? 'dark' : 'light';
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
this.setTheme(newTheme);
});
}
}

setTheme(theme) {
document.body.className = '';
document.body.classList.add(`${theme}-theme`);
localStorage.setItem('arka-theme', theme);
window.arcUtils?.trackEvent('UI', 'ThemeChange', theme);
window.arcUtils?.showInfo(theme === 'dark' ? 'حالت شب فعال شد' : 'حالت روشن فعال شد');
}

setupLanguage() {
// Set Persian as default
document.documentElement.lang = 'fa';
document.documentElement.dir = 'rtl';

// Language switcher (if needed)
const languageSwitcher = document.getElementById('language-switcher');
if (languageSwitcher) {
languageSwitcher.addEventListener('change', (e) => {
const lang = e.target.value;
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
window.arcUtils?.trackEvent('UI', 'LanguageChange', lang);
});
}
}

loadUserData() {
try {
// Load command history
const commandHistory = JSON.parse(localStorage.getItem('arka-command-history') || '[]');
if (window.arcExecutor && Array.isArray(commandHistory)) {
window.arcExecutor.commandHistory = commandHistory;
}

// Load AI history
const aiHistory = JSON.parse(localStorage.getItem('arka-ai-history') || '[]');
if (window.arcAI && Array.isArray(aiHistory)) {
window.arcAI.conversationHistory = aiHistory;
}

// Load user preferences
const userPrefs = JSON.parse(localStorage.getItem('arka-user-preferences') || '{}');
this.applyUserPreferences(userPrefs);

console.log('✅ User data loaded');
} catch (error) {
console.error('Error loading user data:', error);
}
}

applyUserPreferences(prefs) {
// Apply saved preferences
if (prefs.expertMode !== undefined) {
document.body.classList.toggle('expert-mode', prefs.expertMode);
}

if (prefs.fontSize) {
document.documentElement.style.fontSize = `${prefs.fontSize}px`;
}

if (prefs.soundEnabled !== undefined) {
// Handle sound preferences
}
}

setupAnalytics() {
// Initialize analytics
window.arcUtils?.trackEvent('System', 'Startup', 'Application initialized');
window.arcUtils?.trackEvent('User', 'SessionStart', navigator.userAgent);

// Track page views
let lastPage = window.location.pathname;
setInterval(() => {
const currentPage = window.location.pathname;
if (currentPage !== lastPage) {
window.arcUtils?.trackEvent('Navigation', 'PageView', currentPage);
lastPage = currentPage;
}
}, 1000);
}

runStartupChecks() {
console.log('🔍 Running startup checks...');

const checks = [
{ name: 'AI Engine', status: !!window.arcAI, module: 'ai' },
{ name: 'Command Database', status: !!window.arcCommands, module: 'commands' },
{ name: 'Security Validator', status: !!window.arcValidator, module: 'validator' },
{ name: 'Audio Manager', status: !!window.arcAudio, module: 'audio' },
{ name: 'UI Effects', status: !!window.arcGlass, module: 'glass' }
];

const failedChecks = checks.filter(check => !check.status);
if (failedChecks.length > 0) {
console.warn('⚠️ Some modules failed to initialize:', failedChecks);
window.arcUtils?.showWarning(`تعدادی ماژول راه‌اندازی نشدند: ${failedChecks.length}`);
} else {
console.log('✅ All startup checks passed');
}

this.updateSystemStatus(failedChecks.length === 0 ? 'ready' : 'warning');
}

updateSystemStatus(status) {
const statusElement = document.querySelector('.status-item:first-child span');
if (statusElement) {
statusElement.textContent = status === 'ready' ? 'آنلاین' : 'هشدار';
const dot = document.querySelector('.status-dot');
if (dot) {
dot.className = 'status-dot';
dot.classList.add(status === 'ready' ? 'connected' : 'warning');
}
}
}

showWelcomeMessage() {
if (!localStorage.getItem('arka-welcome-shown')) {
setTimeout(() => {
window.arcUtils?.showSuccess('👋 خوشحالم که اینجا هستم! من آرکا هستم، هوش مصنوعی کمک‌کننده شما برای مدیریت سیستم.');
localStorage.setItem('arka-welcome-shown', 'true');
}, 1000);
}
}

triggerSystemReady() {
const event = new CustomEvent('arc:systemReady', { detail: { timestamp: new Date().toISOString() } });
document.dispatchEvent(event);
}

startPerformanceMonitoring() {
this.performanceMonitor = setInterval(() => {
const memory = window.arcUtils?.getMemoryUsage();
if (memory) {
console.log('📊 Memory Usage:', memory);
}
}, 30000); // Every 30 seconds
}

trackUserEngagement(type) {
const engagement = {
type: type,
timestamp: new Date().toISOString(),
userAgent: navigator.userAgent,
screen: {
width: screen.width,
height: screen.height
}
};

// Store in localStorage
let engagements = JSON.parse(localStorage.getItem('arka-engagements') || '[]');
engagements.push(engagement);
engagements = engagements.slice(-100); // Keep last 100
localStorage.setItem('arka-engagements', JSON.stringify(engagements));

window.arcUtils?.trackEvent('Engagement', type, engagement.type);
}

logError(type, message, details = {}) {
const error = {
type: type,
message: message,
timestamp: new Date().toISOString(),
url: window.location.href,
userAgent: navigator.userAgent,
details: details
};

// Store in localStorage for debugging
let errors = JSON.parse(localStorage.getItem('arka-errors') || '[]');
errors.push(error);
errors = errors.slice(-50); // Keep last 50 errors
localStorage.setItem('arka-errors', JSON.stringify(errors));

window.arcUtils?.trackEvent('Error', type, message);
}

startInteractiveTutorial() {
const tutorial = document.createElement('div');
tutorial.className = 'interactive-tutorial';
tutorial.innerHTML = `
<div class="tutorial-overlay">
<div class="tutorial-content glass-card">
<div class="tutorial-header">
<h3><i class="fas fa-graduation-cap"></i> آموزش تعاملی آرکا</h3>
<button class="close-tutorial">&times;</button>
</div>
<div class="tutorial-steps">
<div class="tutorial-step active" data-step="1">
<h4>مرحله ۱: کار با هوش مصنوعی</h4>
<p>در کادر زیر، سؤال خود را به فارسی بنویسید. من دستورات مناسب را پیشنهاد می‌دهم.</p>
<div class="tutorial-example">
<span class="example-query">"فایل‌های حجیم رو پیدا کنم"</span>
<span class="example-query">"شبکه رو تست کنم"</span>
</div>
<button class="next-step">مرحله بعد →</button>
</div>
<div class="tutorial-step" data-step="2">
<h4>مرحله ۲: انتخاب محیط اجرا</h4>
<p>سه محیط اصلی داریم:</p>
<ul class="tutorial-options">
<li><strong>CMD</strong> - برای دستورات ساده و سریع</li>
<li><strong>PowerShell</strong> - برای اسکریپت‌های پیشرفته</li>
<li><strong>Run</strong> - برای اجرای مستقیم برنامه‌ها</li>
</ul>
<button class="next-step">مرحله بعد →</button>
</div>
<div class="tutorial-step" data-step="3">
<h4>مرحله ۳: امنیت و اعتبارسنجی</h4>
<p>سیستم به صورت خودکار دستورات را بررسی می‌کند:</p>
<ul class="tutorial-security">
<li><span class="risk-low">🟢 ریسک پایین</span> - بدون نیاز به تأیید</li>
<li><span class="risk-medium">🟡 ریسک متوسط</span> - با تأیید یک مرحله‌ای</li>
<li><span class="risk-high">🔴 ریسک بالا</span> - با تأیید دو مرحله‌ای</li>
</ul>
<button class="next-step">مرحله بعد →</button>
</div>
<div class="tutorial-step" data-step="4">
<h4>مرحله ۴: ترمینال کوانتومی</h4>
<p>تمام خروجی‌ها در ترمینال نمایش داده می‌شود:</p>
<div class="tutorial-terminal-features">
<div class="feature">
<i class="fas fa-copy"></i>
<span>کپی کردن لاگ</span>
</div>
<div class="feature">
<i class="fas fa-trash"></i>
<span>پاک کردن</span>
</div>
<div class="feature">
<i class="fas fa-download"></i>
<span>دانلود لاگ</span>
</div>
</div>
<button class="finish-tutorial">پایان آموزش</button>
</div>
</div>
</div>
</div>
`;

document.body.appendChild(tutorial);

// Setup tutorial interactions
document.querySelector('.close-tutorial').addEventListener('click', () => {
tutorial.remove();
});

document.querySelectorAll('.next-step').forEach(button => {
button.addEventListener('click', () => {
const currentStep = button.closest('.tutorial-step');
const nextStep = currentStep.nextElementSibling;
if (nextStep) {
currentStep.classList.remove('active');
nextStep.classList.add('active');
}
});
});

document.querySelector('.finish-tutorial').addEventListener('click', () => {
tutorial.remove();
window.arcUtils?.showSuccess('آموزش با موفقیت به پایان رسید! حالا می‌توانید از تمام قابلیت‌ها استفاده کنید.');
});
}

static initialize() {
window.arcMain = new ArcMain();
console.log('✅ Arc Main fully initialized');
}
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
// Check if all dependencies are loaded
const dependencies = [
'arcUtils', 'arcRouter', 'arcAudio', 'arcCommands', 'arcValidator', 'arcSandbox',
'arcAI', 'arcNLP', 'arcSuggest', 'arcGlass', 'arcParallax', 'arcPhysics', 'arcUI', 'arcTimeTravel'
];

const interval = setInterval(() => {
const allLoaded = dependencies.every(dep => window[dep]);
if (allLoaded) {
clearInterval(interval);
ArcMain.initialize();
} else {
console.log('⏳ Waiting for dependencies to load...');
}
}, 100);
});

// Fallback initialization if DOMContentLoaded doesn't work
setTimeout(() => {
if (!window.arcMain) {
ArcMain.initialize();
}
}, 3000);
