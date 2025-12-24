// Site 1 JS
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    dropdowns.forEach(d => d.classList.remove('active'));
                }
            }
        });
    }
    
    // Dropdown Logic
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        
        // Force remove any inline style if present
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) menu.style.display = ''; 

        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = dropdown.classList.contains('active');
            
            // Close ALL dropdowns first
            dropdowns.forEach(d => {
                d.classList.remove('active');
            });
            
            // If it wasn't active before, open it now
            if (!isActive) {
                dropdown.classList.add('active');
            }
        });

        // Mouse leave to close (Desktop only)
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                dropdown.classList.remove('active');
            }
        });
    });

    // Click outside to close (Global)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
});