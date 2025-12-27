class AutoSuggestEngine {
constructor() {
this.suggestionHistory = new Map();
this.contextualSuggestions = new Map();
this.popularQueries = [
'فایل‌های موقت رو پاک کنم',
'حافظه سیستم رو خالی کنم',
'شبکه رو تست کنم',
'فرآیندهای پر مصرف رو ببینم',
'دیسک رو پاک کنم',
'سیستم رو بهینه کنم',
'بکاپ بگیرم',
'ویروس‌ها رو اسکن کنم',
'باتری رو مدیریت کنم',
'زمان سیستم رو تنظیم کنم',
'کاربر جدید بسازم',
'رمزنامه رو عوض کنم',
'برنامه‌ها رو بروزرسانی کنم',
'درایورها رو به‌روز کنم',
'صفحه نمایش رو تنظیم کنم'
];
this.init();
}

init() {
this.loadSuggestionsFromStorage();
this.setupEventListeners();
console.log('✅ Suggestion Engine initialized');
}

setupEventListeners() {
document.getElementById('ai-input')?.addEventListener('input', (e) => {
this.handleInput(e.target.value);
});
document.getElementById('ai-input')?.addEventListener('focus', () => {
this.showContextualSuggestions();
});
document.getElementById('ai-input')?.addEventListener('blur', () => {
this.hideSuggestions();
});
}

handleInput(query) {
if (query.trim().length === 0) {
this.showContextualSuggestions();
return;
}

this.updateSuggestions(query);
}

updateSuggestions(query) {
const suggestions = this.generateSuggestions(query);
this.displaySuggestions(suggestions);
this.saveQueryToHistory(query);
}

generateSuggestions(query) {
const normalizedQuery = query.toLowerCase().trim();
const suggestions = new Set();

// Add from history
this.getRecentQueries().forEach(q => {
if (q.toLowerCase().includes(normalizedQuery) && q !== query) {
suggestions.add(q);
}
});

// Add contextual suggestions
const contextual = this.getContextualSuggestions(query);
contextual.forEach(suggestion => suggestions.add(suggestion));

// Add popular queries if no suggestions found
if (suggestions.size === 0 && normalizedQuery.length > 2) {
this.popularQueries.forEach(q => {
if (q.toLowerCase().includes(normalizedQuery)) {
suggestions.add(q);
}
});
}

// Limit to 4 suggestions
return Array.from(suggestions).slice(0, 4);
}

getContextualSuggestions(query) {
const tokens = query.toLowerCase().split(/\s+/);
const suggestions = [];

// Intent-based suggestions
const intents = {
'فایل': ['فایل‌های حجیم رو پاک کنم', 'فضای دیسک رو آزاد کنم', 'فایل‌های تکراری رو پیدا کنم'],
'حافظه': ['حافظه رو خالی کنم', 'فرآیندهای پر مصرف رو ببینم', 'RAM رو بهینه کنم'],
'شبکه': ['سرعت اینترنت رو تست کنم', 'اتصال رو بررسی کنم', 'DNS رو تنظیم کنم'],
'سیستم': ['سیستم رو بهینه کنم', 'ویندوز رو بروزرسانی کنم', 'سیستم رو ریستارت کنم'],
'دیسک': ['فضای دیسک رو آزاد کنم', 'هارد رو defrag کنم', 'فایل‌های موقت رو پاک کنم'],
'کاربر': ['کاربر جدید بسازم', 'رمز رو عوض کنم', 'دسترسی‌ها رو مدیریت کنم'],
'برنامه': ['برنامه‌ها رو بروزرسانی کنم', 'برنامه‌های غیرضروری رو حذف کنم', 'Startup رو پاک کنم'],
'امنیت': ['ویروس‌ها رو اسکن کنم', 'فایروال رو تنظیم کنم', 'سیستم رو محافظت کنم'],
'زمان': ['زمان رو تنظیم کنم', 'برنامه‌ریزی کنم', 'زمان‌بندی کنم'],
'باتری': ['باتری رو مدیریت کنم', 'مصرف رو کاهش بدم', 'برنامه‌های پر مصرف باتری رو ببینم']
};

Object.entries(intents).forEach(([keyword, suggestionsList]) => {
if (tokens.some(token => token.includes(keyword) || keyword.includes(token))) {
suggestionsList.forEach(s => suggestions.push(s));
}
});

// Command-based suggestions
const commands = {
'cmd': ['dir /s /b *.tmp', 'ipconfig /all', 'tasklist /fi "memusage gt 50000"'],
'powershell': ['Get-Process | Sort-Object CPU -Descending', 'Test-NetConnection 8.8.8.8', 'Get-ChildItem -Path $env:TEMP -Recurse'],
'run': ['control panel', 'msconfig', 'devmgmt.msc']
};

Object.entries(commands).forEach(([env, cmdList]) => {
if (tokens.some(token => token.includes(env))) {
cmdList.forEach(cmd => suggestions.push(`اجرای دستور: ${cmd}`));
}
});

return suggestions.slice(0, 3);
}

displaySuggestions(suggestions) {
const container = document.querySelector('.ai-suggestions');
if (!container) return;

container.innerHTML = '';

suggestions.forEach(suggestion => {
const chip = document.createElement('div');
chip.className = 'suggestion-chip';
chip.textContent = suggestion;
chip.dataset.query = suggestion;
chip.addEventListener('click', () => {
document.getElementById('ai-input').value = suggestion;
document.getElementById('ai-submit').click();
});
container.appendChild(chip);
});
}

showContextualSuggestions() {
const recent = this.getRecentQueries().slice(0, 2);
const popular = this.popularQueries.slice(0, 2);
const suggestions = [...recent, ...popular].slice(0, 4);
this.displaySuggestions(suggestions);
}

hideSuggestions() {
document.querySelector('.ai-suggestions').innerHTML = '';
}

saveQueryToHistory(query) {
if (!query || query.trim().length < 3) return;

const now = new Date().getTime();
const normalizedQuery = query.trim().toLowerCase();

// Add to history with timestamp
this.suggestionHistory.set(normalizedQuery, {
query: query.trim(),
timestamp: now,
count: (this.suggestionHistory.get(normalizedQuery)?.count || 0) + 1
});

// Save to localStorage
this.saveSuggestionsToStorage();

// Clean old suggestions
this.cleanOldSuggestions();
}

getRecentQueries() {
return Array.from(this.suggestionHistory.values())
.sort((a, b) => b.timestamp - a.timestamp)
.map(item => item.query)
.slice(0, 10);
}

saveSuggestionsToStorage() {
const historyArray = Array.from(this.suggestionHistory.entries()).map(([key, value]) => ({
key,
...value
}));

localStorage.setItem('arka-suggestions-history', JSON.stringify(historyArray));
}

loadSuggestionsFromStorage() {
try {
const saved = localStorage.getItem('arka-suggestions-history');
if (saved) {
const historyArray = JSON.parse(saved);
historyArray.forEach(item => {
this.suggestionHistory.set(item.key, {
query: item.query,
timestamp: item.timestamp,
count: item.count || 1
});
});
console.log('✅ Suggestions history loaded from storage');
}
} catch (error) {
console.error('Error loading suggestions history:', error);
}
}

cleanOldSuggestions() {
const now = new Date().getTime();
const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

Array.from(this.suggestionHistory.entries())
.filter(([_, value]) => value.timestamp < thirtyDaysAgo)
.forEach(([key]) => this.suggestionHistory.delete(key));
}

getSuggestions(query, response) {
// This method is called by the AI engine to get suggestions based on the response
// For now, we'll just update the suggestions based on the query
this.updateSuggestions(query);
}

static initialize() {
window.arcSuggest = new AutoSuggestEngine();
console.log('✅ Suggestion Engine fully initialized');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', AutoSuggestEngine.initialize);
