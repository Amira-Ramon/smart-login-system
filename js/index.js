// ==========================================
// LOGIN FORM
// ==========================================
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');

    if (!form) return;

    // Real-time validation
    emailInput.addEventListener('input', () => {
        setFieldValidation(emailInput, 'emailError', isValidEmail(emailInput.value));
    });
    emailInput.addEventListener('blur', () => {
        setFieldValidation(emailInput, 'emailError', isValidEmail(emailInput.value));
    });

    passwordInput.addEventListener('input', () => {
        setFieldValidation(passwordInput, 'passwordError', passwordInput.value.length > 0);
    });
    passwordInput.addEventListener('blur', () => {
        setFieldValidation(passwordInput, 'passwordError', passwordInput.value.length > 0);
    });

    // Form submission
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

    // Real-time validation
    name.addEventListener('input', () => {
        setFieldValidation(name, 'usernameError', isValidUsername(name.value));
    });
    name.addEventListener('blur', () => {
        setFieldValidation(name, 'usernameError', isValidUsername(name.value));
    });

    email.addEventListener('input', () => {
        setFieldValidation(email, 'emailError', isValidEmail(email.value));
    });
    email.addEventListener('blur', () => {
        setFieldValidation(email, 'emailError', isValidEmail(email.value));
    });

    password.addEventListener('input', () => {
        setFieldValidation(password, 'passwordError', isValidPassword(password.value));
    });
    password.addEventListener('blur', () => {
        setFieldValidation(password, 'passwordError', isValidPassword(password.value));
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameValid = isValidUsername(name.value);
        const emailValid = isValidEmail(email.value);
        const passwordValid = isValidPassword(password.value);

        setFieldValidation(name, 'usernameError', usernameValid);
        setFieldValidation(email, 'emailError', emailValid);
        setFieldValidation(password, 'passwordError', passwordValid);

        if (!usernameValid || !emailValid || !passwordValid) {
            showToast('error', 'Error', 'Please correct the errors in the form.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email.value)) {
            showToast('error', 'Error', 'Email already exists');
            setFieldValidation(email, 'emailError', false);
            return;
        }

        setLoadingState(btn, true);
        await delay(800);

        users.push({ name: name.value, email: email.value, password: password.value });
        localStorage.setItem('users', JSON.stringify(users));

        setLoadingState(btn, false);
        showToast('success', 'Done', 'Account created');
        setTimeout(() => window.location.href = 'index.html', 1200);
    });
}

// ==========================================
// VALIDATION HELPER FUNCTIONS
// ==========================================

/**
 * Validate email format using regex
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate password (minimum 6 characters)
 */
function isValidPassword(password) {
    return password.length >= 6;
}

/**
 * Validate username (minimum 3 characters, alphanumeric)
 */
function isValidUsername(username) {
    return username.trim().length >= 3;
}

/**
 * Set field validation state (valid/invalid)
 */
function setFieldValidation(inputElement, errorId, isValid) {
    const errorElement = document.getElementById(errorId);

    if (isValid) {
        inputElement.classList.remove('invalid');
        inputElement.classList.add('valid');
        if (errorElement) errorElement.style.display = 'none';
    } else {
        inputElement.classList.remove('valid');
        inputElement.classList.add('invalid');
        if (errorElement) errorElement.style.display = 'block';
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Show toast notification
 */
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ'}</span>
        <div class="toast-content">
            <strong class="toast-title">${title}</strong>
            <p class="toast-message">${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Set loading state on button
 */
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

/**
 * Promise-based delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Attempt login with stored users
 */
function attemptLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store current user session
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true };
    }

    return { success: false, message: 'Invalid email or password' };
}

// ==========================================
// THEME TOGGLE
// ==========================================
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// ==========================================
// PASSWORD TOGGLE
// ==========================================
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);

            if (!input) return;

            const eyeIcon = btn.querySelector('.eye-icon');
            const eyeOffIcon = btn.querySelector('.eye-off-icon');

            if (input.type === 'password') {
                input.type = 'text';
                btn.setAttribute('aria-label', 'Hide password');
                if (eyeIcon) eyeIcon.style.display = 'none';
                if (eyeOffIcon) eyeOffIcon.style.display = 'block';
            } else {
                input.type = 'password';
                btn.setAttribute('aria-label', 'Show password');
                if (eyeIcon) eyeIcon.style.display = 'block';
                if (eyeOffIcon) eyeOffIcon.style.display = 'none';
            }
        });
    });
}

// ==========================================
// INITIALIZE ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initSignupForm();
    initThemeToggle();
    initPasswordToggle();
});
