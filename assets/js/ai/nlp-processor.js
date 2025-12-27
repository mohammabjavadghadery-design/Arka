class NLPProcessor {
constructor() {
this.intentKeywords = {
system_optimization: ['بهینه', 'بهینه‌سازی', 'سرعت', 'عملکرد', 'سریع', 'کند', 'بطئ'],
file_management: ['فایل', 'پوشه', 'فایل‌ها', 'ذخیره', 'حذف', 'پاک', 'پاکسازی', 'فضا'],
network: ['شبکه', 'اینترنت', 'کابل', 'وای‌فای', 'تست', 'سرعت', 'اتصال', 'قطع', 'برقرار'],
memory: ['حافظه', 'رام', 'RAM', 'خالی', 'آزاد', 'پر', 'کمبود'],
cpu: ['پردازنده', 'CPU', 'دمای', 'گرم', 'سرد', 'بار', 'مصرف'],
disk: ['دیسک', 'هارد', 'SSD', 'HDD', 'فضا', 'خالی', 'پر', 'ظرفیت'],
process: ['فرآیند', 'پردازش', 'process', 'بستن', 'کشتن', 'فعال', 'غیرفعال'],
security: ['امنیت', 'ویروس', 'مالور', 'محافظت', 'حفاظت', 'تهدید', 'خطر'],
backup: ['بکاپ', 'پشتیبان', 'ذخیره', 'بازگردانی', 'بازیابی', 'آسیب'],
user_management: ['کاربر', 'حساب', 'رمز', 'ادمین', 'ادمینیستراتور', 'دسترسی'],
software: ['برنامه', 'نرم‌افزار', 'نصب', 'حذف', 'بروزرسانی', 'ویرایش'],
hardware: ['سخت‌افزار', 'قطعه', 'کارت', 'گرافیک', 'صدا', 'شبکه', 'درایور'],
time: ['زمان', 'تاریخ', 'ساعت', 'زمانبندی', 'برنامه‌ریزی', 'همزمان'],
power: ['برق', 'باتری', 'خواب', 'هیبرنتی', 'خاموش', 'روشن', 'مصرف'],
search: ['جستجو', 'پیدا', 'یافتن', 'جستجوی', 'جستجویی'],
help: ['کمک', 'راهنما', 'آموزش', 'نحوه', 'چطور', 'چرا', 'کجا']
};

this.commandPatterns = {
cmd: [
'cmd',
'command prompt',
'کامند',
'خط فرمان',
'پرامپت'
],
powershell: [
'powershell',
'پاورشل',
'اسکریپت',
'script',
'پیشرفته'
],
run: [
'run',
'اجرای',
'اجرایی',
'run dialog',
'دایالوگ اجرا',
'اجرای سریع'
]
};

this.safetyKeywords = [
'حذف', 'delete', 'remove', 'erase', 'format', 'restart', 'shutdown',
'reboot', 'registry', 'system32', 'windows', 'system', 'admin',
'administrator', 'root', 'danger', 'hazard', 'permanent', 'destroy',
'dangerous', 'warning', 'خطر', 'حذف دائمی', 'فورمت', 'ریستارت',
'خاموش', 'سیستم', 'ادمین', 'ریشه', 'پایگاه', 'ویندوز'
];

this.contextWords = {
low_risk: ['خواندن', 'مشاهده', 'لیست', 'info', 'اطلاعات', 'get', 'show', 'view', 'read'],
medium_risk: ['تغییر', 'ویرایش', 'change', 'edit', 'modify', 'update', 'configure'],
high_risk: ['حذف', 'destroy', 'delete', 'remove', 'format', 'erase', 'danger', 'permanent']
};

this.init();
}

init() {
console.log('✅ NLP Processor initialized');
}

processQuery(query) {
if (!query || typeof query !== 'string') {
return {
query: '',
intent: 'unknown',
confidence: 0,
environment: 'CMD',
riskScore: 1
};
}

const normalizedQuery = this.normalizeQuery(query);
const tokens = this.tokenize(normalizedQuery);
const intent = this.detectIntent(tokens);
const environment = this.detectEnvironment(tokens);
const riskScore = this.assessRisk(tokens, query);
const confidence = this.calculateConfidence(intent, tokens);

return {
query: normalizedQuery,
tokens: tokens,
intent: intent,
environment: environment,
riskScore: riskScore,
confidence: confidence,
timestamp: new Date()
};
}

normalizeQuery(query) {
return query
.toLowerCase()
.trim()
.replace(/[،,؟?؛;:!]/g, ' ')
.replace(/\s+/g, ' ');
}

tokenize(text) {
return text.split(/\s+/).filter(token => token.length > 0);
}

detectIntent(tokens) {
let bestIntent = 'general';
let bestScore = 0;

Object.entries(this.intentKeywords).forEach(([intent, keywords]) => {
const score = this.calculateKeywordScore(tokens, keywords);
if (score > bestScore) {
bestScore = score;
bestIntent = intent;
}
});

// Special handling for help queries
if (tokens.some(token => ['کمک', 'راهنما', 'چطور', 'چگونه', 'help', 'how', 'what'].includes(token))) {
return 'help';
}

// Special handling for search queries
if (tokens.some(token => ['جستجو', 'پیدا', 'یافتن', 'search', 'find', 'look for'].includes(token))) {
return 'search';
}

return bestIntent;
}

calculateKeywordScore(tokens, keywords) {
const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
let score = 0;

tokens.forEach(token => {
if (keywordSet.has(token)) {
score += 2;
} else if (keywords.some(kw => token.includes(kw) || kw.includes(token))) {
score += 1;
}
});

return score;
}

detectEnvironment(tokens) {
let bestEnv = 'CMD';
let bestScore = 0;

Object.entries(this.commandPatterns).forEach(([env, patterns]) => {
const score = this.calculateKeywordScore(tokens, patterns);
if (score > bestScore) {
bestScore = score;
bestEnv = env;
}
});

// Context-based detection
if (tokens.some(token => ['اسکریپت', 'script', 'پاورشل', 'powershell', 'advanced'].includes(token))) {
return 'PowerShell';
}

if (tokens.some(token => ['اجرای', 'run', 'سریع', 'quick', 'direct'].includes(token))) {
return 'Run';
}

return bestEnv;
}

assessRisk(tokens, query) {
let riskScore = 1;

// Check for safety keywords
const safetyScore = tokens.reduce((score, token) => {
if (this.safetyKeywords.includes(token)) {
return score + 3;
}
return score;
}, 0);

riskScore += Math.min(safetyScore, 9); // Cap at 9 to avoid overflow

// Context-based risk assessment
if (this.contextWords.high_risk.some(word => query.includes(word))) {
riskScore = Math.max(riskScore, 8);
} else if (this.contextWords.medium_risk.some(word => query.includes(word))) {
riskScore = Math.max(riskScore, 5);
} else if (this.contextWords.low_risk.some(word => query.includes(word))) {
riskScore = Math.min(riskScore, 3);
}

// Special high-risk commands
const highRiskPatterns = [
/format\s*\w+/i,
/del\s*\/s\s*\/q/i,
'rm -rf',
'reg delete',
'shutdown',
'restart',
'net user',
'net localgroup'
];

if (highRiskPatterns.some(pattern => pattern.test(query))) {
riskScore = Math.max(riskScore, 9);
}

return Math.min(10, riskScore);
}

calculateConfidence(intent, tokens) {
if (intent === 'unknown') return 0.1;

const keywordCount = Object.values(this.intentKeywords).flat().filter(kw => 
tokens.some(token => token.includes(kw) || kw.includes(token))
).length;

const confidence = 0.3 + (keywordCount * 0.2);
return Math.min(0.95, confidence);
}

analyzeQueryIntent(query, systemContext = {}) {
const processed = this.processQuery(query);
const intentDetails = this.getIntentDetails(processed.intent);

return {
intent: processed.intent,
confidence: processed.confidence,
environment: processed.environment,
riskScore: processed.riskScore,
details: intentDetails,
systemContext: systemContext,
recommendations: this.getIntentRecommendations(processed.intent, systemContext)
};
}

getIntentDetails(intent) {
const details = {
system_optimization: {
title: 'بهینه‌سازی سیستم',
description: 'بهینه‌سازی عملکرد سیستم و افزایش سرعت',
commands: [
'Get-Process | Sort-Object CPU -Descending | Select-Object -First 10',
'taskkill /f /im chrome.exe',
'powercfg /energy'
]
},
file_management: {
title: 'مدیریت فایل‌ها',
description: 'مدیریت فایل‌ها، پوشه‌ها و فضای دیسک',
commands: [
'dir /s /b *.tmp',
'del /s /q %temp%\\*',
'cleanmgr /sagerun:1'
]
},
network: {
title: 'مدیریت شبکه',
description: 'تست و بهینه‌سازی اتصال شبکه',
commands: [
'ping -t 8.8.8.8',
'ipconfig /all',
'netstat -ano'
]
},
memory: {
title: 'مدیریت حافظه',
description: 'آزادسازی و مدیریت حافظه RAM',
commands: [
'tasklist /fi "memusage gt 50000"',
'Get-Process | Sort-Object WS -Descending | Select-Object -First 5',
'Clear-Memory'
]
},
cpu: {
title: 'مدیریت پردازنده',
description: 'نظارت و بهینه‌سازی مصرف CPU',
commands: [
'tasklist /fi "cpu gt 50"',
'Get-Process | Sort-Object CPU -Descending | Select-Object -First 5',
'powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c'
]
},
disk: {
title: 'مدیریت دیسک',
description: 'مدیریت فضای دیسک و عملکرد',
commands: [
'df -h',
'Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free',
'chkdsk /f'
]
},
process: {
title: 'مدیریت فرآیندها',
description: 'کنترل و مدیریت فرآیندهای سیستم',
commands: [
'tasklist /fi "status eq running"',
'Get-Process | Where-Object {$_.CPU -gt 50}',
'taskkill /f /im processname.exe'
]
},
security: {
title: 'امنیت سیستم',
description: 'بررسی و بهبود امنیت سیستم',
commands: [
'sfc /scannow',
'Get-MpThreat',
'netsh advfirewall show allprofiles'
]
},
help: {
title: 'راهنمایی',
description: 'درخواست راهنمایی و آموزش',
commands: [
'help',
'Get-Help',
'man'
]
},
search: {
title: 'جستجو',
description: 'جستجوی فایل‌ها، فرآیندها و اطلاعات',
commands: [
'findstr /s /i "text" *.*',
'Get-ChildItem -Path C:\\ -Include *.txt -Recurse -ErrorAction SilentlyContinue',
'search-ms:'
]
},
general: {
title: 'درخواست عمومی',
description: 'درخواست عمومی بدون دسته‌بندی خاص',
commands: [
'echo "درخواست عمومی"',
'Get-Command',
'help'
]
}
};

return details[intent] || details.general;
}

getIntentRecommendations(intent, systemContext) {
const recommendations = {
system_optimization: [
'بستن برنامه‌های غیرضروری در Startup',
'بهینه‌سازی تنظیمات برق',
'حذف فایل‌های موقت'
],
file_management: [
'پاک‌سازی فایل‌های Temp',
'حذف فایل‌های دانلود شده قدیمی',
'انتقال فایل‌های حجیم به دیسک خارجی'
],
network: [
'راه‌اندازی مجدد روتر',
'بررسی تنظیمات DNS',
'به‌روزرسانی درایورهای شبکه'
],
memory: [
'بستن تب‌های مرورگر',
'غیرفعال کردن برنامه‌های پس‌زمینه',
'افزایش حافظه مجازی'
],
cpu: [
'کاهش عملکرد برنامه‌های سنگین',
'پاک‌سازی ونتیلاتورها',
'به‌روزرسانی BIOS'
],
disk: [
'Defrag دیسک',
'حذف برنامه‌های غیرضروری',
'استفاده از SSD برای سیستم‌عامل'
]
};

return recommendations[intent] || [
'بررسی سلامت سیستم',
'به‌روزرسانی ویندوز',
'نصب آنتی‌ویروس'
];
}

generateResponseTemplate(processedQuery) {
const { intent, environment, riskScore, confidence } = processedQuery;
const intentDetails = this.getIntentDetails(intent);

return {
title: `${intentDetails.title} - ${environment}`,
description: intentDetails.description,
commands: intentDetails.commands.slice(0, 3),
riskLevel: this.getRiskLevel(riskScore),
confidence: confidence,
warnings: this.getRiskWarnings(riskScore),
recommendations: this.getIntentRecommendations(intent, {})
};
}

getRiskLevel(score) {
if (score <= 3) return 'low';
if (score <= 6) return 'medium';
return 'high';
}

getRiskWarnings(score) {
if (score <= 3) return ['این دستورات ایمن هستند و خطری ندارند'];
if (score <= 6) return [
'قبل از اجرا، مطمئن شوید که می‌دانید دستور چه کاری انجام می‌دهد',
'توصیه می‌شود ابتدا در محیط تست امتحان کنید'
];
return [
'⚠️ این دستورات بسیار پرخطر هستند و ممکن است باعث آسیب دائمی به سیستم شوند',
'✅ حتماً قبل از اجرا از داده‌های مهم بکاپ بگیرید',
'🔍 دستور را با دقت بررسی کنید و فقط در صورت اطمینان اجرا نمایید'
];
}

static initialize() {
window.arcNLP = new NLPProcessor();
console.log('✅ NLP Processor fully initialized');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', NLPProcessor.initialize);
