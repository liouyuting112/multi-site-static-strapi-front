// 科學觀察台 - 全覆蓋導航邏輯與水平滑動
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const overlayNav = document.querySelector('.overlay-nav');
    const hasSubmenu = document.querySelector('.has-submenu');

    // 確保overlay-nav初始狀態正確
    if (overlayNav) {
        overlayNav.style.display = 'none';
    }

    if (hamburger && overlayNav) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const isActive = overlayNav.classList.contains('active');
            
            if (isActive) {
                overlayNav.classList.remove('active');
                overlayNav.style.display = 'none';
                document.body.style.overflow = '';
            } else {
                overlayNav.classList.add('active');
                overlayNav.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });

        // 點擊外部關閉選單
        document.addEventListener('click', (e) => {
            if (overlayNav.classList.contains('active')) {
                if (!overlayNav.contains(e.target) && !hamburger.contains(e.target)) {
                    overlayNav.classList.remove('active');
                    overlayNav.style.display = 'none';
                    document.body.style.overflow = '';
                }
            }
        });
        
        // ESC鍵關閉選單
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlayNav.classList.contains('active')) {
                overlayNav.classList.remove('active');
                overlayNav.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // 子選單展開功能
    if (hasSubmenu) {
        hasSubmenu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hasSubmenu.classList.toggle('active');
        });
        
        // 點擊子選單外部關閉
        document.addEventListener('click', (e) => {
            if (!hasSubmenu.contains(e.target)) {
                hasSubmenu.classList.remove('active');
            }
        });
    }
    
    // 水平滑動功能（僅在首頁）
    initHorizontalSlider();
});

function initHorizontalSlider() {
    const track = document.querySelector('.featured-horizontal-track');
    const cards = document.querySelectorAll('.featured-horizontal-track .featured-asymmetric-card');
    const prevBtn = document.querySelector('.prev-horizontal-btn');
    const nextBtn = document.querySelector('.next-horizontal-btn');
    const dotsContainer = document.querySelector('.horizontal-slider-dots');
    
    if (!track || cards.length === 0) return;
    
    let currentIndex = 0;
    const totalCards = cards.length;
    
    // 創建點點指示器
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
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

