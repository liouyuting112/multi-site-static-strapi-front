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

    // 每日精選文章 - 垂直排列（so007）
    const dailyArticles = document.querySelector('.daily-articles');
    
    if (dailyArticles) {
        // 設置容器為垂直排列
        dailyArticles.style.display = 'flex';
        dailyArticles.style.flexDirection = 'column';
        dailyArticles.style.gap = '2rem';
    }

    // 星象研究卡片 - 橫向卷軸（可拖動，自動居中，so007）
    const featuredTrack = document.querySelector('.featured-cards-track');
    
    if (featuredTrack) {
        const cards = featuredTrack.querySelectorAll('.featured-card');
        let isDown = false;
        let startX;
        let scrollLeft;
        let scrollTimeout;
        let isScrolling = false;
        
        // 計算卡片應該居中的位置
        function scrollToCenterCard() {
            if (cards.length === 0) return;
            
            const trackRect = featuredTrack.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;
            
            let closestCard = null;
            let closestDistance = Infinity;
            
            // 找到最接近中心的卡片
            cards.forEach((card) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - trackCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCard = card;
                }
            });
            
            if (closestCard) {
                // 獲取卡片的實際位置（相對於track的scrollLeft）
                const cardRect = closestCard.getBoundingClientRect();
                const trackRect = featuredTrack.getBoundingClientRect();
                const cardLeftRelativeToViewport = cardRect.left;
                const trackLeftRelativeToViewport = trackRect.left;
                
                // 計算卡片相對於track的實際位置
                const cardLeftInTrack = cardLeftRelativeToViewport - trackLeftRelativeToViewport + featuredTrack.scrollLeft;
                const cardWidth = cardRect.width;
                const trackWidth = trackRect.width;
                
                // 計算使卡片居中的滾動位置
                // 卡片左邊緣 + 卡片寬度的一半 - 容器寬度的一半
                const scrollPosition = cardLeftInTrack - (trackWidth / 2) + (cardWidth / 2);
                
                // 確保滾動位置在有效範圍內
                const maxScroll = featuredTrack.scrollWidth - trackWidth;
                const finalScrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));
                
                // 使用 requestAnimationFrame 確保在下一幀執行，避免與拖動衝突
                requestAnimationFrame(() => {
                    featuredTrack.scrollTo({
                        left: finalScrollPosition,
                        behavior: 'smooth'
                    });
                });
            }
        }
        
        // 滑鼠拖動
        featuredTrack.addEventListener('mousedown', (e) => {
            isDown = true;
            isScrolling = false;
            featuredTrack.style.cursor = 'grabbing';
            featuredTrack.style.scrollBehavior = 'auto'; // 拖動時禁用平滑滾動
            startX = e.pageX - featuredTrack.offsetLeft;
            scrollLeft = featuredTrack.scrollLeft;
            
            // 清除之前的滾動超時
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        });
        
        featuredTrack.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                featuredTrack.style.cursor = 'grab';
                featuredTrack.style.scrollBehavior = 'smooth';
                // 拖動結束後自動居中
                scrollTimeout = setTimeout(() => {
                    scrollToCenterCard();
                }, 100);
            }
        });
        
        featuredTrack.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                featuredTrack.style.cursor = 'grab';
                featuredTrack.style.scrollBehavior = 'smooth';
                // 拖動結束後自動居中
                scrollTimeout = setTimeout(() => {
                    scrollToCenterCard();
                }, 100);
            }
        });
        
        featuredTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            isScrolling = true;
            const x = e.pageX - featuredTrack.offsetLeft;
            const walk = (x - startX) * 2; // 滑動速度
            featuredTrack.scrollLeft = scrollLeft - walk;
        });
        
        // 觸摸拖動
        let touchStartX = 0;
        let touchScrollLeft = 0;
        let touchEndTimeout;
        
        featuredTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].pageX;
            touchScrollLeft = featuredTrack.scrollLeft;
            featuredTrack.style.scrollBehavior = 'auto'; // 觸摸時禁用平滑滾動
            
            // 清除之前的滾動超時
            if (touchEndTimeout) {
                clearTimeout(touchEndTimeout);
            }
        }, { passive: true });
        
        featuredTrack.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX;
            const walk = (x - touchStartX) * 2;
            featuredTrack.scrollLeft = touchScrollLeft - walk;
        }, { passive: true });
        
        featuredTrack.addEventListener('touchend', () => {
            featuredTrack.style.scrollBehavior = 'smooth';
            // 觸摸結束後自動居中
            touchEndTimeout = setTimeout(() => {
                scrollToCenterCard();
            }, 150);
        }, { passive: true });
        
        // 滾動事件 - 用於檢測滾輪滾動
        let scrollEndTimeout;
        featuredTrack.addEventListener('scroll', () => {
            // 清除之前的超時
            if (scrollEndTimeout) {
                clearTimeout(scrollEndTimeout);
            }
            
            // 如果正在拖動，不執行自動居中
            if (isDown) return;
            
            // 滾動結束後自動居中
            scrollEndTimeout = setTimeout(() => {
                scrollToCenterCard();
            }, 150);
        }, { passive: true });
        
        // 設置可滾動
        featuredTrack.style.overflowX = 'auto';
        featuredTrack.style.scrollBehavior = 'smooth';
        featuredTrack.style.cursor = 'grab';
        featuredTrack.style.WebkitOverflowScrolling = 'touch';
        
        // 隱藏滾動條但保持功能
        featuredTrack.style.scrollbarWidth = 'thin';
        
        // 窗口大小改變時重新計算
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                scrollToCenterCard();
            }, 300);
        });
        
        // 頁面加載完成後，將第一張卡片居中（所有屏幕尺寸）
        function initializeCardPosition() {
            // 等待DOM完全渲染
            setTimeout(() => {
                const trackWidth = featuredTrack.offsetWidth;
                const firstCard = cards[0];
                
                if (firstCard && trackWidth > 0) {
                    // 所有屏幕尺寸都將第一張卡片居中
                    scrollToCenterCard();
                }
            }, 200);
        }
        
        // 初始化
        initializeCardPosition();
    }
});
