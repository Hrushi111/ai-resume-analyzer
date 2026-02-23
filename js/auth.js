// ============================================
// AUTH LOGIC (Login + Register)
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ---- PASSWORD TOGGLE ----
    document.querySelectorAll('.toggle-pw').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrap = btn.closest('.input-password-wrap');
            const input = wrap.querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });

    // ---- PASSWORD STRENGTH (register page) ----
    const regPwInput = document.getElementById('regPassword');
    if (regPwInput) {
        regPwInput.addEventListener('input', () => {
            const val = regPwInput.value;
            const score = getPasswordStrength(val);
            const bars = document.querySelectorAll('.strength-bar');
            const label = document.getElementById('strengthLabel');
            const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
            const classes = ['', 'active-weak', 'active-fair', 'active-good', 'active-strong'];
            bars.forEach((bar, i) => {
                bar.className = 'strength-bar';
                if (i < score) bar.classList.add(classes[score]);
            });
            if (label) label.textContent = levels[score] || 'Enter password';
        });
    }

    function getPasswordStrength(pw) {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    }

    // ---- LOGIN FORM ----
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            let valid = true;

            // Validate
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                document.getElementById('fg-email').classList.add('error'); valid = false;
            } else { document.getElementById('fg-email').classList.remove('error'); }

            if (!password || password.length < 6) {
                document.getElementById('fg-password').classList.add('error'); valid = false;
            } else { document.getElementById('fg-password').classList.remove('error'); }

            if (!valid) return;

            // Simulate loading
            const btn = document.getElementById('loginBtn');
            const btnText = document.getElementById('loginBtnText');
            const spinner = document.getElementById('loginSpinner');
            btn.disabled = true;
            btnText.textContent = 'Signing in…';
            spinner.classList.remove('hidden');

            await new Promise(r => setTimeout(r, 1200));

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                const { password: _, ...safeUser } = user;
                Store.set('ra_current_user', safeUser);
                showToast(`Welcome back, ${user.name.split(' ')[0]}! 🎉`, 'success');
                setTimeout(() => {
                    window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
                }, 800);
            } else {
                btn.disabled = false;
                btnText.textContent = 'Sign In';
                spinner.classList.add('hidden');
                showToast('Invalid email or password. Try the demo credentials below.', 'error');
            }
        });

        // Google Login (demo)
        const gBtn = document.getElementById('googleLogin');
        if (gBtn) {
            gBtn.addEventListener('click', () => {
                Store.set('ra_current_user', { id: 'google-1', name: 'Google User', email: 'google@gmail.com', role: 'user' });
                showToast('Signed in with Google! ✓', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 800);
            });
        }
    }

    // ---- REGISTER FORM ----
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let valid = true;
            const fname = document.getElementById('firstName').value.trim();
            const lname = document.getElementById('lastName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const agree = document.getElementById('agreeTerms').checked;

            if (!fname) { document.getElementById('fg-fname').classList.add('error'); valid = false; }
            else document.getElementById('fg-fname').classList.remove('error');
            if (!lname) { document.getElementById('fg-lname').classList.add('error'); valid = false; }
            else document.getElementById('fg-lname').classList.remove('error');
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('fg-email').classList.add('error'); valid = false; }
            else document.getElementById('fg-email').classList.remove('error');
            if (!password || password.length < 8) { document.getElementById('fg-password').classList.add('error'); valid = false; }
            else document.getElementById('fg-password').classList.remove('error');
            if (confirm !== password) { document.getElementById('fg-confirm').classList.add('error'); valid = false; }
            else document.getElementById('fg-confirm').classList.remove('error');

            if (!agree) { showToast('Please agree to the Terms of Service.', 'error'); return; }
            if (!valid) return;

            // Check duplicate
            const users = getUsers();
            if (users.find(u => u.email === email)) {
                showToast('An account with this email already exists. Please login.', 'error'); return;
            }

            const btn = document.getElementById('registerBtn');
            const btnText = document.getElementById('registerBtnText');
            const spinner = document.getElementById('registerSpinner');
            btn.disabled = true;
            btnText.textContent = 'Creating Account…';
            spinner.classList.remove('hidden');

            await new Promise(r => setTimeout(r, 1500));

            const newUser = {
                id: generateId(),
                name: `${fname} ${lname}`,
                email,
                password,
                role: 'user',
                joinDate: new Date().toISOString(),
                role_type: document.getElementById('userRole').value,
            };
            addUser(newUser);
            const { password: _, ...safeUser } = newUser;
            Store.set('ra_current_user', safeUser);
            showToast(`Account created! Welcome, ${fname}! 🎉`, 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 900);
        });
    }
});
