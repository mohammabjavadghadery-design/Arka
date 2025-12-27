class MicroInteractions {
constructor() {
this.interactiveElements = [];
this.hoverTimeouts = new Map();
this.clickLocks = new Map();
this.init();
}

init() {
this.setupElements();
this.setupEventListeners();
this.setupGlobalInteractions();
console.log('✅ Micro Interactions initialized');
}

setupElements() {
// Buttons
this.setupButtons();
// Cards
this.setupCards();
// Input fields
this.setupInputs();
// Navigation
this.setupNavigation();
// Terminal interactions
this.setupTerminalInteractions();
}

setupEventListeners() {
// Global keyboard shortcuts
document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

// Window focus/blur
window.addEventListener('focus', () => {
window.arcUtils?.showSuccess('✅ سایت فعال شد');
});
window.addEventListener('blur', () => {
window.arcUtils?.showInfo('⏸️ سایت غیرفعال است');
});
}

setupButtons() {
const buttons = document.querySelectorAll('button, .btn, .copy-btn, .execute-btn');
buttons.forEach(button => {
button.addEventListener('mouseenter', () => this.handleButtonHover(button));
button.addEventListener('mouseleave', () => this.handleButtonLeave(button));
button.addEventListener('mousedown', () => this.handleButtonPress(button));
button.addEventListener('mouseup', () => this.handleButtonRelease(button));
button.addEventListener('click', () => this.handleButtonClick(button));

// Add ripple effect
button.classList.add('ripple-effect');
});

// Special buttons
document.querySelectorAll('.copy-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
const command = e.target.closest('button').dataset.command;
if (command) {
window.arcUtils.copyToClipboard(command, btn);
}
});
});

document.querySelectorAll('.execute-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
const command = e.target.closest('button').dataset.command;
const env = e.target.closest('button').dataset.env;
const risk = parseInt(e.target.closest('button').dataset.risk);
window.arcExecutor?.executeCommand(command, env, risk);
});
});
}

handleButtonHover(button) {
if (this.hoverTimeouts.has(button)) {
clearTimeout(this.hoverTimeouts.get(button));
}

button.classList.add('hover-active');
button.style.transform = 'scale(1.05)';
button.style.boxShadow = '0 0 15px rgba(0, 255, 140, 0.5)';

// Play subtle hover sound
if (!button.dataset.noSound) {
window.arcAudio?.click();
}
}

handleButtonLeave(button) {
const timeout = setTimeout(() => {
button.classList.remove('hover-active');
button.style.transform = 'scale(1)';
button.style.boxShadow = '';
}, 200);

this.hoverTimeouts.set(button, timeout);
}

handleButtonPress(button) {
button.style.transform = 'scale(0.95)';
button.style.boxShadow = '0 0 5px rgba(0, 255, 140, 0.3)';
}

handleButtonRelease(button) {
button.style.transform = 'scale(1.05)';
setTimeout(() => {
button.style.transform = 'scale(1)';
}, 100);
}

handleButtonClick(button) {
// Create ripple effect
const rect = button.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;

const ripple = document.createElement('span');
ripple.className = 'ripple';
ripple.style.left = `${x}px`;
ripple.style.top = `${y}px`;
button.appendChild(ripple);

setTimeout(() => {
ripple.remove();
}, 600);

// Track click
window.arcUtils?.trackEvent('UI', 'ButtonClick', button.textContent.trim());

// Show visual feedback
button.classList.add('click-active');
setTimeout(() => {
button.classList.remove('click-active');
}, 300);

// Play click sound
window.arcAudio?.click();
}

setupCards() {
const cards = document.querySelectorAll('.command-card, .stat-card, .feature-card');
cards.forEach(card => {
card.addEventListener('mouseenter', () => {
card.style.transform = 'translateY(-5px) scale(1.02)';
card.style.boxShadow = '0 15px 30px rgba(0, 255, 140, 0.4)';
card.style.zIndex = '10';
});

card.addEventListener('mouseleave', () => {
card.style.transform = 'translateY(0) scale(1)';
card.style.boxShadow = '';
card.style.zIndex = '1';
});

card.addEventListener('click', () => {
card.style.transform = 'scale(0.98)';
setTimeout(() => {
card.style.transform = 'scale(1.02)';
}, 100);
setTimeout(() => {
card.style.transform = 'translateY(-5px) scale(1.02)';
}, 200);
});
});
}

setupInputs() {
const inputs = document.querySelectorAll('input, textarea, select');
inputs.forEach(input => {
input.addEventListener('focus', () => {
input.style.borderColor = 'var(--primary-neon)';
input.style.boxShadow = '0 0 0 2px rgba(0, 255, 140, 0.3)';
});

input.addEventListener('blur', () => {
input.style.borderColor = '';
input.style.boxShadow = '';
});

input.addEventListener('input', () => {
// Show character count for textareas
if (input.tagName === 'TEXTAREA') {
const count = input.value.length;
const max = input.maxLength || 1000;
const ratio = count / max;
input.style.borderColor = ratio > 0.9 ? 'var(--danger-neon)' : 
ratio > 0.7 ? 'var(--warning-neon)' : 'var(--primary-neon)';
}
});
});

// AI input specific
const aiInput = document.getElementById('ai-input');
if (aiInput) {
aiInput.addEventListener('input', (e) => {
const value = e.target.value.trim();
document.getElementById('ai-submit').disabled = value.length === 0;
});

aiInput.addEventListener('focus', () => {
document.querySelector('.ai-section').style.boxShadow = '0 0 30px rgba(0, 255, 140, 0.3)';
});

aiInput.addEventListener('blur', () => {
document.querySelector('.ai-section').style.boxShadow = '';
});
}
}

setupNavigation() {
const navItems = document.querySelectorAll('nav a, .breadcrumb-item a');
navItems.forEach(item => {
item.addEventListener('mouseenter', () => {
item.style.color = 'var(--primary-neon)';
item.style.textShadow = '0 0 10px rgba(0, 255, 140, 0.5)';
});

item.addEventListener('mouseleave', () => {
item.style.color = '';
item.style.textShadow = '';
});

item.addEventListener('click', (e) => {
e.preventDefault();
const href = item.getAttribute('href');
window.arcRouter?.navigate(href);
});
});
}

setupTerminalInteractions() {
const terminal = document.getElementById('quantum-terminal');
if (!terminal) return;

// Copy terminal content
document.getElementById('copy-terminal')?.addEventListener('click', () => {
const text = terminal.textContent;
window.arcUtils.copyToClipboard(text, document.getElementById('copy-terminal'));
});

// Clear terminal
document.getElementById('clear-terminal')?.addEventListener('click', () => {
terminal.innerHTML = '<div class="terminal-line info">ترمینال پاک شد ✓</div>';
window.arcAudio?.success();
});

// Download terminal log
document.getElementById('download-terminal')?.addEventListener('click', () => {
const text = terminal.textContent;
const blob = new Blob([text], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `terminal-log-${new Date().toISOString().replace(/[:,]/g, '-')}.txt`;
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
URL.revokeObjectURL(url);
}, 100);
window.arcUtils?.trackEvent('Terminal', 'DownloadLog');
});
}

handleKeyboardShortcuts(e) {
// Ctrl + C: Copy last command
if (e.ctrlKey && e.key === 'c') {
e.preventDefault();
const lastCommand = document.querySelector('.terminal-line.command');
if (lastCommand) {
const commandText = lastCommand.textContent.replace('🚀 درخواست اجرای دستور: ', '');
window.arcUtils.copyToClipboard(commandText);
window.arcUtils.showSuccess('📋 آخرین دستور کپی شد');
}
}

// Ctrl + L: Clear terminal
if (e.ctrlKey && e.key === 'l') {
e.preventDefault();
document.getElementById('clear-terminal')?.click();
}

// Ctrl + K: Focus on AI input
if (e.ctrlKey && e.key === 'k') {
e.preventDefault();
document.getElementById('ai-input')?.focus();
}

// Ctrl + H: Show help
if (e.ctrlKey && e.key === 'h') {
e.preventDefault();
document.getElementById('tutorial-btn')?.click();
}

// Escape: Close modals
if (e.key === 'Escape') {
this.closeAllModals();
}
}

closeAllModals() {
const modals = document.querySelectorAll('.modal-content, .focus-panel');
modals.forEach(modal => {
modal.style.display = 'none';
});
const backdrop = document.getElementById('focus-backdrop');
if (backdrop) backdrop.style.display = 'none';
}

setupGlobalInteractions() {
// Click outside to close modals
document.addEventListener('click', (e) => {
if (e.target === document.getElementById('focus-backdrop')) {
this.closeAllModals();
}
});

// Prevent default context menu on glass cards
document.querySelectorAll('.glass-card').forEach(card => {
card.addEventListener('contextmenu', (e) => {
e.preventDefault();
window.arcUtils?.showInfo('راست‌کلیک غیرفعال است');
});
});

// Double click to maximize/minimize
document.querySelectorAll('.glass-card').forEach(card => {
let clickTimer;
card.addEventListener('click', (e) => {
if (clickTimer) {
clearTimeout(clickTimer);
clickTimer = null;
this.toggleCardMaximize(card);
} else {
clickTimer = setTimeout(() => {
clickTimer = null;
}, 300);
}
});
});
}

toggleCardMaximize(card) {
if (card.classList.contains('maximized')) {
card.classList.remove('maximized');
card.style.position = '';
card.style.top = '';
card.style.left = '';
card.style.width = '';
card.style.height = '';
card.style.zIndex = '';
document.body.style.overflow = 'auto';
} else {
card.classList.add('maximized');
card.style.position = 'fixed';
card.style.top = '10px';
card.style.left = '10px';
card.style.width = 'calc(100% - 20px)';
card.style.height = 'calc(100% - 20px)';
card.style.zIndex = '1000';
document.body.style.overflow = 'hidden';
}

// Reinitialize glass effects
window.arcGlass?.updateGlassEffects();
}

createTooltip(element, text) {
const tooltip = document.createElement('div');
tooltip.className = 'micro-tooltip';
tooltip.textContent = text;
document.body.appendChild(tooltip);

const rect = element.getBoundingClientRect();
tooltip.style.left = `${rect.left + rect.width/2}px`;
tooltip.style.top = `${rect.bottom + 10}px`;

// Show tooltip
tooltip.style.opacity = '1';
tooltip.style.transform = 'translateY(0)';

// Hide after delay
setTimeout(() => {
tooltip.style.opacity = '0';
tooltip.style.transform = 'translateY(-5px)';
setTimeout(() => {
document.body.removeChild(tooltip);
}, 300);
}, 2000);
}

showLoadingSpinner(container) {
const spinner = document.createElement('div');
spinner.className = 'micro-spinner';
spinner.innerHTML = `
<div class="spinner">
<div class="bounce1"></div>
<div class="bounce2"></div>
<div class="bounce3"></div>
</div>
<span>در حال بارگذاری...</span>
`;
container.appendChild(spinner);
return spinner;
}

hideLoadingSpinner(spinner) {
if (spinner && spinner.parentNode) {
spinner.parentNode.removeChild(spinner);
}
}

setupDraggable(element) {
let isDragging = false;
let startX, startY, initialX, initialY;

element.addEventListener('mousedown', (e) => {
isDragging = true;
startX = e.clientX;
startY = e.clientY;
initialX = element.offsetLeft;
initialY = element.offsetTop;
element.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
if (!isDragging) return;
e.preventDefault();
const dx = e.clientX - startX;
const dy = e.clientY - startY;
element.style.left = `${initialX + dx}px`;
element.style.top = `${initialY + dy}px`;
});

document.addEventListener('mouseup', () => {
if (isDragging) {
element.style.cursor = 'grab';
isDragging = false;
window.arcUtils?.trackEvent('UI', 'DragComplete', element.id || element.className);
}
});
}

setupSwipeGestures(element) {
let touchStartX = 0;
let touchEndX = 0;

element.addEventListener('touchstart', (e) => {
touchStartX = e.touches[0].clientX;
});

element.addEventListener('touchend', (e) => {
touchEndX = e.changedTouches[0].clientX;
this.handleSwipeGesture(touchStartX, touchEndX);
});
}

handleSwipeGesture(startX, endX) {
const diff = endX - startX;
const threshold = 50;

if (diff > threshold) {
// Swipe right
window.arcUtils?.trackEvent('UI', 'SwipeRight');
document.getElementById('about-btn')?.click();
} else if (diff < -threshold) {
// Swipe left  
window.arcUtils?.trackEvent('UI', 'SwipeLeft');
document.getElementById('usage-btn')?.click();
}
}

static initialize() {
window.arcUI = new MicroInteractions();
console.log('✅ Micro Interactions fully initialized');

// Setup additional interactions after DOM is loaded
setTimeout(() => {
// Setup theme toggle
document.getElementById('mode-toggle')?.addEventListener('click', () => {
const isDark = document.body.classList.contains('dark-theme');
document.body.classList.toggle('dark-theme', !isDark);
document.body.classList.toggle('light-theme', isDark);
document.getElementById('mode-toggle').innerHTML = `
${isDark ? '<i class="fas fa-sun"></i> <span>حالت روشن</span>' : '<i class="fas fa-moon"></i> <span>حالت شب</span>'}
`;
window.arcUtils?.trackEvent('UI', 'ThemeToggle', isDark ? 'light' : 'dark');
});

// Setup expert mode toggle
document.getElementById('expert-toggle')?.addEventListener('click', () => {
const isExpert = document.body.classList.contains('expert-mode');
document.body.classList.toggle('expert-mode', !isExpert);
document.getElementById('expert-toggle').innerHTML = `
${isExpert ? '<i class="fas fa-user"></i> <span>حالت مبتدی</span>' : '<i class="fas fa-user-graduate"></i> <span>حالت حرفه‌ای</span>'}
`;
window.arcUtils?.showInfo(isExpert ? 'حالت مبتدی فعال شد' : 'حالت حرفه‌ای فعال شد');
});

// Setup tutorial
document.getElementById('tutorial-btn')?.addEventListener('click', () => {
alert('آموزش کامل در حال توسعه است. هم‌اکنون می‌توانید از قابلیت‌های هوش مصنوعی استفاده کنید.');
window.arcUtils?.trackEvent('UI', 'TutorialOpen');
});
}, 1000);
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', MicroInteractions.initialize);
