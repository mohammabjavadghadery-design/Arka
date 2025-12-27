class ParallaxEffects {
constructor() {
this.layers = [];
this.scrollSensitivity = 0.05;
this.mouseSensitivity = 0.02;
this.lastScroll = 0;
this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
this.init();
}

init() {
this.setupElements();
this.setupEventListeners();
this.startAnimation();
console.log('✅ Parallax Effects initialized');
}

setupElements() {
// Get all parallax layers
this.layers = [
{ element: document.querySelector('.navbar'), depth: 0.1 },
{ element: document.querySelector('.section-header'), depth: 0.2 },
{ element: document.querySelector('.ai-section'), depth: 0.3 },
{ element: document.querySelector('.environment-section'), depth: 0.4 },
{ element: document.querySelector('.terminal-section'), depth: 0.5 },
{ element: document.querySelector('.stats-section'), depth: 0.6 },
{ element: document.querySelector('.status-bar'), depth: 0.9 }
].filter(layer => layer.element);

// Setup 3D perspective
document.body.style.perspective = '1000px';
document.body.style.transformStyle = 'preserve-3d';
}

setupEventListeners() {
window.addEventListener('scroll', this.handleScroll.bind(this));
if (!this.isMobile) {
window.addEventListener('mousemove', this.handleMouseMove.bind(this));
}
}

handleScroll() {
const scrollPosition = window.pageYOffset;
const scrollDelta = scrollPosition - this.lastScroll;
this.lastScroll = scrollPosition;

this.layers.forEach(layer => {
if (layer.element) {
const offset = scrollPosition * layer.depth * this.scrollSensitivity;
layer.element.style.transform = `
translate3d(0, ${-offset}px, ${offset * 0.1}px)
rotateX(${scrollDelta * 0.1}deg)
`;
}
});
}

handleMouseMove(e) {
if (this.isMobile) return;

const x = e.clientX / window.innerWidth - 0.5;
const y = e.clientY / window.innerHeight - 0.5;

this.layers.forEach(layer => {
if (layer.element) {
const offsetX = x * layer.depth * 30 * this.mouseSensitivity;
const offsetY = y * layer.depth * 30 * this.mouseSensitivity;
const rotateX = y * layer.depth * 5;
const rotateY = -x * layer.depth * 5;
const scale = 1 + layer.depth * 0.05;

layer.element.style.transform = `
translate3d(${offsetX}px, ${offsetY}px, ${layer.depth * 50}px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
scale(${scale})
`;
}
});
}

startAnimation() {
// Initial animation
setTimeout(() => {
this.layers.forEach((layer, index) => {
if (layer.element) {
layer.element.style.opacity = '0';
layer.element.style.transform = 'translate3d(0, 20px, 0) scale(0.9)';
setTimeout(() => {
layer.element.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
layer.element.style.opacity = '1';
layer.element.style.transform = 'translate3d(0, 0, 0) scale(1) rotateX(0) rotateY(0)';
}, index * 200);
}
});
}, 500);

// Continuous gentle animation
setInterval(() => {
this.animateBackgroundElements();
}, 2000);
}

animateBackgroundElements() {
const elements = document.querySelectorAll('.stat-card, .shell-btn, .command-card');
elements.forEach(element => {
const randomX = (Math.random() - 0.5) * 10;
const randomY = (Math.random() - 0.5) * 10;
const randomRotate = (Math.random() - 0.5) * 5;
element.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
});
}

setupInteractiveParallax() {
// Interactive elements with parallax
const interactiveElements = document.querySelectorAll('[data-parallax]');
interactiveElements.forEach(element => {
element.addEventListener('mousemove', (e) => {
const rect = element.getBoundingClientRect();
const x = (e.clientX - rect.left) / rect.width - 0.5;
const y = (e.clientY - rect.top) / rect.height - 0.5;
const depth = parseFloat(element.dataset.parallax) || 0.5;

const offsetX = x * depth * 20;
const offsetY = y * depth * 20;
const rotateX = y * depth * 10;
const rotateY = -x * depth * 10;

element.style.transform = `
perspective(1000px)
translate3d(${offsetX}px, ${offsetY}px, 0)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
`;
});

element.addEventListener('mouseleave', () => {
element.style.transform = 'perspective(1000px) translate3d(0, 0, 0) rotateX(0) rotateY(0)';
});
});
}

createFloatingElements() {
const floatingElements = document.querySelectorAll('[data-float]');
floatingElements.forEach(element => {
const floatSpeed = parseFloat(element.dataset.float) || 1;
const amplitude = 10;

let animationFrame;
const animate = () => {
const now = Date.now() / 1000;
const offset = Math.sin(now * floatSpeed) * amplitude;
element.style.transform = `translateY(${offset}px)`;
animationFrame = requestAnimationFrame(animate);
};

animate();

// Cleanup on component removal
const observer = new MutationObserver(() => {
if (!document.body.contains(element)) {
cancelAnimationFrame(animationFrame);
observer.disconnect();
}
});

observer.observe(document.body, { childList: true, subtree: true });
});
}

setupScrollReveal() {
// Reveal elements on scroll
const revealElements = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.style.opacity = '1';
entry.target.style.transform = 'translateY(0)';
observer.unobserve(entry.target);
}
}
}, {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(element => {
element.style.opacity = '0';
element.style.transform = 'translateY(20px)';
element.style.transition = 'all 0.6s ease';
observer.observe(element);
});
}

updateParallaxIntensity(intensity = 1) {
this.scrollSensitivity = 0.05 * intensity;
this.mouseSensitivity = 0.02 * intensity;
console.log(`🔄 Parallax intensity updated to: ${intensity}`);
}

static initialize() {
window.arcParallax = new ParallaxEffects();
console.log('✅ Parallax Effects fully initialized');

// Setup additional effects after initialization
setTimeout(() => {
window.arcParallax.setupInteractiveParallax();
window.arcParallax.createFloatingElements();
window.arcParallax.setupScrollReveal();
}, 1000);
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', ParallaxEffects.initialize);
