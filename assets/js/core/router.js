class ArcRouter {
constructor() {
this.routes = new Map();
this.notFoundHandler = null;
this.init();
}

init() {
// Set up initial route
this.handleRoute();
// Listen for route changes
window.addEventListener('popstate', () => this.handleRoute());
// Set up link interceptors
this.setupLinkInterceptors();
console.log('✅ Router initialized');
}

setupLinkInterceptors() {
document.addEventListener('click', (e) => {
const target = e.target.closest('a');
if (target && this.isInternalLink(target)) {
e.preventDefault();
const href = target.getAttribute('href');
this.navigate(href);
}
});
}

isInternalLink(link) {
const href = link.getAttribute('href');
return href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#');
}

addRoute(path, handler) {
this.routes.set(path, handler);
return this;
}

setNotFound(handler) {
this.notFoundHandler = handler;
return this;
}

navigate(path) {
// Update browser history
window.history.pushState({}, '', path);
// Handle the route
this.handleRoute();
// Track navigation
window.arcUtils?.trackEvent('Navigation', 'Page Change', path);
}

handleRoute() {
const path = window.location.pathname;
const handler = this.routes.get(path) || this.notFoundHandler;
if (handler) {
try {
handler();
this.updateActiveLinks(path);
this.scrollToTop();
} catch (error) {
console.error('Error handling route:', error);
window.arcUtils?.showError('خطا در بارگذاری صفحه');
}
}
}

updateActiveLinks(currentPath) {
document.querySelectorAll('nav a, .nav-link, .breadcrumb-item a').forEach(link => {
const href = link.getAttribute('href');
if (href === currentPath || (href === '/' && currentPath === '/')) {
link.classList.add('active');
} else {
link.classList.remove('active');
}
});
}

scrollToTop() {
window.scrollTo({
top: 0,
behavior: 'smooth'
});
}

static initialize() {
window.arcRouter = new ArcRouter();
// Add routes
window.arcRouter
.addRoute('/', () => {
// Hide command section on home page
document.getElementById('commands-section')?.style.setProperty('display', 'none', 'important');
// Update breadcrumbs
document.getElementById('current-page').textContent = 'داشبورد اصلی';
// Show AI section
document.querySelector('.ai-section')?.style.setProperty('display', 'block', 'important');
})
.addRoute('/cmd', () => {
// Show command section
document.getElementById('commands-section')?.style.setProperty('display', 'block', 'important');
// Update environment title
document.getElementById('environment-title').textContent = 'دستورات CMD';
// Load commands
window.arcCommands?.loadCommands('CMD');
// Update breadcrumbs
document.getElementById('current-page').textContent = 'CMD';
// Hide AI section
document.querySelector('.ai-section')?.style.setProperty('display', 'none', 'important');
})
.addRoute('/powershell', () => {
// Show command section
document.getElementById('commands-section')?.style.setProperty('display', 'block', 'important');
// Update environment title
document.getElementById('environment-title').textContent = 'دستورات PowerShell';
// Load commands
window.arcCommands?.loadCommands('PowerShell');
// Update breadcrumbs
document.getElementById('current-page').textContent = 'PowerShell';
// Hide AI section
document.querySelector('.ai-section')?.style.setProperty('display', 'none', 'important');
})
.addRoute('/run', () => {
// Show command section
document.getElementById('commands-section')?.style.setProperty('display', 'block', 'important');
// Update environment title
document.getElementById('environment-title').textContent = 'دستورات Run';
// Load commands
window.arcCommands?.loadCommands('Run');
// Update breadcrumbs
document.getElementById('current-page').textContent = 'Run';
// Hide AI section
document.querySelector('.ai-section')?.style.setProperty('display', 'none', 'important');
})
.addRoute('/about', () => {
// Show about page
document.querySelectorAll('.page-content').forEach(page => {
page.style.display = 'none';
});
document.getElementById('about-page').style.display = 'block';
// Update breadcrumbs
document.getElementById('current-page').textContent = 'درباره سازنده';
// Hide command section
document.getElementById('commands-section')?.style.setProperty('display', 'none', 'important');
// Hide AI section
document.querySelector('.ai-section')?.style.setProperty('display', 'none', 'important');
})
.addRoute('/usage', () => {
// Show usage page
document.querySelectorAll('.page-content').forEach(page => {
page.style.display = 'none';
});
document.getElementById('usage-page').style.display = 'block';
// Update breadcrumbs
document.getElementById('current-page').textContent = 'راهنما استفاده';
// Hide command section
document.getElementById('commands-section')?.style.setProperty('display', 'none', 'important');
// Hide AI section
document.querySelector('.ai-section')?.style.setProperty('display', 'none', 'important');
})
.setNotFound(() => {
// Show 404 page
document.querySelector('main').innerHTML = `
<div class="glass-card text-center p-5">
<h1 class="text-glow mb-4">404</h1>
<h2 class="text-danger mb-4">صفحه مورد نظر پیدا نشد</h2>
<p class="mb-4 text-secondary">متاسفانه صفحه‌ای که دنبال آن هستید وجود ندارد.</p>
<div class="mt-4">
<button class="btn btn-primary btn-lg" onclick="window.arcRouter.navigate('/')">
<i class="fas fa-home"></i> بازگشت به خانه
</button>
<button class="btn btn-secondary btn-lg" onclick="window.history.back()">
<i class="fas fa-arrow-left"></i> بازگشت به صفحه قبل
</button>
</div>
<div class="mt-4 text-muted">
<p>ممکن است آدرس اشتباه وارد شده باشد یا صفحه حذف شده باشد.</p>
</div>
</div>
`;
// Update breadcrumbs
document.getElementById('current-page').textContent = 'خطا 404';
// Hide other sections
document.getElementById('commands-section')?.style.setProperty('display', 'none', 'important');
document.querySelector('.ai-section')?.style.setProperty('display', 'none', 'important');
});

console.log('✅ Router fully configured with routes:');
console.log('- Home (/)');
console.log('- CMD (/cmd)');
console.log('- PowerShell (/powershell)');
console.log('- Run (/run)');
console.log('- About (/about)');
console.log('- Usage (/usage)');
console.log('- 404 Not Found');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', ArcRouter.initialize);
