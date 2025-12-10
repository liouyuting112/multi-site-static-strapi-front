// 占星智慧館 - 導覽列與下拉選單邏輯
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // 用於存儲延遲關閉的定時器
    const closeTimers = new Map();

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
                            m.style.opacity = '0';
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

        // 點擊下拉按鈕
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const isMobile = window.innerWidth <= 768;
            const isActive = dropdown.classList.contains('active');
            
            // 立即執行，不等待其他事件
            if (isActive) {
                // 如果已經開啟，則關閉
                closeDropdown(dropdown, true);
            } else {
                // 如果沒開啟，則打開
                openDropdown(dropdown);
            }
            
            // 阻止事件冒泡到document
            return false;
        }, true); // 使用捕獲階段，確保優先執行

        // 滑鼠進入下拉區域時，取消關閉
        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                cancelCloseDropdown(dropdown);
                if (!dropdown.classList.contains('active')) {
                    openDropdown(dropdown);
                }
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
    // 使用 setTimeout 確保這個邏輯在其他點擊事件之後執行
    document.addEventListener('click', (e) => {
        // 延遲執行，確保下拉按鈕的點擊事件先執行
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
            
            if (!clickedDropdown) {
                // 點擊外部，關閉所有下拉選單
                dropdowns.forEach(d => {
                    closeDropdown(d, true);
                });
            }
        }, 10); // 增加延遲，確保下拉按鈕的點擊事件先完成
    }, false); // 使用冒泡階段，在捕獲階段之後執行

    // 每日文章 - 左右排列，點擊切換（awh008 - 保持點擊切換）
    const articlesTrack = document.querySelector('.articles-track');
    const slidePrev = document.querySelector('.slide-prev');
    const slideNext = document.querySelector('.slide-next');
    
    if (articlesTrack && slidePrev && slideNext) {
        const articles = articlesTrack.querySelectorAll('.article-box');
        let currentIndex = 0;
        const articlesPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
        const totalSlides = Math.ceil(articles.length / articlesPerView);
        
        function updateSlider() {
            if (articles.length === 0) return;
            // 使用容器寬度來計算，確保每次切換整個視窗
            const container = articlesTrack.parentElement; // .articles-container
            if (!container) return;
            const containerWidth = container.offsetWidth || container.clientWidth;
            const translateX = -currentIndex * containerWidth;
            articlesTrack.style.transform = `translateX(${translateX}px)`;
            
            slidePrev.disabled = currentIndex === 0;
            slideNext.disabled = currentIndex >= totalSlides - 1;
        }
        
        function nextSlide() {
            if (currentIndex < totalSlides - 1) {
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
        
        slidePrev.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
        });
        
        slideNext.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        });
        
        updateSlider();
    }
});
