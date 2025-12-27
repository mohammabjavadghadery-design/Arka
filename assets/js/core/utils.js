class ArcUtils {
constructor() {
this.init();
}

init() {
console.log('✅ Utilities initialized');
this.setupGlobalUtils();
this.setupEventListeners();
}

setupGlobalUtils() {
// Add to window for global access
window.arcUtils = this;
}

setupEventListeners() {
// Copy to clipboard functionality
document.addEventListener('click', (e) => {
if (e.target.matches('[data-copy]') || e.target.closest('[data-copy]')) {
const target = e.target.closest('[data-copy]');
const text = target.dataset.copy;
this.copyToClipboard(text, target);
}
});

// Track external links
document.querySelectorAll('a[href^="http"]').forEach(link => {
link.addEventListener('click', (e) => {
this.trackEvent('ExternalLink', 'Click', link.href);
});
});
}

// Copy text to clipboard with visual feedback
copyToClipboard(text, element = null) {
if (!text) return;

const textarea = document.createElement('textarea');
textarea.value = text;
document.body.appendChild(textarea);
textarea.select();
document.execCommand('copy');
document.body.removeChild(textarea);

// Visual feedback
if (element) {
const originalIcon = element.innerHTML;
element.innerHTML = '<i class="fas fa-check"></i>';
element.classList.add('success');
setTimeout(() => {
element.innerHTML = originalIcon;
element.classList.remove('success');
}, 1500);
}

// Play success sound
const successSound = document.getElementById('success-sound');
if (successSound) {
successSound.currentTime = 0;
successSound.play().catch(e => console.log('Audio play prevented:', e));
}

this.trackEvent('Clipboard', 'Copy', text.substring(0, 50));
}

// Show toast notification
showToast(message, type = 'info', duration = 3000) {
const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
const toast = document.createElement('div');
toast.className = `toast ${type} fade-in`;
toast.innerHTML = `
<div class="toast-content">
<i class="fas ${this.getToastIcon(type)}"></i>
<span>${message}</span>
</div>
<div class="toast-progress" style="animation-duration: ${duration}ms"></div>
`;
toastContainer.appendChild(toast);

// Auto remove
setTimeout(() => {
toast.classList.add('fade-out');
setTimeout(() => {
toast.remove();
if (toastContainer.children.length === 0) {
toastContainer.remove();
}
}, 300);
}, duration);

this.trackEvent('UI', 'Toast', message);
}

createToastContainer() {
const container = document.createElement('div');
container.id = 'toast-container';
container.style.position = 'fixed';
container.style.bottom = '20px';
container.style.right = '20px';
container.style.zIndex = '9999';
document.body.appendChild(container);
return container;
}

getToastIcon(type) {
const icons = {
success: 'fa-check-circle text-success',
error: 'fa-exclamation-circle text-danger',
warning: 'fa-exclamation-triangle text-warning',
info: 'fa-info-circle text-info'
};
return icons[type] || icons.info;
}

// Show success message
showSuccess(message, duration = 2000) {
this.showToast(message, 'success', duration);
}

// Show error message
showError(message, duration = 3000) {
this.showToast(message, 'error', duration);
}

// Show warning message
showWarning(message, duration = 2500) {
this.showToast(message, 'warning', duration);
}

// Generate random ID
generateId(prefix = 'arc') {
return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format bytes to human readable
formatBytes(bytes, decimals = 2) {
if (bytes === 0) return '0 Bytes';
const k = 1024;
const dm = decimals < 0 ? 0 : decimals;
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));
return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format time as HH:MM:SS
formatTime(seconds) {
const h = Math.floor(seconds / 3600);
const m = Math.floor((seconds % 3600) / 60);
const s = Math.floor(seconds % 60);
return [
h > 0 ? h.toString().padStart(2, '0') : null,
m.toString().padStart(2, '0'),
s.toString().padStart(2, '0')
].filter(Boolean).join(':');
}

// Generate random color
randomColor() {
const letters = '0123456789ABCDEF';
let color = '#';
for (let i = 0; i < 6; i++) {
color += letters[Math.floor(Math.random() * 16)];
}
return color;
}

// Debounce function
debounce(func, delay) {
let timeoutId;
return (...args) => {
clearTimeout(timeoutId);
timeoutId = setTimeout(() => {
func.apply(this, args);
}, delay);
};
}

// Smooth scroll to element
smoothScroll(element, duration = 800) {
const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
const startPosition = window.pageYOffset;
const distance = targetPosition - startPosition;
let startTime = null;

const animation = (currentTime) => {
if (startTime === null) startTime = currentTime;
const timeElapsed = currentTime - startTime;
const run = ease(timeElapsed, startPosition, distance, duration);
window.scrollTo(0, run);
if (timeElapsed < duration) requestAnimationFrame(animation);
};

const ease = (t, b, c, d) => {
t /= d / 2;
if (t < 1) return c / 2 * t * t + b;
t--;
return -c / 2 * (t * (t - 2) - 1) + b;
};

requestAnimationFrame(animation);
}

// Track analytics event
trackEvent(category, action, label = '', value = 0) {
try {
// Google Analytics
if (typeof gtag === 'function') {
gtag('event', action, {
event_category: category,
event_label: label,
value: value
});
}

// Custom analytics
const event = {
category,
action,
label,
value,
timestamp: new Date().toISOString(),
url: window.location.href,
userAgent: navigator.userAgent
};

// Store in localStorage for offline tracking
let events = JSON.parse(localStorage.getItem('arc-analytics-events') || '[]');
events.push(event);
localStorage.setItem('arc-analytics-events', JSON.stringify(events.slice(-100))); // Keep last 100 events

console.log(`📊 Analytics: ${category} - ${action}`, { label, value });
} catch (error) {
console.error('Analytics tracking error:', error);
}
}

// Performance timing
startPerformanceTimer(name) {
if (!window.performance) return null;
return {
name: name,
start: performance.now()
};
}

endPerformanceTimer(timer, description = '') {
if (!timer || !window.performance) return;
const duration = performance.now() - timer.start;
console.log(`⏱️ Performance: ${timer.name} - ${duration.toFixed(2)}ms ${description}`);
this.trackEvent('Performance', timer.name, description, duration);
}

// Check if element is in viewport
isInViewport(element) {
const rect = element.getBoundingClientRect();
return (
rect.top >= 0 &&
rect.left >= 0 &&
rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
rect.right <= (window.innerWidth || document.documentElement.clientWidth)
);
}

// Detect device type
getDeviceType() {
const ua = navigator.userAgent;
if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
return 'tablet';
} else if (/Mobile|Android|iP(hone|od)|IEMobile|Windows Phone|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
return 'mobile';
} else {
return 'desktop';
}
}

// Get browser info
getBrowserInfo() {
const ua = navigator.userAgent;
let browserName = 'Unknown';
let browserVersion = 'Unknown';

if (ua.includes('Chrome') && !ua.includes('Edg')) {
browserName = 'Chrome';
browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
} else if (ua.includes('Firefox')) {
browserName = 'Firefox';
browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
} else if (ua.includes('Safari') && !ua.includes('Chrome')) {
browserName = 'Safari';
browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
} else if (ua.includes('Edg')) {
browserName = 'Edge';
browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
} else if (ua.includes('OPR')) {
browserName = 'Opera';
browserVersion = ua.match(/OPR\/(\d+)/)?.[1] || 'Unknown';
}

return {
name: browserName,
version: browserVersion,
userAgent: ua
};
}

// Get system info
getSystemInfo() {
return {
os: this.getOS(),
browser: this.getBrowserInfo(),
device: this.getDeviceType(),
screen: {
width: screen.width,
height: screen.height,
colorDepth: screen.colorDepth
},
language: navigator.language,
timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
online: navigator.onLine
};
}

getOS() {
const ua = navigator.userAgent;
if (ua.includes('Win')) return 'Windows';
if (ua.includes('Mac')) return 'MacOS';
if (ua.includes('Linux')) return 'Linux';
if (ua.includes('Android')) return 'Android';
if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
return 'Unknown';
}

// Create blob URL for download
createDownloadUrl(data, filename, type = 'text/plain') {
const blob = new Blob([data], { type });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
URL.revokeObjectURL(url);
}, 100);
}

// Parse query parameters
getQueryParams() {
const params = new URLSearchParams(window.location.search);
const result = {};
for (const [key, value] of params) {
result[key] = value;
}
return result;
}

// Set cookie with expiration
setCookie(name, value, days = 7) {
const expires = new Date(Date.now() + days * 864e5).toUTCString();
document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Get cookie
getCookie(name) {
return document.cookie.split('; ')
.find(row => row.startsWith(`${name}=`))
?.split('=')[1];
}

// Generate random string
generateRandomString(length = 10) {
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let result = '';
for (let i = 0; i < length; i++) {
result += chars.charAt(Math.floor(Math.random() * chars.length));
}
return result;
}

// Format number with commas
formatNumber(number) {
return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Capitalize first letter
capitalizeFirstLetter(string) {
return string.charAt(0).toUpperCase() + string.slice(1);
}

// Truncate text
truncateText(text, maxLength = 100) {
if (!text) return '';
if (text.length <= maxLength) return text;
return text.substring(0, maxLength) + '...';
}

// Validate email
isValidEmail(email) {
const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return re.test(email);
}

// Validate URL
isValidUrl(url) {
try {
new URL(url);
return true;
} catch (e) {
return false;
}
}

// Generate slug from string
generateSlug(text) {
return text.toLowerCase()
.replace(/[^a-z0-9\s-]/g, '')
.replace(/\s+/g, '-')
.replace(/-+/g, '-')
.trim();
}

// Deep clone object
deepClone(obj) {
return JSON.parse(JSON.stringify(obj));
}

// Merge objects deeply
deepMerge(target, source) {
if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
return source;
}

const output = Array.isArray(target) ? [...target] : { ...target };
Object.keys(source).forEach(key => {
if (typeof source[key] === 'object' && source[key] !== null) {
output[key] = this.deepMerge(target[key], source[key]);
} else {
output[key] = source[key];
}
});
return output;
}

// Shuffle array
shuffleArray(array) {
const result = [...array];
for (let i = result.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[result[i], result[j]] = [result[j], result[i]];
}
return result;
}

// Get random item from array
getRandomItem(array) {
return array[Math.floor(Math.random() * array.length)];
}

// Generate UUID
generateUUID() {
return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
const r = Math.random() * 16 | 0;
const v = c === 'x' ? r : (r & 0x3 | 0x8);
return v.toString(16);
});
}

// Format date in Persian
formatPersianDate(date = new Date()) {
const options = {
year: 'numeric',
month: 'long',
day: 'numeric',
weekday: 'long',
hour: '2-digit',
minute: '2-digit',
hour12: false
};
return date.toLocaleDateString('fa-IR', options);
}

// Calculate color contrast
getContrastColor(bgColor) {
const hex = bgColor.replace('#', '');
const r = parseInt(hex.substring(0, 2), 16);
const g = parseInt(hex.substring(2, 4), 16);
const b = parseInt(hex.substring(4, 6), 16);
const brightness = (r * 299 + g * 587 + b * 114) / 1000;
return brightness > 128 ? '#000000' : '#ffffff';
}

// Create gradient text
createGradientText(text, colors = ['#00ff8c', '#00ffff']) {
return `<span style="background: linear-gradient(45deg, ${colors.join(', ')}); -webkit-background-clip: text; background-clip: text; color: transparent;">${text}</span>`;
}

// Animate number counter
animateCounter(element, start, end, duration = 2000) {
let startTimestamp = null;
const step = (timestamp) => {
if (!startTimestamp) startTimestamp = timestamp;
const progress = Math.min((timestamp - startTimestamp) / duration, 1);
const value = Math.floor(start + (end - start) * progress);
element.textContent = this.formatNumber(value);
if (progress < 1) {
window.requestAnimationFrame(step);
}
};
window.requestAnimationFrame(step);
}

// Get query selector with fallback
querySelect(selector, fallback = null) {
const element = document.querySelector(selector);
return element || fallback;
}

// Get all query selectors
querySelectAll(selector) {
return document.querySelectorAll(selector);
}

// Add class with animation
addClassWithAnimation(element, className, animationClass = 'fade-in') {
element.classList.add(animationClass);
setTimeout(() => {
element.classList.add(className);
setTimeout(() => {
element.classList.remove(animationClass);
}, 300);
}, 10);
}

// Remove class with animation
removeClassWithAnimation(element, className, animationClass = 'fade-out') {
element.classList.add(animationClass);
setTimeout(() => {
element.classList.remove(className);
setTimeout(() => {
element.classList.remove(animationClass);
}, 300);
}, 10);
}

// Toggle class with animation
toggleClassWithAnimation(element, className, animationIn = 'fade-in', animationOut = 'fade-out') {
if (element.classList.contains(className)) {
this.removeClassWithAnimation(element, className, animationOut);
} else {
this.addClassWithAnimation(element, className, animationIn);
}
}

// Check if dark mode is enabled
isDarkMode() {
return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Set theme
setTheme(theme) {
document.body.className = '';
document.body.classList.add(`${theme}-theme`);
localStorage.setItem('arc-theme', theme);
this.trackEvent('UI', 'ThemeChange', theme);
}

// Get saved theme
getSavedTheme() {
return localStorage.getItem('arc-theme') || (this.isDarkMode() ? 'dark' : 'light');
}

// Initialize theme
initTheme() {
const savedTheme = this.getSavedTheme();
this.setTheme(savedTheme);
}

// Setup theme toggle
setupThemeToggle() {
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
themeToggle.addEventListener('click', () => {
const currentTheme = document.body.className.includes('dark') ? 'dark' : 'light';
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
this.setTheme(newTheme);
});
}
}

// Performance monitor
startPerformanceMonitor() {
if (!window.performance) return;
const paint = performance.getEntriesByType('paint');
const navigation = performance.getEntriesByType('navigation')[0];
console.log('📊 Performance Metrics:');
console.log(`- First Paint: ${paint[0]?.startTime || 0}ms`);
console.log(`- First Contentful Paint: ${paint[1]?.startTime || 0}ms`);
console.log(`- DOMContentLoaded: ${navigation?.domContentLoadedEventEnd || 0}ms`);
console.log(`- Load Event: ${navigation?.loadEventEnd || 0}ms`);
}

// Memory usage monitor
getMemoryUsage() {
if (performance.memory) {
const memory = performance.memory;
return {
usedJSHeapSize: this.formatBytes(memory.usedJSHeapSize),
totalJSHeapSize: this.formatBytes(memory.totalJSHeapSize),
jsHeapSizeLimit: this.formatBytes(memory.jsHeapSizeLimit)
};
}
return null;
}

// Network status monitor
setupNetworkMonitor() {
window.addEventListener('online', () => {
console.log('🌐 Network: Back online');
this.showSuccess('اتصال اینترنت برقرار شد');
this.trackEvent('Network', 'Online');
});
window.addEventListener('offline', () => {
console.log('⚠️ Network: Offline');
this.showWarning('اتصال اینترنت قطع شد');
this.trackEvent('Network', 'Offline');
});
}

// Error handler
setupErrorHandler() {
window.addEventListener('error', (e) => {
console.error('🚨 Global Error:', e.message, e.filename, e.lineno);
this.trackEvent('Error', 'Global', e.message);
});
window.addEventListener('unhandledrejection', (e) => {
console.error('🚨 Unhandled Promise Rejection:', e.reason);
this.trackEvent('Error', 'UnhandledRejection', e.reason?.message || 'Unknown');
});
}

// Initialize all utilities
initialize() {
this.initTheme();
this.setupThemeToggle();
this.startPerformanceMonitor();
this.setupNetworkMonitor();
this.setupErrorHandler();
console.log('✅ ArcUtils fully initialized');
}

static initialize() {
new ArcUtils().initialize();
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', ArcUtils.initialize);
