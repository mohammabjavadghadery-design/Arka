class SecuritySandbox {
constructor() {
this.sandboxContainer = null;
this.executionTimeout = 5000; // 5 seconds
this.maxOutputSize = 1024 * 100; // 100KB
this.memoryLimit = 100 * 1024 * 1024; // 100MB
this.cpuLimit = 50; // 50% CPU usage
this.allowedCommands = [];
this.blockedCommands = [];
this.executionHistory = [];
this.securityLevel = 'high'; // 'low', 'medium', 'high'
this.init();
}

init() {
this.createSandboxContainer();
this.loadSecurityPolicies();
this.setupEventListeners();
console.log('✅ Security Sandbox initialized');
}

createSandboxContainer() {
// Create an iframe for sandboxing
this.sandboxContainer = document.createElement('iframe');
this.sandboxContainer.id = 'arka-security-sandbox';
this.sandboxContainer.style.display = 'none';
this.sandboxContainer.sandbox = 'allow-scripts allow-same-origin';
this.sandboxContainer.src = 'about:blank';
document.body.appendChild(this.sandboxContainer);

// Setup sandbox communication
this.setupSandboxCommunication();
}

setupSandboxCommunication() {
window.addEventListener('message', (event) => {
if (event.origin !== window.location.origin) return;

switch (event.data.type) {
case 'sandbox-ready':
console.log('✅ Sandbox iframe is ready');
break;
case 'command-executed':
this.handleCommandResult(event.data);
break;
case 'command-error':
this.handleCommandError(event.data);
break;
case 'resource-limit-exceeded':
this.handleResourceLimitExceeded(event.data);
break;
}
});
}

loadSecurityPolicies() {
// Load security policies from storage
try {
const policies = JSON.parse(localStorage.getItem('arka-security-policies')) || {
allowedCommands: ['ipconfig', 'ping', 'dir', 'cls', 'help'],
blockedCommands: ['format', 'del /s /q', 'rm -rf', 'reg delete'],
securityLevel: 'high',
executionTimeout: 5000,
maxOutputSize: 102400
};

this.allowedCommands = policies.allowedCommands;
this.blockedCommands = policies.blockedCommands;
this.securityLevel = policies.securityLevel;
this.executionTimeout = policies.executionTimeout;
this.maxOutputSize = policies.maxOutputSize;

console.log('✅ Security policies loaded');
} catch (error) {
console.error('Error loading security policies:', error);
}
}

saveSecurityPolicies() {
const policies = {
allowedCommands: this.allowedCommands,
blockedCommands: this.blockedCommands,
securityLevel: this.securityLevel,
executionTimeout: this.executionTimeout,
maxOutputSize: this.maxOutputSize
};

localStorage.setItem('arka-security-policies', JSON.stringify(policies));
}

setupEventListeners() {
// Security level change
document.getElementById('security-level')?.addEventListener('change', (e) => {
this.securityLevel = e.target.value;
this.saveSecurityPolicies();
window.arcUtils?.trackEvent('Security', 'LevelChange', this.securityLevel);
});

// Add allowed command
document.getElementById('add-allowed-command')?.addEventListener('click', () => {
const command = document.getElementById('allowed-command-input').value.trim();
if (command && !this.allowedCommands.includes(command)) {
this.allowedCommands.push(command);
this.saveSecurityPolicies();
this.updateSecurityUI();
window.arcUtils?.trackEvent('Security', 'AddAllowedCommand', command);
}
});

// Add blocked command
document.getElementById('add-blocked-command')?.addEventListener('click', () => {
const command = document.getElementById('blocked-command-input').value.trim();
if (command && !this.blockedCommands.includes(command)) {
this.blockedCommands.push(command);
this.saveSecurityPolicies();
this.updateSecurityUI();
window.arcUtils?.trackEvent('Security', 'AddBlockedCommand', command);
});
}

executeCommandSafely(command, environment = 'CMD', options = {}) {
return new Promise((resolve, reject) => {
// Validate command before execution
const validationResult = window.arcValidator?.validateCommand(command, environment);
if (validationResult && !validationResult.isValid) {
reject(new Error(validationResult.error || 'دستور نامعتبر است'));
return;
}

// Check if command is blocked
if (this.isCommandBlocked(command)) {
reject(new Error('این دستور به دلایل امنیتی مسدود شده است'));
return;
}

// Check if command is allowed (in strict mode)
if (this.securityLevel === 'high' && !this.isCommandAllowed(command)) {
reject(new Error('این دستور در سطح امنیتی فعلی مجاز نیست'));
return;
}

// Create execution context
const executionId = this.generateExecutionId();
const executionContext = {
id: executionId,
command: command,
environment: environment,
options: options,
startTime: Date.now(),
timeout: this.executionTimeout,
maxOutputSize: this.maxOutputSize
};

// Add to execution history
this.executionHistory.push(executionContext);

// Send to sandbox
this.sandboxContainer.contentWindow.postMessage({
type: 'execute-command',
executionContext: executionContext,
securityLevel: this.securityLevel
}, '*');

// Set timeout
const timeoutId = setTimeout(() => {
this.handleTimeout(executionId);
reject(new Error('اجرای دستور به دلیل محدودیت زمانی متوقف شد'));
}, this.executionTimeout);

// Store timeout ID for cleanup
executionContext.timeoutId = timeoutId;
resolve(executionContext);
});
}

isCommandBlocked(command) {
return this.blockedCommands.some(blocked => 
command.toLowerCase().includes(blocked.toLowerCase())
);
}

isCommandAllowed(command) {
// In high security mode, only allow whitelisted commands
if (this.securityLevel === 'high') {
return this.allowedCommands.some(allowed => 
command.toLowerCase().startsWith(allowed.toLowerCase())
);
}
return true; // In lower security modes, allow all commands that pass validation
}

handleCommandResult(data) {
const executionContext = this.executionHistory.find(ctx => ctx.id === data.executionId);
if (!executionContext) return;

// Clear timeout
clearTimeout(executionContext.timeoutId);

// Process result
const result = {
success: true,
output: this.sanitizeOutput(data.output),
executionTime: Date.now() - executionContext.startTime,
memoryUsed: data.memoryUsed || 0,
cpuUsed: data.cpuUsed || 0
};

// Log execution
this.logExecution(executionContext, result);

// Play success sound
window.arcAudio?.success();

return result;
}

handleCommandError(data) {
const executionContext = this.executionHistory.find(ctx => ctx.id === data.executionId);
if (!executionContext) return;

// Clear timeout
clearTimeout(executionContext.timeoutId);

// Process error
const error = {
success: false,
error: this.sanitizeOutput(data.error),
executionTime: Date.now() - executionContext.startTime
};

// Log error
this.logExecution(executionContext, error);

// Play error sound
window.arcAudio?.error();

return error;
}

handleResourceLimitExceeded(data) {
const executionContext = this.executionHistory.find(ctx => ctx.id === data.executionId);
if (!executionContext) return;

// Clear timeout
clearTimeout(executionContext.timeoutId);

// Process resource limit error
const error = {
success: false,
error: `محدودیت منابع تجاوز شد: ${data.resourceType}`,
resourceType: data.resourceType,
limit: data.limit,
used: data.used,
executionTime: Date.now() - executionContext.startTime
};

// Log resource limit violation
this.logExecution(executionContext, error);

// Show warning
window.arcUtils?.showWarning(`⚠️ محدودیت ${data.resourceType} تجاوز شد. اجرای دستور متوقف شد.`);

return error;
}

handleTimeout(executionId) {
const executionContext = this.executionHistory.find(ctx => ctx.id === executionId);
if (!executionContext) return;

// Send timeout signal to sandbox
this.sandboxContainer.contentWindow.postMessage({
type: 'timeout-command',
executionId: executionId
}, '*');

// Log timeout
const error = {
success: false,
error: 'اجرای دستور به دلیل محدودیت زمانی متوقف شد',
executionTime: this.executionTimeout,
timeout: true
};

this.logExecution(executionContext, error);
}

sanitizeOutput(output) {
if (!output || typeof output !== 'string') return '';

// Remove dangerous content
return output
.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
.replace(/on\w+\s*=\s*"[^"]*"/g, '')
.replace(/javascript:/gi, '')
.replace(/data:/gi, '')
.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
.trim();
}

logExecution(executionContext, result) {
const logEntry = {
timestamp: new Date().toISOString(),
command: executionContext.command,
environment: executionContext.environment,
success: result.success,
executionTime: result.executionTime,
riskScore: executionContext.riskScore || 1,
outputSize: result.output?.length || 0,
error: result.error || null,
memoryUsed: result.memoryUsed || 0,
cpuUsed: result.cpuUsed || 0
};

// Add to execution history
executionContext.result = logEntry;

// Save to storage
this.saveExecutionHistory();

// Track event
window.arcUtils?.trackEvent('Security', 'CommandExecution', 
result.success ? 'success' : 'error', result.executionTime);

return logEntry;
}

saveExecutionHistory() {
// Keep only recent executions
const recentExecutions = this.executionHistory.slice(-100);
localStorage.setItem('arka-execution-history', JSON.stringify(recentExecutions));
}

loadExecutionHistory() {
try {
const saved = localStorage.getItem('arka-execution-history');
if (saved) {
this.executionHistory = JSON.parse(saved);
console.log(`✅ Loaded ${this.executionHistory.length} execution records`);
}
} catch (error) {
console.error('Error loading execution history:', error);
this.executionHistory = [];
}
}

generateExecutionId() {
return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

getCurrentResourceUsage() {
// Simulate resource usage monitoring
return {
memory: {
used: this.getRandomValue(10, 80),
limit: 100,
unit: 'MB'
},
cpu: {
used: this.getRandomValue(5, 60),
limit: 100,
unit: '%'
},
disk: {
used: this.getRandomValue(100, 400),
limit: 500,
unit: 'GB'
},
network: {
activeConnections: this.getRandomValue(10, 100),
bandwidth: this.getRandomValue(1, 100),
unit: 'Mbps'
}
};
}

getRandomValue(min, max) {
return Math.floor(Math.random() * (max - min + 1) + min);
}

getSecurityReport() {
const recentExecutions = this.executionHistory.slice(-50);
const successful = recentExecutions.filter(e => e.result?.success);
const failed = recentExecutions.filter(e => !e.result?.success);
const highRisk = recentExecutions.filter(e => e.result?.riskScore >= 7);

return {
totalExecutions: recentExecutions.length,
successful: successful.length,
failed: failed.length,
highRisk: highRisk.length,
averageExecutionTime: recentExecutions.reduce((sum, e) => sum + (e.result?.executionTime || 0), 0) / 
(recentExecutions.length || 1),
securityLevel: this.securityLevel,
resourceUsage: this.getCurrentResourceUsage()
};
}

updateSecurityUI() {
const report = this.getSecurityReport();
const securityStatus = document.getElementById('security-status');
if (securityStatus) {
securityStatus.innerHTML = `
<div class="security-summary">
<h4><i class="fas fa-shield-alt"></i> وضعیت امنیتی</h4>
<div class="security-metrics">
<div class="metric">
<span class="metric-label">اجرای موفق</span>
<span class="metric-value success">${report.successful}</span>
</div>
<div class="metric">
<span class="metric-label">اجرای ناموفق</span>
<span class="metric-value error">${report.failed}</span>
</div>
<div class="metric">
<span class="metric-label">دستورات پرخطر</span>
<span class="metric-value warning">${report.highRisk}</span>
</div>
<div class="metric">
<span class="metric-label">سطح امنیت</span>
<span class="metric-value ${report.securityLevel}">${report.securityLevel}</span>
</div>
</div>
</div>
`;
}
}

monitorSystemHealth() {
// Monitor system health and resource usage
setInterval(() => {
const resourceUsage = this.getCurrentResourceUsage();
const securityReport = this.getSecurityReport();

// Check for abnormal resource usage
if (resourceUsage.memory.used > 90 || resourceUsage.cpu.used > 80) {
window.arcUtils?.showWarning('⚠️ استفاده غیرعادی از منابع سیستم شناسایی شد');
}

// Check for too many failed executions
if (securityReport.failed > 10) {
window.arcUtils?.showError('🚨 تعداد زیادی اجرای ناموفق. ممکن است حمله باشد');
}

// Update UI
this.updateSecurityUI();
}, 30000); // Check every 30 seconds
}

exportSecurityReport() {
try {
const report = this.getSecurityReport();
const fullReport = {
summary: report,
executionHistory: this.executionHistory.slice(-100),
securityPolicies: {
allowedCommands: this.allowedCommands,
blockedCommands: this.blockedCommands,
securityLevel: this.securityLevel,
executionTimeout: this.executionTimeout,
maxOutputSize: this.maxOutputSize
},
generatedAt: new Date().toISOString()
};

const blob = new Blob([JSON.stringify(fullReport, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `arka-security-report-${new Date().toISOString().replace(/[:,]/g, '-')}.json`;
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
URL.revokeObjectURL(url);
}, 100);

console.log('✅ Security report exported');
window.arcUtils?.trackEvent('Security', 'ExportReport');
return true;
} catch (error) {
console.error('Error exporting security report:', error);
return false;
}
}

resetSecuritySettings() {
if (confirm('آیا مطمئن هستید که می‌خواهید تنظیمات امنیتی را به حالت پیش‌فرض بازنشانی کنید؟')) {
this.allowedCommands = ['ipconfig', 'ping', 'dir', 'cls', 'help'];
this.blockedCommands = ['format', 'del /s /q', 'rm -rf', 'reg delete'];
this.securityLevel = 'high';
this.executionTimeout = 5000;
this.maxOutputSize = 102400;
this.saveSecurityPolicies();
this.updateSecurityUI();
window.arcUtils?.showSuccess('تنظیمات امنیتی بازنشانی شد');
window.arcUtils?.trackEvent('Security', 'ResetSettings');
}
}

// Add security badge to UI
addSecurityBadge() {
const badge = document.createElement('div');
badge.className = 'security-badge';
badge.innerHTML = `
<div class="badge-content">
<i class="fas fa-shield-alt"></i>
<span class="badge-level">${this.securityLevel}</span>
<span class="badge-status">فعال</span>
</div>
<div class="badge-tooltip">
وضعیت امنیتی فعلی: ${this.securityLevel.toUpperCase()}<br>
تمام دستورات تحت نظارت هستند
</div>
`;
document.body.appendChild(badge);

// Add hover effect
badge.addEventListener('mouseenter', () => {
badge.querySelector('.badge-tooltip').style.display = 'block';
});
badge.addEventListener('mouseleave', () => {
badge.querySelector('.badge-tooltip').style.display = 'none';
});
}

static initialize() {
window.arcSandbox = new SecuritySandbox();
console.log('✅ Security Sandbox fully initialized');

// Add security badge to UI
setTimeout(() => {
window.arcSandbox.addSecurityBadge();
}, 1000);
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', SecuritySandbox.initialize);
