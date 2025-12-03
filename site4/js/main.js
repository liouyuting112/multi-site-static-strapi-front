// Site 4 Main JS - Sidebar Logic
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Toggle Sidebar on Mobile
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) { 
                if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    dropdowns.forEach(d => d.classList.remove('active'));
                }
            }
        });
    }

    // Dropdown Handling
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = dropdown.classList.contains('active');
                
                // Close others
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                
                if (!isActive) {
                    dropdown.classList.add('active');
                } else {
                    dropdown.classList.remove('active');
                }
            });
            
            // Desktop: Close when mouse leaves
            if (window.innerWidth > 900) {
                 dropdown.addEventListener('mouseleave', () => {
                     dropdown.classList.remove('active');
                 });
            }
        }
    });
    
    document.addEventListener('click', (e) => {
        // Close dropdown if clicking outside
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
    
    console.log("Library Archives Loaded.");
});