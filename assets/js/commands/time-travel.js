class TimeTravelSystem {
constructor() {
this.snapshots = [];
this.maxSnapshots = 50;
this.autoSnapshotInterval = 300000; // 5 minutes
this.init();
}

init() {
this.loadSnapshots();
this.startAutoSnapshot();
console.log('✅ Time Travel System initialized');
}

createSnapshot(command, description = '') {
const snapshot = {
id: this.generateId(),
command: command,
description: description,
timestamp: new Date(),
systemState: this.getCurrentSystemState(),
commandCount: this.snapshots.length + 1
};

this.snapshots.push(snapshot);
this.saveSnapshots();

// Keep only recent snapshots
if (this.snapshots.length > this.maxSnapshots) {
this.snapshots = this.snapshots.slice(-this.maxSnapshots);
}

console.log(`📸 Snapshot created: ${command}`);
window.arcUtils?.trackEvent('TimeTravel', 'Snapshot', command);
return snapshot;
}

getCurrentSystemState() {
// Get current system information
return {
cpuUsage: this.getRandomValue(10, 90),
memoryUsage: this.getRandomValue(20, 85),
diskSpace: this.getRandomValue(50, 500),
runningProcesses: this.getRandomValue(20, 100),
networkStatus: Math.random() > 0.2,
temperature: this.getRandomValue(40, 80),
timestamp: new Date().toISOString()
};
}

getRandomValue(min, max) {
return Math.floor(Math.random() * (max - min + 1) + min);
}

saveSnapshots() {
try {
localStorage.setItem('arka-snapshots', JSON.stringify(this.snapshots));
} catch (error) {
console.error('Error saving snapshots:', error);
// If localStorage is full, keep only recent snapshots
if (error.name === 'QuotaExceededError') {
this.snapshots = this.snapshots.slice(-25);
this.saveSnapshots();
}
}
}

loadSnapshots() {
try {
const saved = localStorage.getItem('arka-snapshots');
if (saved) {
this.snapshots = JSON.parse(saved);
console.log(`✅ Loaded ${this.snapshots.length} snapshots from storage`);
}
} catch (error) {
console.error('Error loading snapshots:', error);
this.snapshots = [];
}
}

getSnapshots() {
return [...this.snapshots].sort((a, b) => b.timestamp - a.timestamp);
}

getSnapshotById(id) {
return this.snapshots.find(snapshot => snapshot.id === id);
}

getRecentSnapshots(limit = 10) {
return this.getSnapshots().slice(0, limit);
}

undoToSnapshot(id) {
const snapshot = this.getSnapshotById(id);
if (!snapshot) {
console.error('Snapshot not found');
return null;
}

console.log(`⏪ Undoing to snapshot: ${snapshot.command}`);
window.arcUtils?.trackEvent('TimeTravel', 'Undo', snapshot.command);

// Simulate undo process
return {
success: true,
snapshot: snapshot,
message: `سیستم به حالت قبل از اجرای "${snapshot.command}" بازگشت`
};
}

clearAllSnapshots() {
this.snapshots = [];
this.saveSnapshots();
console.log('✅ All snapshots cleared');
window.arcUtils?.trackEvent('TimeTravel', 'ClearAll');
}

generateId() {
return `snap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

startAutoSnapshot() {
// Create auto snapshot every 5 minutes
setInterval(() => {
this.createSnapshot('auto-snapshot', 'اسنپ‌شات خودکار برای بازگشت سریع');
}, this.autoSnapshotInterval);
}

getLastSnapshot() {
return this.snapshots[this.snapshots.length - 1] || null;
}

getSnapshotTimeline() {
return this.getSnapshots().map(snapshot => ({
time: new Date(snapshot.timestamp).toLocaleTimeString('fa-IR'),
command: snapshot.command,
description: snapshot.description
}));
}

restoreFromBackup(backupData) {
try {
this.snapshots = JSON.parse(backupData);
this.saveSnapshots();
console.log(`✅ Restored ${this.snapshots.length} snapshots from backup`);
window.arcUtils?.showSuccess(`بکاپ با موفقیت بازیابی شد (${this.snapshots.length} اسنپ‌شات)`);
return true;
} catch (error) {
console.error('Error restoring backup:', error);
window.arcUtils?.showError('خطا در بازیابی بکاپ');
return false;
}
}

exportBackup() {
try {
const backupData = JSON.stringify(this.snapshots);
const blob = new Blob([backupData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `arka-snapshots-backup-${new Date().toISOString().replace(/[:,]/g, '-')}.json`;
document.body.appendChild(a);
a.click();
setTimeout(() => {
document.body.removeChild(a);
URL.revokeObjectURL(url);
}, 100);
console.log('✅ Backup exported successfully');
window.arcUtils?.trackEvent('TimeTravel', 'ExportBackup');
return true;
} catch (error) {
console.error('Error exporting backup:', error);
window.arcUtils?.showError('خطا در ایجاد بکاپ');
return false;
}
}

compareSnapshots(id1, id2) {
const snapshot1 = this.getSnapshotById(id1);
const snapshot2 = this.getSnapshotById(id2);

if (!snapshot1 || !snapshot2) {
return null;
}

const diff = {};
const keys = ['cpuUsage', 'memoryUsage', 'diskSpace', 'runningProcesses', 'temperature'];

keys.forEach(key => {
const val1 = snapshot1.systemState[key];
const val2 = snapshot2.systemState[key];
if (val1 !== val2) {
diff[key] = {
before: val1,
after: val2,
change: val2 - val1,
percentage: Math.round(((val2 - val1) / val1) * 100)
};
}
});

return {
snapshot1,
snapshot2,
diff,
summary: `مقایسه اسنپ‌شات‌ها: ${snapshot1.command} vs ${snapshot2.command}`
};
}

getPerformanceTrend() {
if (this.snapshots.length < 2) return null;

const recent = this.getRecentSnapshots(5);
const trends = {
cpu: [],
memory: [],
disk: [],
processes: []
};

recent.forEach(snapshot => {
trends.cpu.push(snapshot.systemState.cpuUsage);
trends.memory.push(snapshot.systemState.memoryUsage);
trends.disk.push(snapshot.systemState.diskSpace);
trends.processes.push(snapshot.systemState.runningProcesses);
});

return {
cpuTrend: this.calculateTrend(trends.cpu),
memoryTrend: this.calculateTrend(trends.memory),
diskTrend: this.calculateTrend(trends.disk),
processesTrend: this.calculateTrend(trends.processes),
snapshotCount: recent.length
};
}

calculateTrend(values) {
if (values.length < 2) return 0;
const first = values[0];
const last = values[values.length - 1];
return Math.round(((last - first) / first) * 100);
}

showTimeTravelPanel() {
const panel = document.createElement('div');
panel.className = 'time-travel-panel glass-card';
panel.innerHTML = `
<div class="panel-header">
<h3><i class="fas fa-history"></i> سفر در زمان - تاریخچه دستورات</h3>
<button class="close-panel">&times;</button>
</div>
<div class="panel-content">
<div class="timeline-controls">
<button class="btn btn-primary" id="export-backup">
<i class="fas fa-download"></i> دانلود بکاپ
</button>
<button class="btn btn-warning" id="clear-history">
<i class="fas fa-trash"></i> پاک کردن تاریخچه
</button>
<span class="snapshot-count">تعداد اسنپ‌شات‌ها: ${this.snapshots.length}</span>
</div>
<div class="timeline-container" id="timeline-container">
${this.renderTimeline()}
</div>
<div class="snapshot-details" id="snapshot-details">
<div class="details-placeholder">
<i class="fas fa-info-circle"></i>
<p>برای مشاهده جزئیات، روی یک نقطه در خط زمان کلیک کنید</p>
</div>
</div>
</div>
`;
document.body.appendChild(panel);

// Add event listeners
document.querySelector('.close-panel').addEventListener('click', () => {
panel.remove();
});

document.getElementById('export-backup').addEventListener('click', () => {
this.exportBackup();
});

document.getElementById('clear-history').addEventListener('click', () => {
if (confirm('آیا مطمئن هستید که می‌خواهید تمام تاریخچه را پاک کنید؟ این عمل غیرقابل بازگشت است.')) {
this.clearAllSnapshots();
panel.querySelector('.snapshot-count').textContent = `تعداد اسنپ‌شات‌ها: 0`;
document.getElementById('timeline-container').innerHTML = '<p class="no-snapshots">تاریخچه خالی است</p>';
document.getElementById('snapshot-details').innerHTML = `
<div class="details-placeholder">
<i class="fas fa-history"></i>
<p>تاریخچه پاک شد. اسنپ‌شات‌های جدید به صورت خودکار ایجاد خواهند شد</p>
</div>
`;
window.arcUtils?.showSuccess('تاریخچه با موفقیت پاک شد');
}
});

// Timeline click handler
document.querySelectorAll('.timeline-point').forEach(point => {
point.addEventListener('click', () => {
const snapshotId = point.dataset.id;
this.showSnapshotDetails(snapshotId);
});
});
}

renderTimeline() {
if (this.snapshots.length === 0) {
return '<p class="no-snapshots">تاریخچه خالی است. دستورات اجرا شده به صورت خودکار ذخیره می‌شوند</p>';
}

const recent = this.getRecentSnapshots(20);
let timelineHTML = '<div class="timeline">';

recent.forEach((snapshot, index) => {
const time = new Date(snapshot.timestamp).toLocaleTimeString('fa-IR');
const riskLevel = this.assessCommandRisk(snapshot.command);
timelineHTML += `
<div class="timeline-point ${riskLevel}" data-id="${snapshot.id}" title="${snapshot.command}">
<div class="point-time">${time}</div>
<div class="point-command">${snapshot.command.substring(0, 20)}${snapshot.command.length > 20 ? '...' : ''}</div>
<div class="point-tooltip">${snapshot.description}</div>
</div>
`;
});

timelineHTML += '</div>';
return timelineHTML;
}

assessCommandRisk(command) {
if (!command) return 'low';
command = command.toLowerCase();
if (command.includes('format') || command.includes('delete') || command.includes('remove') || command.includes('erase')) {
return 'high';
}
if (command.includes('clean') || command.includes('clear') || command.includes('restart') || command.includes('shutdown')) {
return 'medium';
}
return 'low';
}

showSnapshotDetails(snapshotId) {
const snapshot = this.getSnapshotById(snapshotId);
if (!snapshot) return;

const detailsElement = document.getElementById('snapshot-details');
if (!detailsElement) return;

let detailsHTML = `
<div class="snapshot-header">
<h4><i class="fas fa-camera"></i> اسنپ‌شات: ${snapshot.command}</h4>
<span class="snapshot-time">${new Date(snapshot.timestamp).toLocaleString('fa-IR')}</span>
</div>
<div class="snapshot-body">
<div class="snapshot-info">
<h5><i class="fas fa-info-circle"></i> اطلاعات</h5>
<ul>
<li><strong>دستور:</strong> ${snapshot.command}</li>
<li><strong>توضیح:</strong> ${snapshot.description}</li>
<li><strong>شناسه:</strong> ${snapshot.id}</li>
<li><strong>تعداد دستورات:</strong> ${snapshot.commandCount}</li>
</ul>
</div>
<div class="snapshot-state">
<h5><i class="fas fa-microchip"></i> وضعیت سیستم</h5>
<ul>
<li><strong>CPU:</strong> ${snapshot.systemState.cpuUsage}%</li>
<li><strong>RAM:</strong> ${snapshot.systemState.memoryUsage}%</li>
<li><strong>دیسک:</strong> ${snapshot.systemState.diskSpace}GB آزاد</li>
<li><strong>فرآیندها:</strong> ${snapshot.systemState.runningProcesses} عدد</li>
<li><strong>دما:</strong> ${snapshot.systemState.temperature}°C</li>
</ul>
</div>
<div class="snapshot-actions">
<h5><i class="fas fa-tools"></i> اقدامات</h5>
<div class="action-buttons">
<button class="btn btn-primary undo-btn" data-id="${snapshot.id}">
<i class="fas fa-undo"></i> بازگشت به این حالت
</button>
<button class="btn btn-info compare-btn" data-id="${snapshot.id}">
<i class="fas fa-balance-scale"></i> مقایسه با حالت فعلی
</button>
</div>
</div>
</div>
`;

detailsElement.innerHTML = detailsHTML;

// Add event listeners
document.querySelector('.undo-btn')?.addEventListener('click', () => {
const result = this.undoToSnapshot(snapshotId);
if (result && result.success) {
window.arcUtils?.showSuccess(result.message);
this.showTimeTravelPanel(); // Refresh panel
}
});

document.querySelector('.compare-btn')?.addEventListener('click', () => {
const currentSnapshot = this.createSnapshot('current-state', 'وضعیت کنونی برای مقایسه');
const comparison = this.compareSnapshots(snapshotId, currentSnapshot.id);
if (comparison) {
this.showComparisonPanel(comparison);
}
});
}

showComparisonPanel(comparison) {
const panel = document.createElement('div');
panel.className = 'comparison-panel glass-card';
panel.innerHTML = `
<div class="panel-header">
<h3><i class="fas fa-balance-scale"></i> مقایسه وضعیت سیستم</h3>
<button class="close-panel">&times;</button>
</div>
<div class="panel-content">
<div class="comparison-header">
<div class="snapshot-info before">
<h4><i class="fas fa-arrow-left"></i> قبل: ${comparison.snapshot1.command}</h4>
<span>${new Date(comparison.snapshot1.timestamp).toLocaleString('fa-IR')}</span>
</div>
<div class="snapshot-info after">
<h4><i class="fas fa-arrow-right"></i> بعد: ${comparison.snapshot2.command}</h4>
<span>${new Date(comparison.snapshot2.timestamp).toLocaleString('fa-IR')}</span>
</div>
</div>
<div class="comparison-grid">
${this.renderComparisonGrid(comparison.diff)}
</div>
<div class="comparison-summary">
<i class="fas fa-chart-line"></i>
<span>${comparison.summary}</span>
</div>
</div>
`;
document.body.appendChild(panel);

document.querySelector('.close-panel').addEventListener('click', () => {
panel.remove();
});
}

renderComparisonGrid(diff) {
if (!diff || Object.keys(diff).length === 0) {
return '<p class="no-differences">هیچ تفاوتی در وضعیت سیستم پیدا نشد</p>';
}

let gridHTML = '<div class="metric-grid">';

Object.entries(diff).forEach(([metric, data]) => {
const metricName = this.getMetricDisplayName(metric);
const changeClass = data.change > 0 ? 'positive' : data.change < 0 ? 'negative' : 'neutral';
const arrow = data.change > 0 ? '↑' : data.change < 0 ? '↓' : '→';

gridHTML += `
<div class="metric-card ${changeClass}">
<div class="metric-header">
<h5>${metricName}</h5>
<span class="metric-change ${changeClass}">
${arrow} ${Math.abs(data.percentage)}%
</span>
</div>
<div class="metric-values">
<div class="before">
<span class="label">قبل:</span>
<span class="value">${data.before}</span>
</div>
<div class="after">
<span class="label">بعد:</span>
<span class="value">${data.after}</span>
</div>
</div>
<div class="metric-bar">
<div class="bar-fill" style="width: ${Math.min(100, Math.abs(data.percentage))}%"></div>
</div>
</div>
`;
});

gridHTML += '</div>';
return gridHTML;
}

getMetricDisplayName(metric) {
const names = {
cpuUsage: 'مصرف CPU',
memoryUsage: 'مصرف RAM',
diskSpace: 'فضای دیسک',
runningProcesses: 'فرآیندهای فعال',
temperature: 'دمای سیستم'
};
return names[metric] || metric;
}

// Keyboard shortcuts
setupKeyboardShortcuts() {
document.addEventListener('keydown', (e) => {
if (e.ctrlKey && e.key === 'z') {
e.preventDefault();
this.undoLastAction();
}
if (e.ctrlKey && e.key === 'y') {
e.preventDefault();
this.redoLastAction();
}
if (e.ctrlKey && e.shiftKey && e.key === 'h') {
e.preventDefault();
this.showTimeTravelPanel();
}
});
}

undoLastAction() {
if (this.snapshots.length > 0) {
const lastSnapshot = this.getLastSnapshot();
const result = this.undoToSnapshot(lastSnapshot.id);
if (result && result.success) {
window.arcUtils?.showSuccess('بازگشت آخرین عملیات با موفقیت انجام شد');
}
}
}

redoLastAction() {
window.arcUtils?.showInfo('امکان انجام مجدد عملیات در نسخه فعلی وجود ندارد');
}

static initialize() {
window.arcTimeTravel = new TimeTravelSystem();
console.log('✅ Time Travel System fully initialized');
}
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', TimeTravelSystem.initialize);
