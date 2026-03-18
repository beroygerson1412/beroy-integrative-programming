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
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performAPISearch();
        });
    }

    function performAPISearch() {
        const query = searchInput.value.trim();
        errorBox.style.display = 'none';
        resultsContainer.innerHTML = '';
        
        if (!query) { showAPIError('Scan failed: Please enter a valid country name.'); return; }

        const originalBtnText = searchBtn.innerText;
        searchBtn.innerText = 'Scanning Network...';
        searchBtn.disabled = true;

        fetch(`https://restcountries.com/v3.1/name/${query}?fullText=false`)
            .then(response => {
                if (!response.ok) throw new Error('Entity not found in global database. Check spelling.');
                return response.json();
            })
            .then(data => {
                const country = data[0]; 
                
                // Package the data we want to save
                const intelData = {
                    name: country.name.common,
                    capital: country.capital ? country.capital[0] : 'N/A',
                    region: country.region,
                    population: country.population.toLocaleString(),
                    flagUrl: country.flags.svg
                };

                resultsContainer.innerHTML = `
                    <div class="api-result-card">
                        <div class="api-flag">
                            <img src="${intelData.flagUrl}" alt="Flag of ${intelData.name}">
                        </div>
                        <div class="api-details">
                            <h3>${intelData.name}</h3>
                            <p><strong>Capital:</strong> ${intelData.capital}</p>
                            <p><strong>Region:</strong> ${intelData.region}</p>
                            <p><strong>Population:</strong> ${intelData.population}</p>
                            
                            <button id="save-intel-btn" class="btn-primary" style="margin-top: 15px; background: #2563eb; border-color: #3b82f6;">
                                💾 Save to Local Database
                            </button>
                        </div>
                    </div>
                `;

                // Attach event listener to the newly created Save Button
                document.getElementById('save-intel-btn').addEventListener('click', () => {
                    saveIntelToLocal(intelData);
                });
            })
            .catch(error => showAPIError(error.message))
            .finally(() => {
                searchBtn.innerText = originalBtnText;
                searchBtn.disabled = false;
            });
    }

    function showAPIError(message) {
        errorBox.innerText = message;
        errorBox.style.display = 'block';
    }

    // -------------------------------------------
    // 6. LOCALSTORAGE LOGIC (Save, Load, Delete)
    // -------------------------------------------
    
    // Function to Save Data
    function saveIntelToLocal(data) {
        // 1. Get existing data or create an empty array
        let savedItems = JSON.parse(localStorage.getItem('neurolink_saved_intel')) || [];

        // 2. Prevent Duplicates (Check by country name)
        const isDuplicate = savedItems.some(item => item.name === data.name);
        
        if (isDuplicate) {
            alert(`⚠️ Alert: "${data.name}" is already saved in your database.`);
            return;
        }

        // 3. Add new data and save back to localStorage
        savedItems.push(data);
        localStorage.setItem('neurolink_saved_intel', JSON.stringify(savedItems));
        
        // 4. Show success message
        alert(`✅ Success: "${data.name}" intel secured in local database.`);
    }

    // Function to Load Data on the Saved Items Page
    const savedGrid = document.getElementById('saved-intel-grid');
    if (savedGrid) {
        loadSavedIntel();
    }

    function loadSavedIntel() {
        let savedItems = JSON.parse(localStorage.getItem('neurolink_saved_intel')) || [];
        savedGrid.innerHTML = ''; // Clear grid

        // Bonus: Empty State
        if (savedItems.length === 0) {
            savedGrid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">No intel data saved yet. Access the scanner to retrieve and save data.</div>`;
            return;
        }

        // Render saved items
        savedItems.forEach((item, index) => {
            savedGrid.innerHTML += `
                <div class="saved-card" data-index="${index}">
                    <div class="saved-header">
                        <img src="${item.flagUrl}" alt="Flag">
                        <h4>${item.name}</h4>
                    </div>
                    <div class="saved-body">
                        <p><strong>Capital:</strong> ${item.capital}</p>
                        <p><strong>Region:</strong> ${item.region}</p>
                        <p><strong>Pop:</strong> ${item.population}</p>
                    </div>
                    <button class="btn-small btn-danger delete-saved-btn" style="margin-top: 10px;">Remove Intel</button>
                </div>
            `;
        });

        // Attach event listeners to all delete buttons
        document.querySelectorAll('.delete-saved-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.saved-card').getAttribute('data-index');
                deleteSavedIntel(index);
            });
        });
    }

    // Function to Delete Data
    function deleteSavedIntel(index) {
        let savedItems = JSON.parse(localStorage.getItem('neurolink_saved_intel')) || [];
        // Remove 1 item at the specific index
        savedItems.splice(index, 1);
        // Resave and reload the UI
        localStorage.setItem('neurolink_saved_intel', JSON.stringify(savedItems));
        loadSavedIntel(); 
    }

}); // <--- ENSURE THIS FINAL CLOSING BRACKET STAYS AT THE VERY BOTTOM OF SCRIPT.JS