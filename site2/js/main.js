// Site 2 Main JS
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                dropdowns.forEach(d => d.classList.remove('active'));
            }
        });
    }

    // Mobile Dropdown Handling
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    console.log("System Ready. GLHF.");
});

