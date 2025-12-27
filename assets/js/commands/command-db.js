class CommandDatabase {
constructor() {
this.commands = {
CMD: [],
PowerShell: [],
Run: []
};
this.categories = {
system: 'سیستم',
file: 'فایل‌ها',
network: 'شبکه',
security: 'امنیت',
performance: 'عملکرد',
user: 'کاربران',
hardware: 'سخت‌افزار'
};
this.loadCommands();
console.log('✅ Command Database initialized');
}

loadCommands() {
// CMD Commands
this.commands.CMD = [
{
id: 'cmd-001',
name: 'لیست فایل‌ها',
command: 'dir',
description: 'نمایش لیست فایل‌ها و پوشه‌های فعلی',
category: 'file',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اطلاعات را نمایش می‌دهد',
undoCommand: null,
example: 'dir /s /b *.txt',
tags: ['فایل', 'لیست', 'مشاهده']
},
{
id: 'cmd-002',
name: 'پاک‌سازی فایل‌های موقت',
command: 'del /s /q %temp%\\*',
description: 'حذف تمام فایل‌های موقت سیستم',
category: 'file',
riskScore: 4,
riskLevel: 'medium',
safetyInfo: 'قبل از اجرا، مطمئن شوید که فایل‌های مهمی در پوشه Temp ندارید. این دستور فایل‌های موقت را دائمی حذف می‌کند.',
undoCommand: null,
example: 'del /s /q %temp%\\*.tmp',
tags: ['فایل', 'پاک‌سازی', 'تمپ']
},
{
id: 'cmd-003',
name: 'تست شبکه',
command: 'ping -t 8.8.8.8',
description: 'تست اتصال شبکه به سرور گوگل',
category: 'network',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اتصال شبکه را تست می‌کند',
undoCommand: null,
example: 'ping -n 10 google.com',
tags: ['شبکه', 'تست', 'اتصال']
},
{
id: 'cmd-004',
name: 'لیست فرآیندها',
command: 'tasklist /fi "memusage gt 50000"',
description: 'نمایش فرآیندهایی که بیش از 50MB حافظه مصرف کرده‌اند',
category: 'performance',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور فقط اطلاعات را نمایش می‌دهد و هیچ تغییری ایجاد نمی‌کند',
undoCommand: null,
example: 'tasklist /fi "cpu gt 50"',
tags: ['عملکرد', 'حافظه', 'فرآیند']
},
{
id: 'cmd-005',
name: 'بستن فرآیند',
command: 'taskkill /f /im processname.exe',
description: 'بستن یک فرآیند مشخص با نام',
category: 'performance',
riskScore: 6,
riskLevel: 'medium',
safetyInfo: 'این دستور می‌تواند باعث بسته شدن برنامه‌ها شود. مطمئن شوید که فرآیند مورد نظر ضروری نیست.',
undoCommand: null,
example: 'taskkill /f /im chrome.exe',
tags: ['عملکرد', 'بستن', 'فرآیند']
},
{
id: 'cmd-006',
name: 'فضای دیسک',
command: 'df -h',
description: 'نمایش فضای آزاد و استفاده شده دیسک',
category: 'system',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اطلاعات را نمایش می‌دهد',
undoCommand: null,
example: 'dir /s /b',
tags: ['سیستم', 'دیسک', 'فضا']
},
{
id: 'cmd-007',
name: 'پاک‌سازی دیسک',
command: 'cleanmgr /sagerun:1',
description: 'اجرای ابزار پاک‌سازی دیسک ویندوز',
category: 'system',
riskScore: 3,
riskLevel: 'low',
safetyInfo: 'این دستور فایل‌های موقت و غیرضروری را حذف می‌کند. هیچ داده مهمی حذف نمی‌شود.',
undoCommand: null,
example: 'cleanmgr /d C:',
tags: ['سیستم', 'پاک‌سازی', 'دیسک']
},
{
id: 'cmd-008',
name: 'اطلاعات سیستم',
command: 'systeminfo',
description: 'نمایش اطلاعات کامل سیستم',
category: 'system',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اطلاعات را نمایش می‌دهد',
undoCommand: null,
example: 'systeminfo | findstr /I /c:bios /c:os',
tags: ['سیستم', 'اطلاعات', 'سخت‌افزار']
}
];

// PowerShell Commands
this.commands.PowerShell = [
{
id: 'ps-001',
name: 'فرآیندهای پر مصرف حافظه',
command: 'Get-Process | Sort-Object WS -Descending | Select-Object -First 10',
description: 'نمایش 10 فرآیند پر مصرف حافظه',
category: 'performance',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اطلاعات را نمایش می‌دهد',
undoCommand: null,
example: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 5',
tags: ['عملکرد', 'حافظه', 'فرآیند']
},
{
id: 'ps-002',
name: 'حذف فایل‌های موقت',
command: 'Get-ChildItem -Path $env:TEMP -Recurse | Remove-Item -Force -Recurse -WhatIf',
description: 'حذف ایمن فایل‌های موقت با پیش‌نمایش',
category: 'file',
riskScore: 5,
riskLevel: 'medium',
safetyInfo: 'با پارامتر -WhatIf، دستور فقط نمایش داده می‌شود و اجرا نمی‌شود. برای اجرای واقعی، -WhatIf را حذف کنید.',
undoCommand: null,
example: 'Get-ChildItem -Path C:\\Windows\\Temp -Recurse | Remove-Item -Force -Recurse',
tags: ['فایل', 'پاک‌سازی', 'تمپ']
},
{
id: 'ps-003',
name: 'تست اتصال شبکه پیشرفته',
command: 'Test-NetConnection -ComputerName 8.8.8.8 -TraceRoute',
description: 'تست اتصال شبکه با TraceRoute برای تشخیص مسیر',
category: 'network',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اتصال شبکه را تست می‌کند',
undoCommand: null,
example: 'Test-NetConnection google.com -Port 443',
tags: ['شبکه', 'تست', 'اتصال']
},
{
id: 'ps-004',
name: 'مدیریت کاربران',
command: 'Get-LocalUser',
description: 'نمایش لیست کاربران محلی سیستم',
category: 'user',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اطلاعات را نمایش می‌دهد',
undoCommand: null,
example: 'New-LocalUser -Name "User1" -Password (Read-Host -AsSecureString)',
tags: ['کاربران', 'مدیریت', 'حساب']
},
{
id: 'ps-005',
name: 'بروزرسانی ویندوز',
command: 'Install-WindowsUpdate -AcceptAll -AutoReboot',
description: 'نصب تمام بروزرسانی‌های ویندوز و ریستارت خودکار',
category: 'system',
riskScore: 8,
riskLevel: 'high',
safetyInfo: '⚠️ این دستور بسیار پرخطر است! سیستم را ریستارت می‌کند و ممکن است برنامه‌های باز را ببندد. حتماً از تمام کارهای مهم بکاپ بگیرید.',
undoCommand: null,
example: 'Get-WindowsUpdate',
tags: ['سیستم', 'بروزرسانی', 'ویندوز']
},
{
id: 'ps-006',
name: 'اسکن امنیتی',
command: 'Get-MpThreat',
description: 'نمایش تهدیدات شناسایی شده توسط Windows Defender',
category: 'security',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط نتایج اسکن را نمایش می‌دهد',
undoCommand: null,
example: 'Start-MpScan -ScanType FullScan',
tags: ['امنیت', 'اسکن', 'ویروس']
},
{
id: 'ps-007',
name: 'بهینه‌سازی حافظه',
command: 'Clear-Memory',
description: 'آزادسازی حافظه RAM با بستن فرآیندهای غیرضروری',
category: 'performance',
riskScore: 7,
riskLevel: 'high',
safetyInfo: '⚠️ این دستور می‌تواند باعث بسته شدن برنامه‌های باز شود. فقط در مواقع ضروری استفاده کنید.',
undoCommand: null,
example: 'Get-Process | Where-Object {$_.WorkingSet -gt 100MB} | Stop-Process -Force',
tags: ['عملکرد', 'حافظه', 'بهینه‌سازی']
},
{
id: 'ps-008',
name: 'مدیریت دیسک',
command: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, Used, Free',
description: 'نمایش فضای استفاده شده و آزاد دیسک‌ها',
category: 'system',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اطلاعات را نمایش می‌دهد',
undoCommand: null,
example: 'Get-Volume | Select-Object DriveLetter, SizeRemaining, Size',
tags: ['سیستم', 'دیسک', 'فضا']
}
];

// Run Commands
this.commands.Run = [
{
id: 'run-001',
name: 'پنل کنترل',
command: 'control panel',
description: 'باز کردن پنل کنترل ویندوز',
category: 'system',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط پنل کنترل را باز می‌کند',
undoCommand: null,
example: 'control',
tags: ['سیستم', 'پنل', 'کنترل']
},
{
id: 'run-002',
name: 'مدیریت سیستم',
command: 'msconfig',
description: 'باز کردن ابزار پیکربندی سیستم',
category: 'system',
riskScore: 3,
riskLevel: 'low',
safetyInfo: 'این دستور امن است اما تغییرات در آن می‌تواند بر عملکرد سیستم تأثیر بگذارد',
undoCommand: null,
example: 'msconfig',
tags: ['سیستم', 'پیکربندی', 'راه‌اندازی']
},
{
id: 'run-003',
name: 'مدیریت دستگاه‌ها',
command: 'devmgmt.msc',
description: 'باز کردن مدیریت دستگاه‌ها',
category: 'hardware',
riskScore: 2,
riskLevel: 'low',
safetyInfo: 'این دستور امن است اما تغییرات در درایورها می‌تواند باعث مشکلات سخت‌افزاری شود',
undoCommand: null,
example: 'devmgmt.msc',
tags: ['سخت‌افزار', 'درایور', 'مدیریت']
},
{
id: 'run-004',
name: 'اطلاعات سیستم',
command: 'msinfo32',
description: 'باز کردن اطلاعات سیستم',
category: 'system',
riskScore: 1,
riskLevel: 'low',
safetyInfo: 'این دستور کاملاً ایمن است و فقط اطلاعات را نمایش می‌دهد',
undoCommand: null,
example: 'msinfo32',
tags: ['سیستم', 'اطلاعات', 'سخت‌افزار']
},
{
id: 'run-005',
name: 'مدیریت گروه',
command: 'gpedit.msc',
description: 'باز کردن ویرایشگر سیاست گروه',
category: 'security',
riskScore: 9,
riskLevel: 'high',
safetyInfo: '⚠️ این دستور بسیار پرخطر است! تغییرات سیاست گروه می‌تواند باعث قفل شدن سیستم یا از دست دادن دسترسی‌ها شود. فقط توسط کارشناسان استفاده شود.',
undoCommand: null,
example: 'gpedit.msc',
tags: ['امنیت', 'سیاست', 'گروه']
},
{
id: 'run-006',
name: 'پشتیبان‌گیری',
command: 'sdclt.exe',
description: 'باز کردن ابزار پشتیبان‌گیری ویندوز',
category: 'system',
riskScore: 2,
riskLevel: 'low',
safetyInfo: 'این دستور امن است و برای پشتیبان‌گیری از فایل‌ها استفاده می‌شود',
undoCommand: null,
example: 'sdclt.exe',
tags: ['سیستم', 'بکاپ', 'پشتیبان']
},
{
id: 'run-007',
name: 'مدیریت وظایف',
command: 'taskmgr',
description: 'باز کردن مدیر وظایف',
category: 'performance',
riskScore: 2,
riskLevel: 'low',
safetyInfo: 'این دستور امن است اما بستن فرآیندها در آن می‌تواند برنامه‌ها را ببندد',
undoCommand: null,
example: 'taskmgr',
tags: ['عملکرد', 'مدیریت', 'وظایف']
},
{
id: 'run-008',
name: 'ویرایش رجیستری',
command: 'regedit',
description: 'باز کردن ویرایشگر رجیستری',
category: 'system',
riskScore: 10,
riskLevel: 'high',
safetyInfo: '⚠️ این دستور بسیار پرخطر است! تغییرات در رجیستری می‌تواند باعث خرابی کامل سیستم شود. فقط در صورتی استفاده کنید که دقیقاً می‌دانید چه کاری انجام می‌دهید.',
undoCommand: 'System Restore Point',
example: 'regedit',
tags: ['سیستم', 'رجیستری', 'ویرایش']
}
];

console.log('✅ Commands loaded successfully');
}

getCommandsByEnvironment(environment) {
return this.commands[environment] || [];
}

getCommandsByCategory(environment, category) {
const cmds = this.getCommandsByEnvironment(environment);
return cmds.filter(cmd => cmd.category === category);
}

getCommandsByRiskLevel(environment, riskLevel) {
const cmds = this.getCommandsByEnvironment(environment);
return cmds.filter(cmd => cmd.riskLevel === riskLevel);
}

searchCommands(query, environment = null) {
query = query.toLowerCase().trim();
let results = [];

if (environment) {
results = this.commands[environment] || [];
} else {
results = [
...this.commands.CMD,
...this.commands.PowerShell,
...this.commands.Run
];
}

return results.filter(cmd => 
cmd.name.toLowerCase().includes(query) ||
cmd.description.toLowerCase().includes(query) ||
cmd.command.toLowerCase().includes(query) ||
(cmd.tags && cmd.tags.some(tag => tag.toLowerCase().includes(query)))
);
}

getCommandById(id) {
const allCommands = [
...this.commands.CMD,
...this.commands.PowerShell,
...this.commands.Run
];
return allCommands.find(cmd => cmd.id === id);
}

getCategories() {
return this.categories;
}

getRiskLevels() {
return ['low', 'medium', 'high'];
}

getPopularCommands(environment, limit = 5) {
const cmds = this.getCommandsByEnvironment(environment);
return cmds.sort((a, b) => a.riskScore - b.riskScore).slice(0, limit);
}

getDangerousCommands(environment) {
const cmds = this.getCommandsByEnvironment(environment);
return cmds.filter(cmd => cmd.riskScore >= 7);
}

getSafeCommands(environment) {
const cmds = this.getCommandsByEnvironment(environment);
return cmds.filter(cmd => cmd.riskScore <= 3);
}

static initialize() {
window.arcCommands = new CommandDatabase();
console.log('✅ Command Database fully initialized');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', CommandDatabase.initialize);
