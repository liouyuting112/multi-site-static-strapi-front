// 星象觀測台 - 導覽列與下拉選單邏輯
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // 用於存儲延遲關閉的定時器
    const closeTimers = new Map();

    // 漢堡選單切換
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        // 點擊外部關閉選單
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    dropdowns.forEach(d => {
                        d.classList.remove('active');
                        const m = d.querySelector('.dropdown-menu');
                        if (m) {
                            m.style.display = 'none';
                            m.style.opacity = '0';
                        }
                    });
                }
            }
        });
    }

    // 關閉下拉選單的函數
    function closeDropdown(dropdown, immediate = false) {
        if (immediate) {
            dropdown.classList.remove('active');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.display = 'none';
                menu.style.opacity = '0';
            }
            // 清除該下拉選單的定時器
            if (closeTimers.has(dropdown)) {
                clearTimeout(closeTimers.get(dropdown));
                closeTimers.delete(dropdown);
            }
        } else {
            // 延遲關閉，給用戶時間移動滑鼠
            const timer = setTimeout(() => {
                dropdown.classList.remove('active');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    menu.style.opacity = '0';
                    setTimeout(() => {
                        menu.style.display = 'none';
                    }, 200); // 等待過渡動畫完成
                }
                closeTimers.delete(dropdown);
            }, 300); // 300ms 延遲
            closeTimers.set(dropdown, timer);
        }
    }

    // 取消關閉下拉選單
    function cancelCloseDropdown(dropdown) {
        if (closeTimers.has(dropdown)) {
            clearTimeout(closeTimers.get(dropdown));
            closeTimers.delete(dropdown);
        }
    }

    // 打開下拉選單的函數
    function openDropdown(dropdown) {
        // 先關閉所有其他下拉選單
        dropdowns.forEach(d => {
            if (d !== dropdown) {
                closeDropdown(d, true);
            }
        });
        
        // 清除該下拉選單的關閉定時器
        cancelCloseDropdown(dropdown);
        
        // 打開當前下拉選單
        dropdown.classList.add('active');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.display = 'block';
            // 使用 requestAnimationFrame 確保 display 先設置，然後再設置 opacity
            requestAnimationFrame(() => {
                menu.style.opacity = '1';
            });
        }
    }

    // 下拉選單邏輯
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (menu) {
            menu.style.display = 'none';
            menu.style.opacity = '0';
            menu.style.transition = 'opacity 0.2s ease';
        }

        // 點擊下拉按鈕
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = dropdown.classList.contains('active');
            
            if (isActive) {
                // 如果已經開啟，則關閉
                closeDropdown(dropdown, true);
            } else {
                // 如果沒開啟，則打開
                openDropdown(dropdown);
            }
        });

        // 滑鼠進入下拉區域時，取消關閉
        dropdown.addEventListener('mouseenter', () => {
            cancelCloseDropdown(dropdown);
            if (!dropdown.classList.contains('active')) {
                openDropdown(dropdown);
            }
        });

        // 滑鼠離開下拉區域時，延遲關閉
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                closeDropdown(dropdown, false);
            }
        });
    });

    // 點擊外部關閉下拉選單（帶延遲）
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(d => {
                closeDropdown(d, true);
            });
        }
    });

    // 星象研究卡片 - 橫向卷軸（可拖動，so007）
    const featuredTrack = document.querySelector('.featured-cards-track');
    const carouselPrev = document.querySelector('.carousel-btn-prev');
    const carouselNext = document.querySelector('.carousel-btn-next');
    
    if (featuredTrack) {
        const cards = featuredTrack.querySelectorAll('.featured-card');
        let isDown = false;
        let startX;
        let scrollLeft;
        
        // 滑鼠拖動
        featuredTrack.addEventListener('mousedown', (e) => {
            isDown = true;
            featuredTrack.style.cursor = 'grabbing';
            startX = e.pageX - featuredTrack.offsetLeft;
            scrollLeft = featuredTrack.scrollLeft;
        });
        
        featuredTrack.addEventListener('mouseleave', () => {
            isDown = false;
            featuredTrack.style.cursor = 'grab';
        });
        
        featuredTrack.addEventListener('mouseup', () => {
            isDown = false;
            featuredTrack.style.cursor = 'grab';
        });
        
        featuredTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - featuredTrack.offsetLeft;
            const walk = (x - startX) * 2; // 滑動速度
            featuredTrack.scrollLeft = scrollLeft - walk;
        });
        
        // 觸摸拖動
        let touchStartX = 0;
        let touchScrollLeft = 0;
        
        featuredTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].pageX;
            touchScrollLeft = featuredTrack.scrollLeft;
        });
        
        featuredTrack.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX;
            const walk = (x - touchStartX) * 2;
            featuredTrack.scrollLeft = touchScrollLeft - walk;
        });
        
        // 設置可滾動
        featuredTrack.style.overflowX = 'auto';
        featuredTrack.style.scrollBehavior = 'smooth';
        featuredTrack.style.cursor = 'grab';
        featuredTrack.style.WebkitOverflowScrolling = 'touch';
        
        // 隱藏滾動條但保持功能
        featuredTrack.style.scrollbarWidth = 'thin';
        
        // 按鈕控制（可選）
        if (carouselPrev && carouselNext) {
            carouselPrev.addEventListener('click', () => {
                featuredTrack.scrollBy({ left: -400, behavior: 'smooth' });
            });
            
            carouselNext.addEventListener('click', () => {
                featuredTrack.scrollBy({ left: 400, behavior: 'smooth' });
            });
        }
    }
});
