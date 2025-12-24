// ==========================================
// INITIALIZATION - Run when DOM is ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    clearLoginFormOnLoad();
    initThemeToggle();
    initPasswordToggles();
    initLoginForm();
    initSignupForm();
    initWelcomePage();
});

// ==========================================
// THEME TOGGLE (Dark/Light Mode)
// ==========================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        themeToggle.setAttribute(
            'aria-label',
            newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        );
    });
}

// ==========================================
// PASSWORD VISIBILITY TOGGLE
// ==========================================
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const eyeIcon = button.querySelector('.eye-icon');
            const eyeOffIcon = button.querySelector('.eye-off-icon');

            if (eyeIcon && eyeOffIcon) {
                eyeIcon.style.display = isPassword ? 'none' : 'block';
                eyeOffIcon.style.display = isPassword ? 'block' : 'none';
            }

            button.setAttribute(
                'aria-label',
                isPassword ? 'Hide password' : 'Show password'
            );
        });
    });
}

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: `✔️`,
        error: `❌`,
        warning: `⚠️`
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">✖</button>
    `;

    container.appendChild(toast);

    toast.querySelector('.toast-close')
        .addEventListener('click', () => removeToast(toast));

    setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
}

// ==========================================
// VALIDATION HELPERS
// ==========================================
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(name) {
    return /^[A-Za-z]{3,10}(\s?[A-Za-z]{3,10})?$/.test(name);
}

function isValidPassword(password) {
    return password.length >= 5 && password.length <= 15;
}

function setFieldValidation(input, errorId, isValid) {
    const errorEl = document.getElementById(errorId);

    input.classList.remove('is-valid', 'is-invalid');
    if (input.value) {
        input.classList.add(isValid ? 'is-valid' : 'is-invalid');
    }

    if (errorEl) {
        errorEl.classList.toggle('show', !isValid && input.value.length > 0);
    }
}

// ==========================================
// LOGIN FORM
// ==========================================
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');

    if (!form) return;

    emailInput.addEventListener('input', () => {
        setFieldValidation(emailInput, 'emailError', isValidEmail(emailInput.value));
    });

    passwordInput.addEventListener('input', () => {
        setFieldValidation(passwordInput, 'passwordError', passwordInput.value.length > 0);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailValid = isValidEmail(emailInput.value);
        const passValid = passwordInput.value.length > 0;

        setFieldValidation(emailInput, 'emailError', emailValid);
        setFieldValidation(passwordInput, 'passwordError', passValid);

        if (!emailValid || !passValid) {
            showToast('error', 'Error', 'Invalid login data');
            return;
        }

        setLoadingState(loginBtn, true);
        await delay(800);

        const result = attemptLogin(emailInput.value, passwordInput.value);
        setLoadingState(loginBtn, false);

        if (result.success) {
            showToast('success', 'Welcome', 'Login successful');
            setTimeout(() => {
                window.location.href = 'welcome.html';
            }, 1000);
        } else {
            showToast('error', 'Failed', result.message);
        }
    });
}
function clearLoginFormOnLoad() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.reset();


    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('is-valid', 'is-invalid');
    });
}

function attemptLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];

    for (const user of users) {
        if (user.email === email && user.password === password) {
            localStorage.setItem('sessionUsername', user.name);
            localStorage.setItem('loginTime', new Date().toLocaleString());
            return { success: true };
        }
    }

    return { success: false, message: 'Wrong email or password' };
}

// ==========================================
// SIGNUP FORM
// ==========================================
function initSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;

    const name = document.getElementById('usernameInput');
    const email = document.getElementById('userEmailInput');
    const password = document.getElementById('userPasswordInput');
    const btn = document.getElementById('signupBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isValidUsername(name.value) ||
            !isValidEmail(email.value) ||
            !isValidPassword(password.value)) {

            showToast('error', 'Error', 'Invalid signup data');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email.value)) {
            showToast('error', 'Error', 'Email already exists');
            return;
        }

        setLoadingState(btn, true);
        await delay(800);

        users.push({
            name: name.value,
            email: email.value,
            password: password.value
        });

        localStorage.setItem('users', JSON.stringify(users));
        setLoadingState(btn, false);

        showToast('success', 'Done', 'Account created');
        setTimeout(() => window.location.href = 'index.html', 1200);
    });
}

// ==========================================
// WELCOME PAGE
// ==========================================
function initWelcomePage() {
    const usernameEl = document.getElementById('username');
    const loginTimeEl = document.getElementById('loginTime');
    const logoutBtn = document.getElementById('logoutBtn');

    if (usernameEl) {
        const name = localStorage.getItem('sessionUsername');
        if (!name) {
            window.location.href = 'index.html';
            return;
        }
        usernameEl.textContent = `Welcome, ${name}!`;
    }

    if (loginTimeEl) {
        loginTimeEl.textContent =
            localStorage.getItem('loginTime') || '';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('sessionUsername');
            localStorage.removeItem('loginTime');

            showToast('success', 'Logged out', 'Goodbye 👋');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        });
    }
}

// ==========================================
// UTILITIES
// ==========================================
function setLoadingState(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.classList.toggle('loading', isLoading);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
