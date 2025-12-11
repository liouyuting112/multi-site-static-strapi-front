// 數位生活館 - 側邊欄導覽與滑動切換邏輯
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const navClose = document.querySelector('.nav-close');
    const dropdowns = document.querySelectorAll('.dropdown');

    function closeNav() {
        if (menuToggle) menuToggle.classList.remove('active');
        if (sidebarNav) sidebarNav.classList.remove('active');
    }

    // 手機版漢堡選單
    if (menuToggle && sidebarNav) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            sidebarNav.classList.toggle('active');
        });
    }

    // 關閉按鈕
    if (navClose) {
        navClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeNav();
        });
    }

    // 點擊外部關閉
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sidebar-nav') && !e.target.closest('.menu-toggle')) {
            closeNav();
        }
    });

    // 下拉選單邏輯
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (menu) {
            menu.style.display = 'none';
        }

        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = dropdown.classList.contains('active');
            
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const m = d.querySelector('.dropdown-menu');
                if (m) m.style.display = 'none';
            });
            
            if (!isActive) {
                dropdown.classList.add('active');
                if (menu) menu.style.display = 'block';
            }
        });
    });

    // 點擊外部關閉下拉選單
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const m = d.querySelector('.dropdown-menu');
                if (m) m.style.display = 'none';
            });
        }
    });

});

