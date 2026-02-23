// ============================================
// SHARED UTILITIES
// ============================================

// ---- Toast Notifications ----
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ---- Local Storage Helpers ----
const Store = {
    get: (key, fallback = null) => {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch { return fallback; }
    },
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    remove: (key) => localStorage.removeItem(key),
};

// ---- Mock Users DB ----
const DEMO_USERS = [
    { id: 'admin-1', name: 'Admin User', email: 'admin@resumeai.com', password: 'admin123', role: 'admin' },
    { id: 'user-1', name: 'Demo User', email: 'user@resumeai.com', password: 'user123', role: 'user' },
];

function getUsers() {
    const stored = Store.get('ra_users', []);
    return [...DEMO_USERS, ...stored];
}

function addUser(user) {
    const users = Store.get('ra_users', []);
    users.push(user);
    Store.set('ra_users', users);
}

function getCurrentUser() {
    return Store.get('ra_current_user', null);
}

function requireAuth(adminOnly = false) {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    if (adminOnly && user.role !== 'admin') { window.location.href = 'dashboard.html'; return null; }
    return user;
}

// ---- Particles helper ----
function initParticles(containerId = 'particles') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const colors = ['#6C63FF', '#3ECFCF', '#FF6584', '#43E97B'];
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1.5;
        p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 15 + 8}s;
      animation-delay:${Math.random() * 8}s;
    `;
        container.appendChild(p);
    }
}

// ---- Format Date ----
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---- Truncate ----
function truncate(str, len = 100) {
    return str.length > len ? str.slice(0, len) + '…' : str;
}

// ---- Generate ID ----
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Init particles on every page
window.addEventListener('DOMContentLoaded', () => initParticles());
