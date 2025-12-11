// 确保loader已加载
if (typeof loader === 'undefined') {
    console.error('ContentfulLoader未載入，請確保已引入contentful-loader.js');
}

// 使用全局SITE_CODE（已在contentful-integration.js中定义）
// 如果未定义，则定义它
if (typeof SITE_CODE === 'undefined') {
    window.SITE_CODE = 'dlh011';
}

/**
 * 广告功能整合脚本
 * 从Contentful加载并显示广告
 */

// ============================================
// 广告相关函数
// ============================================

/**
 * 加载广告
 * @param {string} position - 广告位置（header, sidebar, footer, content）
 * @returns {Promise<Array>} 广告列表
 */
async function loadAds(position) {
    try {
        const result = await loader.getEntries('ad', {
            'fields.site': SITE_CODE,
            'fields.position': position,
            'fields.isActive': true,
            order: 'fields.order'
        });
        
        // 客户端二次过滤：确保只显示当前网站的广告
        const siteFilteredAds = result.items.filter(item => {
            const itemData = item.fields || {};
            let itemSite = itemData.site || itemData.siteCode || '';
            if (typeof itemSite === 'object' && itemSite !== null && 'en-US' in itemSite) {
                itemSite = itemSite['en-US'];
            }
            return itemSite === SITE_CODE;
        });
        
        return siteFilteredAds;
    } catch (error) {
        console.error('加载广告失败:', error);
        return [];
    }
}

/**
 * 渲染广告
 * @param {HTMLElement} container - 广告容器
 * @param {Array} ads - 广告列表
 */
function renderAds(container, ads) {
    if (!container) {
        return;
    }
    
    container.innerHTML = '';
    
    if (ads.length === 0) {
        return;
    }
    
    ads.forEach(ad => {
        const adData = ad.fields;
        
        // 获取广告类型
        let adType = adData.adType || '';
        if (typeof adType === 'object' && adType !== null && 'en-US' in adType) {
            adType = adType['en-US'];
        }
        
        let adHtml = '';
        
        if (adType === 'image') {
            // 渲染图片广告
            let imageUrl = adData.imageUrl || '';
            if (typeof imageUrl === 'object' && imageUrl !== null && 'en-US' in imageUrl) {
                imageUrl = imageUrl['en-US'];
            }
            
            if (imageUrl) {
                adHtml = `
                    <a href="#" target="_blank" rel="nofollow" class="ad-container">
                        <img src="${imageUrl}" alt="3C產品廣告" loading="lazy">
                    </a>
                `;
            }
        } else if (adType === 'adtag') {
            // 渲染广告代码（直接插入HTML）
            let adTag = adData.adTag || '';
            if (typeof adTag === 'object' && adTag !== null && 'en-US' in adTag) {
                adTag = adTag['en-US'];
            }
            
            if (adTag) {
                adHtml = adTag;
            }
        }
        
        if (adHtml) {
            container.innerHTML = adHtml;
        }
    });
}

/**
 * 根据class名称确定广告位置
 * @param {HTMLElement} element - 广告容器元素
 * @returns {string} 广告位置
 */
function getAdPositionFromClass(element) {
    const classes = element.className.split(' ');
    for (const cls of classes) {
        if (cls.startsWith('ad-') && cls !== 'ad-section' && cls !== 'ad-container') {
            const position = cls.replace('ad-', '');
            // 映射到标准位置
            if (position.includes('top') || position.includes('banner')) {
                return 'header';
            } else if (position.includes('bottom') || position.includes('footer')) {
                return 'footer';
            } else if (position.includes('sidebar')) {
                return 'sidebar';
            } else if (position.includes('content') || position.includes('inline') || position.includes('follow')) {
                return 'content';
            }
        }
    }
    return 'content'; // 默认位置
}

/**
 * 加载首页广告
 */
async function loadHomepageAds() {
    try {
        // 查找所有广告容器（通过class名称）
        const adSections = document.querySelectorAll('.ad-section');
        
        for (const adSection of adSections) {
            // 根据class确定位置
            const position = getAdPositionFromClass(adSection);
            
            // 加载对应位置的广告
            const ads = await loadAds(position);
            
            if (ads.length > 0) {
                // 渲染新广告（会替换原有内容）
                renderAds(adSection, ads);
            }
        }
        
        // 也支持通过ID查找（向后兼容）
        const headerAdContainer = document.getElementById('header-ad');
        if (headerAdContainer) {
            const ads = await loadAds('header');
            renderAds(headerAdContainer, ads);
        }
        
        const sidebarAdContainer = document.getElementById('sidebar-ad');
        if (sidebarAdContainer) {
            const ads = await loadAds('sidebar');
            renderAds(sidebarAdContainer, ads);
        }
        
        const footerAdContainer = document.getElementById('footer-ad');
        if (footerAdContainer) {
            const ads = await loadAds('footer');
            renderAds(footerAdContainer, ads);
        }
        
        const contentAdContainer = document.getElementById('content-ad');
        if (contentAdContainer) {
            const ads = await loadAds('content');
            renderAds(contentAdContainer, ads);
        }
    } catch (error) {
        console.error('加载首页广告失败:', error);
    }
}

// 页面加载时自动加载广告
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHomepageAds);
} else {
    loadHomepageAds();
}
