class AudioManager {
constructor() {
this.audioElements = {};
this.isInitialized = false;
this.fallbackEnabled = false;
this.init();
}

init() {
if (this.isInitialized) return;
this.isInitialized = true;
this.loadAudioFromCDN();
console.log('✅ Audio Manager initialized');
}

loadAudioFromCDN() {
// Define CDN audio sources
const audioSources = {
'success-sound': [
  'https://cdn.pixabay.com/audio/2022/03/14/audio_4583067c0c.mp3',
  'https://cdn.pixabay.com/audio/2022/02/22/audio_d1b6d5c6c8.mp3',
  'https://cdn.pixabay.com/audio/2022/01/17/audio_9a6c762c3e.mp3'
],
'error-sound': [
  'https://cdn.pixabay.com/audio/2022/03/14/audio_9a6c762c3e.mp3',
  'https://cdn.pixabay.com/audio/2022/02/22/audio_4583067c0c.mp3',
  'https://cdn.pixabay.com/audio/2022/01/17/audio_d1b6d5c6c8.mp3'
],
'click-sound': [
  'https://cdn.pixabay.com/audio/2022/02/22/audio_9c3850c6c8.mp3',
  'https://cdn.pixabay.com/audio/2022/01/17/audio_4583067c0c.mp3',
  'https://cdn.pixabay.com/audio/2022/03/14/audio_d1b6d5c6c8.mp3'
]
};

// Create and load audio elements
Object.entries(audioSources).forEach(([id, urls]) => {
const audio = new Audio();
audio.preload = 'auto';
audio.volume = 0.7;
audio.crossOrigin = 'anonymous';
this.audioElements[id] = audio;

// Try to load from first working URL
this.loadAudioWithFallback(audio, urls, 0);
});

// Initialize fallback system
this.initFallbackSystem();
}

loadAudioWithFallback(audio, urls, index) {
if (index >= urls.length) {
console.warn('⚠️ All audio sources failed for audio element');
this.enableFallbackSystem();
return;
}

const url = urls[index];
audio.src = url;
audio.load();

audio.onerror = () => {
console.warn(`❌ Failed to load audio from: ${url}`);
this.loadAudioWithFallback(audio, urls, index + 1);
};

audio.onloadeddata = () => {
console.log(`✅ Audio loaded successfully from: ${url}`);
audio.removeEventListener('error', audio.onerror);
};
}

initFallbackSystem() {
// Create fallback CSS
const fallbackCSS = `
.audio-fallback {
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: rgba(0, 255, 140, 0.8);
color: black;
padding: 15px 25px;
border-radius: 25px;
font-size: 1.2rem;
font-weight: bold;
z-index: 9999;
animation: fadeOutAudio 1s forwards;
box-shadow: 0 0 20px rgba(0, 255, 140, 0.5);
border: 2px solid white;
}
@keyframes fadeOutAudio {
0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
}
.audio-feedback {
position: relative;
animation: pulseAudio 0.3s ease;
}
@keyframes pulseAudio {
0% { transform: scale(1); }
50% { transform: scale(1.1); }
100% { transform: scale(1); }
}
.sound-icon {
margin-right: 8px;
animation: pulseIcon 1s infinite;
}
@keyframes pulseIcon {
0% { transform: scale(1); opacity: 1; }
50% { transform: scale(1.2); opacity: 0.7; }
100% { transform: scale(1); opacity: 1; }
}
`;

const style = document.createElement('style');
style.textContent = fallbackCSS;
document.head.appendChild(style);
}

enableFallbackSystem() {
this.fallbackEnabled = true;
console.log('🔊 Fallback audio system enabled');
}

playSound(id) {
if (!this.audioElements[id]) {
console.warn(`⚠️ Audio element not found: ${id}`);
if (this.fallbackEnabled) {
this.showFallbackFeedback(id);
}
return;
}

const audio = this.audioElements[id];
audio.currentTime = 0;

// Handle autoplay policy
audio.play().catch(error => {
console.log('🔇 Audio play prevented (autoplay policy):', error);
if (this.fallbackEnabled) {
this.showFallbackFeedback(id);
}
});
}

success() {
this.playSound('success-sound');
}

error() {
this.playSound('error-sound');
}

click() {
this.playSound('click-sound');
}

showFallbackFeedback(id) {
const messages = {
'success-sound': '✅ عملیات موفقیت‌آمیز بود',
'error-sound': '❌ خطایی رخ داد',
'click-sound': '🔔 کلیک شد'
};

const message = messages[id] || '🔊 صدا پخش شد';
const icon = {
'success-sound': '<i class="fas fa-check-circle sound-icon"></i>',
'error-sound': '<i class="fas fa-exclamation-circle sound-icon text-danger"></i>',
'click-sound': '<i class="fas fa-mouse-pointer sound-icon"></i>'
}[id] || '<i class="fas fa-volume-up sound-icon"></i>';

const fallbackElement = document.createElement('div');
fallbackElement.className = 'audio-fallback';
fallbackElement.innerHTML = `${icon}${message}`;
document.body.appendChild(fallbackElement);

setTimeout(() => {
if (fallbackElement.parentNode) {
fallbackElement.parentNode.removeChild(fallbackElement);
}
}, 800);
}

// Initialize on DOMContentLoaded
static initialize() {
window.arcAudio = new AudioManager();
console.log('✅ Audio Manager fully initialized');
}
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', AudioManager.initialize);

// Add global audio functions for backward compatibility
window.playSuccessSound = () => window.arcAudio?.success();
window.playErrorSound = () => window.arcAudio?.error();
window.playClickSound = () => window.arcAudio?.click();

// Auto-play policy workaround
document.addEventListener('click', () => {
// Try to unlock audio on first user interaction
Object.values(window.arcAudio?.audioElements || {}).forEach(audio => {
audio.play().catch(() => {});
});
}, { once: true });
