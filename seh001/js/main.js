// 科學探索館 - 導覽列與滑動功能
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    // 確保初始狀態正確
    if (navMenu) {
        if (window.innerWidth > 768) {
            navMenu.style.display = '';
        } else {
            navMenu.style.maxHeight = '0';
        }
    }

    // 漢堡選單切換
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                navMenu.classList.remove('active');
                if (window.innerWidth <= 768) {
                    navMenu.style.maxHeight = '0';
                    navMenu.style.display = 'none';
                }
            } else {
                navMenu.classList.add('active');
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'block';
                    navMenu.style.maxHeight = '500px';
                }
            }
        });

        // 點擊外部關閉選單
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navMenu.style.maxHeight = '0';
                    navMenu.style.display = 'none';
                    dropdowns.forEach(d => d.classList.remove('active'));
                }
            }
        });
        
        // ESC鍵關閉選單
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (window.innerWidth <= 768) {
                    navMenu.style.maxHeight = '0';
                    navMenu.style.display = 'none';
                }
            }
        });
    }

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
                if (m) m.style.display = 'none';
            });
        }
    });

    // 桌面版滑鼠離開關閉
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                dropdown.classList.remove('active');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) menu.style.display = 'none';
            }
        });
    });
});

// 每日文章橫向滑動功能
function initDailySlider() {
    const track = document.querySelector('.daily-slider-track');
    const cards = document.querySelectorAll('.daily-card');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (!track || cards.length === 0) return;
    
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // 創建點點指示器
    if (dotsContainer) {
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('span');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }
    
    function updateSlider() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 32; // 2rem = 32px
        const translateX = -currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(${translateX}px)`;
        
        // 更新點點
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('span');
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }
    
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, totalCards - 1));
        updateSlider();
    }
    
    function nextSlide() {
        if (currentIndex < totalCards - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
    }
    
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = totalCards - 1;
        }
        updateSlider();
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    
    // 觸摸滑動支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
    
    // 響應式處理
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateSlider();
        }, 250);
    });
    
    // 初始化
    updateSlider();
}

// 頁面載入時初始化滑動
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initDailySlider, 100);
        initAccordion();
    });
} else {
    setTimeout(initDailySlider, 100);
    initAccordion();
}

// 手風琴展開功能
function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach((item, index) => {
        const header = item.querySelector('.accordion-header');
        
        // 第一個項目預設展開
        if (index === 0) {
            item.classList.add('active');
        }
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // 關閉所有項目
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // 如果原本沒展開，現在展開
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

