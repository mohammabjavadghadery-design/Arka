class CommandExecutor {
constructor() {
this.isProcessing = false;
this.terminalElement = document.getElementById('quantum-terminal');
this.commandHistory = [];
this.undoStack = [];
this.init();
}

init() {
this.setupEventListeners();
this.updateStatus('آماده دریافت دستورات');
console.log('✅ Command Executor initialized');
}

setupEventListeners() {
const copyTerminal = document.getElementById('copy-terminal');
if (copyTerminal) {
copyTerminal.addEventListener('click', () => {
const terminalText = this.terminalElement.textContent;
window.arcUtils.copyToClipboard(terminalText, copyTerminal);
});
}

const clearTerminal = document.getElementById('clear-terminal');
if (clearTerminal) {
clearTerminal.addEventListener('click', () => {
this.terminalElement.innerHTML = '<div class="terminal-line info">ترمینال پاک شد</div>';
});
}

const downloadTerminal = document.getElementById('download-terminal');
if (downloadTerminal) {
downloadTerminal.addEventListener('click', () => {
this.downloadTerminalLog();
});
}

// Shell environment buttons
document.querySelectorAll('.shell-btn').forEach(btn => {
btn.addEventListener('click', () => {
const env = btn.dataset.env;
this.handleEnvironmentChange(env);
});
});

// Command filter
document.getElementById('command-filter')?.addEventListener('input', (e) => {
this.filterCommands(e.target.value);
});

// Risk level filters
document.querySelectorAll('.filter-btn').forEach(btn => {
btn.addEventListener('click', () => {
document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
btn.classList.add('active');
this.filterCommandsByRisk(btn.dataset.filter);
});
});
}

handleEnvironmentChange(environment) {
document.getElementById('environment-title').textContent = `دستورات ${environment}`;
document.getElementById('commands-section').style.display = 'block';
window.arcCommands.loadCommandsByEnvironment(environment);
window.arcUtils?.trackEvent('Commands', 'EnvironmentChange', environment);
}

executeCommand(command, environment = 'CMD', riskScore = 1) {
if (riskScore > 7) {
this.showConfirmationModal(command, environment, riskScore);
return;
}

if (riskScore > 4) {
this.showWarningModal(command, environment, riskScore);
return;
}

this.processCommand(command, environment, riskScore);
}

async processCommand(command, environment, riskScore) {
try {
this.appendToTerminal(`🚀 درخواست اجرای دستور: ${command}`, 'command');
this.appendToTerminal(`⚙️ محیط: ${environment}, ریسک: ${riskScore}/10`, 'info');

// Validate command
const validationResult = window.arcValidator?.validateCommand(command, environment);
if (validationResult && !validationResult.isValid) {
throw new Error(validationResult.error || 'دستور معتبر نیست');
}

// Create snapshot for undo
const snapshot = {
command: command,
environment: environment,
riskScore: riskScore,
timestamp: new Date(),
preState: await this.getSystemState()
};
this.undoStack.push(snapshot);

// Execute command (simulated for security)
this.simulateCommandExecution(command, environment, riskScore);

// Update command history
this.commandHistory.push({
command: command,
environment: environment,
riskScore: riskScore,
timestamp: new Date(),
result: 'success'
});

// Update command count
const commandCount = parseInt(document.getElementById('command-count')?.textContent || '0');
document.getElementById('command-count').textContent = commandCount + 1;

// Update status
this.updateStatus(`دستور اجرا شد: ${command.substring(0, 30)}...`);

// Create time travel snapshot
window.arcTimeTravel?.createSnapshot(command, 'دستور اجرا شد');
window.arcUtils?.trackEvent('Command', 'Execute', command);

} catch (error) {
console.error('Command execution error:', error);
this.appendToTerminal(`❌ خطا: ${error.message}`, 'error');
this.updateStatus('خطا در اجرای دستور', 'error');
window.arcUtils?.showError(`خطا در اجرای دستور: ${error.message}`);
}
}

simulateCommandExecution(command, environment, riskScore) {
this.appendToTerminal(`✅ دستور برای اجرا آماده شد`, 'success');
this.appendToTerminal(`📋 <strong>دستور:</strong> ${command}`, 'info');
this.appendToTerminal(`💡 <strong>راهنمای اجرا:</strong> این دستور را می‌توانید در ${environment} اجرا کنید`, 'warning');

// Simulate execution result
setTimeout(() => {
if (riskScore <= 3) {
this.appendToTerminal(`✨ نتیجه: دستور با موفقیت اجرا شد`, 'success');
this.appendToTerminal(`📊 خروجی نمونه:`, 'info');
this.appendToTerminal(`- فایل‌های پاک شده: 25 عدد`, 'success');
this.appendToTerminal(`- فضای آزاد شده: 150MB`, 'success');
} else if (riskScore <= 6) {
this.appendToTerminal(`⚠️ توجه: دستور با موفقیت اجرا شد اما نیاز به بررسی دارد`, 'warning');
this.appendToTerminal(`🔍 توصیه: وضعیت سیستم را بررسی کنید`, 'info');
} else {
this.appendToTerminal(`🚨 هشدار: دستور اجرا شد. سیستم در حالت نظارت است`, 'warning');
this.appendToTerminal(`⏱️ زمان نظارت: 5 دقیقه`, 'info');
}

// Play success sound
window.arcAudio?.success();
}, 1000);
}

showConfirmationModal(command, environment, riskScore) {
const modal = document.getElementById('confirmation-modal');
const backdrop = document.getElementById('focus-backdrop');
if (!modal || !backdrop) return;

document.getElementById('confirmation-command').textContent = command;
const warningText = document.getElementById('confirmation-warning');
warningText.textContent = `این دستور با ریسک ${riskScore}/10 همراه است. آرکا دستورات را به صورت مستقیم اجرا نمی‌کند، بلکه فقط دستور را برای شما نمایش می‌دهد.`;

const safetySteps = document.getElementById('safety-steps');
safetySteps.innerHTML = '';
const steps = [
'این دستور را فقط در صورتی اجرا کنید که می‌دانید چه کاری انجام می‌دهد',
'برای دستورات پرخطر، ابتدا در محیط تست امتحان کنید',
'همیشه قبل از اجرای دستورات حساس، از داده‌های مهم بکاپ بگیرید',
`ریسک این دستور: ${riskScore}/10 (سطح ${riskScore >= 8 ? 'بسیار بالا' : riskScore >= 5 ? 'متوسط' : 'پایین'})`
];
steps.forEach(step => {
const li = document.createElement('li');
li.textContent = step;
safetySteps.appendChild(li);
});

backdrop.style.display = 'block';
modal.style.display = 'flex';

document.getElementById('close-confirmation').addEventListener('click', () => {
backdrop.style.display = 'none';
modal.style.display = 'none';
}, { once: true });

document.getElementById('cancel-execute').addEventListener('click', () => {
backdrop.style.display = 'none';
modal.style.display = 'none';
this.appendToTerminal(`⏹️ اجرای دستور لغو شد`, 'warning');
}, { once: true });

const confirmBtn = document.getElementById('confirm-execute');
confirmBtn.innerHTML = '<i class="fas fa-copy"></i> کپی دستور';
confirmBtn.className = 'confirm-btn btn-primary';
let isHolding = false;
let holdProgress = 0;
const holdProgressBar = document.getElementById('hold-progress');

const startHold = () => {
isHolding = true;
holdProgress = 0;
holdProgressBar.style.width = '0%';
const interval = setInterval(() => {
if (!isHolding) {
clearInterval(interval);
return;
}
holdProgress += 2;
holdProgressBar.style.width = `${holdProgress}%`;
if (holdProgress >= 100) {
clearInterval(interval);
this.processCommand(command, environment, riskScore);
backdrop.style.display = 'none';
modal.style.display = 'none';
}
}, 30);
};

const stopHold = () => {
isHolding = false;
holdProgress = 0;
holdProgressBar.style.width = '0%';
};

confirmBtn.addEventListener('mousedown', startHold);
confirmBtn.addEventListener('mouseup', stopHold);
confirmBtn.addEventListener('mouseleave', stopHold);
}

showWarningModal(command, environment, riskScore) {
this.appendToTerminal(`⚠️ هشدار: این دستور دارای ریسک ${riskScore}/10 است`, 'warning');
this.appendToTerminal(`🎯 توصیه: برای اجرای ایمن، لطفاً دستور را در محیط تست امتحان کنید`, 'info');

// Show visual warning
const warningElement = document.createElement('div');
warningElement.className = 'command-warning';
warningElement.innerHTML = `
<div class="warning-content">
<i class="fas fa-exclamation-triangle warning-icon"></i>
<h4>هشدار امنیتی</h4>
<p>دستور "${command.substring(0, 40)}..." دارای ریسک ${riskScore}/10 است.</p>
<button class="warning-confirm">تایید و ادامه</button>
<button class="warning-cancel">لغو</button>
</div>
`;
this.terminalElement.appendChild(warningElement);

document.querySelector('.warning-confirm').addEventListener('click', () => {
warningElement.remove();
this.processCommand(command, environment, riskScore);
});

document.querySelector('.warning-cancel').addEventListener('click', () => {
warningElement.remove();
this.appendToTerminal(`⏹️ اجرای دستور لغو شد`, 'warning');
});
}

appendToTerminal(text, type = 'info') {
if (!this.terminalElement) return;

const line = document.createElement('div');
line.className = `terminal-line ${type}`;
line.innerHTML = `
<span class="timestamp">${new Date().toLocaleTimeString('fa-IR')}</span>
${text.replace(/[<>&]/g, (c) => {
return {'<': '&lt;', '>': '&gt;', '&': '&amp;'}[c];
})}
`;
this.terminalElement.appendChild(line);
this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
}

updateStatus(message, statusClass = 'connected') {
const statusElement = document.querySelector('.status-bar .status-item:first-child span');
if (statusElement) {
statusElement.textContent = message;
const dot = document.querySelector('.status-bar .status-dot');
if (dot) {
dot.className = 'status-dot';
dot.classList.add(statusClass);
}
}
}

downloadTerminalLog() {
const logText = this.terminalElement.textContent;
const blob = new Blob([logText], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `arka-terminal-log-${new Date().toISOString().replace(/[:,]/g, '-')}.txt`;
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
URL.revokeObjectURL(url);
}, 100);
window.arcUtils?.trackEvent('Terminal', 'DownloadLog');
}

async getSystemState() {
// Simulate getting system state
return {
cpuUsage: Math.floor(Math.random() * 100),
memoryUsage: Math.floor(Math.random() * 100),
diskSpace: Math.floor(Math.random() * 500),
runningProcesses: Math.floor(Math.random() * 50),
timestamp: new Date().toISOString()
};
}

undoLastCommand() {
if (this.undoStack.length === 0) {
this.appendToTerminal(`❌ خطای بازگشت: تاریخچه خالی است`, 'error');
return;
}

const lastSnapshot = this.undoStack.pop();
this.appendToTerminal(`⏪ بازگشت از دستور: ${lastSnapshot.command}`, 'warning');
this.appendToTerminal(`🔄 سیستم در حال بازگشت به حالت قبلی...`, 'info');

// Simulate undo process
setTimeout(() => {
this.appendToTerminal(`✅ بازگشت با موفقیت انجام شد`, 'success');
this.updateStatus('بازگشت انجام شد');
window.arcUtils?.showSuccess('بازگشت از آخرین دستور با موفقیت انجام شد');
}, 1500);
}

clearHistory() {
this.commandHistory = [];
this.undoStack = [];
this.appendToTerminal(`🗑️ تاریخچه دستورات پاک شد`, 'info');
document.getElementById('command-count').textContent = '0';
window.arcUtils?.showInfo('تاریخچه دستورات پاک شد');
}

filterCommands(query) {
query = query.toLowerCase().trim();
const environmentTitle = document.getElementById('environment-title').textContent;
const environment = environmentTitle.includes('CMD') ? 'CMD' : 
environmentTitle.includes('PowerShell') ? 'PowerShell' : 'Run';

const commands = window.arcCommands.searchCommands(query, environment);
this.displayCommands(commands);
}

filterCommandsByRisk(riskLevel) {
const environmentTitle = document.getElementById('environment-title').textContent;
const environment = environmentTitle.includes('CMD') ? 'CMD' : 
environmentTitle.includes('PowerShell') ? 'PowerShell' : 'Run';

let commands = window.arcCommands.getCommandsByEnvironment(environment);

if (riskLevel === 'low') {
commands = commands.filter(cmd => cmd.riskScore <= 3);
} else if (riskLevel === 'medium') {
commands = commands.filter(cmd => cmd.riskScore > 3 && cmd.riskScore <= 6);
} else if (riskLevel === 'high') {
commands = commands.filter(cmd => cmd.riskScore > 6);
}

this.displayCommands(commands);
}

displayCommands(commands) {
const grid = document.getElementById('commands-grid');
if (!grid) return;

grid.innerHTML = '';

if (commands.length === 0) {
grid.innerHTML = `
<div class="no-commands">
<i class="fas fa-search"></i>
<p>هیچ دستوری پیدا نشد</p>
<p>لطفاً عبارت جستجو را تغییر دهید یا فیلترها را تنظیم کنید</p>
</div>
`;
return;
}

commands.forEach(command => {
const card = document.createElement('div');
card.className = `command-card glass-card ${command.environment?.toLowerCase()}-card`;
card.innerHTML = `
<div class="command-header">
<h3 class="command-title">
<i class="fas fa-terminal"></i>
<span>${command.name}</span>
<span class="risk-indicator risk-${command.riskLevel}">${command.riskScore}/10</span>
</h3>
<span class="command-env-badge">${command.environment || 'CMD'}</span>
</div>
<div class="command-description">
<p>${command.description}</p>
</div>
<div class="command-code">
<code>${command.command}</code>
</div>
<div class="command-actions">
<button class="copy-btn" data-command="${command.command}">
<i class="fas fa-copy"></i> کپی
</button>
<button class="execute-btn" data-command="${command.command}" 
data-env="${command.environment || 'CMD'}" 
data-risk="${command.riskScore}">
<i class="fas fa-play"></i> اجرا
</button>
</div>
`;

card.addEventListener('click', () => {
this.showCommandDetails(command);
});

card.querySelector('.copy-btn')?.addEventListener('click', (e) => {
e.stopPropagation();
const cmd = e.target.closest('button').dataset.command;
window.arcUtils.copyToClipboard(cmd, e.target.closest('button'));
});

card.querySelector('.execute-btn')?.addEventListener('click', (e) => {
e.stopPropagation();
const cmd = e.target.closest('button').dataset.command;
const env = e.target.closest('button').dataset.env;
const risk = parseInt(e.target.closest('button').dataset.risk);
this.executeCommand(cmd, env, risk);
});

grid.appendChild(card);
});

// Add event listeners to new elements
document.querySelectorAll('.copy-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
const command = e.target.closest('button').dataset.command;
window.arcUtils.copyToClipboard(command, e.target.closest('button'));
});
});

document.querySelectorAll('.execute-btn').forEach(btn => {
btn.addEventListener('click', (e) => {
const command = e.target.closest('button').dataset.command;
const environment = e.target.closest('button').dataset.env;
const riskScore = parseInt(e.target.closest('button').dataset.risk);
this.executeCommand(command, environment, riskScore);
});
});
}

showCommandDetails(command) {
const backdrop = document.getElementById('focus-backdrop');
const panel = document.getElementById('focus-panel');
if (!backdrop || !panel) return;

document.getElementById('focus-title').innerHTML = `
<i class="fas fa-info-circle"></i>
<span>${command.name}</span>
<span class="command-env-detail">${command.environment || 'CMD'}</span>
`;

document.getElementById('focus-command').textContent = command.command;
document.getElementById('focus-description').innerHTML = `
<p>${command.description}</p>
<div class="command-category">
<i class="fas fa-tag"></i>
<span>دسته‌بندی: ${command.category || 'عمومی'}</span>
</div>
<div class="command-example">
<i class="fas fa-code"></i>
<span>مثال: ${command.example || command.command}</span>
</div>
`;

const riskIndicator = document.getElementById('focus-risk');
riskIndicator.className = `risk-indicator risk-${command.riskLevel}`;
riskIndicator.innerHTML = `
<div class="risk-level">
<i class="fas fa-shield-alt"></i>
<span>سطح ریسک: <strong>${command.riskScore}/10</strong></span>
</div>
<div class="risk-description">${this.getRiskDescription(command.riskScore)}</div>
`;

const warnings = document.getElementById('focus-warnings');
warnings.innerHTML = '';
command.safetyInfo.split('⚠️').forEach((warning, index) => {
if (warning.trim()) {
const li = document.createElement('li');
li.innerHTML = index === 0 ? warning.trim() : `⚠️ ${warning.trim()}`;
warnings.appendChild(li);
}
});

if (command.undoCommand) {
document.getElementById('focus-undo').textContent = command.undoCommand;
} else {
document.getElementById('focus-undo').textContent = 'بازگشت دستی ممکن است نیاز باشد';
}

backdrop.style.display = 'block';
panel.style.display = 'block';

document.getElementById('close-focus').addEventListener('click', () => {
backdrop.style.display = 'none';
panel.style.display = 'none';
}, { once: true });

document.getElementById('focus-copy').addEventListener('click', () => {
window.arcUtils.copyToClipboard(command.command, document.getElementById('focus-copy'));
});

document.getElementById('focus-execute').addEventListener('click', () => {
this.executeCommand(command.command, command.environment || 'CMD', command.riskScore);
backdrop.style.display = 'none';
panel.style.display = 'none';
});
}

getRiskDescription(score) {
if (score <= 3) return 'این دستور بسیار ایمن است و خطری برای سیستم ندارد';
if (score <= 6) return 'این دستور دارای ریسک متوسط است. با احتیاط استفاده کنید';
return 'این دستور بسیار پرخطر است. فقط در صورتی استفاده کنید که کاملاً مطمئن هستید';
}

static initialize() {
window.arcExecutor = new CommandExecutor();
console.log('✅ Command Executor fully initialized');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', CommandExecutor.initialize);
