// Site 3 JS
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.menu-btn');
    const navList = document.querySelector('.nav-list');
    const subMenus = document.querySelectorAll('.has-sub');

    if (menuBtn && navList) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navList.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!navList.contains(e.target) && !menuBtn.contains(e.target)) {
                    navList.classList.remove('active');
                    subMenus.forEach(s => s.classList.remove('active'));
                }
            }
        });
    }

    // Submenu Click Logic
    subMenus.forEach(menu => {
        const link = menu.querySelector('a');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                menu.classList.toggle('active');
            }
        });
    });
});