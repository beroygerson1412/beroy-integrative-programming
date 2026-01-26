document.addEventListener('DOMContentLoaded', () => {
    // Select all links with hashes
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Prevent default anchor click behavior
            e.preventDefault();

            // Get the target element
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Skip empty links
            
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Scroll to the element smoothly
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Optional: Add a subtle reveal effect on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate on scroll
    document.querySelectorAll('.feature-card, .use-case-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // Add class for the CSS to handle (injected here for simplicity)
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
});