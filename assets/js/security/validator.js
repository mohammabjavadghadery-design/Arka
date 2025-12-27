class CommandValidator {
constructor() {
this.dangerousPatterns = [
// High risk patterns
/format\s+\w+/i,
/del\s+\/s\s+\/q\s+\*|rm\s+-rf\s+\*/i,
'reg\s+delete|i delete registry/i',
'net\s+user\s+\w+\s+\/add|useradd/i',
'shutdown\s+\/r|reboot/i',
'diskpart\s+clean/i',
'cipher\s+\/w/i',
'bootsect\s+\/nt60/i',
'bootrec\s+\/fixmbr/i',
// Medium risk patterns
'taskkill\s+\/f\s+\/im\s+\w+|kill\s+-9/i',
'net\s+share|share/i',
'netsh\s+firewall|firewall/i',
'powershell\s+-exec\s+bypass/i',
'certutil\s+-decode/i',
// Low risk but suspicious
'curl\s+https?:\/\/|wget\s+https?:\/\//i',
'base64\s+decode/i',
'invoke-webrequest/i',
'wget\s+-o\s+\w+|curl\s+-o\s+\w+/i'
];

this.whitelistedCommands = [
// Safe commands that can be executed directly
'ipconfig',
'ping',
'dir',
'cls',
'help',
'echo',
'hostname',
'whoami',
'time',
'date',
'vol',
'cd',
'pwd',
'ls',
'cat',
'man',
'get-help',
'get-command',
'test-netconnection',
'get-process',
'get-service',
'get-childitem',
'get-content'
];

this.sensitivePaths = [
'C:\\Windows\\System32',
'C:\\Windows\\SysWOW64',
'C:\\Program Files',
'C:\\Program Files (x86)',
'C:\\Users\\Administrator',
'C:\\Users\\Public',
'C:\\Windows\\Registry',
'C:\\Windows\\System32\\drivers',
'/etc',
'/usr/bin',
'/usr/sbin',
'/root',
'/home/admin',
'/var/log'
];

this.sensitiveExtensions = [
'.exe', '.bat', '.cmd', '.ps1', '.vbs', '.js', '.com', '.pif', '.scr', '.reg', '.dll',
'.sys', '.drv', '.ocx', '.cpl', '.msi', '.msp', '.inf', '.cab', '.zip', '.rar', '.7z'
];

this.adminCommands = [
'format', 'diskpart', 'chkdsk', 'sfc', 'dism', 'netsh', 'sc', 'taskkill', 'shutdown',
'reboot', 'reg', 'net user', 'net localgroup', 'icacls', 'takeown', 'cipher', 'bootsect',
'bootrec', 'bcdedit', 'gpupdate', 'powershell -exec bypass', 'cmd.exe /c'
];

this.riskLevels = {
low: { min: 1, max: 3, color: '#00ff8c', description: 'ایمن - بدون خطر' },
medium: { min: 4, max: 6, color: '#fff01a', description: 'متوسط - با احتیاط' },
high: { min: 7, max: 10, color: '#ff1a1a', description: 'بالا - بسیار خطرناک' }
};

this.auditLog = [];
this.maxAuditEntries = 100;

this.init();
}

init() {
console.log('✅ Command Validator initialized');
this.loadWhitelistFromStorage();
}

validateCommand(command, environment = 'CMD') {
if (!command || typeof command !== 'string') {
return {
isValid: false,
error: 'دستور نامعتبر است',
riskScore: 10,
riskLevel: 'high',
recommendations: ['لطفاً یک دستور معتبر وارد کنید']
};
}

const normalizedCommand = command.trim().toLowerCase();
const validation = {
isValid: true,
error: null,
riskScore: 1,
riskLevel: 'low',
analysis: {},
recommendations: []
};

// 1. Check for empty or malicious commands
this.checkBasicValidity(normalizedCommand, validation);

// 2. Analyze command patterns
this.analyzeCommandPatterns(normalizedCommand, validation);

// 3. Check for sensitive paths
this.checkSensitivePaths(normalizedCommand, validation);

// 4. Check for sensitive extensions
this.checkSensitiveExtensions(normalizedCommand, validation);

// 5. Check admin privileges requirement
this.checkAdminRequirements(normalizedCommand, validation);

// 6. Environment-specific validation
this.validateEnvironmentSpecific(normalizedCommand, environment, validation);

// 7. Final risk assessment
this.finalizeRiskAssessment(validation);

// 8. Add to audit log
this.addToAuditLog(command, environment, validation);

return validation;
}

checkBasicValidity(command, validation) {
if (command.length === 0) {
validation.isValid = false;
validation.error = 'دستور خالی است';
validation.riskScore = 8;
return;
}

// Check for obvious malicious patterns
if (command.includes('&&') || command.includes('||') || command.includes(';')) {
validation.riskScore += 3;
validation.recommendations.push('از ترکیب دستورات پرهیز کنید');
}

if (command.includes('curl') || command.includes('wget') || command.includes('Invoke-WebRequest')) {
validation.riskScore += 2;
validation.recommendations.push('دانلود فایل‌ها فقط از منابع معتبر');
}

if (command.includes('http://') || command.includes('https://')) {
validation.riskScore += 2;
validation.recommendations.push('لینک‌های ناشناخته را باز نکنید');
}
}

analyzeCommandPatterns(command, validation) {
this.dangerousPatterns.forEach((pattern, index) => {
if (pattern.test(command)) {
const riskIncrease = this.getPatternRiskLevel(index);
validation.riskScore += riskIncrease;
validation.recommendations.push(`الگوی خطرناک شناسایی شد: ${pattern.toString()}`);

if (riskIncrease > 5) {
validation.isValid = false;
validation.error = 'دستور بسیار خطرناک شناسایی شد';
}
}
});
}

getPatternRiskLevel(patternIndex) {
if (patternIndex < 5) return 8; // High risk patterns
if (patternIndex < 10) return 5; // Medium risk patterns
return 2; // Low risk patterns
}

checkSensitivePaths(command, validation) {
this.sensitivePaths.forEach(path => {
if (command.includes(path.toLowerCase())) {
validation.riskScore += 3;
validation.recommendations.push(`مسیر حساس شناسایی شد: ${path}`);
}
});
}

checkSensitiveExtensions(command, validation) {
this.sensitiveExtensions.forEach(ext => {
if (command.includes(ext)) {
validation.riskScore += 2;
validation.recommendations.push(`پسوند فایل خطرناک شناسایی شد: ${ext}`);
}
});
}

checkAdminRequirements(command, validation) {
this.adminCommands.forEach(adminCmd => {
if (command.includes(adminCmd.toLowerCase())) {
validation.riskScore += 4;
validation.requiresAdmin = true;
validation.recommendations.push('این دستور نیاز به دسترسی ادمین دارد');
}
});
}

validateEnvironmentSpecific(command, environment, validation) {
switch (environment.toLowerCase()) {
case 'cmd':
this.validateCmdSpecific(command, validation);
break;
case 'powershell':
this.validatePowerShellSpecific(command, validation);
break;
case 'run':
this.validateRunSpecific(command, validation);
break;
default:
validation.riskScore += 1;
validation.recommendations.push('محیط اجرا ناشناخته است');
}
}

validateCmdSpecific(command, validation) {
// CMD specific validations
if (command.includes('del /s /q') || command.includes('rd /s /q')) {
validation.riskScore += 4;
validation.recommendations.push('حذف بازگشت‌ناپذیر فایل‌ها');
}

if (command.includes('format') && !command.includes('format /?')) {
validation.riskScore += 9;
validation.isValid = false;
validation.error = 'فرمت کردن دیسک بسیار خطرناک است';
}
}

validatePowerShellSpecific(command, validation) {
// PowerShell specific validations
if (command.includes('invoke-webrequest') || command.includes('iwr')) {
validation.riskScore += 3;
validation.recommendations.push('دانلود از اینترنت با احتیاط انجام شود');
}

if (command.includes('set-executionpolicy') || command.includes('executionpolicy')) {
validation.riskScore += 6;
validation.recommendations.push('تغییر سیاست اجرایی بسیار خطرناک است');
}

if (command.includes('bypass') || command.includes('-ep bypass')) {
validation.riskScore += 8;
validation.isValid = false;
validation.error = 'اجرای با حذف محدودیت‌های امنیتی ممنوع است';
}
}

validateRunSpecific(command, validation) {
// Run dialog specific validations
if (command.includes('regedit') || command.includes('reg.exe')) {
validation.riskScore += 10;
validation.isValid = false;
validation.error = 'ویرایش رجیستری بسیار خطرناک است';
}

if (command.includes('gpedit.msc') || command.includes('secpol.msc')) {
validation.riskScore += 9;
validation.recommendations.push('تغییر سیاست‌های گروهی نیاز به تأیید دارد');
}

if (command.includes('cmd.exe') || command.includes('powershell.exe')) {
validation.riskScore += 2;
validation.recommendations.push('اجرای خط فرمان از طریق Run');
}
}

finalizeRiskAssessment(validation) {
// Cap risk score at 10
validation.riskScore = Math.min(10, validation.riskScore);

// Determine risk level
if (validation.riskScore >= 7) {
validation.riskLevel = 'high';
} else if (validation.riskScore >= 4) {
validation.riskLevel = 'medium';
} else {
validation.riskLevel = 'low';
}

// Add final recommendations
if (validation.riskScore > 3) {
validation.recommendations.push('پیشنهاد می‌شود ابتدا در محیط تست امتحان کنید');
}

if (validation.requiresAdmin) {
validation.recommendations.push('این دستور نیاز به دسترسی مدیریت دارد');
}

// If risk is too high, invalidate command
if (validation.riskScore > 8 && validation.isValid) {
validation.isValid = false;
validation.error = 'ریسک دستور بسیار بالا است. اجرای آن توصیه نمی‌شود';
}
}

addToAuditLog(command, environment, validation) {
const auditEntry = {
timestamp: new Date().toISOString(),
command: command,
environment: environment,
riskScore: validation.riskScore,
riskLevel: validation.riskLevel,
isValid: validation.isValid,
error: validation.error,
recommendations: validation.recommendations
};

this.auditLog.push(auditEntry);

// Keep audit log size manageable
if (this.auditLog.length > this.maxAuditEntries) {
this.auditLog.shift();
}

// Save to localStorage
this.saveAuditLog();
}

saveAuditLog() {
try {
localStorage.setItem('arka-command-audit', JSON.stringify(this.auditLog));
} catch (error) {
console.error('Error saving audit log:', error);
// Clear old entries if storage is full
if (error.name === 'QuotaExceededError') {
this.auditLog = this.auditLog.slice(-50);
this.saveAuditLog();
}
}
}

loadAuditLog() {
try {
const saved = localStorage.getItem('arka-command-audit');
if (saved) {
this.auditLog = JSON.parse(saved);
console.log(`✅ Loaded ${this.auditLog.length} audit entries`);
}
} catch (error) {
console.error('Error loading audit log:', error);
this.auditLog = [];
}
}

loadWhitelistFromStorage() {
try {
const saved = localStorage.getItem('arka-command-whitelist');
if (saved) {
const whitelist = JSON.parse(saved);
this.whitelistedCommands = [...new Set([...this.whitelistedCommands, ...whitelist])];
console.log(`✅ Loaded ${this.whitelistedCommands.length} whitelisted commands`);
}
} catch (error) {
console.error('Error loading whitelist:', error);
}
}

saveWhitelistToStorage() {
try {
localStorage.setItem('arka-command-whitelist', JSON.stringify(this.whitelistedCommands));
} catch (error) {
console.error('Error saving whitelist:', error);
}
}

addToWhitelist(command) {
if (!this.whitelistedCommands.includes(command.toLowerCase())) {
this.whitelistedCommands.push(command.toLowerCase());
this.saveWhitelistToStorage();
console.log(`✅ Added to whitelist: ${command}`);
return true;
}
return false;
}

isWhitelisted(command) {
return this.whitelistedCommands.includes(command.toLowerCase().trim());
}

getAuditReport() {
const report = {
totalCommands: this.auditLog.length,
highRiskCommands: this.auditLog.filter(entry => entry.riskScore >= 7).length,
blockedCommands: this.auditLog.filter(entry => !entry.isValid).length,
lastCommand: this.auditLog[this.auditLog.length - 1] || null
};

return report;
}

exportAuditReport() {
try {
const report = this.getAuditReport();
const reportData = {
summary: report,
details: this.auditLog,
generatedAt: new Date().toISOString()
};

const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `arka-security-audit-${new Date().toISOString().replace(/[:,]/g, '-')}.json`;
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
URL.revokeObjectURL(url);
}, 100);

console.log('✅ Security audit report exported');
window.arcUtils?.trackEvent('Security', 'ExportAuditReport');
return true;
} catch (error) {
console.error('Error exporting audit report:', error);
return false;
}
}

clearAuditLog() {
this.auditLog = [];
this.saveAuditLog();
console.log('✅ Audit log cleared');
window.arcUtils?.trackEvent('Security', 'ClearAuditLog');
}

getSecurityStatus() {
const report = this.getAuditReport();
return {
status: report.highRiskCommands > 5 ? 'warning' : 'good',
message: report.highRiskCommands > 5 
? `⚠️ ${report.highRiskCommands} دستور پرخطر اجرا شده است`
: '✅ سیستم در وضعیت امنیتی خوبی است',
details: report
};
}

monitorSuspiciousActivity() {
// Real-time monitoring for suspicious patterns
setInterval(() => {
const status = this.getSecurityStatus();
if (status.status === 'warning') {
window.arcUtils?.showWarning('هشدار امنیتی: فعالیت‌های مشکوک شناسایی شده است');
}
}, 60000); // Check every minute
}

static initialize() {
window.arcValidator = new CommandValidator();
console.log('✅ Command Validator fully initialized');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', CommandValidator.initialize);
