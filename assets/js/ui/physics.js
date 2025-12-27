class PhysicsEngine {
constructor() {
this.objects = [];
this.gravity = 0.5;
this.friction = 0.95;
this.bounce = 0.8;
this.objects = [];
this.mouse = { x: 0, y: 0, down: false };
this.lastFrameTime = 0;
this.animationFrame = null;
this.init();
}

init() {
this.setupElements();
this.setupEventListeners();
this.startAnimation();
console.log('✅ Physics Engine initialized');
}

setupElements() {
// Create physics objects
this.createObject({
element: document.querySelector('.quantum-icon'),
mass: 1,
elasticity: 0.9,
drag: 0.05
});

this.createObject({
element: document.querySelector('.brand-name'),
mass: 0.5,
elasticity: 0.7,
drag: 0.1
});

// Add terminal physics
const terminalLines = document.querySelectorAll('.terminal-line');
terminalLines.forEach((line, index) => {
this.createObject({
element: line,
mass: 0.2 + index * 0.01,
elasticity: 0.6,
drag: 0.2,
position: { x: 0, y: index * 2 }
});
});
}

setupEventListeners() {
// Mouse events
document.addEventListener('mousemove', (e) => {
this.mouse.x = e.clientX;
this.mouse.y = e.clientY;
});

document.addEventListener('mousedown', () => {
this.mouse.down = true;
});

document.addEventListener('mouseup', () => {
this.mouse.down = false;
});

// Touch events for mobile
document.addEventListener('touchmove', (e) => {
if (e.touches.length > 0) {
this.mouse.x = e.touches[0].clientX;
this.mouse.y = e.touches[0].clientY;
}
});

document.addEventListener('touchstart', () => {
this.mouse.down = true;
});

document.addEventListener('touchend', () => {
this.mouse.down = false;
});

// Window resize
window.addEventListener('resize', this.handleResize.bind(this));
}

createObject(config) {
const rect = config.element.getBoundingClientRect();
const physicsObject = {
element: config.element,
mass: config.mass || 1,
elasticity: config.elasticity || 0.8,
drag: config.drag || 0.1,
position: config.position || { x: rect.left + rect.width/2, y: rect.top + rect.height/2 },
velocity: { x: 0, y: 0 },
acceleration: { x: 0, y: 0 },
rotation: 0,
angularVelocity: 0,
size: { width: rect.width, height: rect.height },
constraints: config.constraints || {
minX: 0,
maxX: window.innerWidth,
minY: 0,
maxY: window.innerHeight
}
};

this.objects.push(physicsObject);
return physicsObject;
}

applyPhysics(object, deltaTime) {
// Apply gravity
object.acceleration.y += this.gravity;

// Apply velocity
object.velocity.x += object.acceleration.x;
object.velocity.y += object.acceleration.y;

// Apply position
object.position.x += object.velocity.x * deltaTime;
object.position.y += object.velocity.y * deltaTime;

// Apply rotation
object.rotation += object.angularVelocity * deltaTime;

// Apply constraints
this.applyConstraints(object);

// Apply drag
object.velocity.x *= this.friction;
object.velocity.y *= this.friction;
object.angularVelocity *= this.friction;

// Reset acceleration
object.acceleration.x = 0;
object.acceleration.y = 0;
}

applyConstraints(object) {
const margin = 20;
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

// X constraints
if (object.position.x < object.size.width/2 + margin) {
object.position.x = object.size.width/2 + margin;
object.velocity.x *= -object.elasticity;
} else if (object.position.x > windowWidth - object.size.width/2 - margin) {
object.position.x = windowWidth - object.size.width/2 - margin;
object.velocity.x *= -object.elasticity;
}

// Y constraints
if (object.position.y < object.size.height/2 + margin) {
object.position.y = object.size.height/2 + margin;
object.velocity.y *= -object.elasticity;
} else if (object.position.y > windowHeight - object.size.height/2 - margin) {
object.position.y = windowHeight - object.size.height/2 - margin;
object.velocity.y *= -object.elasticity;
}
}

applyMouseForces() {
if (!this.mouse.down) return;

this.objects.forEach(object => {
const dx = this.mouse.x - object.position.x;
const dy = this.mouse.y - object.position.y;
const distance = Math.sqrt(dx * dx + dy * dy);
const maxDistance = 200;

if (distance < maxDistance) {
const force = (1 - distance / maxDistance) * 5;
const angle = Math.atan2(dy, dx);
object.velocity.x += Math.cos(angle) * force;
object.velocity.y += Math.sin(angle) * force;
object.angularVelocity += (Math.random() - 0.5) * 2;
}
});
}

update(deltaTime) {
this.applyMouseForces();

this.objects.forEach(object => {
this.applyPhysics(object, deltaTime);
this.updateElementPosition(object);
});
}

updateElementPosition(object) {
const element = object.element;
if (!element) return;

// Update position
const transform = `
translate(${object.position.x - object.size.width/2}px, 
${object.position.y - object.size.height/2}px)
rotate(${object.rotation}deg)
scale(${1 + object.velocity.y * 0.01})
`;

element.style.transform = transform;
element.style.transformOrigin = 'center center';
element.style.willChange = 'transform';
}

handleResize() {
this.objects.forEach(object => {
const rect = object.element.getBoundingClientRect();
object.size = { width: rect.width, height: rect.height };
object.constraints = {
minX: 0,
maxX: window.innerWidth,
minY: 0,
maxY: window.innerHeight
};
});
}

startAnimation() {
const animate = (timestamp) => {
if (!this.lastFrameTime) this.lastFrameTime = timestamp;
const deltaTime = (timestamp - this.lastFrameTime) / 16; // Normalize to 60fps
this.lastFrameTime = timestamp;

this.update(deltaTime);

this.animationFrame = requestAnimationFrame(animate);
};

this.animationFrame = requestAnimationFrame(animate);
}

stopAnimation() {
if (this.animationFrame) {
cancelAnimationFrame(this.animationFrame);
this.animationFrame = null;
}
}

addInteractiveElement(element, config = {}) {
const physicsObject = this.createObject({
element: element,
mass: config.mass || 0.5,
elasticity: config.elasticity || 0.7,
drag: config.drag || 0.2
});

// Add click interaction
element.addEventListener('click', () => {
physicsObject.velocity.y = -15;
physicsObject.angularVelocity = (Math.random() - 0.5) * 20;
});
}

createParticleSystem(container, config = {}) {
const particleCount = config.count || 20;
const particles = [];

for (let i = 0; i < particleCount; i++) {
const particle = document.createElement('div');
particle.className = 'physics-particle';
particle.style.width = `${Math.random() * 8 + 2}px`;
particle.style.height = particle.style.width;
particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
particle.style.boxShadow = `0 0 10px hsl(${Math.random() * 360}, 100%, 50%)`;
container.appendChild(particle);

const physicsObject = this.createObject({
element: particle,
mass: Math.random() * 0.5 + 0.1,
elasticity: 0.8,
drag: Math.random() * 0.1 + 0.1,
position: {
x: container.getBoundingClientRect().left + Math.random() * container.offsetWidth,
y: container.getBoundingClientRect().top + Math.random() * container.offsetHeight
}
});

particles.push(physicsObject);
}

return particles;
}

simulateSpring(object1, object2, stiffness = 0.1, damping = 0.8) {
const dx = object2.position.x - object1.position.x;
const dy = object2.position.y - object1.position.y;
const distance = Math.sqrt(dx * dx + dy * dy);
const minDistance = object1.size.width/2 + object2.size.width/2;

if (distance < minDistance) {
const overlap = minDistance - distance;
const angle = Math.atan2(dy, dx);
const force = overlap * stiffness;

object1.velocity.x -= Math.cos(angle) * force;
object1.velocity.y -= Math.sin(angle) * force;
object2.velocity.x += Math.cos(angle) * force;
object2.velocity.y += Math.sin(angle) * force;

// Apply damping
object1.velocity.x *= damping;
object1.velocity.y *= damping;
object2.velocity.x *= damping;
object2.velocity.y *= damping;
}
}

createRippleEffect(element, config = {}) {
const ripple = document.createElement('div');
ripple.className = 'physics-ripple';
ripple.style.position = 'absolute';
ripple.style.borderRadius = '50%';
ripple.style.background = 'rgba(0, 255, 140, 0.3)';
ripple.style.transform = 'scale(0)';
ripple.style.transition = 'all 0.6s ease-out';

const rect = element.getBoundingClientRect();
const x = config.x || rect.width / 2;
const y = config.y || rect.height / 2;

ripple.style.left = `${x}px`;
ripple.style.top = `${y}px`;
ripple.style.width = '2px';
ripple.style.height = '2px';

element.appendChild(ripple);

setTimeout(() => {
ripple.style.transform = 'scale(50)';
ripple.style.opacity = '0';
}, 10);

setTimeout(() => {
element.removeChild(ripple);
}, 600);

// Create physics object for ripple
const physicsObject = this.createObject({
element: ripple,
mass: 0.1,
elasticity: 0.3,
drag: 0.5,
position: { x: rect.left + x, y: rect.top + y }
});

physicsObject.velocity.y = -5;
physicsObject.angularVelocity = 10;
}

static initialize() {
window.arcPhysics = new PhysicsEngine();
console.log('✅ Physics Engine fully initialized');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', PhysicsEngine.initialize);
