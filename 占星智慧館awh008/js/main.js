// 占星智慧館 - 導覽列與下拉選單邏輯
document.addEventListener('DOMContentLoaded', function() {
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
    let articlesTrack = document.querySelector('.articles-track');
    let slidePrev = document.querySelector('.slide-prev');
    let slideNext = document.querySelector('.slide-next');
    
    console.log('awh008 - articlesTrack:', articlesTrack);
    console.log('awh008 - slidePrev:', slidePrev);
    console.log('awh008 - slideNext:', slideNext);
    
    // 確保按鈕可以點擊（桌面版和響應式都要）
    // 先檢查按鈕是否存在
    if (!slidePrev || !slideNext) {
        console.error('awh008 - 找不到按鈕元素:', { slidePrev, slideNext });
        return;
    }
    
    // 強制設置按鈕樣式，確保在所有情況下都可點擊
    [slidePrev, slideNext].forEach((btn, index) => {
        btn.style.zIndex = '1002';
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.position = 'relative';
        btn.style.userSelect = 'none';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', index === 0 ? '上一張' : '下一張');
        
        console.log(`awh008 - ${index === 0 ? 'slidePrev' : 'slideNext'} 樣式設置完成:`, {
            zIndex: btn.style.zIndex,
            pointerEvents: btn.style.pointerEvents,
            cursor: btn.style.cursor,
            display: btn.style.display,
            computedZIndex: window.getComputedStyle(btn).zIndex,
            computedPointerEvents: window.getComputedStyle(btn).pointerEvents
        });
    });
    
    if (articlesTrack && slidePrev && slideNext) {
        let articles = articlesTrack.querySelectorAll('.article-box');
        let currentIndex = 0;
        let articlesPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
        let totalSlides = Math.ceil(articles.length / articlesPerView);
        
        // 保存按鈕引用，以便重新初始化時使用
        let slidePrevRef = slidePrev;
        let slideNextRef = slideNext;
        
        function updateSlider() {
            // ⚠️ 關鍵：每次更新時重新獲取文章元素（因為CMS可能已經更新了DOM）
            articles = articlesTrack.querySelectorAll('.article-box');
            
            // 動態判斷響應式狀態
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
            const isDesktop = window.innerWidth > 1024;
            
            // 根據響應式狀態設置每頁顯示的文章數
            articlesPerView = isMobile ? 1 : isTablet ? 2 : 3;
            totalSlides = Math.ceil(articles.length / articlesPerView);
            
            if (articles.length === 0) return;
            
            // 使用wrapper寬度來計算
            const wrapper = articlesTrack.closest('.articles-slider-wrapper');
            const container = articlesTrack.parentElement; // .articles-container
            if (!container || !wrapper) return;
            
            // 確保容器有正確的樣式
            container.style.overflow = 'hidden';
            container.style.position = 'relative';
            container.style.width = '100%';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            
            // 確保track有正確的樣式
            articlesTrack.style.display = 'flex';
            articlesTrack.style.flexWrap = 'nowrap';
            articlesTrack.style.transition = 'transform 0.5s ease';
            articlesTrack.style.willChange = 'transform';
            
            // 獲取容器寬度
            const containerWidth = wrapper.offsetWidth || wrapper.clientWidth || container.offsetWidth || container.clientWidth;
            
            // 確保 currentIndex 在有效範圍內
            currentIndex = Math.max(0, Math.min(currentIndex, totalSlides - 1));
            
            // ⚠️ 關鍵：使用比例計算，確保卡片在屏幕中間
            // 計算每個卡片應該佔據的容器寬度比例
            const cardWidthPercent = 100 / articlesPerView; // 例如：3個卡片 = 33.333%
            
            // 計算當前卡片應該移動到的位置（百分比）
            const targetPositionPercent = currentIndex * cardWidthPercent;
            
            // 轉換為實際的 px 值
            const targetPositionPx = (containerWidth * targetPositionPercent) / 100;
            
            // 計算單個卡片的實際寬度（px）
            const singleCardWidthPx = containerWidth / articlesPerView;
            
            // 計算居中偏移量：讓當前卡片在容器中間
            // 偏移量 = (容器寬度 - 單個卡片寬度) / 2
            const offsetToCenter = (containerWidth - singleCardWidthPx) / 2;
            
            // 總偏移量：先移動到目標位置，然後調整到中間
            const translateX = -targetPositionPx + offsetToCenter;
            
            articlesTrack.style.transform = `translateX(${translateX}px)`;
            
            console.log('awh008 - 比例滑動:', {
                containerWidth,
                articlesPerView,
                cardWidthPercent: `${cardWidthPercent}%`,
                targetPositionPercent: `${targetPositionPercent}%`,
                targetPositionPx,
                singleCardWidthPx,
                offsetToCenter,
                translateX,
                currentIndex,
                totalSlides,
                isMobile,
                isTablet,
                isDesktop
            });
            
            if (slidePrevRef && slideNextRef) {
                slidePrevRef.disabled = currentIndex === 0;
                slideNextRef.disabled = currentIndex >= totalSlides - 1;
            }
        }
        
        // 監聽視窗大小變化，重新計算
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newArticlesPerView = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
                if (newArticlesPerView !== articlesPerView) {
                    currentIndex = 0;
                }
                // 即使 articlesPerView 沒變，也要重新計算（因為容器寬度可能改變）
                updateSlider();
            }, 250);
        });
        
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
        
        // ⚠️ 關鍵：確保按鈕在所有情況下都可點擊
        // 使用保存的引用
        const btnPrev = slidePrevRef;
        const btnNext = slideNextRef;
        
        // 重新設置按鈕樣式（強制設置，確保桌面版和響應式都可點擊）
        btnPrev.style.zIndex = '1004';
        btnPrev.style.pointerEvents = 'auto';
        btnPrev.style.cursor = 'pointer';
        btnPrev.style.position = 'relative';
        btnPrev.style.display = 'flex';
        btnPrev.style.alignItems = 'center';
        btnPrev.style.justifyContent = 'center';
        btnPrev.setAttribute('tabindex', '0');
        btnPrev.setAttribute('role', 'button');
        btnPrev.setAttribute('type', 'button');
        
        btnNext.style.zIndex = '1004';
        btnNext.style.pointerEvents = 'auto';
        btnNext.style.cursor = 'pointer';
        btnNext.style.position = 'relative';
        btnNext.style.display = 'flex';
        btnNext.style.alignItems = 'center';
        btnNext.style.justifyContent = 'center';
        btnNext.setAttribute('tabindex', '0');
        btnNext.setAttribute('role', 'button');
        btnNext.setAttribute('type', 'button');
        
        // 確保按鈕容器也可點擊
        const sliderControls = btnPrev.closest('.slider-controls');
        if (sliderControls) {
            sliderControls.style.zIndex = '1003';
            sliderControls.style.pointerEvents = 'auto';
            sliderControls.style.position = 'relative';
        }
        
        // 使用onclick確保事件綁定
        btnPrev.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('awh008 prev button clicked (onclick)');
            prevSlide();
            return false;
        };
        
        btnNext.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('awh008 next button clicked (onclick)');
            nextSlide();
            return false;
        };
        
        // 同時使用addEventListener作為備份（使用捕獲階段）
        btnPrev.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('awh008 prev button clicked (addEventListener capture)');
            prevSlide();
            return false;
        }, true);
        
        btnNext.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('awh008 next button clicked (addEventListener capture)');
            nextSlide();
            return false;
        }, true);
        
        // 同時使用冒泡階段
        btnPrev.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('awh008 prev button clicked (addEventListener bubble)');
            prevSlide();
            return false;
        }, false);
        
        btnNext.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('awh008 next button clicked (addEventListener bubble)');
            nextSlide();
            return false;
        }, false);
        
        // 測試按鈕是否可點擊
        console.log('awh008 - 按鈕設置完成:', {
            slidePrev: {
                element: btnPrev,
                zIndex: btnPrev.style.zIndex,
                pointerEvents: btnPrev.style.pointerEvents,
                cursor: btnPrev.style.cursor,
                onclick: typeof btnPrev.onclick
            },
            slideNext: {
                element: btnNext,
                zIndex: btnNext.style.zIndex,
                pointerEvents: btnNext.style.pointerEvents,
                cursor: btnNext.style.cursor,
                onclick: typeof btnNext.onclick
            }
        });
        
        // 延遲初始化，確保元素完全渲染
        setTimeout(() => {
            updateSlider();
        }, 100);
        
        // 監聽CMS內容更新事件，自動重新初始化（不依賴CMS主動調用）
        document.addEventListener('cmsContentUpdated', (e) => {
            if (e.detail && e.detail.type === 'daily') {
                console.log('📢 [awh008] 檢測到CMS內容更新，自動重新初始化滑動器...');
                setTimeout(() => {
                    // 重新獲取元素引用（因為CMS可能已經更新了DOM）
                    const newArticlesTrack = document.querySelector('.articles-track');
                    const newSlidePrev = document.querySelector('.slide-prev');
                    const newSlideNext = document.querySelector('.slide-next');
                    
                    if (newArticlesTrack && newSlidePrev && newSlideNext) {
                        // 更新引用
                        articlesTrack = newArticlesTrack;
                        slidePrevRef = newSlidePrev;
                        slideNextRef = newSlideNext;
                        
                        // 重新設置按鈕樣式（強制設置，確保桌面版和響應式都可點擊）
                        slidePrevRef.style.zIndex = '1004';
                        slidePrevRef.style.pointerEvents = 'auto';
                        slidePrevRef.style.cursor = 'pointer';
                        slidePrevRef.style.position = 'relative';
                        slidePrevRef.style.display = 'flex';
                        slidePrevRef.style.alignItems = 'center';
                        slidePrevRef.style.justifyContent = 'center';
                        slidePrevRef.setAttribute('tabindex', '0');
                        slidePrevRef.setAttribute('role', 'button');
                        slidePrevRef.setAttribute('type', 'button');
                        
                        slideNextRef.style.zIndex = '1004';
                        slideNextRef.style.pointerEvents = 'auto';
                        slideNextRef.style.cursor = 'pointer';
                        slideNextRef.style.position = 'relative';
                        slideNextRef.style.display = 'flex';
                        slideNextRef.style.alignItems = 'center';
                        slideNextRef.style.justifyContent = 'center';
                        slideNextRef.setAttribute('tabindex', '0');
                        slideNextRef.setAttribute('role', 'button');
                        slideNextRef.setAttribute('type', 'button');
                        
                        // 確保按鈕容器也可點擊
                        const sliderControlsReinit = slidePrevRef.closest('.slider-controls');
                        if (sliderControlsReinit) {
                            sliderControlsReinit.style.zIndex = '1003';
                            sliderControlsReinit.style.pointerEvents = 'auto';
                            sliderControlsReinit.style.position = 'relative';
                        }
                        
                        // 重新綁定事件
                        slidePrevRef.onclick = function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.log('awh008 prev button clicked (reinit)');
                            prevSlide();
                            return false;
                        };
                        
                        slideNextRef.onclick = function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.log('awh008 next button clicked (reinit)');
                            nextSlide();
                            return false;
                        };
                        
                        // 重新綁定 addEventListener
                        slidePrevRef.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.log('awh008 prev button clicked (addEventListener reinit)');
                            prevSlide();
                            return false;
                        }, true);
                        
                        slideNextRef.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            console.log('awh008 next button clicked (addEventListener reinit)');
                            nextSlide();
                            return false;
                        }, true);
                        
                        // 重置索引並更新滑動器
                        currentIndex = 0;
                        updateSlider();
                        console.log('✅ [awh008] 滑動器自動重新初始化完成');
                    } else {
                        console.warn('⚠️ [awh008] 重新初始化時找不到必要的DOM元素');
                    }
                }, 400);
            }
        });
    }
});
