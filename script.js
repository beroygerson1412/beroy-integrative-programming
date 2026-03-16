document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------
    // 1. SMOOTH SCROLLING (From Activity 2)
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
    // 2. SCROLL REVEAL ANIMATIONS (From Activity 2)
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
    // 3. FORM VALIDATION & ROUTING LOGIC (Activity 4 & 5)
    // -------------------------------------------
    const forms = document.querySelectorAll('.auth-form');

    forms.forEach(form => {
        const linkBtn = form.querySelector('a.btn-primary');
        
        // Handle login page button click
        if (linkBtn && window.location.pathname.includes('login.html')) {
            linkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (validateForm(form)) {
                    const emailInput = form.querySelector('input[type="email"]').value;
                    // ADMIN ROUTING LOGIC:
                    if (emailInput === 'admin@neurolink.ai') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'profile.html'; // Default user route
                    }
                }
            });
        } 
        // Handle forms that act as standard links
        else if (linkBtn) {
            linkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (validateForm(form)) window.location.href = linkBtn.getAttribute('href');
            });
        }

        // Handle standard form submissions (Signup, Settings)
        form.addEventListener('submit', (e) => {
            if(form.id === 'add-user-form') return; // Skip here, handled below
            e.preventDefault(); 
            
            if (validateForm(form)) {
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
        form.querySelectorAll('.error-msg').forEach(msg => msg.remove());
        form.querySelectorAll('.form-input').forEach(input => input.classList.remove('invalid'));

        const name = form.querySelector('input[id*="name"]');
        const email = form.querySelector('input[type="email"]');
        const password = form.querySelector('input[type="password"]:not(#confirm-password)');
        const confirmPassword = form.querySelector('#confirm-password');

        if (name && name.value.trim().length < 2) { showError(name, 'Please enter a valid name.'); isValid = false; }
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim() || !emailRegex.test(email.value)) { showError(email, 'Please enter a valid email address.'); isValid = false; }
        }
        if (password) {
            const isSettings = window.location.pathname.includes('settings.html');
            if (!isSettings || (isSettings && password.value.length > 0)) {
                if (password.value.length < 6) { showError(password, 'Password must be at least 6 characters long.'); isValid = false; }
            }
        }
        if (confirmPassword && password && confirmPassword.value !== password.value) {
            showError(confirmPassword, 'Passwords do not match.'); isValid = false;
        }
        return isValid;
    }

    function showError(input, message) {
        input.classList.add('invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-msg';
        errorDiv.innerText = message;
        input.parentElement.appendChild(errorDiv);
    }

    // -------------------------------------------
    // 4. ADMIN CRUD LOGIC (Activity 5)
    // -------------------------------------------
    const addUserForm = document.getElementById('add-user-form');
    const userTableBody = document.getElementById('user-table-body');

    if (addUserForm && userTableBody) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateForm(addUserForm)) {
                const name = document.getElementById('new-name').value;
                const email = document.getElementById('new-email').value;
                const role = document.getElementById('new-role').value;
                
                // Generate a random ID for simulation
                const newId = Math.floor(Math.random() * 1000) + 3; 

                // Create new row
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${newId}</td>
                    <td>${name}</td>
                    <td>${email}</td>
                    <td><span class="badge badge-${role}">${role.toUpperCase()}</span></td>
                    <td><button class="btn-small btn-danger btn-delete">Delete</button></td>
                `;
                
                // Append and reset form
                userTableBody.appendChild(newRow);
                addUserForm.reset();
                alert('User added successfully!');
            }
        });

        // Event delegation for dynamically added Delete buttons
        userTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                if (confirm('Are you sure you want to delete this user?')) {
                    e.target.closest('tr').remove();
                }
            }
        });
    }

// -------------------------------------------
    // 5. API INTEGRATION LOGIC (Global Intel Scanner)
    // -------------------------------------------
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('country-search');
    const errorBox = document.getElementById('api-error');
    const resultsContainer = document.getElementById('api-results');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performAPISearch);
        
        // Allow user to hit "Enter" to search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performAPISearch();
        });
    }

    function performAPISearch() {
        const query = searchInput.value.trim();
        
        // 1. Reset UI state
        errorBox.style.display = 'none';
        resultsContainer.innerHTML = '';
        
        // 2. Error Handling: Empty Input
        if (!query) {
            showAPIError('Scan failed: Please enter a valid country name.');
            return;
        }

        // Update button state to show loading
        const originalBtnText = searchBtn.innerText;
        searchBtn.innerText = 'Scanning Network...';
        searchBtn.disabled = true;

        // 3. API Request (Fetch)
        fetch(`https://restcountries.com/v3.1/name/${query}?fullText=false`)
            .then(response => {
                // 4. Error Handling: API response is not OK (e.g., 404 Not Found)
                if (!response.ok) {
                    throw new Error('Entity not found in global database. Check spelling.');
                }
                return response.json(); // Process JSON response
            })
            .then(data => {
                // 5. Display the Data
                const country = data[0]; // Take the first best match
                
                // Extracting variables nicely
                const name = country.name.common;
                const capital = country.capital ? country.capital[0] : 'N/A';
                const population = country.population.toLocaleString();
                const region = country.region;
                const flagUrl = country.flags.svg;

                // Create the HTML dynamically
                resultsContainer.innerHTML = `
                    <div class="api-result-card">
                        <div class="api-flag">
                            <img src="${flagUrl}" alt="Flag of ${name}">
                        </div>
                        <div class="api-details">
                            <h3>${name}</h3>
                            <p><strong>Capital:</strong> ${capital}</p>
                            <p><strong>Region:</strong> ${region}</p>
                            <p><strong>Population:</strong> ${population}</p>
                        </div>
                    </div>
                `;
            })
            .catch(error => {
                // Handle network errors or the error thrown above
                showAPIError(error.message);
            })
            .finally(() => {
                // Revert button state whether it succeeded or failed
                searchBtn.innerText = originalBtnText;
                searchBtn.disabled = false;
            });
    }

    function showAPIError(message) {
        errorBox.innerText = message;
        errorBox.style.display = 'block';
    }

}); // <--- This was the missing closing bracket and parenthesis!