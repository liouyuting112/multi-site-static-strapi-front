// 上傳核心模組 - 通用 HTML 提取和上傳邏輯
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');

function readHtmlFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        return null;
    }
}

function extractTitle(html, fallback) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
        return titleMatch[1].trim().replace(/\s*\|\s*.*$/, '').trim();
    }
    return fallback || 'Untitled';
}

function extractPageHtml(html) {
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
        return mainMatch[1].trim();
    }
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        let bodyContent = bodyMatch[1];
        bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
        bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
        bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
        return bodyContent.trim();
    }
    return html;
}

function extractArticleHtml(html) {
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
        return mainMatch[1].trim();
    }
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        return articleMatch[1].trim();
    }
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        let bodyContent = bodyMatch[1];
        bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
        bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
        bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
        return bodyContent.trim();
    }
    return html;
}

function extractImageUrl(html) {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
        return imgMatch[1];
    }
    return null;
}

function extractExcerpt(html) {
    const metaMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (metaMatch) {
        return metaMatch[1].trim();
    }
    const pMatch = html.match(/<p[^>]*>([^<]{50,200})<\/p>/i);
    if (pMatch) {
        return pMatch[1].trim().substring(0, 200);
    }
    return null;
}

function extractDateFromSlug(slug) {
    const dateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
}

function extractAdInfo(html) {
    let adSectionMatch = html.match(/<section[^>]*class=["'][^"']*ad[^"']*["'][^>]*>([\s\S]*?)<\/section>/i);
    if (!adSectionMatch) {
        adSectionMatch = html.match(/<aside[^>]*class=["'][^"']*ad[^"']*["'][^>]*>([\s\S]*?)<\/aside>/i);
    }
    if (!adSectionMatch) {
        return null;
    }
    const adSection = adSectionMatch[1];
    const linkMatch = adSection.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);
    const linkUrl = linkMatch ? linkMatch[1] : null;
    const imgMatch = adSection.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/i);
    const imageUrl = imgMatch ? imgMatch[1] : null;
    const altText = imgMatch ? imgMatch[2] : null;
    if (linkUrl || imageUrl) {
        return {
            linkUrl: linkUrl || null,
            imageUrl: imageUrl || null,
            altText: altText || null
        };
    }
    return null;
}

function detectFileType(filePath, html) {
    const fileName = path.basename(filePath, '.html');
    const dirName = path.dirname(filePath);
    const parentDir = path.basename(dirName);
    const knownPages = ['index', 'about', 'contact', 'privacy'];
    if (knownPages.includes(fileName)) {
        return {
            type: 'page',
            pageType: fileName === 'index' ? 'home' : fileName,
            slug: fileName === 'index' ? 'index' : fileName
        };
    }
    if (fileName === 'all-daily-articles') {
        return null;
    }
    if (parentDir === 'articles' || parentDir.includes('article')) {
        const isDaily = /^\d{4}-\d{2}-\d{2}/.test(fileName);
        return {
            type: 'post',
            category: isDaily ? 'daily' : 'fixed',
            slug: fileName
        };
    }
    if (parentDir === 'fixed-articles') {
        return {
            type: 'post',
            category: 'fixed',
            slug: fileName
        };
    }
    return {
        type: 'page',
        pageType: fileName,
        slug: fileName
    };
}

function extractSiteName(folderPath) {
    const folderName = path.basename(folderPath);
    if (/^(site\d+|cds\d+|dlh\d+|awh\d+|sce\d+|zfh\d+|so\d+|seh\d+|kfd\d+|sgo\d+|kst\d+|kel\d+)$/i.test(folderName)) {
        return folderName.toLowerCase();
    }
    const codeMatch = folderName.match(/(seh\d+|kfd\d+|sgo\d+|kst\d+|kel\d+|cds\d+|dlh\d+|awh\d+|sce\d+|zfh\d+|so\d+|site\d+)/i);
    if (codeMatch) {
        return codeMatch[1].toLowerCase();
    }
    return folderName;
}

module.exports = {
    readHtmlFile,
    extractTitle,
    extractPageHtml,
    extractArticleHtml,
    extractImageUrl,
    extractExcerpt,
    extractDateFromSlug,
    extractAdInfo,
    detectFileType,
    extractSiteName
};

