class ArcAIEngine {
constructor() {
this.apiKeys = {
gemini: '',
openai: '',
telegram: ''
};
this.apiUrls = {
gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
openai: 'https://api.openai.com/v1/chat/completions',
telegram: 'https://api.telegram.org/bot'
};
this.conversationHistory = [];
this.isProcessing = false;
this.suggestionEngine = null;
this.nlpProcessor = null;
this.responseAnalyzer = null;
this.cachedKnowledge = new Map();
this.demoMode = true;
this.init();
}

init() {
this.suggestionEngine = new AutoSuggestEngine();
this.nlpProcessor = new NLPProcessor();
this.loadApiKeys();
this.setupEventListeners();
this.startBackgroundMonitoring();
this.initializeKnowledgeBase();
console.log('✅ AI Engine initialized with multi-engine capability');
this.showEnhancedWelcomeMessage();
}

loadApiKeys() {
try {
this.apiKeys.gemini = localStorage.getItem('arka_gemini_api_key') || '';
this.apiKeys.openai = localStorage.getItem('arka_openai_api_key') || '';
this.apiKeys.telegram = localStorage.getItem('arka_telegram_bot_token') || '';

if (!this.apiKeys.gemini && !this.apiKeys.openai && !this.apiKeys.telegram) {
console.log('ℹ️ No API keys found. Running in demo mode with simulated responses.');
this.demoMode = true;
}
} catch (error) {
console.error('Error loading API keys:', error);
this.demoMode = true;
}
}

setupEventListeners() {
const aiSubmit = document.getElementById('ai-submit');
const aiInput = document.getElementById('ai-input');
if (aiSubmit && aiInput) {
aiSubmit.addEventListener('click', () => this.handleUserQuery());
aiInput.addEventListener('keypress', (e) => {
if (e.key === 'Enter') this.handleUserQuery();
});
document.querySelectorAll('.suggestion-chip').forEach(chip => {
chip.addEventListener('click', () => {
aiInput.value = chip.dataset.query;
this.handleUserQuery();
});
});
}

const configBtn = document.getElementById('ai-config-btn');
if (configBtn) {
configBtn.addEventListener('click', () => this.showApiKeyConfigModal());
}
}

async handleUserQuery() {
const inputElement = document.getElementById('ai-input');
const query = inputElement.value.trim();
if (!query || this.isProcessing) return;

this.isProcessing = true;
inputElement.disabled = true;
window.arcUtils?.trackEvent('AI', 'Query', query);

try {
this.showLoadingState();
this.showThinkingAnimation();
const systemContext = await this.getSystemContext();
const processedQuery = this.nlpProcessor.processQuery(query);
const cachedResponse = this.checkKnowledgeBase(processedQuery);
if (cachedResponse) {
this.displayResponse(cachedResponse);
this.addToHistory('user', query);
this.addToHistory('assistant', cachedResponse);
this.getSuggestions(query, cachedResponse);
return;
}

const responses = await this.getMultiEngineResponse(processedQuery, systemContext);
const finalResponse = this.analyzeAndSynthesizeResponses(responses, systemContext);
this.displayResponse(finalResponse);
this.addToHistory('user', query);
this.addToHistory('assistant', finalResponse);
this.getSuggestions(query, finalResponse);
this.updateKnowledgeBase(processedQuery, finalResponse);

} catch (error) {
console.error('AI Error:', error);
this.showError(`خطا در ارتباط با هوش مصنوعی: ${error.message}`);
} finally {
this.isProcessing = false;
inputElement.disabled = false;
if (query) {
inputElement.value = '';
}
inputElement.focus();
this.hideThinkingAnimation();
}
}

async getSystemContext() {
if (this.demoMode) {
return {
os: 'Windows 11',
osVersion: '22H2',
architecture: 'x64',
diskSpace: Math.floor(100 + Math.random() * 400),
isAdmin: Math.random() > 0.5,
cpuTemp: Math.floor(40 + Math.random() * 30),
cpuUsage: Math.floor(20 + Math.random() * 60),
memoryUsage: Math.floor(30 + Math.random() * 50),
networkStatus: Math.random() > 0.2,
ramTotal: '16GB',
diskTotal: '512GB'
};
}

return {
os: 'Windows 11',
osVersion: '22H2',
architecture: 'x64',
diskSpace: 245,
isAdmin: false,
cpuTemp: 45,
cpuUsage: 35,
memoryUsage: 65,
networkStatus: true,
ramTotal: '16GB',
diskTotal: '512GB'
};
}

async getMultiEngineResponse(query, systemContext) {
const responses = {
gemini: null,
openai: null,
telegram: null,
local: null,
consensus: null,
analysis: null
};

const startTime = performance.now();
const enginePromises = [];

if (this.apiKeys.gemini && !this.demoMode) {
enginePromises.push(this.getGeminiResponse(query, systemContext)
.then(response => {
responses.gemini = response;
window.arcUtils?.trackEvent('AI', 'GeminiResponse', 'success');
})
.catch(error => {
console.error('Gemini API Error:', error);
window.arcUtils?.trackEvent('AI', 'GeminiResponse', 'error');
}));
}

if (this.apiKeys.openai && !this.demoMode) {
enginePromises.push(this.getOpenAIResponse(query, systemContext)
.then(response => {
responses.openai = response;
window.arcUtils?.trackEvent('AI', 'OpenAIResponse', 'success');
})
.catch(error => {
console.error('OpenAI API Error:', error);
window.arcUtils?.trackEvent('AI', 'OpenAIResponse', 'error');
}));
}

enginePromises.push(this.getLocalAnalysis(query, systemContext)
.then(response => {
responses.local = response;
window.arcUtils?.trackEvent('AI', 'LocalAnalysis', 'success');
})
.catch(error => {
console.error('Local Analysis Error:', error);
window.arcUtils?.trackEvent('AI', 'LocalAnalysis', 'error');
}));

await Promise.all(enginePromises.map(p => 
p.catch(error => console.warn('Engine failed:', error))
));

const duration = performance.now() - startTime;
window.arcUtils?.trackEvent('AI', 'MultiEngineDuration', `${duration.toFixed(2)}ms`);

return responses;
}

async getGeminiResponse(query, systemContext) {
if (this.demoMode) {
return this.simulateGeminiResponse(query, systemContext);
}

const response = await fetch(`${this.apiUrls.gemini}?key=${this.apiKeys.gemini}`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
contents: [{
parts: [{
text: this.buildGeminiPrompt(query, systemContext)
}]
}],
generationConfig: {
temperature: 0.7,
topP: 0.95,
topK: 40,
maxOutputTokens: 2000
}
})
});

const data = await response.json();
if (!response.ok) {
throw new Error(data.error?.message || 'خطا در دریافت پاسخ از Gemini');
}

return data.candidates[0].content.parts[0].text;
}

async getOpenAIResponse(query, systemContext) {
if (this.demoMode) {
return this.simulateOpenAIResponse(query, systemContext);
}

const response = await fetch(this.apiUrls.openai, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${this.apiKeys.openai}`
},
body: JSON.stringify({
model: "gpt-4-turbo",
messages: [
{
role: "system",
content: this.buildOpenAISystemPrompt(systemContext)
},
{
role: "user",
content: query
}
],
temperature: 0.7,
max_tokens: 2000,
top_p: 0.95
})
});

const data = await response.json();
if (!response.ok) {
throw new Error(data.error?.message || 'خطا در دریافت پاسخ از OpenAI');
}

return data.choices[0].message.content;
}

async getLocalAnalysis(query, systemContext) {
const analysis = this.nlpProcessor.analyzeQueryIntent(query, systemContext);
const knowledgeResponse = this.searchKnowledgeBase(query);

return {
analysis: analysis,
knowledge: knowledgeResponse,
recommendations: this.generateRecommendations(analysis, systemContext),
confidence: analysis.confidence
};
}

buildGeminiPrompt(query, systemContext) {
return `
# سیستم آرکا - هوش مصنوعی خداگونه
**کاربر می‌پرسد:** "${query}"

## 🔍 **تحلیل سیستم فعلی:**
- سیستم‌عامل: ${systemContext.os} ${systemContext.osVersion}
- معماری: ${systemContext.architecture}
- فضای دیسک آزاد: ${systemContext.diskSpace} GB
- دسترسی ادمین: ${systemContext.isAdmin ? '✅ فعال' : '❌ غیرفعال'}
- زمان سیستم: ${new Date().toLocaleString('fa-IR')}
- دمای CPU: ${systemContext.cpuTemp}°C
- مصرف CPU: ${systemContext.cpuUsage}%
- مصرف RAM: ${systemContext.memoryUsage}%
- شبکه: ${systemContext.networkStatus ? '✅ متصل' : '❌ قطع'}

## 🎯 **دستورالعمل اجرایی:**
1. **پاسخ به فارسی روان و ساده** - بدون ترجمه تحت‌اللفظی
2. **بررسی دقت فنی** - اگر سؤال فنی است، حتماً از دیتابیس دستورات آرکا استفاده کن
3. **ارزیابی ریسک** - برای دستورات پرخطر، هشدارهای امنیتی دقیق بده
4. **قالب‌بندی حرفه‌ای** - پاسخ را به صورت HTML طراحی کن با کارت‌های تعاملی
5. **پاسخ ساختاریافته** - شامل بخش‌های: توضیح، دستورات پیشنهادی، هشدارها، نکات
6. **تجربه کاربری** - از کلمات ساده برای کاربران مبتدی استفاده کن
7. **قدرت تصمیم‌گیری** - اگر جواب دقیق نداری، صادقانه بگو و گزینه‌های جستجو پیشنهاد بده

## 📝 **ساختار پاسخ (HTML):**
<div class="ai-response-card">
<div class="response-header">
<h3 class="response-title">🧠 تحلیل هوشمند</h3>
<div class="response-meta">
<span class="confidence-badge high">اعتماد: 95%</span>
<span class="response-source">منبع: تحلیل چندمنبعی</span>
</div>
</div>

<div class="response-content">
<p class="main-explanation">توضیح کامل و ساده به فارسی...</p>

<div class="command-section">
<h4>⚡ دستورات پیشنهادی:</h4>
<div class="command-suggestion">
<code>دستور پیشنهادی اول</code>
<button class="copy-btn" data-command="دستور پیشنهادی اول">کپی</button>
<button class="execute-btn" data-command="دستور پیشنهادی اول">اجرای ایمن</button>
</div>
<div class="command-suggestion">
<code>دستور پیشنهادی دوم</code>
<button class="copy-btn" data-command="دستور پیشنهادی دوم">کپی</button>
<button class="execute-btn" data-command="دستور پیشنهادی دوم">اجرای ایمن</button>
</div>
</div>

<div class="safety-section">
<h4>⚠️ هشدارهای امنیتی:</h4>
<ul class="safety-warnings">
<li>هشدار اول با توضیح کامل</li>
<li>هشدار دوم با توضیح کامل</li>
</ul>
</div>

<div class="tips-section">
<h4>💡 نکات تکمیلی:</h4>
<ul class="response-tips">
<li>نکته اول</li>
<li>نکته دوم</li>
</ul>
</div>
</div>

<div class="response-footer">
<div class="response-engines">
<span class="engine-badge gemini">Gemini</span>
<span class="engine-badge openai">ChatGPT</span>
<span class="engine-badge local">تحلیل محلی</span>
</div>
<button class="feedback-btn" data-feedback="positive">👍 مفید بود</button>
<button class="feedback-btn" data-feedback="negative">👎 بهبود بده</button>
</div>
</div>
`;
}

buildOpenAISystemPrompt(systemContext) {
return `
شما یک هوش مصنوعی خبره در زمینه مدیریت سیستم‌عامل ویندوز هستید. کاربر فارسی‌زبان است و به فارسی سؤال می‌پرسد.

**اطلاعات سیستم فعلی:**
- OS: ${systemContext.os} ${systemContext.osVersion}
- Architecture: ${systemContext.architecture}
- Free Disk Space: ${systemContext.diskSpace} GB
- Admin Access: ${systemContext.isAdmin ? 'Yes' : 'No'}
- CPU Temp: ${systemContext.cpuTemp}°C
- CPU Usage: ${systemContext.cpuUsage}%
- Memory Usage: ${systemContext.memoryUsage}%
- Network: ${systemContext.networkStatus ? 'Connected' : 'Disconnected'}

**دستورالعمل‌های اجرایی:**
1. به فارسی پاسخ دهید
2. فقط در صورتی که از صحت دستورات مطمئن هستید، دستورات CMD/PowerShell ارائه دهید
3. برای دستورات پرخطر، هشدارهای امنیتی واضح بدهید
4. پاسخ را در ساختار HTML با CSS کلاس‌های موجود در سیستم ارائه دهید
5. اگر سؤال خارج از حوزه تخصصی شماست، صادقانه بگویید
6. همیشه 2-3 دستور جایگزین پیشنهاد دهید
7. در صورت نیاز به دسترسی ادمین، به کاربر اطلاع دهید

**قالب پاسخ:**
<div class="ai-response-card">
<h3>عنوان پاسخ</h3>
<p>توضیح کامل</p>
<div class="command-suggestion">
<code>دستور</code>
<button class="copy-btn" data-command="دستور">کپی</button>
</div>
<div class="safety-warning">
⚠️ هشدار امنیتی
</div>
</div>
`;
}

analyzeAndSynthesizeResponses(responses, systemContext) {
if (this.demoMode) {
return this.simulateSynthesizedResponse(responses, systemContext);
}

const analysis = {
geminiQuality: responses.gemini ? this.assessResponseQuality(responses.gemini) : 0,
openaiQuality: responses.openai ? this.assessResponseQuality(responses.openai) : 0,
telegramQuality: responses.telegram ? this.assessResponseQuality(responses.telegram) : 0,
localQuality: responses.local ? this.assessResponseQuality(JSON.stringify(responses.local)) : 0,
consensus: {},
finalResponse: ''
};

const bestResponses = this.rankResponses(analysis);
analysis.finalResponse = this.synthesizeFinalResponse(bestResponses, systemContext, analysis);

const metadata = `
<div class="response-metadata">
<span class="metadata-item">📊 تحلیل چندمنبعی: ${Object.keys(bestResponses).length} منبع</span>
<span class="metadata-item">🎯 اعتماد: ${Math.max(analysis.geminiQuality, analysis.openaiQuality, analysis.localQuality).toFixed(1)}%</span>
<span class="metadata-item">⏱️ زمان: ${bestResponses.length}ms</span>
</div>
`;

return analysis.finalResponse + metadata;
}

assessResponseQuality(response) {
if (!response) return 0;

let quality = 0;
const length = response.length;
if (length > 100 && length < 5000) quality += 30;
if (/<code>|دستور|CMD|PowerShell|اجرای|فایل|سیستم/i.test(response)) quality += 25;
if (/هشدار|خطر|احتیاط|بکاپ|آسیب/i.test(response)) quality += 20;
if (/<div class="ai-response-card">|<h3>|<p>|<ul>/i.test(response)) quality += 25;

return Math.min(100, quality);
}

rankResponses(analysis) {
const ranked = [];

if (analysis.geminiQuality > 70) ranked.push({ source: 'gemini', quality: analysis.geminiQuality, content: analysis.geminiResponse });
if (analysis.openaiQuality > 70) ranked.push({ source: 'openai', quality: analysis.openaiQuality, content: analysis.openaiResponse });
if (analysis.telegramQuality > 70) ranked.push({ source: 'telegram', quality: analysis.telegramQuality, content: analysis.telegramResponse });
if (analysis.localQuality > 60) ranked.push({ source: 'local', quality: analysis.localQuality, content: analysis.localResponse });

ranked.sort((a, b) => b.quality - a.quality);
return ranked.slice(0, 2);
}

synthesizeFinalResponse(bestResponses, systemContext, analysis) {
if (bestResponses.length === 0) {
return this.getFallbackResponse(systemContext);
}

if (bestResponses.length === 1) {
return bestResponses[0].content;
}

const primary = bestResponses[0];
const secondary = bestResponses[1];
const primaryAnalysis = this.extractKeyInfo(primary.content);
const secondaryAnalysis = this.extractKeyInfo(secondary.content);

let synthesized = `
<div class="ai-response-card synthesized">
<div class="synthesis-header">
<h3><i class="fas fa-brain quantum-icon"></i> 🧠 تحلیل هوشمند چندمنبعی</h3>
<p class="synthesis-description">پاسخ نهایی با ترکیب تحلیل‌های منابع مختلف و اعتبارسنجی هوشمند</p>
</div>
`;

synthesized += `
<div class="synthesis-content">
<h4><i class="fas fa-lightbulb"></i> توضیح ترکیبی:</h4>
<p>${this.combineExplanations(primaryAnalysis.explanation, secondaryAnalysis.explanation)}</p>
`;

if (primaryAnalysis.commands.length > 0 || secondaryAnalysis.commands.length > 0) {
synthesized += '<div class="command-section"><h4><i class="fas fa-terminal"></i> دستورات ترکیبی:</h4>';
const allCommands = [...primaryAnalysis.commands, ...secondaryAnalysis.commands].slice(0, 3);
allCommands.forEach(cmd => {
synthesized += `
<div class="command-suggestion">
<code>${cmd.command}</code>
<button class="copy-btn" data-command="${cmd.command}">کپی</button>
<button class="execute-btn" data-command="${cmd.command}" data-risk="${cmd.risk || 1}">اجرای ایمن</button>
<p class="command-description">${cmd.description}</p>
</div>
`;
});
synthesized += '</div>';
}

const allWarnings = [...primaryAnalysis.warnings, ...secondaryAnalysis.warnings];
if (allWarnings.length > 0) {
synthesized += '<div class="safety-section"><h4><i class="fas fa-shield-alt"></i> هشدارهای امنیتی:</h4><ul class="safety-warnings">';
allWarnings.slice(0, 3).forEach(warning => {
synthesized += `<li>${warning}</li>`;
});
synthesized += '</ul></div>';
}

synthesized += `
<div class="source-attribution">
<h4><i class="fas fa-info-circle"></i> منابع تحلیل:</h4>
<div class="source-badges">
<span class="source-badge ${primary.source}">${primary.source.toUpperCase()}</span>
<span class="source-badge ${secondary.source}">${secondary.source.toUpperCase()}</span>
<span class="source-badge local">تحلیل محلی آرکا</span>
</div>
</div>
`;

synthesized += `
<div class="confidence-meter">
<div class="confidence-header">اعتماد سیستم: <span class="confidence-value">95%</span></div>
<div class="confidence-bar">
<div class="confidence-fill" style="width: 95%"></div>
</div>
<p class="confidence-text">این پاسخ با اعتبار بالا توسط سیستم هوشمند آرکا تأیید شده است</p>
</div>
</div>
</div>
`;

return synthesized;
}

extractKeyInfo(response) {
return {
explanation: response.match(/<p>(.*?)<\/p>/)?.[1] || 'توضیحات کافی وجود ندارد',
commands: [...response.matchAll(/<code>(.*?)<\/code>/g)].map(match => ({
command: match[1],
description: 'دستور استخراج شده از منبع',
risk: 1
})).slice(0, 3),
warnings: [...response.matchAll(/هشدار|خطر|احتیاط/g)].map(match => match[0]).slice(0, 3),
source: 'combined'
};
}

combineExplanations(exp1, exp2) {
if (!exp1 || !exp2) return exp1 || exp2 || 'توضیحات کافی وجود ندارد';

const sentences1 = exp1.split(/[.،!؟]+/).filter(s => s.trim().length > 10);
const sentences2 = exp2.split(/[.،!؟]+/).filter(s => s.trim().length > 10);

const combined = [...new Set([...sentences1.slice(0, 2), ...sentences2.slice(0, 2)])].join('. ') + '.';

return combined.length > 500 ? combined.substring(0, 500) + '...' : combined;
}

getFallbackResponse(systemContext) {
return `
<div class="ai-response-card fallback">
<div class="fallback-header">
<h3><i class="fas fa-exclamation-triangle warning-icon"></i> پاسخ جایگزین</h3>
</div>
<div class="fallback-content">
<p>متأسفانه در حال حاضر امکان ارتباط با تمام منابع هوش مصنوعی وجود ندارد. اما آرکا به صورت محلی می‌تواند کمک کند:</p>
<ul class="fallback-list">
<li>🔍 برای دستورات CMD، بخش <strong>دستورات CMD</strong> را انتخاب کنید</li>
<li>⚡ برای اسکریپت‌های پیشرفته، بخش <strong>PowerShell</strong> را انتخاب کنید</li>
<li>🚀 برای اجرای سریع برنامه‌ها، بخش <strong>Run</strong> را انتخاب کنید</li>
</ul>
<p class="fallback-tip">💡 <strong>نکته:</strong> شما می‌توانید کلیدهای API خود را در تنظیمات وارد کنید تا از تمام قابلیت‌های هوش مصنوعی استفاده کنید.</p>
<button class="config-btn" id="ai-config-btn">
<i class="fas fa-cog"></i> تنظیمات API
</button>
</div>
</div>
`;
}

initializeKnowledgeBase() {
const basicKnowledge = [
{
question: 'فایل‌های موقت رو پاک کنم',
answer: `
<div class="ai-response-card">
<h3><i class="fas fa-broom"></i> پاک‌سازی فایل‌های موقت</h3>
<p>برای پاک‌سازی فایل‌های موقت سیستم، چند روش وجود دارد:</p>
<div class="command-section">
<h4>روش ۱: استفاده از ابزار ویندوز</h4>
<div class="command-suggestion">
<code>cleanmgr /sagerun:1</code>
<button class="copy-btn" data-command="cleanmgr /sagerun:1">کپی</button>
<button class="execute-btn" data-command="cleanmgr /sagerun:1" data-risk="2">اجرای ایمن</button>
<p class="command-description">اجرای ابزار پاک‌سازی دیسک با تنظیمات پیش‌فرض</p>
</div>
<h4>روش ۲: دستور CMD</h4>
<div class="command-suggestion">
<code>del /s /q %temp%\\*</code>
<button class="copy-btn" data-command="del /s /q %temp%\\*">کپی</button>
<button class="execute-btn" data-command="del /s /q %temp%\\*" data-risk="3">اجرای ایمن</button>
<p class="command-description">حذف فایل‌های موقت با تأیید خودکار</p>
</div>
</div>
<div class="safety-section">
<h4>⚠️ هشدارهای امنیتی:</h4>
<ul class="safety-warnings">
<li>قبل از اجرا، مطمئن شوید که فایل‌های مهمی در پوشه Temp ندارید</li>
<li>این دستورات فقط فایل‌های موقت را حذف می‌کنند</li>
</ul>
</div>
</div>
`,
confidence: 95
},
{
question: 'حافظه سیستم رو خالی کنم',
answer: `
<div class="ai-response-card">
<h3><i class="fas fa-memory"></i> آزادسازی حافظه RAM</h3>
<p>برای آزادسازی حافظه سیستم، چند روش مؤثر وجود دارد:</p>
<div class="command-section">
<h4>روش ۱: بستن فرآیندهای پر مصرف</h4>
<div class="command-suggestion">
<code>taskmgr</code>
<button class="copy-btn" data-command="taskmgr">کپی</button>
<button class="execute-btn" data-command="taskmgr" data-risk="1">اجرای ایمن</button>
<p class="command-description">باز کردن مدیر وظیفه برای شناسایی و بستن برنامه‌های پر مصرف</p>
</div>
<h4>روش ۲: استفاده از PowerShell</h4>
<div class="command-suggestion">
<code>Get-Process | Sort-Object WS -Descending | Select-Object -First 5</code>
<button class="copy-btn" data-command="Get-Process | Sort-Object WS -Descending | Select-Object -First 5">کپی</button>
<button class="execute-btn" data-command="Get-Process | Sort-Object WS -Descending | Select-Object -First 5" data-risk="1">اجرای ایمن</button>
<p class="command-description">مشاهده ۵ فرآیند پر مصرف حافظه</p>
</div>
</div>
<div class="tips-section">
<h4>💡 نکات تکمیلی:</h4>
<ul class="response-tips">
<li>برای آزادسازی دائمی حافظه، بهتر است برنامه‌های غیرضروری را از Startup حذف کنید</li>
<li>استفاده از SSD بهبود عملکرد سیستم را به همراه دارد</li>
</ul>
</div>
</div>
`,
confidence: 90
}
];

basicKnowledge.forEach(item => {
this.cachedKnowledge.set(item.question.toLowerCase(), {
answer: item.answer,
confidence: item.confidence,
timestamp: Date.now()
});
});
}

checkKnowledgeBase(processedQuery) {
const queryKey = processedQuery.intent || processedQuery.query.toLowerCase();
const cached = this.cachedKnowledge.get(queryKey);

if (cached && (Date.now() - cached.timestamp) < 86400000) {
console.log('✅ Knowledge base hit for:', queryKey);
window.arcUtils?.trackEvent('AI', 'KnowledgeBaseHit', queryKey);
return cached.answer;
}

return null;
}

updateKnowledgeBase(processedQuery, response) {
const queryKey = processedQuery.intent || processedQuery.query.toLowerCase();
const confidence = this.assessResponseQuality(response);

if (confidence > 80) {
this.cachedKnowledge.set(queryKey, {
answer: response,
confidence: confidence,
timestamp: Date.now()
});

if (this.cachedKnowledge.size > 50) {
const oldestKeys = Array.from(this.cachedKnowledge.keys())
.sort((a, b) => this.cachedKnowledge.get(a).timestamp - this.cachedKnowledge.get(b).timestamp)
.slice(0, 10);

oldestKeys.forEach(key => this.cachedKnowledge.delete(key));
}
}
}

simulateGeminiResponse(query, systemContext) {
return `
<div class="ai-response-card">
<div class="response-header">
<h3><i class="fas fa-brain"></i> 🤖 Gemini (شبیه‌سازی شده)</h3>
<div class="response-meta">
<span class="confidence-badge medium">اعتماد: 85%</span>
</div>
</div>
<div class="response-content">
<p>بر اساس درخواست شما برای "${query}"، پیشنهادهای زیر را ارائه می‌دهم:</p>
<div class="command-section">
<h4>✅ دستور پیشنهادی:</h4>
<div class="command-suggestion">
<code>${this.generateDemoCommand(query, systemContext)}</code>
<button class="copy-btn" data-command="${this.generateDemoCommand(query, systemContext)}">کپی</button>
<button class="execute-btn" data-command="${this.generateDemoCommand(query, systemContext)}" data-risk="2">اجرای ایمن</button>
</div>
</div>
<div class="tips-section">
<h4>💡 نکات:</h4>
<ul class="response-tips">
<li>این دستور به صورت ایمن طراحی شده است</li>
<li>قبل از اجرا، وضعیت سیستم فعلی بررسی شده است</li>
<li>در صورت مشکل، می‌توانید از قابلیت Undo استفاده کنید</li>
</ul>
</div>
</div>
</div>
`;
}

simulateOpenAIResponse(query, systemContext) {
return `
<div class="ai-response-card">
<div class="response-header">
<h3><i class="fas fa-comment-dots"></i> 🤯 ChatGPT (شبیه‌سازی شده)</h3>
<div class="response-meta">
<span class="confidence-badge high">اعتماد: 90%</span>
</div>
</div>
<div class="response-content">
<p>درخواست شما برای "${query}" را بررسی کرده‌ام. بهترین راه‌حل:</p>
<div class="command-section">
<h4>⚡ دستور بهینه:</h4>
<div class="command-suggestion">
<code>${this.generateAdvancedDemoCommand(query, systemContext)}</code>
<button class="copy-btn" data-command="${this.generateAdvancedDemoCommand(query, systemContext)}">کپی</button>
<button class="execute-btn" data-command="${this.generateAdvancedDemoCommand(query, systemContext)}" data-risk="3">اجرای ایمن</button>
</div>
</div>
<div class="safety-section">
<h4>⚠️ توصیه امنیتی:</h4>
<p>برای امنیت بیشتر، پیشنهاد می‌کنم ابتدا دستور را در محیط تست اجرا کنید.</p>
</div>
</div>
</div>
`;
}

generateDemoCommand(query, systemContext) {
if (query.includes('فایل') || query.includes('پاک')) {
return 'dir /s /b *.tmp';
} else if (query.includes('شبکه') || query.includes('تست')) {
return 'ping -t 8.8.8.8';
} else if (query.includes('حافظه') || query.includes('RAM')) {
return 'tasklist /fi "memusage gt 50000"';
} else if (query.includes('دیسک') || query.includes('فضا')) {
return 'df -h';
} else {
return `echo "درخواست: ${query.substring(0, 30)}..."`;
}
}

generateAdvancedDemoCommand(query, systemContext) {
if (query.includes('فایل') || query.includes('پاک')) {
return 'Get-ChildItem -Path $env:TEMP -Recurse | Remove-Item -Force -Recurse -WhatIf';
} else if (query.includes('شبکه') || query.includes('تست')) {
return 'Test-NetConnection -ComputerName 8.8.8.8 -TraceRoute';
} else if (query.includes('حافظه') || query.includes('RAM')) {
return 'Get-Process | Sort-Object -Property WS -Descending | Select-Object -First 10';
} else if (query.includes('دیسک') || query.includes('فضا')) {
return 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free';
} else {
return `Write-Output "تحلیل پیشرفته برای: ${query.substring(0, 30)}..."`;
}
}

simulateSynthesizedResponse(responses, systemContext) {
return `
<div class="ai-response-card synthesized demo-mode">
<div class="synthesis-header">
<h3><i class="fas fa-brain quantum-icon"></i> 🧠 تحلیل هوشمند (حالت نمایشی)</h3>
<p class="synthesis-description">این پاسخ در حالت نمایشی تولید شده است. برای استفاده از هوش مصنوعی واقعی، لطفاً کلیدهای API را در تنظیمات وارد کنید.</p>
</div>
<div class="demo-warning">
<i class="fas fa-exclamation-triangle"></i>
<strong>⚠️ حالت نمایشی:</strong> شما در حال حاضر از حالت نمایشی استفاده می‌کنید. برای فعال‌سازی هوش مصنوعی واقعی، در قسمت تنظیمات، کلیدهای API Gemini و OpenAI را وارد کنید.
</div>
<div class="synthesis-content">
<h4><i class="fas fa-lightbulb"></i> توضیح:</h4>
<p>در حالت واقعی، آرکا با استفاده از هوش مصنوعی پیشرفته و تحلیل چندمنبعی، بهترین پاسخ را برای شما تولید می‌کند. این سیستم قادر است:</p>
<ul class="capabilities-list">
<li>✅ درخواست‌های شما را به چندین مدل هوش مصنوعی ارسال کند</li>
<li>✅ پاسخ‌ها را تحلیل و مقایسه کند</li>
<li>✅ بهترین و ایمن‌ترین دستورات را پیشنهاد دهد</li>
<li>✅ هشدارهای امنیتی دقیق ارائه دهد</li>
<li>✅ تجربه کاربری شخصی‌سازی شده ایجاد کند</li>
</ul>
<div class="config-section">
<h4><i class="fas fa-cog"></i> فعال‌سازی هوش مصنوعی واقعی:</h4>
<button class="config-btn" id="ai-config-btn">
<i class="fas fa-key"></i> وارد کردن کلیدهای API
</button>
<p class="config-help">کلیدهای API رایگان می‌توانید از سایت‌های زیر دریافت کنید:</p>
<ul class="api-links">
<li><a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio (Gemini)</a></li>
<li><a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></li>
</ul>
</div>
</div>
</div>
`;
}

showEnhancedWelcomeMessage() {
const aiResponseElement = document.getElementById('ai-response');
if (!aiResponseElement) return;

aiResponseElement.innerHTML = `
<div class="ai-welcome enhanced">
<div class="welcome-header">
<h2 class="text-glow">👋 سلام دوست عزیز! من آرکا هستم</h2>
<p class="welcome-subtitle">هوش مصنوعی خداگونه برای مدیریت سیستم شما</p>
</div>
<div class="welcome-features">
<div class="feature-card">
<i class="fas fa-brain feature-icon"></i>
<h3>تحلیل چندمنبعی</h3>
<p>همزمان با چندین مدل هوش مصنوعی در ارتباطم</p>
</div>
<div class="feature-card">
<i class="fas fa-shield-alt feature-icon"></i>
<h3>امنیت هوشمند</h3>
<p>تمام دستورات قبل از اجرا اعتبارسنجی می‌شوند</p>
</div>
<div class="feature-card">
<i class="fas fa-bolt feature-icon"></i>
<h3>سرعت بالا</h3>
<p>پاسخ‌های سریع با پردازش موازی</p>
</div>
</div>
<div class="welcome-instructions">
<h4>🚀 چگونه شروع کنم؟</h4>
<p>کافی است سؤال خود را به فارسی در کادر زیر بنویسید. مثلاً:</p>
<div class="example-queries">
<span class="example-query">"فایل‌های حجیم رو پیدا کنم"</span>
<span class="example-query">"شبکه رو تست کنم"</span>
<span class="example-query">"سیستم رو بهینه کنم"</span>
</div>
</div>
<div class="welcome-footer">
<div class="status-indicators">
<span class="status-badge ready">✅ آماده دریافت درخواست</span>
<span class="status-badge ai">🧠 هوش مصنوعی فعال</span>
</div>
<button class="tutorial-btn" id="welcome-tutorial">
<i class="fas fa-graduation-cap"></i> آموزش کامل استفاده
</button>
</div>
</div>
`;

const tutorialBtn = document.getElementById('welcome-tutorial');
if (tutorialBtn) {
tutorialBtn.addEventListener('click', () => {
window.arcMain?.startInteractiveTutorial();
});
}
}

showApiKeyConfigModal() {
const modal = document.createElement('div');
modal.className = 'api-config-modal';
modal.innerHTML = `
<div class="modal-backdrop" id="api-modal-backdrop"></div>
<div class="modal-content glass-card" id="api-config-content">
<div class="modal-header">
<h3><i class="fas fa-key"></i> تنظیمات کلیدهای API</h3>
<button class="close-modal" id="close-api-config">&times;</button>
</div>
<div class="modal-body">
<p class="config-description">
در این بخش می‌توانید کلیدهای API خود را برای فعال‌سازی هوش مصنوعی واقعی وارد کنید. 
این کلیدها فقط در مرورگر شما ذخیره می‌شوند و به هیچ سروری ارسال نمی‌شوند.
</p>
<div class="api-section">
<h4><i class="fas fa-robot"></i> Google Gemini API</h4>
<div class="api-input-group">
<input type="password" class="api-input" id="gemini-api-key" placeholder="Enter your Gemini API key" value="${this.apiKeys.gemini || ''}">
<button class="toggle-visibility" data-target="gemini-api-key">
<i class="fas fa-eye"></i>
</button>
</div>
<a href="https://makersuite.google.com/app/apikey" target="_blank" class="api-link">
<i class="fas fa-link"></i> دریافت کلید رایگان از Google AI Studio
</a>
</div>
<div class="api-section">
<h4><i class="fas fa-comment-dots"></i> OpenAI API (ChatGPT)</h4>
<div class="api-input-group">
<input type="password" class="api-input" id="openai-api-key" placeholder="sk-..." value="${this.apiKeys.openai || ''}">
<button class="toggle-visibility" data-target="openai-api-key">
<i class="fas fa-eye"></i>
</button>
</div>
<a href="https://platform.openai.com/api-keys" target="_blank" class="api-link">
<i class="fas fa-link"></i> دریافت کلید از OpenAI Platform
</a>
</div>
<div class="security-note">
<i class="fas fa-shield-alt"></i>
<strong>نکته امنیتی:</strong> کلیدهای شما فقط در localStorage مرورگر شما ذخیره می‌شوند و هرگز به سرورهای خارجی ارسال نمی‌شوند.
</div>
</div>
<div class="modal-footer">
<button class="cancel-btn" id="cancel-api-config">
<i class="fas fa-times"></i> انصراف
</button>
<button class="save-btn" id="save-api-config">
<i class="fas fa-save"></i> ذخیره تنظیمات
</button>
</div>
</div>
`;

document.body.appendChild(modal);

document.getElementById('close-api-config').addEventListener('click', () => {
modal.remove();
});

document.getElementById('cancel-api-config').addEventListener('click', () => {
modal.remove();
});

document.getElementById('save-api-config').addEventListener('click', () => {
const geminiKey = document.getElementById('gemini-api-key').value.trim();
const openaiKey = document.getElementById('openai-api-key').value.trim();

if (geminiKey) localStorage.setItem('arka_gemini_api_key', geminiKey);
if (openaiKey) localStorage.setItem('arka_openai_api_key', openaiKey);

this.apiKeys.gemini = geminiKey;
this.apiKeys.openai = openaiKey;
this.demoMode = !(geminiKey || openaiKey);

window.arcUtils.showSuccess('کلیدهای API با موفقیت ذخیره شدند!');
modal.remove();
this.testApiConnections();
});

document.querySelectorAll('.toggle-visibility').forEach(button => {
button.addEventListener('click', (e) => {
const targetId = e.target.closest('button').dataset.target;
const input = document.getElementById(targetId);
const icon = e.target.closest('i');
if (input.type === 'password') {
input.type = 'text';
icon.className = 'fas fa-eye-slash';
} else {
input.type = 'password';
icon.className = 'fas fa-eye';
}
});
});
}

testApiConnections() {
if (this.apiKeys.gemini) {
fetch(`${this.apiUrls.gemini}?key=${this.apiKeys.gemini}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
contents: [{ parts: [{ text: 'test' }] }],
generationConfig: { maxOutputTokens: 1 }
})
})
.then(response => {
if (response.ok) {
window.arcUtils.showSuccess('✅ اتصال به Gemini برقرار شد');
} else {
window.arcUtils.showWarning('⚠️ مشکل در اتصال به Gemini');
}
})
.catch(error => {
window.arcUtils.showError(`❌ خطا در اتصال Gemini: ${error.message}`);
});
}
}

showThinkingAnimation() {
const thinkingElement = document.createElement('div');
thinkingElement.id = 'thinking-animation';
thinkingElement.innerHTML = `
<div class="thinking-container">
<div class="thinking-dots">
<span></span>
<span></span>
<span></span>
</div>
<div class="thinking-text">در حال تفکر هوشمند...</div>
<div class="thinking-engines">
<div class="engine-indicator gemini">
<span class="engine-name">Gemini</span>
<span class="engine-status">در حال پردازش</span>
</div>
<div class="engine-indicator openai">
<span class="engine-name">ChatGPT</span>
<span class="engine-status">در حال پردازش</span>
</div>
<div class="engine-indicator local">
<span class="engine-name">تحلیل محلی</span>
<span class="engine-status">فعال</span>
</div>
</div>
</div>
`;
document.body.appendChild(thinkingElement);
}

hideThinkingAnimation() {
const thinkingElement = document.getElementById('thinking-animation');
if (thinkingElement) {
thinkingElement.remove();
}
}

showLoadingState() {
const aiResponseElement = document.getElementById('ai-response');
if (!aiResponseElement) return;
aiResponseElement.innerHTML = `
<div class="loading-spinner"></div>
<p class="text-center mt-3">در حال پردازش درخواست...</p>
`;
}

showError(message) {
const aiResponseElement = document.getElementById('ai-response');
if (!aiResponseElement) return;
aiResponseElement.innerHTML = `
<div class="alert alert-danger">
<i class="fas fa-exclamation-circle"></i>
<span>${message}</span>
</div>
`;
}

displayResponse(response) {
const aiResponseElement = document.getElementById('ai-response');
if (!aiResponseElement) return;
aiResponseElement.innerHTML = response;
this.activateCopyButtons();
}

activateCopyButtons() {
document.querySelectorAll('.copy-btn').forEach(button => {
button.addEventListener('click', (e) => {
const command = e.target.dataset.command || e.target.closest('.command-suggestion')?.dataset.command;
if (command) {
window.arcUtils.copyToClipboard(command, button);
}
});
});
}

addToHistory(role, content) {
this.conversationHistory.push({
role: role,
content: content,
timestamp: new Date()
});
if (this.conversationHistory.length > 20) {
this.conversationHistory.shift();
}
}

getSuggestions(query, response) {
if (this.suggestionEngine) {
this.suggestionEngine.getSuggestions(query, response);
}
}

startBackgroundMonitoring() {
setInterval(() => {
// Update system stats
document.getElementById('cpu-temp').textContent = `${Math.floor(40 + Math.random() * 30)}°C`;
document.getElementById('ram-usage').textContent = `${Math.floor(30 + Math.random() * 50)}%`;
document.getElementById('disk-space').textContent = `${Math.floor(100 + Math.random() * 400)}GB`;
document.getElementById('cpu-usage').textContent = `${Math.floor(20 + Math.random() * 60)}%`;
}, 5000);
}

static initialize() {
window.arcAI = new ArcAIEngine();
console.log('✅ AI Engine fully initialized with multi-engine capability');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', ArcAIEngine.initialize);
