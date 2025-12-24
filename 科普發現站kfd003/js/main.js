// 科普發現站 - 導覽列與下拉選單邏輯
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const dropdowns = document.querySelectorAll('.dropdown');

    // 確保初始狀態正確
    if (mainNav && window.innerWidth > 768) {
        mainNav.style.display = '';
    }

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const isActive = mainNav.classList.contains('active');
            
            if (isActive) {
                mainNav.classList.remove('active');
                if (window.innerWidth <= 768) {
                    mainNav.style.display = 'none';
                }
            } else {
                mainNav.classList.add('active');
                if (window.innerWidth <= 768) {
                    mainNav.style.display = 'block';
                }
            }
        });

        // 點擊外部關閉選單
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                    mainNav.classList.remove('active');
                    mainNav.style.display = 'none';
                    dropdowns.forEach(d => d.classList.remove('active'));
                }
            }
        });
    }

    // 下拉選單邏輯（所有設備都支持點擊）
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (menu) {
            // 桌面版初始隱藏，手機版也隱藏
            if (window.innerWidth > 768) {
                menu.style.display = 'none';
            } else {
                menu.style.display = 'none';
            }
        }

        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = dropdown.classList.contains('active');
            
            // 先關閉所有下拉選單
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const m = d.querySelector('.dropdown-menu');
                if (m) m.style.display = 'none';
            });
            
            // 如果原本沒開啟，現在開啟
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
                if (m) {
                    // 桌面版保持hover功能，手機版完全隱藏
                    if (window.innerWidth <= 768) {
                        m.style.display = 'none';
                    } else {
                        m.style.display = 'none';
                    }
                }
            });
        }
    });
    
    // 桌面版：滑鼠離開時關閉（但保持hover功能）
    if (window.innerWidth > 768) {
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseleave', () => {
                dropdown.classList.remove('active');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) menu.style.display = 'none';
            });
        });
    }
});

