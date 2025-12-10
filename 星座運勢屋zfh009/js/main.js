// 星座運勢屋 - 導覽列與下拉選單邏輯
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // 用於存儲延遲關閉的定時器
    const closeTimers = new Map();
    // 標記是否正在處理點擊事件
    let isProcessingClick = false;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                // 如果點擊的是下拉按鈕或下拉選單內的連結，不關閉導覽列
                if (e.target.closest('.dropdown > a') || e.target.closest('.dropdown-menu')) {
                    return;
                }
                
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    dropdowns.forEach(d => {
                        d.classList.remove('active');
                        const m = d.querySelector('.dropdown-menu');
                        if (m) {
                            m.style.display = 'none';
                            m.style.opacity = '1';
                            m.style.visibility = 'hidden';
                        }
                    });
                }
            }
        });
    }

    // 關閉下拉選單的函數
    function closeDropdown(dropdown, immediate = false) {
        const isMobile = window.innerWidth <= 768;
        
        if (immediate) {
            dropdown.classList.remove('active');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                if (isMobile) {
                    menu.style.display = 'none';
                    menu.style.opacity = '1';
                    menu.style.visibility = 'hidden';
                } else {
                    menu.style.display = 'none';
                    menu.style.opacity = '0';
                }
            }
            // 清除該下拉選單的定時器
            if (closeTimers.has(dropdown)) {
                clearTimeout(closeTimers.get(dropdown));
                closeTimers.delete(dropdown);
            }
        } else {
            // 延遲關閉，給用戶時間移動滑鼠（僅桌面版）
            if (isMobile) {
                closeDropdown(dropdown, true);
                return;
            }
            
            const timer = setTimeout(() => {
                dropdown.classList.remove('active');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    menu.style.opacity = '0';
                    setTimeout(() => {
                        menu.style.display = 'none';
                    }, 200);
                }
                closeTimers.delete(dropdown);
            }, 300);
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
        const isMobile = window.innerWidth <= 768;
        dropdown.classList.add('active');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            if (isMobile) {
                // 手機版：強制設置為block，確保顯示
                menu.style.display = 'block';
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
            } else {
                // 桌面版：使用過渡效果
                menu.style.display = 'block';
                requestAnimationFrame(() => {
                    menu.style.opacity = '1';
                });
            }
        }
    }

    // 下拉選單邏輯
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (menu) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // 手機版：強制設置初始狀態為隱藏
                menu.style.display = 'none';
                menu.style.opacity = '1';
                menu.style.visibility = 'hidden';
            } else {
                // 桌面版：設置初始狀態
                menu.style.display = 'none';
                menu.style.opacity = '0';
                menu.style.transition = 'opacity 0.2s ease';
            }
        }

        // 點擊下拉按鈕 - 使用捕獲階段，最高優先級
        link.addEventListener('click', (e) => {
            // 標記正在處理點擊
            isProcessingClick = true;
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const isMobile = window.innerWidth <= 768;
            const isActive = dropdown.classList.contains('active');
            
            // 立即執行，不等待
            if (isActive) {
                closeDropdown(dropdown, true);
            } else {
                openDropdown(dropdown);
            }
            
            // 短暫延遲後重置標記
            setTimeout(() => {
                isProcessingClick = false;
            }, 50);
            
            return false;
        }, true);
    });

    // 滑鼠進入下拉區域時，取消關閉（僅桌面版）
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                cancelCloseDropdown(dropdown);
                if (!dropdown.classList.contains('active')) {
                    openDropdown(dropdown);
                }
            }
        });

        // 滑鼠離開下拉區域時，延遲關閉（僅桌面版）
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                closeDropdown(dropdown, false);
            }
        });
    });

    // 點擊外部關閉下拉選單 - 使用冒泡階段，在捕獲階段之後執行
    document.addEventListener('click', (e) => {
        // 如果正在處理點擊事件，不執行
        if (isProcessingClick) {
            return;
        }
        
        // 延遲執行，確保下拉按鈕的點擊事件先完成
        setTimeout(() => {
            const isMobile = window.innerWidth <= 768;
            
            // 檢查是否點擊在下拉選單區域內
            const clickedDropdown = e.target.closest('.dropdown');
            const clickedDropdownLink = e.target.closest('.dropdown > a');
            const clickedDropdownMenu = e.target.closest('.dropdown-menu');
            
            // 如果點擊的是下拉按鈕本身或下拉選單，不處理
            if (clickedDropdownLink || clickedDropdownMenu) {
                return;
            }
            
            // 點擊外部，關閉所有下拉選單
            if (!clickedDropdown) {
                dropdowns.forEach(d => {
                    closeDropdown(d, true);
                });
            }
        }, 100); // 增加延遲，確保下拉按鈕的點擊事件先完成
    }, false);

    // 每日文章 - 上下滑動（zfh009 - 上下排列）
    const dailyTrack = document.querySelector('.daily-list-track');
    const navPrev = document.querySelector('.nav-arrow-prev');
    const navNext = document.querySelector('.nav-arrow-next');
    
    if (dailyTrack && navPrev && navNext) {
        const items = dailyTrack.querySelectorAll('.daily-item');
        let currentIndex = 0;
        
        function updateSlider() {
            if (items.length === 0) return;
            // 使用容器高度來計算，確保每次切換整個視窗
            const container = dailyTrack.parentElement; // .daily-list
            if (!container) return;
            const containerHeight = container.offsetHeight || container.clientHeight;
            const translateY = -currentIndex * containerHeight;
            dailyTrack.style.transform = `translateY(${translateY}px)`;
            
            navPrev.style.opacity = currentIndex === 0 ? '0.5' : '1';
            navPrev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            navNext.style.opacity = currentIndex >= items.length - 1 ? '0.5' : '1';
            navNext.style.pointerEvents = currentIndex >= items.length - 1 ? 'none' : 'auto';
        }
        
        function nextSlide() {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateSlider();
            }
        }
        
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        }
        
        navPrev.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
        });
        
        navNext.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        });
        
        // 觸摸滑動支持
        let startY = 0;
        let isDragging = false;
        
        dailyTrack.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
        });
        
        dailyTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        dailyTrack.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endY = e.changedTouches[0].clientY;
            const diff = startY - endY;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
            
            isDragging = false;
        });
        
        updateSlider();
    }
});
