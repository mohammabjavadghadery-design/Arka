class GlassEffects {
constructor() {
this.cards = [];
this.navbar = null;
this.footer = null;
this.scrollTolerance = 5;
this.lastScroll = 0;
this.init();
}

init() {
this.setupElements();
this.setupEventListeners();
this.applyInitialEffects();
console.log('✅ Glass Effects initialized');
}

setupElements() {
this.cards = document.querySelectorAll('.glass-card');
this.navbar = document.querySelector('.glass-navbar');
this.footer = document.querySelector('.status-bar');
this.backgroundGrid = document.getElementById('background-grid');
this.quantumParticles = document.getElementById('quantum-particles');
}

setupEventListeners() {
window.addEventListener('scroll', this.handleScroll.bind(this));
window.addEventListener('resize', this.handleResize.bind(this));
document.addEventListener('mousemove', this.handleMouseMove.bind(this));
}

handleScroll() {
const currentScroll = window.pageYOffset;
const scrollDirection = currentScroll > this.lastScroll ? 'down' : 'up';
const scrollAmount = Math.abs(currentScroll - this.lastScroll);

if (scrollAmount > this.scrollTolerance) {
this.updateGlassEffects(scrollDirection, currentScroll);
}

this.lastScroll = currentScroll;
}

handleResize() {
this.updateGlassEffects();
}

handleMouseMove(e) {
const x = e.clientX / window.innerWidth;
const y = e.clientY / window.innerHeight;
this.updateInteractiveEffects(x, y);
}

updateGlassEffects(scrollDirection = null, scrollPosition = 0) {
// Update cards
this.cards.forEach((card, index) => {
const rect = card.getBoundingClientRect();
const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
const opacity = isVisible ? 1 : 0.7;
const blur = isVisible ? '10px' : '5px';
const translateY = isVisible ? 0 : 10;

card.style.opacity = opacity;
card.style.backdropFilter = `blur(${blur})`;
card.style.webkitBackdropFilter = `blur(${blur})`;
card.style.transform = `translateY(${translateY}px)`;

// Staggered animation for visible cards
if (isVisible) {
setTimeout(() => {
card.style.transition = 'all 0.5s ease';
card.style.transform = 'translateY(0) scale(1)';
}, index * 100);
}
});

// Update navbar
if (this.navbar) {
const isScrolled = scrollPosition > 50;
this.navbar.style.background = isScrolled ? 
'rgba(15, 10, 40, 0.9)' : 'rgba(15, 10, 40, 0.7)';
this.navbar.style.boxShadow = isScrolled ? 
'0 10px 30px rgba(0, 0, 0, 0.4)' : '0 5px 15px rgba(0, 0, 0, 0.3)';
this.navbar.style.backdropFilter = isScrolled ? 
'blur(15px)' : 'blur(10px)';
}

// Update footer
if (this.footer) {
this.footer.style.background = scrollDirection === 'down' && scrollPosition > 100 ? 
'rgba(10, 0, 30, 0.95)' : 'rgba(10, 0, 30, 0.8)';
}
}

updateInteractiveEffects(x, y) {
// Interactive cards
this.cards.forEach(card => {
const rect = card.getBoundingClientRect();
const cardX = (x * window.innerWidth - rect.left) / rect.width;
const cardY = (y * window.innerHeight - rect.top) / rect.height;
const intensity = 0.1;
const offsetX = (cardX - 0.5) * intensity * 20;
const offsetY = (cardY - 0.5) * intensity * 20;
card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
});

// Interactive navbar
if (this.navbar) {
const intensity = 0.05;
const offsetX = (x - 0.5) * intensity * 30;
const offsetY = (y - 0.5) * intensity * 10;
this.navbar.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}
}

applyInitialEffects() {
// Initial animation
setTimeout(() => {
this.cards.forEach((card, index) => {
card.style.opacity = '0';
card.style.transform = 'translateY(20px)';
setTimeout(() => {
card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
card.style.opacity = '1';
card.style.transform = 'translateY(0) scale(1)';
}, index * 150);
});
}, 100);

// Create background grid
this.createBackgroundGrid();

// Create quantum particles
this.createQuantumParticles();
}

createBackgroundGrid() {
if (!this.backgroundGrid) return;

const canvas = this.backgroundGrid;
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridSize = 40;
const lineWidth = 0.5;
const opacity = 0.1;

ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = `rgba(0, 255, 140, ${opacity})`;
ctx.lineWidth = lineWidth;

// Vertical lines
for (let x = 0; x < canvas.width; x += gridSize) {
ctx.beginPath();
ctx.moveTo(x, 0);
ctx.lineTo(x, canvas.height);
ctx.stroke();
}

// Horizontal lines
for (let y = 0; y < canvas.height; y += gridSize) {
ctx.beginPath();
ctx.moveTo(0, y);
ctx.lineTo(canvas.width, y);
ctx.stroke();
}

// Animation
let animationFrame;
const animateGrid = () => {
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = `rgba(0, 255, 140, ${opacity + Math.sin(Date.now() / 1000) * 0.05})`;
ctx.lineWidth = lineWidth + Math.sin(Date.now() / 2000) * 0.2;

// Draw grid with slight movement
for (let x = 0; x < canvas.width; x += gridSize) {
ctx.beginPath();
ctx.moveTo(x + Math.sin(Date.now() / 1000) * 2, 0);
ctx.lineTo(x + Math.sin(Date.now() / 1000) * 2, canvas.height);
ctx.stroke();
}

for (let y = 0; y < canvas.height; y += gridSize) {
ctx.beginPath();
ctx.moveTo(0, y + Math.cos(Date.now() / 1000) * 2);
ctx.lineTo(canvas.width, y + Math.cos(Date.now() / 1000) * 2);
ctx.stroke();
}

animationFrame = requestAnimationFrame(animateGrid);
};

animateGrid();

// Cleanup on resize
window.addEventListener('resize', () => {
cancelAnimationFrame(animationFrame);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
animateGrid();
});
}

createQuantumParticles() {
if (!this.quantumParticles) return;

// Clear existing particles
this.quantumParticles.innerHTML = '';

const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
const colors = ['#00ff8c', '#00ffff', '#ff00ff', '#fff01a', '#ff1a1a'];

for (let i = 0; i < particleCount; i++) {
const particle = document.createElement('div');
particle.className = 'quantum-particle';

// Random properties
const size = Math.random() * 3 + 1;
const color = colors[Math.floor(Math.random() * colors.length)];
const x = Math.random() * 100;
const y = Math.random() * 100;
const duration = Math.random() * 10 + 5;
const delay = Math.random() * 5;
const opacity = Math.random() * 0.5 + 0.2;

// Apply styles
particle.style.width = `${size}px`;
particle.style.height = `${size}px`;
particle.style.background = color;
particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
particle.style.opacity = opacity.toString();
particle.style.left = `${x}%`;
particle.style.top = `${y}%`;

// Animation
particle.style.animation = `
quantumFloat ${duration}s infinite ease-in-out ${delay}s,
quantumPulse ${duration * 0.5}s infinite ease-in-out ${delay * 0.5}s
`;

this.quantumParticles.appendChild(particle);
}

// Add animation styles to document
const style = document.createElement('style');
style.textContent = `
@keyframes quantumFloat {
0%, 100% { transform: translateY(0) translateX(0) scale(1); }
25% { transform: translateY(-10px) translateX(5px) scale(1.1); }
50% { transform: translateY(0) translateX(0) scale(1); }
75% { transform: translateY(10px) translateX(-5px) scale(0.9); }
}
@keyframes quantumPulse {
0%, 100% { opacity: ${Math.random() * 0.3 + 0.2}; }
50% { opacity: ${Math.random() * 0.5 + 0.5}; }
}
`;
document.head.appendChild(style);
}

updateThemeColors() {
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = isDarkMode ? 'dark' : 'light';

this.cards.forEach(card => {
card.style.borderColor = isDarkMode ? 
'rgba(0, 255, 140, 0.3)' : 'rgba(0, 100, 0, 0.3)';
});

if (this.navbar) {
this.navbar.style.borderColor = isDarkMode ? 
'rgba(0, 255, 140, 0.3)' : 'rgba(0, 0, 0, 0.1)';
}

if (this.footer) {
this.footer.style.borderColor = isDarkMode ? 
'rgba(0, 255, 140, 0.3)' : 'rgba(0, 0, 0, 0.1)';
}
}

static initialize() {
window.arcGlass = new GlassEffects();
console.log('✅ Glass Effects fully initialized');
}

// Public methods for external control
fadeInCard(card) {
card.style.transition = 'all 0.4s ease';
card.style.opacity = '1';
card.style.transform = 'translateY(0) scale(1)';
}

fadeOutCard(card) {
card.style.transition = 'all 0.3s ease';
card.style.opacity = '0.5';
card.style.transform = 'translateY(10px) scale(0.95)';
}

pulseCard(card) {
card.style.animation = 'pulse 0.6s ease 2';
setTimeout(() => {
card.style.animation = '';
}, 1200);
}

highlightCard(card) {
card.style.boxShadow = '0 0 30px rgba(0, 255, 140, 0.6)';
card.style.borderColor = 'rgba(0, 255, 140, 0.7)';
setTimeout(() => {
card.style.boxShadow = 'var(--glass-shadow)';
card.style.borderColor = 'var(--glass-border)';
}, 1000);
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', GlassEffects.initialize);
