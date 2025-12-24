// 知識寶庫 - 導覽列邏輯與垂直滑動輪播
document.addEventListener('DOMContentLoaded', () => {
    // 下拉選單點擊功能（所有設備都支持點擊，桌面版同時保持hover）
    const hasDropdown = document.querySelector('.has-dropdown');
    const dropdownSplit = document.querySelector('.dropdown-split');
    
    if (hasDropdown && dropdownSplit) {
        // 確保下拉選單在按鈕正下方
        function updateDropdownPosition() {
            if (hasDropdown && dropdownSplit) {
                const buttonRect = hasDropdown.getBoundingClientRect();
                dropdownSplit.style.left = '0';
                dropdownSplit.style.minWidth = Math.max(buttonRect.width, 200) + 'px';
            }
        }
        
        // 確保初始狀態正確
        if (window.innerWidth > 768) {
            dropdownSplit.style.display = 'none';
        }
        
        // 初始化位置
        updateDropdownPosition();
        
        // 點擊展開/收起下拉選單
        hasDropdown.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = hasDropdown.classList.contains('active');
            
            // 更新位置
            updateDropdownPosition();
            
            // 關閉所有其他下拉選單（如果有的話）
            document.querySelectorAll('.has-dropdown').forEach(dd => {
                if (dd !== hasDropdown) {
                    dd.classList.remove('active');
                    const ddMenu = dd.querySelector('.dropdown-split');
                    if (ddMenu) ddMenu.style.display = 'none';
                }
            });
            
            // 切換當前下拉選單
            if (isActive) {
                hasDropdown.classList.remove('active');
                dropdownSplit.style.display = 'none';
            } else {
                hasDropdown.classList.add('active');
                dropdownSplit.style.display = 'block';
                updateDropdownPosition();
            }
        });
        
        // 點擊外部關閉下拉選單
        document.addEventListener('click', (e) => {
            if (!hasDropdown.contains(e.target)) {
                hasDropdown.classList.remove('active');
                // 桌面版保持hover顯示，手機版完全隱藏
                if (window.innerWidth <= 768) {
                    dropdownSplit.style.display = 'none';
                }
            }
        });
        
        // 桌面版：滑鼠進入時顯示
        if (window.innerWidth > 768) {
            hasDropdown.addEventListener('mouseenter', () => {
                updateDropdownPosition();
                dropdownSplit.style.display = 'block';
            });
            
            hasDropdown.addEventListener('mouseleave', () => {
                // 延遲關閉，讓用戶有時間移動到下拉選單
                setTimeout(() => {
                    if (!hasDropdown.matches(':hover') && !dropdownSplit.matches(':hover')) {
                        hasDropdown.classList.remove('active');
                        dropdownSplit.style.display = 'none';
                    }
                }, 200);
            });
            
            dropdownSplit.addEventListener('mouseenter', () => {
                dropdownSplit.style.display = 'block';
            });
            
            dropdownSplit.addEventListener('mouseleave', () => {
                hasDropdown.classList.remove('active');
                dropdownSplit.style.display = 'none';
            });
        }
        
        // 視窗大小改變時更新位置
        window.addEventListener('resize', () => {
            updateDropdownPosition();
        });
    }
    
    // 垂直滑動輪播功能
    initVerticalSlider();
});

function initVerticalSlider() {
    const track = document.querySelector('.daily-vertical-track');
    const cards = document.querySelectorAll('.daily-vertical-track .daily-full-card');
    const prevBtn = document.querySelector('.prev-vertical-btn');
    const nextBtn = document.querySelector('.next-vertical-btn');
    const dotsContainer = document.querySelector('.vertical-slider-dots');
    
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
        const cardHeight = cards[0].offsetHeight;
        const gap = 32; // 2rem = 32px
        const translateY = -currentIndex * (cardHeight + gap);
        track.style.transform = `translateY(${translateY}px)`;
        
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
    let touchStartY = 0;
    let touchEndY = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
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
    
    // 自動播放（可選）
    // let autoPlayInterval = setInterval(nextSlide, 5000);
    // track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    // track.addEventListener('mouseleave', () => {
    //     autoPlayInterval = setInterval(nextSlide, 5000);
    // });
    
    // 初始化
    updateSlider();
}

