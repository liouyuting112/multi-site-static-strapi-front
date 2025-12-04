// =========================
// ApplyZen 悠慢生活誌 JS
// 導覽列、每日精選、其他互動
// =========================

// Helper: 關閉手機主選單
function closeMenu() {
  document.querySelector('.main-nav').classList.remove('open');
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
}

// ====== 響應式漢堡選單邏輯 ======
document.addEventListener('DOMContentLoaded', function() {
  var menuBtn = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  var navLinks = document.querySelector('.nav-links');
  var prevScroll = window.pageYOffset;

  // 漢堡選單開關
  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    nav.classList.toggle('open');
    var expanded = nav.classList.contains('open');
    menuBtn.setAttribute('aria-expanded', expanded ? "true" : "false");
  });

  // 點擊 LOGO 回首頁
  var logo = document.querySelector('.site-logo');
  if (logo) {
    logo.addEventListener('click', function(e) {
      if(window.location.pathname.indexOf('index.html') < 0) {
        window.location.href = 'index.html';
      }
    });
  }

  // 點擊header外層收合選單
  document.addEventListener('click', function(e) {
    if(nav.classList.contains('open')) {
      if(!nav.contains(e.target) && !menuBtn.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // Escape 鍵快速收合
  window.addEventListener('keydown', function(e) {
    if(e.key === "Escape" && nav.classList.contains('open')) {
      closeMenu();
    }
  });

  // 下拉選單展開
  var dropdown = document.querySelector('.dropdown');
  if (dropdown) {
    dropdown.addEventListener('mouseenter', function() {
      if(window.innerWidth > 900) dropdown.classList.add('hover');
    });
    dropdown.addEventListener('mouseleave', function() {
      if(window.innerWidth > 900) dropdown.classList.remove('hover');
    });
    dropdown.addEventListener('click', function(e) {
      // 行動版：直接切換下拉
      if(window.innerWidth <= 900) {
        e.preventDefault();
        var ddList = dropdown.querySelector('.dropdown-list');
        ddList.style.display = ddList.style.display === 'flex' ? 'none' : 'flex';
      }
    });
  }

  // 如果有下拉時收合其他（手機專用）
  document.querySelectorAll('.dropdown').forEach(function(dd){
    dd.addEventListener('focusout', function(e){
      if(window.innerWidth <= 900) {
        var ddList = dd.querySelector('.dropdown-list');
        ddList && (ddList.style.display = 'none');
      }
    });
  });

  // 導覽列點擊保持在頂端
  document.querySelectorAll('.nav-links a').forEach(function(link){
    link.addEventListener('click', function(){
      closeMenu();
    });
  });

  // 內容自動聚焦，不會被 header 遮住
  var hash = window.location.hash;
  if(hash && document.querySelector(hash)) {
    setTimeout(function(){
      document.querySelector(hash).scrollIntoView({behavior:"smooth", block:"start"});
      window.scrollBy(0, -64);
    },250);
  }
});

// ========== 每日文章區塊動態可擴增 ========== //
// 載入/更新每日精選文章，如API或管理新增，這部分可參照支援動態載入
// 以下僅留初始化/未連API版，人類手寫可再補
var dailyArticlesData = [
  {
    date: "2025-12-04",
    title: "晨間練習：一杯咖啡與今日的溫度",
    desc: "有時候我會發現，早上那杯咖啡，好像比鬧鐘還有用...",
    img: "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site16-daily1.webp?raw=true",
    url: "articles/2025-12-04.html"
  },
  {
    date: "2025-12-05",
    title: "傍晚散步的香氣與光",
    desc: "傍晚的公園有點涼，不是冷，是一種放鬆下來的訊號...",
    img: "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site16-daily2.webp?raw=true",
    url: "articles/2025-12-05.html"
  },
  {
    date: "2025-12-06",
    title: "夜裡自白：獨處小筆記",
    desc: "有時候燈光很暗，卻特別想寫點什麼，小心記下今天的自己...",
    img: "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site16-daily3.webp?raw=true",
    url: "articles/2025-12-06.html"
  }
];

// 自動渲染最新版每日文章
function renderDailyArticles() {
  var dailyList = document.querySelector('.daily-article-list');
  if(!dailyList) return;
  dailyList.innerHTML = '';
  dailyArticlesData.slice(0,3).forEach(function(a){
    var li = document.createElement('li');
    li.innerHTML = `
      <a href="${a.url}">
        <img src="${a.img}" alt="${a.title}" loading="lazy">
        <span class="daily-title">${a.title}</span>
        <span class="publish-date">${a.date}</span>
        <span class="daily-desc">${a.desc}</span>
      </a>
    `;
    dailyList.appendChild(li);
  });
}
renderDailyArticles();