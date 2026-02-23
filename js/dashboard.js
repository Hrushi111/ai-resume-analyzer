// ============================================
// DASHBOARD JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (!user) return;

    // ---- Update UI with user name ----
    document.getElementById('welcomeName').textContent = user.name.split(' ')[0];
    document.getElementById('sidebarUserName').textContent = user.name;
    document.getElementById('sidebarUserRole').textContent = user.role === 'admin' ? 'Administrator' : 'User';
    document.getElementById('userAvatarSidebar').textContent = user.name[0].toUpperCase();

    // ---- Highlight active nav ----
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.href && item.href.includes(path.split('/').pop())) {
            item.classList.add('active');
        }
    });

    // ---- Logout ----
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        Store.remove('ra_current_user');
        window.location.href = '../index.html';
    });

    // ---- Sidebar toggle ----
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarToggle')?.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('sidebarClose')?.addEventListener('click', () => sidebar.classList.remove('open'));

    // ---- Load analysis data ----
    const allAnalyses = Store.get('ra_analyses', []).filter(a => a.userId === user.id);

    // Update summary cards
    document.getElementById('totalAnalyses').textContent = allAnalyses.length;

    if (allAnalyses.length > 0) {
        const avg = Math.round(allAnalyses.reduce((s, a) => s + a.overallScore, 0) / allAnalyses.length);
        const best = allAnalyses.reduce((b, a) => a.overallScore > b.overallScore ? a : b);
        const allMissing = allAnalyses[allAnalyses.length - 1]?.missingSkills?.length ?? '--';
        document.getElementById('avgScore').textContent = avg + '%';
        document.getElementById('bestScore').textContent = best.overallScore + '%';
        document.getElementById('bestScoreJob').textContent = truncate(best.jobTitle || 'N/A', 30);
        document.getElementById('skillsGap').textContent = allMissing;

        renderScoreChart(allAnalyses);
        renderSkillsChart(allAnalyses[allAnalyses.length - 1]);
        renderRecentTable(allAnalyses.slice(-5).reverse());
    } else {
        document.getElementById('avgScore').textContent = '--';
        document.getElementById('bestScore').textContent = '--';
        document.getElementById('skillsGap').textContent = '--';
        document.getElementById('emptyChartMsg').classList.add('show');
        document.getElementById('emptySkillsMsg').classList.add('show');
    }
});

// ---- Render Score History Chart ----
function renderScoreChart(analyses) {
    const ctx = document.getElementById('scoreHistoryChart');
    if (!ctx) return;
    const labels = analyses.slice(-8).map(a => formatDate(a.date));
    const data = analyses.slice(-8).map(a => a.overallScore);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'ATS Score',
                data,
                borderColor: '#6C63FF',
                backgroundColor: 'rgba(108,99,255,0.1)',
                borderWidth: 2.5,
                pointBackgroundColor: '#6C63FF',
                pointRadius: 4,
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,15,35,0.95)',
                    borderColor: 'rgba(108,99,255,0.3)',
                    borderWidth: 1,
                    titleColor: '#fff',
                    bodyColor: '#aaa',
                    callbacks: { label: ctx => `Score: ${ctx.raw}%` }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#555', font: { size: 11 } },
                },
                y: {
                    min: 0, max: 100,
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { color: '#555', font: { size: 11 }, callback: v => v + '%' }
                }
            }
        }
    });
}

// ---- Render Skills Doughnut ----
function renderSkillsChart(analysis) {
    const ctx = document.getElementById('skillsChart');
    if (!ctx) return;
    const matched = analysis.matchedSkills?.length ?? 0;
    const missing = analysis.missingSkills?.length ?? 0;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Matched Skills', 'Missing Skills'],
            datasets: [{
                data: [matched, missing],
                backgroundColor: ['rgba(67,233,123,0.8)', 'rgba(255,71,87,0.8)'],
                borderColor: ['rgba(67,233,123,0.2)', 'rgba(255,71,87,0.2)'],
                borderWidth: 2,
                hoverOffset: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#888', font: { size: 11 }, padding: 14, boxWidth: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(15,15,35,0.95)',
                    borderColor: 'rgba(108,99,255,0.3)',
                    borderWidth: 1,
                }
            },
            cutout: '65%',
        }
    });
}

// ---- Render Recent Table ----
function renderRecentTable(analyses) {
    const container = document.getElementById('recentAnalysesList');
    if (!analyses.length) return;

    const scoreClass = s => s >= 75 ? 'high' : s >= 50 ? 'medium' : 'low';

    let html = `<table class="analysis-table">
    <thead><tr>
      <th>Job Role</th><th>Date</th><th>ATS Score</th><th>Missing Skills</th><th>Action</th>
    </tr></thead><tbody>`;

    analyses.forEach(a => {
        html += `<tr>
      <td><strong>${a.jobTitle || 'Untitled'}</strong></td>
      <td>${formatDate(a.date)}</td>
      <td><span class="score-pill ${scoreClass(a.overallScore)}">${a.overallScore}%</span></td>
      <td><span class="badge badge-danger">${a.missingSkills?.length ?? 0} skills</span></td>
      <td><a href="results.html?id=${a.id}" class="btn btn-ghost btn-sm">View</a></td>
    </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}
