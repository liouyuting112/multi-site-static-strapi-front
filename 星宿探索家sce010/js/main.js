// 星宿探索家 - 全覆蓋導覽列邏輯
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navOverlay = document.querySelector('.nav-overlay');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (menuToggle && navOverlay) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = navOverlay.classList.contains('active') ? 'hidden' : '';
        });

        // 點擊覆蓋層關閉
        navOverlay.addEventListener('click', (e) => {
            if (e.target === navOverlay) {
                menuToggle.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
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

    // 探索主題 - 自動滑動（sce010）
    const topicsTrack = document.querySelector('.topics-track');
    const swipePrev = document.querySelector('.swipe-btn-prev');
    const swipeNext = document.querySelector('.swipe-btn-next');
    
    if (topicsTrack) {
        const topics = topicsTrack.querySelectorAll('.topic-item');
        let currentIndex = 0;
        let autoSlideInterval = null;
        const topicsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
        const totalSlides = Math.ceil(topics.length / topicsPerView);
        
        function updateTopicsSlider() {
            if (topics.length === 0) return;
            // 使用容器寬度來計算，確保每次切換整個視窗
            const container = topicsTrack.parentElement; // .topics-masonry
            if (!container) return;
            const containerWidth = container.offsetWidth || container.clientWidth;
            const translateX = -currentIndex * containerWidth;
            topicsTrack.style.transform = `translateX(${translateX}px)`;
            
            if (swipePrev && swipeNext) {
                swipePrev.style.opacity = currentIndex === 0 ? '0.5' : '1';
                swipePrev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
                swipeNext.style.opacity = currentIndex >= totalSlides - 1 ? '0.5' : '1';
                swipeNext.style.pointerEvents = currentIndex >= totalSlides - 1 ? 'none' : 'auto';
            }
        }
        
        function nextTopicsSlide() {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // 循環播放
            }
            updateTopicsSlider();
        }
        
        function prevTopicsSlide() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = totalSlides - 1; // 循環播放
            }
            updateTopicsSlider();
        }
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                nextTopicsSlide();
            }, 5000); // 每5秒自動切換
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
        
        if (swipePrev && swipeNext) {
            swipePrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                prevTopicsSlide();
                resetAutoSlide();
            });
            
            swipeNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextTopicsSlide();
                resetAutoSlide();
            });
        }
        
        // 滑鼠懸停時暫停自動播放
        const topicsWrapper = topicsTrack.closest('.topics-slider-wrapper');
        if (topicsWrapper) {
            topicsWrapper.addEventListener('mouseenter', stopAutoSlide);
            topicsWrapper.addEventListener('mouseleave', startAutoSlide);
        }
        
        updateTopicsSlider();
        startAutoSlide();
    }

    // 每日文章 - 自動滑動（sce010）
    const dailyTrack = document.querySelector('.daily-track');
    const scrollPrev = document.querySelector('.scroll-btn-prev');
    const scrollNext = document.querySelector('.scroll-btn-next');
    
    if (dailyTrack) {
        const posts = dailyTrack.querySelectorAll('.daily-post');
        let currentIndex = 0;
        let autoSlideInterval = null;
        const postsPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
        const totalSlides = Math.ceil(posts.length / postsPerView);
        
        function updateDailySlider() {
            if (posts.length === 0) return;
            // 使用容器寬度來計算，確保每次切換整個視窗
            const container = dailyTrack.parentElement; // .daily-grid
            if (!container) return;
            const containerWidth = container.offsetWidth || container.clientWidth;
            const translateX = -currentIndex * containerWidth;
            dailyTrack.style.transform = `translateX(${translateX}px)`;
            
            if (scrollPrev && scrollNext) {
                scrollPrev.style.opacity = currentIndex === 0 ? '0.5' : '1';
                scrollPrev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
                scrollNext.style.opacity = currentIndex >= totalSlides - 1 ? '0.5' : '1';
                scrollNext.style.pointerEvents = currentIndex >= totalSlides - 1 ? 'none' : 'auto';
            }
        }
        
        function nextDailySlide() {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
            } else {
                currentIndex = 0; // 循環播放
            }
            updateDailySlider();
        }
        
        function prevDailySlide() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = totalSlides - 1; // 循環播放
            }
            updateDailySlider();
        }
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                nextDailySlide();
            }, 4500); // 每4.5秒自動切換
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
        
        if (scrollPrev && scrollNext) {
            scrollPrev.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                prevDailySlide();
                resetAutoSlide();
            });
            
            scrollNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                nextDailySlide();
                resetAutoSlide();
            });
        }
        
        // 觸摸滑動支持
        let startX = 0;
        let isDragging = false;
        
        dailyTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            stopAutoSlide();
        });
        
        dailyTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        dailyTrack.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextDailySlide();
                else prevDailySlide();
            }
            
            isDragging = false;
            resetAutoSlide();
        });
        
        // 滑鼠懸停時暫停自動播放
        const dailyWrapper = dailyTrack.closest('.daily-slider-wrapper');
        if (dailyWrapper) {
            dailyWrapper.addEventListener('mouseenter', stopAutoSlide);
            dailyWrapper.addEventListener('mouseleave', startAutoSlide);
        }
        
        updateDailySlider();
        startAutoSlide();
    }
});
