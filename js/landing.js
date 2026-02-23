// ============================================
// LANDING PAGE JAVASCRIPT
// ============================================

// ---- Particles ----
(function initParticles() {
    const container = document.getElementById('particles');
    const colors = ['#6C63FF', '#3ECFCF', '#FF6584', '#43E97B', '#F7971E'];
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${Math.random() * 20 + 10}s;
      animation-delay:${Math.random() * 10}s;
      opacity:${Math.random() * 0.4 + 0.1};
    `;
        container.appendChild(p);
    }
})();

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

// ---- Counter animation ----
function animateCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();
        const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    });
}

// ---- Score counter animation ----
function animateScoreCount() {
    document.querySelectorAll('.animate-count[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const interval = setInterval(() => {
            current = Math.min(current + 2, target);
            el.textContent = current;
            if (current >= target) clearInterval(interval);
        }, 25);
    });
}

// ---- Intersection observer for animations ----
const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// ---- Feature cards staggered animation ----
document.querySelectorAll('.feature-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.1}s`;
    card.style.animationPlayState = 'paused';
    observer.observe(card);
});

// ---- Hero animations on load ----
window.addEventListener('load', () => {
    setTimeout(animateCounters, 500);
    setTimeout(animateScoreCount, 800);
});

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
