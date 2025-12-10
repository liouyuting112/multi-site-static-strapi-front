// 星座解密站 - 導覽列與下拉選單邏輯
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

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
                    dropdowns.forEach(d => d.classList.remove('active'));
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

    // 每日文章自動輪播（cds006 - 自動滑動）
    const dailySlider = document.querySelector('.daily-slider-track');
    const prevBtn = document.querySelector('.slider-btn-prev');
    const nextBtn = document.querySelector('.slider-btn-next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (dailySlider && prevBtn && nextBtn) {
        const cards = dailySlider.querySelectorAll('.daily-card');
        let currentIndex = 0;
        let autoSlideInterval = null;
        const cardsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
        const totalSlides = Math.ceil(cards.length / cardsPerView);
        
        // 創建指示點
        if (dotsContainer && totalSlides > 1) {
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `第 ${i + 1} 頁`);
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateSlider();
                    resetAutoSlide();
                });
                dotsContainer.appendChild(dot);
            }
        }
        
        function updateSlider() {
            if (cards.length === 0) return;
            // 使用容器寬度來計算，確保每次切換整個視窗
            const container = dailySlider.parentElement; // .daily-slider
            if (!container) return;
            const containerWidth = container.offsetWidth || container.clientWidth;
            const translateX = -currentIndex * containerWidth;
            dailySlider.style.transform = `translateX(${translateX}px)`;
            
            // 更新指示點
            const dots = dotsContainer?.querySelectorAll('.slider-dot');
            dots?.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
            
            // 更新按鈕狀態
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            nextBtn.style.opacity = currentIndex >= totalSlides - 1 ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentIndex >= totalSlides - 1 ? 'none' : 'auto';
        }
        
        function goToSlide(index) {
            currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
            updateSlider();
        }
        
        function nextSlide() {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // 循環播放
            }
            updateSlider();
        }
        
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = totalSlides - 1; // 循環播放
            }
            updateSlider();
        }
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                nextSlide();
            }, 4000); // 每4秒自動切換
        }
        
        function stopAutoSlide() {
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
            }
        }
        
        function resetAutoSlide() {
            stopAutoSlide();
            startAutoSlide();
        }
        
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
            resetAutoSlide();
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
            resetAutoSlide();
        });
        
        // 滑鼠懸停時暫停自動播放
        const sliderWrapper = dailySlider.closest('.daily-slider-wrapper');
        if (sliderWrapper) {
            sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
            sliderWrapper.addEventListener('mouseleave', startAutoSlide);
        }
        
        // 初始化
        updateSlider();
        startAutoSlide();
    }
});
