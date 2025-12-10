// Site 5 JS
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Hamburger (only visible on小螢幕，但邏輯寫完整一點比較直觀)
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                dropdowns.forEach(d => d.classList.remove('active'));
            }
        });
    }
    
    // Dropdown Logic（桌機與手機都共用，同步行為）
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (!link) return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isActive = dropdown.classList.contains('active');

            // 先收起其他下拉
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });

            // 再切換目前這一個
            if (!isActive) {
                dropdown.classList.add('active');
            } else {
                dropdown.classList.remove('active');
            }
        });
    });
});