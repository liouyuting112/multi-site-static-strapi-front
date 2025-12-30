// 星座運勢屋 - 導覽列與下拉選單邏輯
console.log('zfh009 - main.js 文件開始載入');

(function() {
    'use strict';
    
    console.log('zfh009 - main.js IIFE 開始執行');
    console.log('zfh009 - document.readyState:', document.readyState);
    
    function initSlider() {
        console.log('zfh009 - initSlider 開始執行');
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
    }
    
    // 調用initSlider初始化導覽列
    initSlider();
    console.log('zfh009 - initSlider 執行完成');

    // 每日文章 - 上下滑動（zfh009 - 上下排列）
    // 使用全局變量，確保可以在任何地方訪問
    console.log('zfh009 - 開始創建 zfh009Slider 對象');
    window.zfh009Slider = {
        initialized: false,
        currentIndex: 0,
        items: [],
        dailyTrack: null,
        navPrev: null,
        navNext: null,
        isSliding: false, // 移到對象屬性中，避免每次初始化都重新創建
        
        updateSlider: function() {
            if (this.items.length === 0) {
                console.log('zfh009 - 沒有找到項目');
                return;
            }
            
            const container = this.dailyTrack.parentElement;
            if (!container) return;
            
            container.style.overflow = 'hidden';
            container.style.position = 'relative';
            
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
            let containerHeight;
            
            if (isMobile) {
                containerHeight = 350;
            } else if (isTablet) {
                containerHeight = 380;
            } else {
                containerHeight = 400;
            }
            
            container.style.height = containerHeight + 'px';
            
            this.items.forEach(item => {
                item.style.height = containerHeight + 'px';
                item.style.minHeight = containerHeight + 'px';
                item.style.maxHeight = containerHeight + 'px';
            });
            
            this.dailyTrack.style.display = 'flex';
            this.dailyTrack.style.flexDirection = 'column';
            this.dailyTrack.style.flexWrap = 'nowrap';
            this.dailyTrack.style.transition = 'transform 0.5s ease';
            this.dailyTrack.style.willChange = 'transform';
            this.dailyTrack.style.gap = '0';
            
            const translateY = -this.currentIndex * containerHeight;
            this.dailyTrack.style.transform = `translateY(${translateY}px)`;
            
            console.log('zfh009 - updateSlider: currentIndex=', this.currentIndex, 'translateY=', translateY);
            
            if (this.navPrev) {
                // 只改變視覺樣式，不阻止點擊（確保按鈕始終可點擊）
                this.navPrev.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
                this.navPrev.style.pointerEvents = 'auto'; // 始終允許點擊
                this.navPrev.style.cursor = this.currentIndex === 0 ? 'not-allowed' : 'pointer';
                this.navPrev.disabled = this.currentIndex === 0; // 使用disabled屬性
            }
            
            if (this.navNext) {
                // 只改變視覺樣式，不阻止點擊（確保按鈕始終可點擊）
                this.navNext.style.opacity = this.currentIndex >= this.items.length - 1 ? '0.5' : '1';
                this.navNext.style.pointerEvents = 'auto'; // 始終允許點擊
                this.navNext.style.cursor = this.currentIndex >= this.items.length - 1 ? 'not-allowed' : 'pointer';
                this.navNext.disabled = this.currentIndex >= this.items.length - 1; // 使用disabled屬性
            }
        },
        
        nextSlide: function() {
            // 重新獲取items，確保使用最新值
            this.items = Array.from(this.dailyTrack.querySelectorAll('.daily-item'));
            
            console.log('zfh009 - nextSlide called', {
                currentIndex: this.currentIndex,
                itemsLength: this.items.length,
                canMove: this.currentIndex < this.items.length - 1,
                windowWidth: window.innerWidth
            });
            
            if (this.currentIndex < this.items.length - 1) {
                this.currentIndex++;
                console.log('zfh009 - 移動到下一張，新索引:', this.currentIndex);
                this.updateSlider();
            } else {
                console.warn('zfh009 - 已經是最後一張，無法繼續');
            }
        },
        
        prevSlide: function() {
            // 重新獲取items，確保使用最新值
            this.items = Array.from(this.dailyTrack.querySelectorAll('.daily-item'));
            
            console.log('zfh009 - prevSlide called', {
                currentIndex: this.currentIndex,
                itemsLength: this.items.length,
                canMove: this.currentIndex > 0,
                windowWidth: window.innerWidth
            });
            
            if (this.currentIndex > 0) {
                this.currentIndex--;
                console.log('zfh009 - 移動到上一張，新索引:', this.currentIndex);
                this.updateSlider();
            } else {
                console.warn('zfh009 - 已經是第一張，無法繼續');
            }
        },
        
        init: function() {
            console.log('zfh009 - 開始初始化滑塊');
            console.log('zfh009 - document.readyState:', document.readyState);
            console.log('zfh009 - window.innerWidth:', window.innerWidth);
            
            // 重新查詢元素，確保找到最新的DOM
            this.dailyTrack = document.querySelector('.daily-list-track');
            this.navPrev = document.querySelector('.nav-arrow-prev');
            this.navNext = document.querySelector('.nav-arrow-next');
            
            console.log('zfh009 - dailyTrack:', this.dailyTrack);
            console.log('zfh009 - navPrev:', this.navPrev);
            console.log('zfh009 - navNext:', this.navNext);
            
            // 如果元素不存在，嘗試多次查找
            if (!this.dailyTrack || !this.navPrev || !this.navNext) {
                console.warn('zfh009 - 元素未找到，嘗試查找所有可能的選擇器');
                console.log('zfh009 - 查找 .daily-list-track:', document.querySelectorAll('.daily-list-track').length);
                console.log('zfh009 - 查找 .nav-arrow-prev:', document.querySelectorAll('.nav-arrow-prev').length);
                console.log('zfh009 - 查找 .nav-arrow-next:', document.querySelectorAll('.nav-arrow-next').length);
                console.log('zfh009 - 查找 .nav-arrow:', document.querySelectorAll('.nav-arrow').length);
                return false;
            }
            
            // 重新查詢items
            this.items = Array.from(this.dailyTrack.querySelectorAll('.daily-item'));
            this.currentIndex = 0;
            
            console.log('zfh009 - 找到', this.items.length, '個項目');
            
            // 確保按鈕樣式和屬性
            this.navPrev.style.zIndex = '1005'; // 提高z-index
            this.navPrev.style.pointerEvents = 'auto';
            this.navPrev.style.cursor = 'pointer';
            this.navPrev.style.position = 'absolute';
            this.navPrev.style.display = 'flex';
            this.navPrev.style.isolation = 'isolate'; // 創建獨立的層疊上下文
            this.navPrev.style.minWidth = '50px';
            this.navPrev.style.minHeight = '50px';
            this.navPrev.setAttribute('tabindex', '0');
            this.navPrev.setAttribute('role', 'button');
            this.navPrev.setAttribute('type', 'button');
            
            this.navNext.style.zIndex = '1005'; // 提高z-index
            this.navNext.style.pointerEvents = 'auto';
            this.navNext.style.cursor = 'pointer';
            this.navNext.style.position = 'absolute';
            this.navNext.style.display = 'flex';
            this.navNext.style.isolation = 'isolate'; // 創建獨立的層疊上下文
            this.navNext.style.minWidth = '50px';
            this.navNext.style.minHeight = '50px';
            this.navNext.setAttribute('tabindex', '0');
            this.navNext.setAttribute('role', 'button');
            this.navNext.setAttribute('type', 'button');
            
            // 綁定事件 - 使用箭頭函數確保this正確
            const self = this;
            
            // 移除舊的事件監聽器
            const newPrev = this.navPrev.cloneNode(true);
            const newNext = this.navNext.cloneNode(true);
            this.navPrev.parentNode.replaceChild(newPrev, this.navPrev);
            this.navNext.parentNode.replaceChild(newNext, this.navNext);
            
            // 重新獲取引用
            this.navPrev = document.querySelector('.nav-arrow-prev');
            this.navNext = document.querySelector('.nav-arrow-next');
            
            // 重新設置樣式
            this.navPrev.style.zIndex = '1005'; // 提高z-index
            this.navPrev.style.pointerEvents = 'auto';
            this.navPrev.style.cursor = 'pointer';
            this.navPrev.style.position = 'absolute';
            this.navPrev.style.display = 'flex';
            this.navPrev.style.isolation = 'isolate';
            this.navPrev.style.minWidth = '50px';
            this.navPrev.style.minHeight = '50px';
            
            this.navNext.style.zIndex = '1005'; // 提高z-index
            this.navNext.style.pointerEvents = 'auto';
            this.navNext.style.cursor = 'pointer';
            this.navNext.style.position = 'absolute';
            this.navNext.style.display = 'flex';
            this.navNext.style.isolation = 'isolate';
            this.navNext.style.minWidth = '50px';
            this.navNext.style.minHeight = '50px';
            
            // ⚠️ 關鍵：綁定事件 - 使用onclick（最高優先級）
            // 使用對象的isSliding屬性，確保在所有情況下都能訪問
            console.log('zfh009 - 開始綁定按鈕事件');
            console.log('zfh009 - 測試按鈕訪問:', {
                navPrev: !!this.navPrev,
                navNext: !!this.navNext,
                navPrevElement: this.navPrev,
                navNextElement: this.navNext
            });
            
            this.navPrev.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('zfh009 - PREV BUTTON CLICKED!', {
                    windowWidth: window.innerWidth,
                    isDesktop: window.innerWidth > 1024,
                    currentIndex: self.currentIndex,
                    itemsLength: self.items.length,
                    disabled: self.navPrev.disabled,
                    isSliding: self.isSliding
                });
                
                // 檢查是否被禁用或正在滑動
                if (self.isSliding || self.navPrev.disabled) {
                    console.log('zfh009 - 按鈕被禁用或正在滑動，忽略點擊');
                    return false;
                }
                
                self.isSliding = true;
                self.prevSlide();
                
                setTimeout(() => {
                    self.isSliding = false;
                }, 300);
                
                return false;
            };
            
            this.navNext.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('zfh009 - NEXT BUTTON CLICKED!', {
                    windowWidth: window.innerWidth,
                    isDesktop: window.innerWidth > 1024,
                    currentIndex: self.currentIndex,
                    itemsLength: self.items.length,
                    disabled: self.navNext.disabled,
                    isSliding: self.isSliding
                });
                
                // 檢查是否被禁用或正在滑動
                if (self.isSliding || self.navNext.disabled) {
                    console.log('zfh009 - 按鈕被禁用或正在滑動，忽略點擊');
                    return false;
                }
                
                self.isSliding = true;
                self.nextSlide();
                
                setTimeout(() => {
                    self.isSliding = false;
                }, 300);
                
                return false;
            };
            
            // 測試事件是否綁定成功
            console.log('zfh009 - 事件綁定完成:', {
                navPrevOnclick: typeof this.navPrev.onclick,
                navNextOnclick: typeof this.navNext.onclick,
                navPrevHasListener: !!this.navPrev.onclick,
                navNextHasListener: !!this.navNext.onclick
            });
            
            // 添加mousedown事件作為備份（桌面版）
            this.navPrev.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('zfh009 - PREV BUTTON MOUSEDOWN!');
                if (!self.isSliding && !self.navPrev.disabled) {
                    self.isSliding = true;
                    self.prevSlide();
                    setTimeout(() => {
                        self.isSliding = false;
                    }, 300);
                }
            }, true);
            
            this.navNext.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('zfh009 - NEXT BUTTON MOUSEDOWN!');
                if (!self.isSliding && !self.navNext.disabled) {
                    self.isSliding = true;
                    self.nextSlide();
                    setTimeout(() => {
                        self.isSliding = false;
                    }, 300);
                }
            }, true);
            
            // 觸摸支持
            let startY = 0;
            let isDragging = false;
            
            this.dailyTrack.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                isDragging = true;
            });
            
            this.dailyTrack.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
            });
            
            this.dailyTrack.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                const endY = e.changedTouches[0].clientY;
                const diff = startY - endY;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) self.nextSlide();
                    else self.prevSlide();
                }
                
                isDragging = false;
            });
            
            // 初始化 - 立即執行一次，確保按鈕狀態正確
            this.updateSlider();
            
            // 延遲再執行一次，確保DOM完全渲染
            setTimeout(() => {
                console.log('zfh009 - 延遲初始化');
                this.updateSlider();
            }, 100);
            
            // 再延遲一次，確保CMS內容加載完成
            setTimeout(() => {
                console.log('zfh009 - 第二次延遲初始化');
                this.updateSlider();
            }, 500);
            
            // 視窗大小變化
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.updateSlider();
                }, 150);
            });
            
            this.initialized = true;
            console.log('zfh009 - 滑塊初始化完成！');
            return true;
        }
    };
    
    // 暴露到全局
    window.reInitZfh009Slider = function() {
        console.log('zfh009 - 手動重新初始化');
        window.zfh009Slider.initialized = false;
        window.zfh009Slider.init();
    };
    
    // DOM載入完成後初始化
    function tryInitZfh009Slider() {
        if (window.zfh009Slider.initialized) {
            console.log('zfh009 - 已經初始化，跳過');
            return;
        }
        
        console.log('zfh009 - 嘗試初始化滑塊...');
        
        if (window.zfh009Slider.init()) {
            console.log('zfh009 - 初始化成功！');
        } else {
            console.log('zfh009 - 初始化失敗，將重試...');
            setTimeout(tryInitZfh009Slider, 200);
        }
    }
    
    // 確保在DOM準備好後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('zfh009 - DOMContentLoaded，開始初始化');
            setTimeout(tryInitZfh009Slider, 100);
        });
    } else {
        console.log('zfh009 - DOM已準備好，立即初始化');
        setTimeout(tryInitZfh009Slider, 100);
    }
    
    // 監聽CMS內容更新事件
    document.addEventListener('cmsContentUpdated', (e) => {
        setTimeout(() => {
            console.log('zfh009 - CMS內容更新，重新初始化', e.detail);
            window.zfh009Slider.initialized = false;
            window.zfh009Slider.isSliding = false; // 重置滑動狀態
            tryInitZfh009Slider();
        }, 400);
    });
    
    // 立即執行初始化（如果DOM已準備好）
    console.log('zfh009 - 準備調用 tryInitZfh009Slider');
    tryInitZfh009Slider();
    
    console.log('zfh009 - main.js IIFE 執行完成');
})();

console.log('zfh009 - main.js 文件載入完成');
