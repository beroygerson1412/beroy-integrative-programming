document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------
    // 1. SMOOTH SCROLLING
    // -------------------------------------------
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // -------------------------------------------
    // 2. SCROLL REVEAL ANIMATIONS 
    // -------------------------------------------
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .use-case-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.innerHTML = `
        .visible { opacity: 1 !important; transform: translateY(0) !important; }
        .error-msg { color: #ef4444; font-size: 0.8rem; margin-top: 5px; animation: pulse-glow 0.5s ease; }
        .form-input.invalid { border-color: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
    `;
    document.head.appendChild(style);

    // -------------------------------------------
    // 3. FORM VALIDATION LOGIC 
    // -------------------------------------------
    const forms = document.querySelectorAll('.auth-form');

    forms.forEach(form => {
        // Intercept link-buttons (like the one we used for Login in Activity 3)
        const linkBtn = form.querySelector('a.btn-primary');
        if (linkBtn) {
            linkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (validateForm(form)) {
                    window.location.href = linkBtn.getAttribute('href');
                }
            });
        }

        // Intercept standard form submissions (Signup, Settings)
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default reload
            
            if (validateForm(form)) {
                // Determine success action based on the page
                if (window.location.pathname.includes('signup.html')) {
                    alert('Account created successfully! Redirecting to login...');
                    window.location.href = 'login.html';
                } else if (window.location.pathname.includes('settings.html')) {
                    alert('Settings validated and saved successfully!');
                }
            }
        });
    });

    function validateForm(form) {
        let isValid = true;

        // Clear previous errors
        form.querySelectorAll('.error-msg').forEach(msg => msg.remove());
        form.querySelectorAll('.form-input').forEach(input => input.classList.remove('invalid'));

        // Identify inputs
        const name = form.querySelector('#name');
        const email = form.querySelector('input[type="email"]');
        const password = form.querySelector('input[type="password"]:not(#confirm-password)');
        const confirmPassword = form.querySelector('#confirm-password');

        // Validate Name (if exists)
        if (name && name.value.trim().length < 2) {
            showError(name, 'Please enter a valid full name.');
            isValid = false;
        }

        // Validate Email
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim() || !emailRegex.test(email.value)) {
                showError(email, 'Please enter a valid email address.');
                isValid = false;
            }
        }

        // Validate Password (length check)
        if (password) {
            // Settings page: empty password means "don't change it", so we only validate if they typed something
            const isSettings = window.location.pathname.includes('settings.html');
            if (!isSettings || (isSettings && password.value.length > 0)) {
                if (password.value.length < 6) {
                    showError(password, 'Password must be at least 6 characters long.');
                    isValid = false;
                }
            }
        }

        // Validate Confirm Password (match check)
        if (confirmPassword && password) {
            if (confirmPassword.value !== password.value) {
                showError(confirmPassword, 'Passwords do not match.');
                isValid = false;
            }
        }

        return isValid;
    }

    // Helper function to display error messages directly beneath the input field
    function showError(input, message) {
        input.classList.add('invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-msg';
        errorDiv.innerText = message;
        input.parentElement.appendChild(errorDiv);
    }
});