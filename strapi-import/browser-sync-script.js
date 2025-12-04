// =========================================================
// 在雲端 Strapi 後台 Console 中執行的同步腳本
// 使用方式：
// 1. 登入雲端 Strapi 後台
// 2. 按 F12 打開開發者工具
// 3. 切換到 Console 標籤
// 4. 複製貼上這個腳本並執行
// =========================================================

(async function() {
    console.log('🚀 開始同步資料到雲端 Strapi...');
    
    const STRAPI_URL = window.location.origin;
    console.log(`📍 Strapi URL: ${STRAPI_URL}`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 同步頁面
    const pages = [
    {
        "id": 238,
        "documentId": "uce907z38hmkpts21knjp7hw",
        "site": "site1",
        "type": "home",
        "slug": "index",
        "title": "INSERT COINTO START",
        "html": "<!-- Hero -->\n            <section class=\"retro-hero\">\n                <div class=\"hero-text\">\n                    <h1>INSERT COIN<br>TO START</h1>\n                    <p>這裡沒有 4K 畫質，只有滿滿的回憶。吹一下卡帶，我們重新開始冒險。</p>\n                </div>\n                <div class=\"hero-visual\">\n                    <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-hero.webp?raw=true\" alt=\"一台舊式CRT電視機連接著紅白機，畫面上是像素風格的遊戲畫面，光線溫暖\" loading=\"lazy\">\n                </div>\n            </section>\n\n            <!-- Manual Update (Fixed) -->\n            <!-- <manual-update> -->\n            <section class=\"featured-posts\">\n                <h2 class=\"pixel-title\">精選攻略</h2>\n                \n                <article class=\"post-entry\">\n                    <a href=\"articles/cartridge-care.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed2.webp?raw=true\" alt=\"清潔卡帶示意圖\" loading=\"lazy\">\n                        <div class=\"post-content\">\n                            <h3>卡帶接觸不良？千萬別用吹的！</h3>\n                            <p>這大概是我們童年最大的集體錯誤記憶。用口水吹卡帶雖然暫時有用，但長期下來只會讓金屬接點鏽蝕得更嚴重。</p>\n                            <span class=\"read-btn\">READ MORE >></span>\n                        </div>\n                    </a>\n                </article>\n\n                <article class=\"post-entry\">\n                    <a href=\"articles/collector-guide.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed3.webp?raw=true\" alt=\"收藏櫃示意圖\" loading=\"lazy\">\n                        <div class=\"post-content\">\n                            <h3>新手收藏家的第一堂課</h3>\n                            <p>想入坑懷舊遊戲收藏？先別急著買。從分辨盜版卡帶到保存環境的濕度控制，這些學費你不必繳。</p>\n                            <span class=\"read-btn\">READ MORE >></span>\n                        </div>\n                    </a>\n                </article>\n                \n                <article class=\"post-entry\">\n                    <a href=\"articles/retro-vs-modern.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed1.webp?raw=true\" alt=\"左邊是像素遊戲畫面，右邊是現代3D高畫質遊戲畫面，形成強烈對比\" loading=\"lazy\">\n                        <div class=\"post-content\">\n                            <h3>為什麼我們還在玩 8-bit 遊戲？</h3>\n                            <p>在 3A 大作畫面越來越擬真的今天，為什麼那些「方塊人」依然能讓我們感動？探討像素藝術的獨特美學。</p>\n                            <span class=\"read-btn\">READ MORE >></span>\n                        </div>\n                    </a>\n                </article>\n            </section>\n            <!-- </manual-update> -->",
        "createdAt": "2025-12-03T01:50:24.594Z",
        "updatedAt": "2025-12-04T03:09:30.845Z",
        "publishedAt": "2025-12-04T03:09:30.855Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-hero.webp?raw=true"
    },
    {
        "id": 239,
        "documentId": "fc24g1wixzv695l47jpuswwq",
        "site": "site1",
        "type": "contact",
        "slug": "contact",
        "title": "聯絡我們",
        "html": "<h1>聯絡我們</h1>\n        \n        <div style=\"display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;\">\n            <div>\n                <p>不管是想問這款遊戲值不值得收，還是單純想找人抱怨哪一關太難，都歡迎填寫下面的表單。</p>\n                <p>不過老實說，我回信的速度可能跟撥接網路差不多慢，畢竟我也要打電動嘛。</p>\n                \n                <ul style=\"list-style: none; margin-top: 2rem;\">\n                    <li style=\"margin-bottom: 1rem;\"><strong>電子郵件：</strong> uncle.pixel@example.com</li>\n                    <li style=\"margin-bottom: 1rem;\"><strong>工作室地址：</strong> 台北市像素區懷舊路 8-bit 號</li>\n                </ul>\n            </div>\n            \n            <form style=\"background: #fff; padding: 2rem; border: 2px solid var(--secondary-color);\">\n                <div style=\"margin-bottom: 1rem;\">\n                    <label for=\"name\" style=\"display: block; margin-bottom: 0.5rem;\">怎麼稱呼你？</label>\n                    <input type=\"text\" id=\"name\" name=\"name\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd;\">\n                </div>\n                \n                <div style=\"margin-bottom: 1rem;\">\n                    <label for=\"email\" style=\"display: block; margin-bottom: 0.5rem;\">電子信箱</label>\n                    <input type=\"email\" id=\"email\" name=\"email\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd;\">\n                </div>\n                \n                <div style=\"margin-bottom: 1rem;\">\n                    <label for=\"message\" style=\"display: block; margin-bottom: 0.5rem;\">想說什麼？</label>\n                    <textarea id=\"message\" name=\"message\" rows=\"5\" style=\"width: 100%; padding: 0.5rem; border: 1px solid #ddd;\"></textarea>\n                </div>\n                \n                <button type=\"submit\" style=\"background: var(--primary-color); color: #fff; border: none; padding: 0.5rem 1.5rem; cursor: pointer; font-family: var(--font-heading);\">發送訊息</button>\n            </form>\n        </div>\n        \n         <div style=\"margin-top: 3rem;\">\n            <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-contact.webp?raw=true\" alt=\"一張寫有聯絡資訊的復古風格明信片放在木桌上，旁邊有一杯咖啡\" style=\"width: 100%; height: 300px; object-fit: cover;\" loading=\"lazy\">\n        </div>",
        "createdAt": "2025-12-03T01:50:24.625Z",
        "updatedAt": "2025-12-04T03:09:30.899Z",
        "publishedAt": "2025-12-04T03:09:30.904Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-contact.webp?raw=true"
    },
    {
        "id": 240,
        "documentId": "m5lm28kt2tp88hgkhl1ygq4x",
        "site": "site1",
        "type": "about",
        "slug": "about",
        "title": "關於像素大叔",
        "html": "<h1>關於像素大叔</h1>\n        \n        <section class=\"about-content\" style=\"display: flex; gap: 2rem; align-items: flex-start; flex-wrap: wrap;\">\n            <div style=\"flex: 1; min-width: 300px;\">\n                <p>嗨，我是這裡的站長，你們可以叫我「像素大叔」。</p>\n                \n                <p>老實說，建立這個網站的初衷有點好笑。那天我在整理倉庫，翻出了那台積了厚厚一層灰的紅白機。插上電，電視畫面閃了兩下，然後那熟悉的 8-bit 音樂流出來... 哇，那一瞬間，我好像又變成了那個為了過一關瑪利歐而不吃午餐的小屁孩。</p>\n                \n                <p>我有 10 年的全端開發經驗，但在程式碼的世界裡打滾越久，我越懷念以前那些簡單純粹的快樂。現在的遊戲畫面是很美沒錯，光追開下去連水坑裡的倒影都跟真的一樣。可是，有時候玩著玩著，我卻感覺不到那個「靈魂」。</p>\n                \n                <p>我不太確定是不是只有我有這種感覺？還是我們都老了？（笑）</p>\n\n                <h2>我們的使命</h2>\n                <p>這裡不賣懷舊情懷，我們賣的是「記憶的保鮮」。</p>\n                <p>我會分享怎麼修復那些接觸不良的卡帶（真的不要再用口水吹了，拜託），也會聊聊那些被遺忘的冷門神作。偶爾也會有一些關於遊戲歷史的小考據，像是為什麼林克總是打破別人的罐子之類的。</p>\n                \n                <p>如果你也覺得現在的 DLC 吃相難看，或者只是想找個地方聊聊《超時空之鑰》有多神，歡迎常來坐坐。</p>\n            </div>\n            <div style=\"flex: 1; min-width: 300px;\">\n                 <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-about.webp?raw=true\" alt=\"一位穿著格子襯衫的中年男子，戴著黑框眼鏡，手裡拿著一支舊式遊戲手把，背景是滿牆的遊戲收藏\" style=\"width: 100%; border: 4px solid var(--secondary-color); box-shadow: 4px 4px 0 var(--primary-color);\" loading=\"lazy\">\n            </div>\n        </section>",
        "createdAt": "2025-12-03T01:50:24.654Z",
        "updatedAt": "2025-12-04T03:09:30.940Z",
        "publishedAt": "2025-12-04T03:09:30.945Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-about.webp?raw=true"
    },
    {
        "id": 241,
        "documentId": "iwdt9ni564hoeffavtovmxx6",
        "site": "site1",
        "type": "privacy",
        "slug": "privacy",
        "title": "隱私政策",
        "html": "<h1>隱私政策</h1>\n        <p>最後更新日期：2025 年 12 月 1 日</p>\n        \n        <p>歡迎來到像素時光（以下簡稱「本網站」）。我們非常重視您的隱私權，這不是客套話，是因為我自己也很討厭那種整天偷資料的網站。</p>\n\n        <h2>1. 我們收集什麼資料？</h2>\n        <p>基本上，我們只收集您主動提供的資料，例如當您填寫聯絡表單時的名字和 Email。我們不會偷偷記錄您今天玩了幾次《魂斗羅》。</p>\n\n        <h2>2. Cookies 的使用</h2>\n        <p>我們會使用 Cookies 來改善您的瀏覽體驗。這有點像是遊戲裡的存檔點，記住您的偏好設定，讓您下次來的時候不用重新調整。您可以隨時在瀏覽器設定中關閉它，但這可能會讓某些功能變得怪怪的。</p>\n\n        <h2>3. 資料保護</h2>\n        <p>我們會盡力保護您的資料安全，就像保護稀有的正版卡帶一樣。但老實說，網路上沒有絕對的安全，所以請不要在這裡傳送您的信用卡密碼或其他高度敏感的資訊。</p>\n\n        <h2>4. 第三方連結</h2>\n        <p>本網站可能會包含連往其他網站的連結（例如我們提到的維基百科或其他參考資料）。那些網站的隱私政策我們管不著，點進去之前請自己張大眼睛看看。</p>\n\n        <p>如果您對這份隱私政策有任何疑問，歡迎透過聯絡我們頁面告訴我。</p>",
        "createdAt": "2025-12-03T01:50:24.682Z",
        "updatedAt": "2025-12-04T03:09:30.981Z",
        "publishedAt": "2025-12-04T03:09:30.986Z",
        "imageUrl": null
    },
    {
        "id": 242,
        "documentId": "rfhvdvf6bnckuk0nmmgmhjta",
        "site": "site2",
        "type": "home",
        "slug": "index",
        "title": "差之毫釐失之千里",
        "html": "<!-- Hero Section -->\n        <section class=\"hero\">\n            <div class=\"hero-content\">\n                <h1>差之毫釐<br>失之千里</h1>\n                <p>在這裡，0.1 秒的延遲就是勝與負的距離。我們不談玄學，只談數據。升級你的裝備，也升級你的大腦。</p>\n            </div>\n            <div class=\"hero-image\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-hero.webp?raw=true\" alt=\"電競選手在黑暗的房間中專注盯著螢幕，RGB鍵盤發出冷光\" loading=\"lazy\">\n            </div>\n        </section>\n\n        <!-- Auto Update (Daily) Section -->\n        <!-- <auto-update> -->\n        <section class=\"daily-articles\">\n            <h2>每日戰報</h2>\n            <ul class=\"daily-article-list\">\n                <li>\n                    <a href=\"articles/2025-12-03.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily3.webp?raw=true\" class=\"daily-card-img\" alt=\"遊戲畫面右上角的網路數據，顯示高Ping和掉封包圖示\" loading=\"lazy\">\n                        <div class=\"daily-card-content\">\n                            <h3>為什麼 Ping 值忽高忽低？</h3>\n                            <p>你以為是伺服器爛？其實可能是你的路由器在搞鬼。教你三招檢測網路品質，別再讓 Lag 毀了你的晉級賽。</p>\n                            <span class=\"publish-date\">2025-12-03</span>\n                        </div>\n                    </a>\n                </li>\n                <li>\n                    <a href=\"articles/2025-12-02.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily2.webp?raw=true\" class=\"daily-card-img\" alt=\"斜放鍵盤\" loading=\"lazy\">\n                        <div class=\"daily-card-content\">\n                            <h3>職業選手為什麼都斜放鍵盤？</h3>\n                            <p>這不是為了耍帥。從人體工學到桌面空間管理，斜放鍵盤其實隱藏著讓手臂移動範圍極大化的秘密。</p>\n                            <span class=\"publish-date\">2025-12-02</span>\n                        </div>\n                    </a>\n                </li>\n                <li>\n                    <a href=\"articles/2025-12-01.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily1.webp?raw=true\" class=\"daily-card-img\" alt=\"滑鼠底部\" loading=\"lazy\">\n                        <div class=\"daily-card-content\">\n                            <h3>滑鼠 DPI 不是越高越好？</h3>\n                            <p>廠商不會告訴你的是，過高的 DPI 只會帶來更多雜訊。揭開 16000 DPI 的行銷騙局，找到最適合你的黃金數值。</p>\n                            <span class=\"publish-date\">2025-12-01</span>\n                        </div>\n                    </a>\n                </li>\n            </ul>\n        </section>\n        <!-- </auto-update> -->\n\n        <!-- Manual Update (Fixed) Section -->\n        <!-- <manual-update> -->\n        <section class=\"fixed-articles-section\">\n            <h2>硬核攻略指南</h2>\n            <div class=\"fixed-articles\">\n                <a href=\"articles/keyboard-switches.html\" class=\"article-row\">\n                    <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed1.webp?raw=true\" alt=\"機械鍵盤軸體\" loading=\"lazy\">\n                    <div class=\"article-info\">\n                        <h3>機械鍵盤軸體全解析：紅軸、青軸還是茶軸？</h3>\n                        <p>選錯軸體，就像穿著拖鞋去打籃球。我們拆解了市面上主流的 Cherry、Gateron 與凱華軸，分析觸發行程與回彈力道，幫你找到那把「本命鍵盤」。</p>\n                        <span class=\"read-more\">閱讀完整評測</span>\n                    </div>\n                </a>\n\n                <a href=\"articles/aim-training.html\" class=\"article-row\">\n                    <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed2.webp?raw=true\" alt=\"瞄準訓練\" loading=\"lazy\">\n                    <div class=\"article-info\">\n                        <h3>提升 FPS 瞄準率的三個肌肉記憶訓練</h3>\n                        <p>別再盲目打 Bot 了。沒有目的的練習只是在浪費時間。K 教練公開職業戰隊的熱身菜單，每天 15 分鐘，從定位到跟槍，讓你的準度有感提升。</p>\n                        <span class=\"read-more\">查看訓練菜單</span>\n                    </div>\n                </a>\n\n                <a href=\"articles/monitor-hz.html\" class=\"article-row\">\n                    <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed3.webp?raw=true\" alt=\"兩台螢幕並排，一台顯示流暢畫面，一台顯示殘影畫面\" loading=\"lazy\">\n                    <div class=\"article-info\">\n                        <h3>電競螢幕 144Hz 和 240Hz 真的有差嗎？</h3>\n                        <p>人眼真的看得出來嗎？透過高速攝影機的實測，我們發現高刷新率不僅僅是畫面流暢，更直接影響你的反應時間與索敵能力。</p>\n                        <span class=\"read-more\">深入了解數據</span>\n                    </div>\n                </a>\n            </div>\n        </section>\n        <!-- </manual-update> -->",
        "createdAt": "2025-12-03T01:50:24.712Z",
        "updatedAt": "2025-12-04T03:09:31.021Z",
        "publishedAt": "2025-12-04T03:09:31.027Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-hero.webp?raw=true"
    },
    {
        "id": 243,
        "documentId": "ajt1ft4ijhjlllf50oifcpqe",
        "site": "site2",
        "type": "contact",
        "slug": "contact",
        "title": "戰術交流",
        "html": "<h1 style=\"color: var(--text-highlight); margin-bottom: 2rem;\">戰術交流</h1>\n        \n        <div class=\"contact-grid\">\n            <div>\n                <p style=\"margin-bottom: 2rem;\">有硬體問題？需要戰隊訓練諮詢？或是發現我們的數據有誤？請直接聯繫。</p>\n                <p style=\"margin-bottom: 2rem;\">注意：如果你是來問「為什麼我這麼準還是上不去牌位」，請先附上你的最近 10 場對戰紀錄截圖。</p>\n                \n                <div style=\"background: var(--bg-light); padding: 2rem; border-left: 4px solid var(--primary-color);\">\n                    <h3 style=\"color: var(--text-highlight); margin-bottom: 1rem;\">聯絡資訊</h3>\n                    <p style=\"margin-bottom: 0.5rem;\"><strong>Email:</strong> coach.k@thearena.gg</p>\n                    <p><strong>Discord:</strong> TheArena#1234</p>\n                </div>\n            </div>\n\n            <form style=\"background: var(--bg-light); padding: 2rem; border: 1px solid var(--secondary-color);\">\n                <div style=\"margin-bottom: 1.5rem;\">\n                    <label style=\"display: block; color: var(--text-highlight); margin-bottom: 0.5rem;\">玩家代號 (IGN)</label>\n                    <input type=\"text\" style=\"width: 100%; padding: 0.8rem; background: var(--bg-dark); border: 1px solid #333; color: #fff;\">\n                </div>\n                \n                <div style=\"margin-bottom: 1.5rem;\">\n                    <label style=\"display: block; color: var(--text-highlight); margin-bottom: 0.5rem;\">聯絡信箱</label>\n                    <input type=\"email\" style=\"width: 100%; padding: 0.8rem; background: var(--bg-dark); border: 1px solid #333; color: #fff;\">\n                </div>\n                \n                <div style=\"margin-bottom: 1.5rem;\">\n                    <label style=\"display: block; color: var(--text-highlight); margin-bottom: 0.5rem;\">問題描述</label>\n                    <textarea rows=\"5\" style=\"width: 100%; padding: 0.8rem; background: var(--bg-dark); border: 1px solid #333; color: #fff;\"></textarea>\n                </div>\n                \n                <button type=\"submit\" style=\"background: var(--primary-color); color: var(--bg-dark); border: none; padding: 1rem 2rem; font-weight: bold; cursor: pointer; text-transform: uppercase;\">傳送戰術板</button>\n            </form>\n        </div>\n         <div style=\"margin-top: 3rem;\">\n            <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-contact.webp?raw=true\" alt=\"戰術討論室，白板上畫滿了戰術圖，桌上放著耳機和能量飲料\" style=\"width: 100%; height: 300px; object-fit: cover;\" loading=\"lazy\">\n        </div>",
        "createdAt": "2025-12-03T01:50:24.745Z",
        "updatedAt": "2025-12-04T03:09:31.064Z",
        "publishedAt": "2025-12-04T03:09:31.071Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-contact.webp?raw=true"
    },
    {
        "id": 244,
        "documentId": "j2lbydcowhdz5whga9o0p702",
        "site": "site2",
        "type": "about",
        "slug": "about",
        "title": "關於我們",
        "html": "<div class=\"hero-content\">\n            <h1 style=\"color: var(--text-highlight); margin-bottom: 2rem;\">關於我們</h1>\n            \n            <div style=\"display: flex; gap: 3rem; flex-wrap: wrap; align-items: flex-start;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-about.webp?raw=true\" alt=\"一位穿著休閒連帽衫的資深玩家，戴著耳機專注地看著螢幕，桌上擺滿了各種電競周邊設備\" style=\"flex: 1; min-width: 300px; max-width: 400px; border: 2px solid var(--primary-color); border-radius: 8px;\" loading=\"lazy\">\n                \n                <div style=\"flex: 2; min-width: 300px;\">\n                    <p style=\"margin-bottom: 1.5rem;\">嗨，我是 K。</p>\n                    \n                    <p style=\"margin-bottom: 1.5rem;\">我不算什麼職業選手，也沒拿過世界冠軍。但我打遊戲打了二十年，從撥接網路時代的 CS 1.5 打到現在的瓦羅蘭。我的 Steam 收藏庫比我的存款還豐富，換過的滑鼠墊大概可以鋪滿我的房間。</p>\n                    \n                    <p style=\"margin-bottom: 1.5rem;\">其實建立這個網站的原因很簡單：我看過太多朋友因為錯誤的設定、糟糕的周邊設備，或是缺乏系統性的訓練而卡在低端位，最後灰心退坑。老實說，我覺得很可惜。遊戲應該是讓人享受挑戰的，而不是讓人感到挫折的。</p>\n                    \n                    <p style=\"margin-bottom: 1.5rem;\">我常跟朋友說：「設備不是萬能，但爛設備萬萬不能。」當你的對手用 240Hz 螢幕而你還在用 60Hz 時，你就是在裸體跟穿著全套盔甲的人打架。或許你是天才可以贏，但為什麼要讓自己處於劣勢？</p>\n                    \n                    <h2 style=\"color: var(--primary-color); margin: 2rem 0 1rem;\">競技領域的宗旨</h2>\n                    <ul style=\"list-style: none; padding-left: 0;\">\n                        <li style=\"margin-bottom: 1rem; border-left: 3px solid var(--primary-color); padding-left: 1rem;\"><strong>數據說話：</strong>我不相信「手感好」這種模糊的形容詞。我只相信延遲數據、微動開關的克數和感應器型號。</li>\n                        <li style=\"margin-bottom: 1rem; border-left: 3px solid var(--primary-color); padding-left: 1rem;\"><strong>效率至上：</strong>你的時間很寶貴。我們分享最直接的訓練心得，而不是廢話連篇的心靈雞湯。</li>\n                        <li style=\"margin-bottom: 1rem; border-left: 3px solid var(--primary-color); padding-left: 1rem;\"><strong>熱愛遊戲：</strong>所有的分析與攻略，最終都是為了讓我們在遊戲中獲得更多樂趣。</li>\n                    </ul>\n                    \n                    <p style=\"margin-top: 2rem;\">如果你想找個地方取暖、抱怨隊友太雷，這裡可能不適合你。但如果你想研究如何變得更強，歡迎加入我們。</p>\n                </div>\n            </div>\n        </div>",
        "createdAt": "2025-12-03T01:50:24.773Z",
        "updatedAt": "2025-12-04T03:09:31.104Z",
        "publishedAt": "2025-12-04T03:09:31.109Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-about.webp?raw=true"
    },
    {
        "id": 245,
        "documentId": "rnojelkoiham4p00pwbhd2bq",
        "site": "site2",
        "type": "privacy",
        "slug": "privacy",
        "title": "隱私政策",
        "html": "<h1 style=\"color: var(--text-highlight); margin-bottom: 2rem;\">隱私政策</h1>\n        <p>更新時間：2025-12-01</p>\n\n        <section style=\"margin-top: 2rem;\">\n            <h2 style=\"color: var(--primary-color); font-size: 1.5rem; margin-bottom: 1rem;\">1. 我們不搞間諜軟體</h2>\n            <p>在競技領域，我們討厭外掛，也討厭偷資料的行為。當你瀏覽本站時，我們不會偷偷掃描你的硬碟，也不會側錄你的鍵盤輸入（Keylogger）。</p>\n        </section>\n\n        <section style=\"margin-top: 2rem;\">\n            <h2 style=\"color: var(--primary-color); font-size: 1.5rem; margin-bottom: 1rem;\">2. 關於 Cookies</h2>\n            <p>我們會使用少量的 Cookies，這主要是為了統計網站流量（看看哪篇文章最多人看）。這不會追蹤你的真實身分，頂多知道你來自地球的某個角落。如果你很在意，可以開無痕模式，我們不介意。</p>\n        </section>\n\n        <section style=\"margin-top: 2rem;\">\n            <h2 style=\"color: var(--primary-color); font-size: 1.5rem; margin-bottom: 1rem;\">3. 第三方工具</h2>\n            <p>我們可能會引用外部影片（如 YouTube）或數據網站。這些網站有他們自己的規矩。點擊連結離開本站後，就不是我們的管轄範圍了。就像你在遊戲裡走出安全區一樣，後果自負。</p>\n        </section>\n\n        <section style=\"margin-top: 2rem;\">\n            <h2 style=\"color: var(--primary-color); font-size: 1.5rem; margin-bottom: 1rem;\">4. 資料安全</h2>\n            <p>如果你透過聯絡表單傳送 Email 給我們，該 Email 只會用於回覆你的問題。我們不會把它賣給廣告商，也不會發送垃圾郵件給你。我們是電競人，講究的是實力，不是這種下三濫的手段。</p>\n        </section>",
        "createdAt": "2025-12-03T01:50:24.803Z",
        "updatedAt": "2025-12-04T03:09:31.142Z",
        "publishedAt": "2025-12-04T03:09:31.147Z",
        "imageUrl": null
    },
    {
        "id": 246,
        "documentId": "bghpezdx26g3uh4vz7zrpol0",
        "site": "site3",
        "type": "home",
        "slug": "index",
        "title": "在商業與藝術之間尋找靈魂",
        "html": "<nav class=\"main-nav\">\n        <div class=\"nav-inner\">\n            <div class=\"logo\"><a href=\"index.html\">獨立<span>微光</span></a></div>\n            <div class=\"menu-btn\">\n                <div class=\"btn-line\"></div>\n                <div class=\"btn-line\"></div>\n            </div>\n            <ul class=\"nav-list\">\n                <li><a href=\"index.html\" class=\"active\">首頁</a></li>\n                <li class=\"has-sub\">\n                    <a href=\"#\">深度專題 ▾</a>\n                    <ul class=\"sub-menu\">\n                        <li><a href=\"articles/narrative-games.html\">敘事遊戲分析</a></li>\n                        <li><a href=\"articles/pixel-art.html\">像素美學鑑賞</a></li>\n                        <li><a href=\"articles/steam-wishlist.html\">Steam 願望單</a></li>\n                    </ul>\n                </li>\n                <li><a href=\"articles/2025-12-03.html\">每日精選文章</a></li>\n                <li><a href=\"about.html\">關於我們</a></li>\n                <li><a href=\"contact.html\">聯絡我們</a></li>\n                <li><a href=\"privacy.html\">隱私政策</a></li>\n            </ul>\n        </div>\n    </nav>\n\n    \n\n    <div class=\"content-container\">\n        \n        <!-- Auto Update (Daily) -->\n        <!-- <auto-update> -->\n        <section class=\"daily-picks\">\n            <h2 class=\"section-title\">每日靈感</h2>\n            <div class=\"daily-grid\">\n                <a href=\"articles/2025-12-03.html\" class=\"daily-item\">\n                    <div class=\"item-image\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily3.webp?raw=true\" alt=\"獨立開發者\" loading=\"lazy\">\n                    </div>\n                    <div class=\"item-info\">\n                        <h3>獨立開發者的熬夜日常</h3>\n                        <p>光鮮亮麗的獲獎背後，是無數個盯著 Bug 發呆的夜晚。一位開發者的真實獨白。</p>\n                        <span class=\"meta-date\">2025-12-03</span>\n                    </div>\n                </a>\n                \n                <a href=\"articles/2025-12-02.html\" class=\"daily-item\">\n                    <div class=\"item-image\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily2.webp?raw=true\" alt=\"Roguelike\" loading=\"lazy\">\n                    </div>\n                    <div class=\"item-info\">\n                        <h3>Roguelike 為什麼讓人上癮？</h3>\n                        <p>「再玩一把就睡」是最大的謊言。隨機生成的關卡如何利用心理學機制綁架你的大腦？</p>\n                        <span class=\"meta-date\">2025-12-02</span>\n                    </div>\n                </a>\n                \n                <a href=\"articles/2025-12-01.html\" class=\"daily-item\">\n                    <div class=\"item-image\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily1.webp?raw=true\" alt=\"空洞騎士地圖\" loading=\"lazy\">\n                    </div>\n                    <div class=\"item-info\">\n                        <h3>類銀河戰士惡魔城的魅力</h3>\n                        <p>迷路也是一種樂趣？探討非線性地圖設計如何激發玩家的探索慾望。</p>\n                        <span class=\"meta-date\">2025-12-01</span>\n                    </div>\n                </a>\n            </div>\n        </section>\n        <!-- </auto-update> -->\n\n        <!-- Manual Update (Fixed) -->\n        <!-- <manual-update> -->\n        <section class=\"featured-works\">\n            <h2 class=\"section-title\">深度解析</h2>\n            <div class=\"masonry-grid\">\n                <article class=\"masonry-item large\">\n                    <a href=\"articles/narrative-games.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed1.webp?raw=true\" alt=\"敘事遊戲\" loading=\"lazy\">\n                        <div class=\"masonry-content\">\n                            <h3>當遊戲成為載體：淺談步行模擬器</h3>\n                            <p>從《艾迪芬奇的記憶》到《看火人》，這些遊戲證明了不需要打打殺殺，光是走路和說故事就能讓人淚流滿面。</p>\n                        </div>\n                    </a>\n                </article>\n\n                <article class=\"masonry-item\">\n                    <a href=\"articles/pixel-art.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed2.webp?raw=true\" alt=\"精緻的高位元像素風格城市夜景\" loading=\"lazy\">\n                        <div class=\"masonry-content\">\n                            <h3>像素藝術的文藝復興</h3>\n                            <p>它不只是復古，更是一種表現主義。看現代開發者如何重新詮釋點陣圖。</p>\n                        </div>\n                    </a>\n                </article>\n\n                <article class=\"masonry-item\">\n                    <a href=\"articles/steam-wishlist.html\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed3.webp?raw=true\" alt=\"Steam 商店頁面截圖\" loading=\"lazy\">\n                        <div class=\"masonry-content\">\n                            <h3>Steam 願望單考古學</h3>\n                            <p>那些躺在你願望單裡三年的遊戲，你真的會買嗎？</p>\n                        </div>\n                    </a>\n                </article>\n            </div>\n        </section>\n        <!-- </manual-update> -->\n\n    </div>",
        "createdAt": "2025-12-03T01:50:24.834Z",
        "updatedAt": "2025-12-04T03:09:31.182Z",
        "publishedAt": "2025-12-04T03:09:31.188Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily3.webp?raw=true"
    },
    {
        "id": 247,
        "documentId": "iv86yu82gyja6onb6miaee39",
        "site": "site3",
        "type": "contact",
        "slug": "contact",
        "title": "聯絡我們",
        "html": "<h1>聯絡我們</h1>\n        <p>我們總是渴望發現新的聲音。如果你是獨立開發者，或者發現了一款鮮為人知的好遊戲，請務必告訴我們。</p>\n        \n        <form style=\"margin-top: 2rem; display: grid; gap: 1.5rem;\">\n            <div>\n                <label for=\"name\" style=\"display: block; margin-bottom: 0.5rem;\">暱稱</label>\n                <input type=\"text\" id=\"name\" style=\"width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;\">\n            </div>\n            <div>\n                <label for=\"email\" style=\"display: block; margin-bottom: 0.5rem;\">Email</label>\n                <input type=\"email\" id=\"email\" style=\"width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;\">\n            </div>\n            <div>\n                <label for=\"message\" style=\"display: block; margin-bottom: 0.5rem;\">你想說的話</label>\n                <textarea id=\"message\" rows=\"5\" style=\"width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 4px;\"></textarea>\n            </div>\n            <button type=\"submit\" style=\"background: #333; color: white; padding: 1rem 2rem; border: none; border-radius: 4px; cursor: pointer; width: fit-content;\">發送訊息</button>\n        </form>",
        "createdAt": "2025-12-03T01:50:24.861Z",
        "updatedAt": "2025-12-04T03:09:31.221Z",
        "publishedAt": "2025-12-04T03:09:31.226Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-contact.webp?raw=true"
    },
    {
        "id": 248,
        "documentId": "a7ez1ffwd7xf6la09183k2v2",
        "site": "site3",
        "type": "about",
        "slug": "about",
        "title": "關於獨立微光",
        "html": "<h1 style=\"text-align: center; margin-bottom: 3rem;\">關於獨立微光</h1>\n        \n        <div style=\"display: flex; flex-direction: column; gap: 2rem;\">\n            <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-about.webp?raw=true\" alt=\"一個充滿文青氣息的房間，牆上貼滿了獨立遊戲海報，桌上放著一台筆電和一杯手沖咖啡\" style=\"width: 100%; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.05);\" loading=\"lazy\">\n            \n            <div style=\"font-size: 1.1rem; line-height: 2;\">\n                <p>嗨，我是這個小角落的經營者。你可以叫我「獨立狂熱者」，或者任何你喜歡的稱呼。</p>\n                \n                <p>還記得第一次玩《風之旅人 (Journey)》的時候嗎？那是一個沒有文字、沒有對話，甚至連對方 ID 都不知道的旅程。但在終點雪山倒下的那一刻，我對著螢幕哭了。那時候我就知道，遊戲不僅僅是殺怪升級，它可以是詩，可以是畫，可以是直擊靈魂的體驗。</p>\n                \n                <p>我創立「獨立微光」的原因很簡單：世界太吵了。</p>\n                \n                <p>打開遊戲媒體，滿版都是 3A 大作的宣傳、課金手遊的廣告。那些只有兩三個人開發的優秀小品，往往在發售當天就沉沒在資訊的洪流裡。這太可惜了。</p>\n                \n                <p>所以我決定寫點東西。這裡沒有生硬的評測分數（畢竟藝術怎麼能打分呢？），也沒有那些為了 SEO 而堆砌的廢話。只有我作為一個玩家，最真實的感受。</p>\n                \n                <p>如果你也喜歡在深夜戴上耳機，沉浸在一段不那麼完美，但絕對真誠的故事裡，那麼歡迎回家。</p>\n            </div>\n        </div>",
        "createdAt": "2025-12-03T01:50:24.895Z",
        "updatedAt": "2025-12-04T03:09:31.261Z",
        "publishedAt": "2025-12-04T03:09:31.265Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-about.webp?raw=true"
    },
    {
        "id": 249,
        "documentId": "pq60ql5t6golc5cjjztwwznk",
        "site": "site3",
        "type": "privacy",
        "slug": "privacy",
        "title": "隱私權政策",
        "html": "<h1>隱私權政策</h1>\n        <p>在獨立微光（以下簡稱本站），我們非常重視您的個人隱私。</p>\n        \n        <h2>資訊收集</h2>\n        <p>當您造訪本站時，我們可能會收集一些非個人識別資訊，例如瀏覽器類型、造訪時間等，這僅用於改善網站體驗。</p>\n        \n        <h2>Cookie 的使用</h2>\n        <p>本站可能會使用 Cookie 來記住您的偏好設定。您可以隨時在瀏覽器設定中關閉 Cookie。</p>\n        \n        <h2>聯絡資訊</h2>\n        <p>如果您透過聯絡表單提供 Email，我們僅會用它來回覆您的訊息，絕不會將其出售給第三方。</p>",
        "createdAt": "2025-12-03T01:50:24.925Z",
        "updatedAt": "2025-12-04T03:09:31.299Z",
        "publishedAt": "2025-12-04T03:09:31.305Z",
        "imageUrl": null
    },
    {
        "id": 250,
        "documentId": "dy34262pm527mo8ln9qexpxy",
        "site": "site4",
        "type": "home",
        "slug": "index",
        "title": "歡迎來到攻略圖書館",
        "html": "<!-- Hero -->\n            <section class=\"hero\">\n                <div class=\"hero-content\">\n                    <h1>歡迎來到攻略圖書館</h1>\n                    <p>卡關了嗎？找不到隱藏的寶箱嗎？這裡收錄了無數玩家用血淚換來的經驗。請保持安靜，慢慢查閱。</p>\n                </div>\n                <div class=\"hero-image\">\n                    <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-hero.webp?raw=true\" alt=\"圖書館內部，書架上擺滿了各種古老的魔法書和捲軸，中央有一張展開的羊皮紙地圖\" loading=\"lazy\">\n                </div>\n            </section>\n\n            <!-- Auto Update (Daily) -->\n            <!-- <auto-update> -->\n            <section class=\"daily-articles\">\n                <h2>每日考據與冷知識</h2>\n                <ul class=\"daily-article-list\">\n                    <li>\n                        <a href=\"articles/2025-12-03.html\" class=\"daily-link\">\n                            <div class=\"daily-content\">\n                                <h3>補血道具的紅色秘密</h3>\n                                <p>這不僅僅是因為紅色代表血液。從色彩心理學到早期硬體限制，紅色藥水背後有一個長達 30 年的設計演變史。</p>\n                                <span class=\"publish-date\">2025-12-03</span>\n                            </div>\n                        </a>\n                    </li>\n                    <li>\n                        <a href=\"articles/2025-12-02.html\" class=\"daily-link\">\n                            <div class=\"daily-content\">\n                                <h3>存檔點的演變</h3>\n                                <p>還記得以前找步道存檔點的恐懼嗎？現代遊戲的自動存檔雖然方便，卻也少了一種「終於安全了」的如釋重負感。</p>\n                                <span class=\"publish-date\">2025-12-02</span>\n                            </div>\n                        </a>\n                    </li>\n                    <li>\n                        <a href=\"articles/2025-12-01.html\" class=\"daily-link\">\n                            <div class=\"daily-content\">\n                                <h3>寶箱怪起源</h3>\n                                <p>第一次被寶箱咬死的陰影揮之不去嗎？這種惡意滿滿的怪物設計，其實源自於龍與地下城的經典設定。</p>\n                                <span class=\"publish-date\">2025-12-01</span>\n                            </div>\n                        </a>\n                    </li>\n                </ul>\n            </section>\n            <!-- </auto-update> -->\n\n            <!-- Manual Update -->\n            <!-- <manual-update> -->\n            <section class=\"fixed-articles-section\">\n                <h2>精選攻略指南</h2>\n                <div class=\"fixed-articles\">\n                    <article class=\"article-card\">\n                        <a href=\"articles/open-world-map.html\">\n                            <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-fixed1.webp?raw=true\" alt=\"開放世界遊戲地圖介面，上面標記了許多自定義圖標\" loading=\"lazy\">\n                            <h3>地圖標記心法</h3>\n                            <p>面對像海一樣大的地圖，如何不看攻略也能找到路？傳授你探險家的標記心法，讓你不再迷失方向。</p>\n                        </a>\n                    </article>\n\n                    <article class=\"article-card\">\n                        <a href=\"articles/souls-like-combat.html\">\n                            <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-fixed2.webp?raw=true\" alt=\"魂系遊戲的戰鬥畫面，騎士舉盾面對巨大的Boss\" loading=\"lazy\">\n                            <h3>魂系生存法則</h3>\n                            <p>翻滾還是盾反？這是一個問題。從體力條管理到觀察 Boss 前搖，教你如何死得少一點，活得久一點。</p>\n                        </a>\n                    </article>\n\n                    <article class=\"article-card\">\n                        <a href=\"articles/100-percent-guide.html\">\n                            <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-fixed3.webp?raw=true\" alt=\"遊戲成就列表，顯示100%完成度的白金獎盃\" loading=\"lazy\">\n                            <h3>白金強迫症</h3>\n                            <p>為了一個獎盃刷了 50 個小時值得嗎？當然值得。這篇獻給所有完美主義者，教你如何規劃最有效率的白金路線。</p>\n                        </a>\n                    </article>\n                </div>\n            </section>\n            <!-- </manual-update> -->",
        "createdAt": "2025-12-03T01:50:24.959Z",
        "updatedAt": "2025-12-04T03:09:31.346Z",
        "publishedAt": "2025-12-04T03:09:31.352Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-hero.webp?raw=true"
    },
    {
        "id": 251,
        "documentId": "vtw9r76yjhp55mugwibh2zor",
        "site": "site4",
        "type": "contact",
        "slug": "contact",
        "title": "勘誤與建議回報",
        "html": "<div class=\"content-box\">\n            <h1>勘誤與建議回報</h1>\n            <p>即使經過嚴密測試，疏漏在所難免。如果您發現任何數據錯誤，請協助指正。</p>\n            \n            <form style=\"margin-top: 2rem; display: grid; gap: 1rem;\">\n                <div>\n                    <label style=\"display: block;\">回報類型</label>\n                    <select style=\"width: 100%; padding: 0.5rem;\">\n                        <option>數據錯誤</option>\n                        <option>內容過時</option>\n                        <option>新戰術投稿</option>\n                        <option>網站 Bug</option>\n                    </select>\n                </div>\n                <div>\n                    <label>相關頁面 URL</label>\n                    <input type=\"text\" style=\"width: 100%; padding: 0.5rem;\">\n                </div>\n                <div>\n                    <label>詳細說明</label>\n                    <textarea rows=\"6\" style=\"width: 100%; padding: 0.5rem;\"></textarea>\n                </div>\n                <button type=\"submit\" style=\"padding: 0.5rem 2rem; background: #000; color: #fff; border: none;\">提交</button>\n            </form>\n        </div>",
        "createdAt": "2025-12-03T01:50:24.989Z",
        "updatedAt": "2025-12-04T03:09:31.393Z",
        "publishedAt": "2025-12-04T03:09:31.399Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-contact.webp?raw=true"
    },
    {
        "id": 252,
        "documentId": "ganatejv6hmg64t730fhgxa6",
        "site": "site4",
        "type": "about",
        "slug": "about",
        "title": "關於戰略核心",
        "html": "<div class=\"content-box\">\n            <h1>關於戰略核心</h1>\n            \n            <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-about.webp?raw=true\" alt=\"多螢幕工作站，螢幕上顯示著複雜的遊戲地圖、Excel 數據表格和程式碼\" style=\"width: 100%; margin-bottom: 2rem;\" loading=\"lazy\">\n            \n            <p>遊戲，對我們來說，是一道待解的數學題。</p>\n            <p>我們不相信「憑感覺」。每一把武器的 DPS、每一個 Boss 的攻擊幀數、每一張地圖的資源分佈，都有其最優解。我們成立「戰略核心」的目的，就是要把這些隱藏在代碼背後的真相挖掘出來。</p>\n            \n            <h2>我們的原則</h2>\n            <ul>\n                <li><strong>數據至上：</strong> 所有的攻略都必須經過實測驗證，不接受模糊的形容詞。</li>\n                <li><strong>效率優先：</strong> 我們不教你怎麼看風景，我們教你怎麼用最快速度拿滿獎勵。</li>\n                <li><strong>持續更新：</strong> 版本更新是常態，我們的攻略也會隨之進化。</li>\n            </ul>\n            \n            <p>如果你也是那種為了 0.5% 的提升願意刷上 100 次副本的硬核玩家，這裡就是你的軍火庫。</p>\n        </div>\n        \n        <aside class=\"sidebar\">\n            <div class=\"content-box widget\">\n                <h3>站長簡介</h3>\n                <p>DataMiner，前數據分析師。擅長拆解遊戲機制，用 Excel 表格玩遊戲的男人。</p>\n            </div>\n        </aside>",
        "createdAt": "2025-12-03T01:50:25.017Z",
        "updatedAt": "2025-12-04T03:09:31.438Z",
        "publishedAt": "2025-12-04T03:09:31.443Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site4-about.webp?raw=true"
    },
    {
        "id": 253,
        "documentId": "dqansfiwocshl0jjxu52auh4",
        "site": "site4",
        "type": "privacy",
        "slug": "privacy",
        "title": "隱私權政策",
        "html": "<div class=\"content-box\">\n            <h1>隱私權政策</h1>\n            <p>本文件說明戰略核心如何處理使用者資料。</p>\n            \n            <h3>1. 資料收集</h3>\n            <p>我們不強制要求使用者註冊。匿名瀏覽時，我們僅收集伺服器日誌（IP 地址、User Agent）。</p>\n            \n            <h3>2. Google Analytics</h3>\n            <p>本站使用 Google Analytics 分析流量。該服務可能會設定 Cookie。</p>\n            \n            <h3>3. 資料安全</h3>\n            <p>我們採取標準的安全措施保護資料，防止未經授權的存取。</p>\n        </div>",
        "createdAt": "2025-12-03T01:50:25.046Z",
        "updatedAt": "2025-12-04T03:09:31.492Z",
        "publishedAt": "2025-12-04T03:09:31.498Z",
        "imageUrl": null
    },
    {
        "id": 254,
        "documentId": "ahynz8pucvmd9ztp4f3nhifu",
        "site": "site5",
        "type": "home",
        "slug": "index",
        "title": "碎片時間也能變強",
        "html": "<!-- Hero Section -->\n        <section class=\"hero-card\">\n            <div class=\"hero-img-container\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-hero.webp?raw=true\" alt=\"一位在捷運上單手玩手機遊戲的通勤族，背景是模糊的車廂\" loading=\"lazy\">\n                <div class=\"hero-overlay\">\n                    <h1>碎片時間<br>也能變強</h1>\n                    <p>通勤、排隊、午休... 你的時間很零碎，所以我們只講重點。三分鐘看完一篇攻略，上線立刻變強。</p>\n                </div>\n            </div>\n        </section>\n\n        <!-- Auto Update (Daily) -->\n        <!-- <auto-update> -->\n        <section class=\"feed-section\">\n            <div class=\"section-header\">\n                <h2>每日情報</h2>\n                <span class=\"badge\">New</span>\n            </div>\n            <div class=\"feed-list\">\n                <a href=\"articles/2025-12-03.html\" class=\"feed-item\">\n                    <div class=\"feed-icon\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-daily3.webp?raw=true\" alt=\"首儲禮包\" loading=\"lazy\">\n                    </div>\n                    <div class=\"feed-content\">\n                        <h3>首儲禮包真的划算嗎？</h3>\n                        <p>看到「限時優惠」就忍不住？拆解遊戲公司的定價心理學，告訴你哪些禮包才是真的高 CP 值。</p>\n                        <span class=\"time-ago\">2025-12-03</span>\n                    </div>\n                </a>\n\n                <a href=\"articles/2025-12-02.html\" class=\"feed-item\">\n                    <div class=\"feed-icon\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-daily2.webp?raw=true\" alt=\"體力閃電圖標\" loading=\"lazy\">\n                    </div>\n                    <div class=\"feed-content\">\n                        <h3>體力制機制的愛與恨</h3>\n                        <p>為什麼幾乎所有手遊都有體力限制？這不僅是為了讓你付錢回體，更是為了控制你的遊戲進度。</p>\n                        <span class=\"time-ago\">2025-12-02</span>\n                    </div>\n                </a>\n\n                <a href=\"articles/2025-12-01.html\" class=\"feed-item\">\n                    <div class=\"feed-icon\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-daily1.webp?raw=true\" alt=\"抽卡畫面\" loading=\"lazy\">\n                    </div>\n                    <div class=\"feed-content\">\n                        <h3>玄學抽卡有用嗎？</h3>\n                        <p>半夜兩點抽？放好運來當 BGM？我們統計了上萬筆抽卡數據，來看看這些玄學到底有沒有科學根據。</p>\n                        <span class=\"time-ago\">2025-12-01</span>\n                    </div>\n                </a>\n            </div>\n        </section>\n        <!-- </auto-update> -->\n\n        <!-- Manual Update -->\n        <!-- <manual-update> -->\n        <section class=\"grid-section\">\n            <h2>精選專題</h2>\n            <div class=\"card-grid\">\n                <a href=\"articles/f2p-guide.html\" class=\"feature-card\">\n                    <div class=\"card-img\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-fixed1.webp?raw=true\" alt=\"遊戲資源管理介面\" loading=\"lazy\">\n                    </div>\n                    <div class=\"card-text\">\n                        <h3>無課玩家的資源管理術</h3>\n                        <p>鑽石要存還是花？體力藥水什麼時候喝？不花錢也能玩得舒服的生存法則。</p>\n                    </div>\n                </a>\n\n                <a href=\"articles/portrait-games.html\" class=\"feature-card\">\n                    <div class=\"card-img\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-fixed2.webp?raw=true\" alt=\"單手操作手機示意圖\" loading=\"lazy\">\n                    </div>\n                    <div class=\"card-text\">\n                        <h3>捷運族必備！單手能玩的好遊戲</h3>\n                        <p>另一隻手要抓拉環怎麼辦？精選 5 款可以單手操作的高品質手遊。</p>\n                    </div>\n                </a>\n\n                <a href=\"articles/phone-heating.html\" class=\"feature-card\">\n                    <div class=\"card-img\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-fixed3.webp?raw=true\" alt=\"手機背面貼著散熱貼片\" loading=\"lazy\">\n                    </div>\n                    <div class=\"card-text\">\n                        <h3>手機發燙變暖暖包？降溫大作戰</h3>\n                        <p>玩原神玩到手機降頻卡頓？物理散熱與系統設定優化全攻略。</p>\n                    </div>\n                </a>\n            </div>\n        </section>\n        <!-- </manual-update> -->",
        "createdAt": "2025-12-03T01:50:25.075Z",
        "updatedAt": "2025-12-04T03:09:31.540Z",
        "publishedAt": "2025-12-04T03:09:31.546Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-hero.webp?raw=true"
    },
    {
        "id": 255,
        "documentId": "k6f02wx37knvlji9gsh2xyn4",
        "site": "site5",
        "type": "contact",
        "slug": "contact",
        "title": "聯絡我們",
        "html": "<div class=\"feed-card\" style=\"padding: 2rem;\">\n            <h1>聯絡我們</h1>\n            <p>這裡沒有制式的客服，只有同樣喜歡玩遊戲的小編。歡迎分享你的遊戲心得。</p>\n            \n            <form style=\"margin-top: 2rem;\">\n                <input type=\"text\" placeholder=\"你的名字\" style=\"width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;\">\n                <input type=\"email\" placeholder=\"Email\" style=\"width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;\">\n                <textarea rows=\"5\" placeholder=\"請輸入訊息...\" style=\"width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;\"></textarea>\n                <button type=\"submit\" style=\"background: #4facfe; color: white; padding: 10px 20px; border: none; border-radius: 20px; font-weight: bold; width: 100%;\">發送</button>\n            </form>\n        </div>",
        "createdAt": "2025-12-03T01:50:25.109Z",
        "updatedAt": "2025-12-04T03:09:31.592Z",
        "publishedAt": "2025-12-04T03:09:31.596Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-contact.webp?raw=true"
    },
    {
        "id": 256,
        "documentId": "eqcma7vjfgcg4taxp62ce7nn",
        "site": "site5",
        "type": "about",
        "slug": "about",
        "title": "嗨，我是通勤族小編",
        "html": "<div class=\"hero-card\" style=\"height: auto;\">\n             <div style=\"padding: 2rem;\">\n                <div style=\"text-align: center; margin-bottom: 2rem;\">\n                     <div style=\"width: 100px; height: 100px; background: #ddd; border-radius: 50%; overflow: hidden; margin: 0 auto 1rem;\">\n                        <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-about.webp?raw=true\" alt=\"Avatar\" style=\"width: 100%; height: 100%; object-fit: cover;\">\n                    </div>\n                    <h1>嗨，我是通勤族小編</h1>\n                </div>\n\n                <p style=\"margin-bottom: 1.5rem;\">就像你們大多數人一樣，我不是什麼電競選手，也不是有錢的課長。我只是一個每天要搭來回一小時捷運的上班族。</p>\n\n                <p style=\"margin-bottom: 1.5rem;\">這段時間很無聊，也很珍貴。這是我一天中少數能完全屬於自己的時間。我試過看書（會暈車）、試過睡覺（怕過站），最後發現，玩手遊是最好的選擇。</p>\n\n                <p style=\"margin-bottom: 1.5rem;\">但我發現，市面上的攻略很多都是給重度玩家看的。什麼「每日必刷 100 次副本」、「需要特定 SSR 角色才能過關」。老實說，我沒那個時間，也沒那個錢。</p>\n\n                <p>所以我開了這個站。這裡只推薦那些「不肝不課也能玩得開心」的遊戲。我們追求的不是排行榜第一，而是下班回家的路上，那一瞬間的放鬆。</p>\n             </div>\n        </div>",
        "createdAt": "2025-12-03T01:50:25.145Z",
        "updatedAt": "2025-12-04T03:09:31.644Z",
        "publishedAt": "2025-12-04T03:09:31.651Z",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site5-about.webp?raw=true"
    },
    {
        "id": 257,
        "documentId": "f4s1khihei5hn3bqgc36vl6w",
        "site": "site5",
        "type": "privacy",
        "slug": "privacy",
        "title": "隱私權政策",
        "html": "<div class=\"feed-card\" style=\"padding: 2rem;\">\n        <h1>隱私權政策</h1>\n        <p>我們非常重視你的個人資料安全，會在合理且必要的範圍內使用與保護相關資訊。</p>\n        \n        <h2 style=\"font-size: 1.2rem; margin-top: 1.5rem;\">我們收集什麼？</h2>\n        <p>目前本站僅透過網站分析工具紀錄瀏覽量與裝置類型等匿名統計資料，用來了解哪些內容受到歡迎，方便之後調整版面與主題。</p>\n        \n        <h2 style=\"font-size: 1.2rem; margin-top: 1.5rem;\">我們怎麼使用這些資料？</h2>\n        <p>這些資料只會用於內部趨勢觀察，不會用來識別個別使用者，也不會任意出售或提供給不相關的第三方。</p>\n        \n        <h2 style=\"font-size: 1.2rem; margin-top: 1.5rem;\">關於廣告與第三方服務</h2>\n        <p>如果未來導入廣告或其他第三方服務，我們會在頁面上明確標示，並盡力選擇重視隱私與透明度的合作夥伴。</p>\n        \n        <p style=\"margin-top: 2rem;\">若你對隱私相關問題有任何疑問或建議，歡迎透過聯絡我們頁面留言，我們會盡量回覆說明。</p>\n    </div>",
        "createdAt": "2025-12-03T01:50:25.188Z",
        "updatedAt": "2025-12-04T03:09:31.729Z",
        "publishedAt": "2025-12-04T03:09:31.734Z",
        "imageUrl": null
    }
];
    console.log(`\n📄 開始同步 ${pages.length} 個頁面...\n`);
    
    for (const page of pages) {
        try {
            const attrs = page.attributes || page;
            const payload = { data: attrs };
            
            // 檢查是否已存在
            const checkUrl = `${STRAPI_URL}/api/pages?filters[site][$eq]=${attrs.site}&filters[type][$eq]=${attrs.type}`;
            const checkRes = await fetch(checkUrl);
            const checkData = await checkRes.json();
            const existing = checkData.data?.[0];
            
            let result;
            if (existing) {
                // 更新
                const updateUrl = `${STRAPI_URL}/api/pages/${existing.id}`;
                result = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(`  ✅ 更新頁面: ${attrs.site} - ${attrs.type}`);
                    successCount++;
                } else {
                    console.error(`  ❌ 更新失敗: ${attrs.site} - ${attrs.type}`);
                    failCount++;
                }
            } else {
                // 建立
                const createUrl = `${STRAPI_URL}/api/pages`;
                result = await fetch(createUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(`  ✅ 建立頁面: ${attrs.site} - ${attrs.type}`);
                    successCount++;
                } else {
                    console.error(`  ❌ 建立失敗: ${attrs.site} - ${attrs.type}`);
                    failCount++;
                }
            }
        } catch (error) {
            console.error(`  ❌ 錯誤: ${error.message}`);
            failCount++;
        }
    }
    
    // 同步文章
    const posts = [
    {
        "id": 471,
        "documentId": "odshwmmlgzf05beb28srmuu0",
        "title": "那些讓你哭著玩完的敘事神作",
        "slug": "narrative-games",
        "site": "site3",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.764Z",
        "updatedAt": "2025-12-02T10:44:25.586Z",
        "publishedAt": "2025-12-02T10:44:25.590Z",
        "html": "<img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed1.webp?raw=true\" alt=\"To The Moon 遊戲畫面，兩個博士站在月球上，像素風格但充滿情感\" style=\"width: 100%; border-radius: 12px; margin-bottom: 2rem;\" loading=\"lazy\">\r\n\r\n            <p>有時候，我們玩遊戲不是為了追求刺激的槍戰，也不是為了刷出什麼稀有裝備。我們只是想聽一個好故事。</p>\r\n            <p>獨立遊戲在這方面有著得天獨厚的優勢。沒有商業大廠的包袱（例如：一定要有多人模式、一定要有內購），開發者可以把所有的精力都花在「說故事」這件事上。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">To The Moon：去月球</h2>\r\n            <p>如果有人告訴你，一款用 RPG Maker 做出來的、畫面像 20 年前小遊戲的作品，會讓你哭掉一整包面紙，你相信嗎？</p>\r\n            <p>《To The Moon》就是這樣的奇蹟。故事講述兩位博士進入一位臨終老人的記憶，試圖完成他「去月球」的遺願。隨著記憶一層層倒帶，我們才發現那個願望背後，藏著一段跨越一生的淒美約定。</p>\r\n            <p>老實說，玩到最後那段鋼琴曲響起時，我坐在電腦前久久不能平復。它讓我們思考：如果人生可以重來，你真的會過得比較快樂嗎？</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">What Remains of Edith Finch</h2>\r\n            <p>這不是遊戲，這是一本會動的魔幻寫實小說。</p>\r\n            <p>你扮演家族最後一位倖存者，回到那棟怪異的豪宅，探索每一位家族成員離奇死亡的故事。每個故事的玩法都完全不同：有時候你變成一隻貓，有時候你活在漫畫格裡，有時候你一邊切魚一邊做白日夢。</p>\r\n            <p>其中關於哥哥在罐頭工廠的那一段，真的是將「枯燥現實」與「華麗幻想」的衝突表現得淋漓盡致。那種無力感，我想每一個在大城市打拼的人都能感同身受。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">結語</h2>\r\n            <p>這些遊戲的時長都不長，大概一部電影的時間就能通關。但它們帶給你的後勁，可能會持續一輩子。在這個快節奏的時代，能靜下心來體驗別人的生命，本身就是一種奢侈的幸福。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed1.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 472,
        "documentId": "icsgj0dhtpoamqsp013sgz4c",
        "title": "像素藝術的文藝復興：不只是懷舊",
        "slug": "pixel-art",
        "site": "site3",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.779Z",
        "updatedAt": "2025-12-02T10:44:25.613Z",
        "publishedAt": "2025-12-02T10:44:25.618Z",
        "html": "<img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed2.webp?raw=true\" alt=\"精緻的高位元像素風格城市夜景，雨水在霓虹燈下反光\" style=\"width: 100%; border-radius: 12px; margin-bottom: 2rem;\" loading=\"lazy\">\r\n\r\n            <p>很多人看到像素遊戲的第一反應是：「這是不是經費不夠？」或者「這畫面好復古喔。」</p>\r\n            <p>其實，現代的像素藝術（Pixel Art）已經進化成了一種全新的流派。它不再是因為硬體限制而被迫妥協的產物，而是一種主動選擇的「風格化」表現。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">想像力的留白</h2>\r\n            <p>像素點就像是印象派的筆觸。它不把所有細節都畫出來，而是給予觀看者一個模糊的輪廓。當你看著主角那張只有幾格像素的臉時，你會自動在腦海中補完他的表情。</p>\r\n            <p>這種「留白」給了玩家參與創作的空間。就像看小說比看電影更能激發想像力一樣，適度的抽象反而能帶來更深的沉浸感。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">HD-2D：新舊融合的極致</h2>\r\n            <p>近年來最讓人驚艷的莫過於 SE 社提出的「HD-2D」風格（如《歧路旅人》）。他們保留了角色的像素質感，但在背景中加入了現代的 3D 景深、粒子特效和動態光影。</p>\r\n            <p>想像一下，一個 16-bit 的小人走在充滿真實水面反光和體積光（God rays）的洞穴裡。那種衝突的美感，既有老遊戲的溫暖，又有現代遊戲的精緻。這證明了像素不是過時的技術，它只是一種媒材，就像油畫顏料一樣，永遠不會過時。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">獨立開發者的浪漫</h2>\r\n            <p>對於獨立開發者來說，像素藝術也是一種「浪漫的務實」。它允許一個人在有限的時間內，創造出風格統一且獨特的世界。像《星露谷物語》的作者 Eric Barone，一個人畫完了遊戲裡所有的像素圖。如果用 3D 建模，這幾乎是不可能完成的任務。</p>\r\n            <p>所以，下次看到像素遊戲，別再嫌它畫面簡陋了。停下來欣賞一下那些精心點綴的方塊，你會發現裡面藏著開發者滿滿的愛。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed2.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 473,
        "documentId": "zokqwsvpco5c8ixgbi50pxqw",
        "title": "Steam 願望單整理術：不錯過任何特賣",
        "slug": "steam-wishlist",
        "site": "site3",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.795Z",
        "updatedAt": "2025-12-02T10:44:25.644Z",
        "publishedAt": "2025-12-02T10:44:25.648Z",
        "html": "<img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed3.webp?raw=true\" alt=\"Steam 商店頁面截圖，滿滿的綠色特價標籤，以及整齊的遊戲列表\" style=\"width: 100%; border-radius: 12px; margin-bottom: 2rem;\" loading=\"lazy\">\r\n\r\n            <p>G 胖的微笑總是特別迷人，尤其是在季節特賣的時候。你的手是不是又滑了一下？然後發現買回來的遊戲根本沒時間玩，最後變成了「收藏庫喜加一」？</p>\r\n            <p>其實，願望單（Wishlist）不只是購物車，它是一個強大的篩選工具。只要善用它，你就能在茫茫遊戲海中，精準捕捉到那些真正適合你的獨立遊戲。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">1. 不要只看折扣，看「標籤」</h2>\r\n            <p>很多人加入願望單只是因為「看起來好像不錯」。我建議你養成一個習慣：加入時，順便看一下它的熱門標籤。如果你討厭「Rougelike」或者「回合制」，就算它打一折你也不會玩開心的。</p>\r\n            <p>定期清理那些你已經不感興趣的遊戲。相信我，刪除願望單的快感，有時候比買遊戲還高（笑）。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">2. 善用 SteamDB</h2>\r\n            <p>這是所有 Steam 玩家的神器。<a href=\"https://steamdb.info/\" rel=\"nofollow\" target=\"_blank\">SteamDB</a> 可以查到一款遊戲的歷史最低價。有些遊戲雖然現在打折，但其實比上次特賣貴了 20%。</p>\r\n            <p>對於獨立遊戲來說，通常發售一年後會有比較大的折扣幅度。如果你不急著首發體驗（反正獨立遊戲剛發售通常 Bug 也不少），稍微等一下絕對是明智的選擇。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">3. 關注開發者，而不是發行商</h2>\r\n            <p>在獨立遊戲界，好的開發者通常會有強烈的個人風格。如果你喜歡《Hades》，那你一定會喜歡 Supergiant Games 的其他作品。直接關注開發者的頁面，你能在第一時間收到新作的消息，甚至有時候會有「開發者組合包」的額外折扣。</p>\r\n            <p>願望單的本質，其實是對未來的期待。希望大家都能買到那些能陪伴你度過美好週末的好遊戲，而不是只買到一堆數位代碼。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-fixed3.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 474,
        "documentId": "w8o8ziqlbf14xgdjrnccbikq",
        "title": "白金強迫症 - 攻略圖書館",
        "slug": "100-percent-guide",
        "site": "site4",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.815Z",
        "updatedAt": "2025-12-02T10:44:25.668Z",
        "publishedAt": "2025-12-02T10:44:25.675Z",
        "html": "<p class=\"meta\">發布於 2023-12</p>\n                <img src=\"../../shared-assets/site4-fixed3.webp\" alt=\"遊戲成就列表，顯示100%完成度的白金獎盃\" style=\"width:100%; border-radius:8px; margin: 20px 0;\">\n                \n                <h2>簡介</h2>\n                <p>這是有關於 100 Percent Guide 的詳細攻略指南。在這裡，我們將深入探討遊戲中的各種機制與隱藏要素。</p>\n                \n                <h2>詳細分析</h2>\n                <p>根據我們的測試與研究，這個主題包含了許多值得注意的細節。玩家在進行遊戲時，往往會忽略這些關鍵點。</p>\n                \n                <h3>關鍵要點 1</h3>\n                <p>首先，請確保你已經準備好了相關的裝備與道具。</p>\n                \n                <h3>關鍵要點 2</h3>\n                <p>其次，觀察敵人的動作模式至關重要。</p>\n                \n                <h2>總結</h2>\n                <p>希望這篇關於 100 Percent Guide 的文章能對你的冒險有所幫助。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "../../shared-assets/site4-fixed3.webp",
        "isFeatured": null
    },
    {
        "id": 475,
        "documentId": "ydmp9vqk06m2pnrfrs1qg2qi",
        "title": "地圖標記心法 - 攻略圖書館",
        "slug": "open-world-map",
        "site": "site4",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.887Z",
        "updatedAt": "2025-12-02T10:44:25.694Z",
        "publishedAt": "2025-12-02T10:44:25.699Z",
        "html": "<p class=\"meta\">發布於 2023-12</p>\n                <img src=\"../../shared-assets/site4-fixed1.webp\" alt=\"開放世界遊戲地圖介面，上面標記了許多自定義圖標\" style=\"width:100%; border-radius:8px; margin: 20px 0;\">\n                \n                <h2>簡介</h2>\n                <p>這是有關於 Open World Map 的詳細攻略指南。在這裡，我們將深入探討遊戲中的各種機制與隱藏要素。</p>\n                \n                <h2>詳細分析</h2>\n                <p>根據我們的測試與研究，這個主題包含了許多值得注意的細節。玩家在進行遊戲時，往往會忽略這些關鍵點。</p>\n                \n                <h3>關鍵要點 1</h3>\n                <p>首先，請確保你已經準備好了相關的裝備與道具。</p>\n                \n                <h3>關鍵要點 2</h3>\n                <p>其次，觀察敵人的動作模式至關重要。</p>\n                \n                <h2>總結</h2>\n                <p>希望這篇關於 Open World Map 的文章能對你的冒險有所幫助。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "../../shared-assets/site4-fixed1.webp",
        "isFeatured": null
    },
    {
        "id": 476,
        "documentId": "cqwtpetuq9i238ujjckqt1w3",
        "title": "魂系生存法則 - 攻略圖書館",
        "slug": "souls-like-combat",
        "site": "site4",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.900Z",
        "updatedAt": "2025-12-02T10:44:25.718Z",
        "publishedAt": "2025-12-02T10:44:25.723Z",
        "html": "<p class=\"meta\">發布於 2023-12</p>\n                <img src=\"../../shared-assets/site4-fixed2.webp\" alt=\"魂系遊戲的戰鬥畫面，騎士舉盾面對巨大的Boss\" style=\"width:100%; border-radius:8px; margin: 20px 0;\">\n                \n                <h2>簡介</h2>\n                <p>這是有關於 Souls Like Combat 的詳細攻略指南。在這裡，我們將深入探討遊戲中的各種機制與隱藏要素。</p>\n                \n                <h2>詳細分析</h2>\n                <p>根據我們的測試與研究，這個主題包含了許多值得注意的細節。玩家在進行遊戲時，往往會忽略這些關鍵點。</p>\n                \n                <h3>關鍵要點 1</h3>\n                <p>首先，請確保你已經準備好了相關的裝備與道具。</p>\n                \n                <h3>關鍵要點 2</h3>\n                <p>其次，觀察敵人的動作模式至關重要。</p>\n                \n                <h2>總結</h2>\n                <p>希望這篇關於 Souls Like Combat 的文章能對你的冒險有所幫助。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "../../shared-assets/site4-fixed2.webp",
        "isFeatured": null
    },
    {
        "id": 477,
        "documentId": "hw7tqr0efgsa1r67ylt4kfgn",
        "title": "無課生存指南 - 手遊速報",
        "slug": "f2p-guide",
        "site": "site5",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.954Z",
        "updatedAt": "2025-12-02T10:44:25.747Z",
        "publishedAt": "2025-12-02T10:44:25.752Z",
        "html": "<div class=\"post-header\">\r\n                \r\n                <div class=\"post-meta\">2023-12 • 編輯精選</div>\r\n            </div>\r\n            <div class=\"post-content\">\r\n                <img src=\"../../shared-assets/site5-hero.webp\" alt=\"無課生存指南\" style=\"width:100%; border-radius:12px; margin-bottom: 20px;\">\r\n                \r\n                <p class=\"lead\">這篇文章整理了不課金玩家在資源分配、活動取捨與日常習慣上的實用做法，讓你在不用刷卡的情況下也能玩得穩定又舒服。</p>\r\n                \r\n                <h2>重點整理</h2>\r\n                <ul>\r\n                    <li>重點一：活動時間與參加資格</li>\r\n                    <li>重點二：卡池機率分析</li>\r\n                    <li>重點三：CP值最高的課金禮包推薦</li>\r\n                </ul>\r\n                \r\n                <h2>詳細內容</h2>\r\n                <p>對於許多休閒玩家來說，如何有效利用碎片時間是關鍵。本篇將教你如何用最少的時間獲得最大的收益。</p>\r\n                \r\n                <div class=\"highlight-box\">\r\n                    <strong>小編點評：</strong> 這次的更新誠意滿滿，建議大家不要錯過！\r\n                </div>\r\n                \r\n                <p>更多詳細數據請參考下方的附表。</p>\r\n            </div>",
        "excerpt": null,
        "date": null,
        "imageUrl": "../../shared-assets/site5-hero.webp",
        "isFeatured": null
    },
    {
        "id": 478,
        "documentId": "btlurm5h1imth9oe5jsfgf04",
        "title": "手機發燙救星 - 手遊速報",
        "slug": "phone-heating",
        "site": "site5",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.967Z",
        "updatedAt": "2025-12-02T10:44:25.779Z",
        "publishedAt": "2025-12-02T10:44:25.783Z",
        "html": "<div class=\"post-header\">\r\n                \r\n                <div class=\"post-meta\">2023-12 • 編輯精選</div>\r\n            </div>\r\n            <div class=\"post-content\">\r\n                <img src=\"../../shared-assets/site5-hero.webp\" alt=\"手機發燙救星\" style=\"width:100%; border-radius:12px; margin-bottom: 20px;\">\r\n                \r\n                <p class=\"lead\">玩久一點手機就燙到手？這篇會從設定調整、散熱配件到日常使用習慣，整理幾個實際有用的降溫做法。</p>\r\n                \r\n                <h2>重點整理</h2>\r\n                <ul>\r\n                    <li>重點一：活動時間與參加資格</li>\r\n                    <li>重點二：卡池機率分析</li>\r\n                    <li>重點三：CP值最高的課金禮包推薦</li>\r\n                </ul>\r\n                \r\n                <h2>詳細內容</h2>\r\n                <p>對於許多休閒玩家來說，如何有效利用碎片時間是關鍵。本篇將教你如何用最少的時間獲得最大的收益。</p>\r\n                \r\n                <div class=\"highlight-box\">\r\n                    <strong>小編點評：</strong> 這次的更新誠意滿滿，建議大家不要錯過！\r\n                </div>\r\n                \r\n                <p>更多詳細數據請參考下方的附表。</p>\r\n            </div>",
        "excerpt": null,
        "date": null,
        "imageUrl": "../../shared-assets/site5-hero.webp",
        "isFeatured": null
    },
    {
        "id": 479,
        "documentId": "r902obfjj2ov3fwyl5bqcw4h",
        "title": "單手遊戲推薦 - 手遊速報",
        "slug": "portrait-games",
        "site": "site5",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.978Z",
        "updatedAt": "2025-12-02T10:44:25.825Z",
        "publishedAt": "2025-12-02T10:44:25.830Z",
        "html": "<div class=\"post-header\">\r\n                \r\n                <div class=\"post-meta\">2023-12 • 編輯精選</div>\r\n            </div>\r\n            <div class=\"post-content\">\r\n                <img src=\"../../shared-assets/site5-hero.webp\" alt=\"單手遊戲推薦\" style=\"width:100%; border-radius:12px; margin-bottom: 20px;\">\r\n                \r\n                <p class=\"lead\">如果你常常一手抓拉環、一手想偷玩一下遊戲，這篇就整理幾款真正適合單手操作、又不會太肝的作品。</p>\r\n                \r\n                <h2>重點整理</h2>\r\n                <ul>\r\n                    <li>重點一：活動時間與參加資格</li>\r\n                    <li>重點二：卡池機率分析</li>\r\n                    <li>重點三：CP值最高的課金禮包推薦</li>\r\n                </ul>\r\n                \r\n                <h2>詳細內容</h2>\r\n                <p>對於許多休閒玩家來說，如何有效利用碎片時間是關鍵。本篇將教你如何用最少的時間獲得最大的收益。</p>\r\n                \r\n                <div class=\"highlight-box\">\r\n                    <strong>小編點評：</strong> 這次的更新誠意滿滿，建議大家不要錯過！\r\n                </div>\r\n                \r\n                <p>更多詳細數據請參考下方的附表。</p>\r\n            </div>",
        "excerpt": null,
        "date": null,
        "imageUrl": "../../shared-assets/site5-hero.webp",
        "isFeatured": null
    },
    {
        "id": 582,
        "documentId": "xaq2budfrmkwh02qyg5emzii",
        "title": "為什麼現在的遊戲沒有以前好玩？",
        "slug": "retro-vs-modern",
        "site": "site1",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.589Z",
        "updatedAt": "2025-12-04T03:12:30.029Z",
        "publishedAt": "2025-12-04T03:12:30.034Z",
        "html": "<h1>為什麼現在的遊戲沒有以前好玩？</h1>\n            \n            <div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed1.webp?raw=true\" alt=\"左邊是像素遊戲畫面，右邊是現代3D高畫質遊戲畫面，形成強烈對比\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\n            </div>\n\n            <p>那天下午，窗外的陽光斜斜地照進來，剛好打在我那台積了一點灰塵的 PS5 上。我盯著螢幕上的讀取條，這已經是我第三次在同一個地方死掉了。不是因為操作太難，而是因為... 我竟然在過場動畫的時候睡著了。</p>\n            \n            <p>這讓我想起小時候，為了過《洛克人》的一個跳躍關卡，我可以連續三個小時不喝水、不上廁所，手把都被手汗弄得滑溜溜的。那時候的專注與熱情，現在好像很難找回來了。</p>\n\n            <h2>畫質越好，想像力越少？</h2>\n            \n            <p>以前的 8-bit 時代，瑪利歐只是一堆色塊組成的。但正因為畫面簡陋，我們的大腦會自動補完剩下的細節。我們會想像庫巴城堡裡的岩漿有多燙，想像薩爾達公主長什麼樣子。那是一種「參與式」的體驗。</p>\n\n            <p>現在的遊戲，連主角臉上的毛孔都做得清清楚楚。開發者把一切都塞給你了，你只需要「被動」地接受。就像看電影一樣，畫面很美，但你少了那種「這是我創造的世界」的感覺。</p>\n\n            <p>其實，這有點像是看小說和看改編電影的差別。小說給了你骨架，你的想像力填補了血肉；而電影直接把一切都定型了。</p>\n\n            <h2>「便利性」殺死了探索的樂趣</h2>\n\n            <p>現在的開放世界遊戲，地圖上總是標滿了密密麻麻的問號和驚嘆號。導航線直接畫在地板上告訴你該往哪走。你不需要記路，不需要觀察地形，甚至不需要動腦。</p>\n\n            <p>我還記得玩初代《薩爾達傳說》的時候，拿著一張紙筆自己在現實中畫地圖的感覺。那種「我發現了這個秘密通道！」的成就感，是現在那些自動導航給不了的。說真的，現在玩遊戲有時候感覺像是在按表操課，把清單上的一項項任務打勾而已。</p>\n\n            <p>當然，我也不是說現在的遊戲都不好。像是 <a href=\"https://zh.wikipedia.org/zh-tw/%E8%89%BE%E7%88%BE%E7%99%BB%E6%B3%95%E7%92%B0\" rel=\"nofollow\" target=\"_blank\">艾爾登法環</a> 就找回了那種探索的醍醐味。它不會告訴你前面有什麼，你得自己去撞牆、去死、去發現。</p>\n\n            <h2>付費模式的改變</h2>\n\n            <p>以前我們買一片卡帶，就是買下了完整的體驗。現在呢？買了遊戲本體，還要買季票、買皮膚、買經驗加成卡。遊戲設計不再單純為了「好玩」，有時候是為了「讓你感到不方便，所以你會想花錢」。</p>\n\n            <p>這真的很令人沮喪。當遊戲設計師開始研究心理學，想方設法挖掘人性的弱點來賺錢時，遊戲就變質了。大概是... 五六年前吧，我開始感覺到這種轉變越來越明顯。</p>\n\n            <h2>其實，變的可能是我們</h2>\n\n            <p>不過，老實說，我也在想，是不是因為我們長大了？</p>\n            \n            <p>小時候我們有無限的時間，但沒錢買遊戲，所以每一款遊戲都被我們玩到爛熟。現在我們有錢買主機、買 4K 電視，卻沒有那個下午能心無旁騖地打電動了。</p>\n\n            <p>前幾天我看著我家那隻老狗趴在陽台上曬太陽，牠耳朵動了一下，大概是聽到了樓下機車經過的聲音。那一刻我突然覺得，也許我們追求的不是遊戲本身的好壞，而是懷念那個無憂無慮的自己。</p>\n\n            <p>或許，找個週末，把手機關掉，把那些標榜 4K 120fps 的大作先放一邊。拿出那台舊舊的紅白機，或是玩玩簡單的獨立遊戲。你會發現，快樂其實一直都在，只是被我們複雜的生活給掩蓋了。</p>",
        "excerpt": "那天下午，窗外的陽光斜斜地照進來，剛好打在我那台積了一點灰塵的 PS5 上。我盯著螢幕上的讀取條，這已經是我第三次在同一個地方死掉了。不是因為操作太難，而是因為...",
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed1.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 583,
        "documentId": "nrfueagd2lwk5tchbqtxujuc",
        "title": "收藏家入門：如何辨別正版卡帶？",
        "slug": "collector-guide",
        "site": "site1",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.575Z",
        "updatedAt": "2025-12-04T03:12:30.213Z",
        "publishedAt": "2025-12-04T03:12:30.218Z",
        "html": "<h1>收藏家入門：如何辨別正版卡帶？</h1>\n            \n            <div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed3.webp?raw=true\" alt=\"一個擺滿復古遊戲主機和卡帶的木製展示櫃，井然有序\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\n            </div>\n\n            <p>歡迎來到這個深不見底的坑（笑）。最近這幾年，復古遊戲市場變得異常熱絡，有些稀有卡帶的價格甚至炒到了幾萬塊台幣。但隨著價格水漲船高，盜版商也開始蠢蠢欲動，製作出各種「高仿」卡帶。</p>\n\n            <p>我曾經在網拍上看到一片價格很甜的《洛克人 X3》，興沖沖地標下來，結果收到貨一摸手感就不對。那種塑膠殼的廉價感，就像是拿著免洗餐具一樣。拆開一看，果然是現代晶片焊上去的假貨。那次經驗大概繳了兩千塊學費吧。</p>\n\n            <h2>1. 貼紙的質感與色澤</h2>\n            \n            <p>正版卡帶的貼紙通常會有一定的厚度，而且印刷清晰，色彩飽和。任天堂的正版貼紙通常會有亮面處理（尤其是紅白機和超任時期）。</p>\n            \n            <p>盜版貼紙常犯的錯誤是：解析度不足（仔細看會有網點）、裁切不整齊（邊緣毛毛的），或是顏色偏淡。我有一個小撇步：把卡帶拿到燈光下斜著看，正版貼紙的反光通常很均勻，而盜版貼紙因為紙質差，反光會呈現波浪狀或顆粒感。</p>\n\n            <h2>2. 壓印編號 (Imprint Number)</h2>\n\n            <p>這是一個比較少人知道，但非常準確的辨識點。大多數的任天堂正版卡帶，在背面的標籤紙上，會有兩個用機器壓印進去的數字（通常是兩位數，例如 12、09）。</p>\n\n            <p>這個數字不是印上去的顏色，而是「凹痕」。你用手指摸不一定摸得出來，但側著光看非常明顯。這代表了生產工廠的代號。絕大多數的盜版商為了省成本，都不會做這個工序。</p>\n\n            <h2>3. 螺絲與外殼</h2>\n\n            <p>任天堂的卡帶使用的是特殊的六角星型螺絲（Gamebit），一般十字起子是轉不開的。如果你看到卡帶背面用的是普通十字螺絲，或是塑膠卡扣硬黏的，那 99% 是假貨。</p>\n\n            <p>不過要注意，現在網路上也買得到 Gamebit 螺絲起子，所以有些高仿也會換上正確的螺絲。這時候就要看電路板了。</p>\n\n            <h2>4. 電路板才是真理</h2>\n\n            <p>如果你真的不確定，最保險的方法就是拆開來看。正版電路板上面通常會印有 \"Nintendo\" 字樣以及年份。而盜版卡通常是一坨黑膠（俗稱牛屎晶片），或是看起來很新的綠色 PCB 板，上面隨便焊了幾個現代元件。</p>\n            \n            <p>雖然拆卡帶有點麻煩，但對於動輒數千元的收藏品來說，這是必要的保險。建議大家可以去參考 <a href=\"https://www.pricecharting.com/\" rel=\"nofollow\" target=\"_blank\">PriceCharting</a> 這類網站，上面常有正版電路板的照片可以比對。</p>\n\n            <h2>收藏的心態</h2>\n\n            <p>其實，說了這麼多，我覺得收藏最重要的是「你喜歡」。如果你只是想玩遊戲，那模擬器或是現代移植版都很方便。會想要收實體卡帶，通常是為了那份「擁有感」。</p>\n\n            <p>看著架子上一排排整齊的卡帶，偶爾拿起來把玩一下，那種滿足感是很難形容的。就像有些人喜歡聞舊書的味道一樣，我也很喜歡聞卡帶那種淡淡的... 陳舊塑膠味？聽起來好像有點變態，但我想懂的人自然會懂。</p>",
        "excerpt": "歡迎來到這個深不見底的坑（笑）。最近這幾年，復古遊戲市場變得異常熱絡，有些稀有卡帶的價格甚至炒到了幾萬塊台幣。但隨著價格水漲船高，盜版商也開始蠢蠢欲動，製作出各種「高仿」卡帶。我曾經...",
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed3.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 584,
        "documentId": "irf3f9zi0dhv7zn5gmsvzyjt",
        "title": "紅白機保養指南：吹卡帶真的有用嗎？",
        "slug": "cartridge-care",
        "site": "site1",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.562Z",
        "updatedAt": "2025-12-04T03:12:30.381Z",
        "publishedAt": "2025-12-04T03:12:30.386Z",
        "html": "<h1>紅白機保養指南：吹卡帶真的有用嗎？</h1>\n            \n            <div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed2.webp?raw=true\" alt=\"一雙手拿著棉花棒小心翼翼地清潔遊戲卡帶的金屬接點\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\n            </div>\n\n            <p>只要是經歷過紅白機時代的人，絕對都做過這件事：卡帶插下去沒反應，拔出來，「呼～呼～」用力吹兩口氣，再插回去。神奇的是，通常這樣就真的能玩了。但這真的是正確的做法嗎？</p>\n\n            <p>老實說，我以前也是「吹氣派」的忠實信徒。直到有一天，我拆開了一塊從小玩到大的《超級瑪利歐兄弟 3》，看到電路板上那層綠綠的鏽斑，我才發現自己犯了大錯。那種感覺，就像是發現自己一直以為在照顧寵物，結果其實是在慢慢餵毒給牠一樣。</p>\n\n            <h2>為什麼吹氣會有用？</h2>\n            \n            <p>這其實是一個美麗的誤會。當你把卡帶拔出來再插回去，這個動作本身就重新摩擦了金屬接點，刮除了一部分氧化層，或者讓接觸位置改變了微小的距離。所以，讓你成功開機的不是你的「氣」，而是「重新插拔」這個動作。</p>\n            \n            <p>你吹進去的氣體中含有濕氣（口水微粒），這些濕氣附著在銅製的金屬接點上，短期內或許增加了導電性，但長期來看，它會加速金屬氧化生鏽。這就是為什麼很多老卡帶的接點會變黑、接觸不良越來越嚴重的原因。</p>\n\n            <h2>正確的清潔三步驟</h2>\n\n            <p>既然不能吹，那該怎麼辦？其實很簡單，你需要準備的東西藥局都買得到：90% 以上的異丙醇（或是藥用酒精）和棉花棒。</p>\n\n            <ol>\n                <li><strong>沾取酒精：</strong> 用棉花棒沾一點酒精，不要太濕，剛好濕潤就好。</li>\n                <li><strong>輕輕擦拭：</strong> 把棉花棒伸進卡帶插槽，輕輕擦拭金屬接點。你會發現棉花棒瞬間變黑，那就是歲月留下的污垢。</li>\n                <li><strong>換頭再擦：</strong> 換一支新的棉花棒，直到擦出來沒有黑色為止。</li>\n            </ol>\n\n            <p>我有一次收到一片朋友送的二手《勇者鬥惡龍》，插上去完全沒反應，畫面一片灰。我大概用了十支棉花棒才把它清乾淨。當標題畫面和音樂出來的那一刻，真的有一種把人從加護病房救回來的成就感。</p>\n\n            <h2>關於保存環境的小細節</h2>\n\n            <p>除了清潔，保存環境也很重要。很多人習慣把卡帶隨便疊在一起，或是塞在抽屜深處。其實台灣的氣候潮濕，這對老遊戲機來說是大忌。</p>\n            \n            <p>我建議買幾個簡單的防潮箱，或是至少在收納箱裡放幾包乾燥劑。還有，盡量避免陽光直射。我看過太多卡帶的塑膠外殼因為長期曬太陽而變黃、變脆，稍微一捏就裂開了，那真的很心痛。</p>\n\n            <p>最近我整理房間時，翻到一個舊餅乾盒，裡面裝滿了我小學時收集的攻略本。雖然紙張泛黃了，還有一股舊書特有的味道，但那種踏實感是電子書無法取代的。卡帶也是一樣，它們不只是塑膠殼和電路板，它們是載著我們回憶的實體容器。</p>\n\n            <p>好好對待它們，它們還能再陪你戰鬥二十年。下次如果卡帶讀不到，記得忍住那股想吹氣的衝動，去拿棉花棒吧。</p>",
        "excerpt": "只要是經歷過紅白機時代的人，絕對都做過這件事：卡帶插下去沒反應，拔出來，「呼～呼～」用力吹兩口氣，再插回去。神奇的是，通常這樣就真的能玩了。但這真的是正確的做法嗎？老實說...",
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-fixed2.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 585,
        "documentId": "l05xfut5lu3cfmch71x5dzsa",
        "title": "測試用測試用測試用",
        "slug": "2025-12-05",
        "site": "site1",
        "category": "daily",
        "createdAt": "2025-12-03T06:50:08.081Z",
        "updatedAt": "2025-12-04T03:12:30.548Z",
        "publishedAt": "2025-12-04T03:12:30.554Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\r\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily3.webp?raw=true\" alt=\"Game Boy畫面上的俄羅斯方塊，一條長條正在落下\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\r\n            </div>\r\n\r\n            <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用？</p>\r\n\r\n            <p>這項研究指出，方形的結構可能與當時的巢穴設計和運輸方式有關。在沒有現代緩衝材料的古代，方形結構或許能提供更好的堆疊穩定性和抗震能力。</p>\r\n\r\n            <h2>進化的巧合還是必然？</h2>\r\n\r\n            <p>科學家認為，雞蛋的形狀是長期演化的結果，橢圓形能承受壓力且方便母體產出。那麼，為什麼在特定的古代文化中會出現方形蛋？</p>\r\n\r\n            <p>一種可能性是，這是一種**藝術上的簡化**或宗教上的隱喻，就像古代的像素藝術一樣，將複雜的形狀簡化為更容易繪製的幾何圖形。但壁畫上的細節，包括蛋殼的紋理和巢穴的描繪，都暗示著這可能不僅僅是簡化。</p>\r\n\r\n            <h2>形狀的背後：資源限制</h2>\r\n\r\n            <p>另一種有趣的理論是，方形蛋是古代**資源極度限制**下的產物。在資源匱乏的時期，家禽可能無法獲得足夠的鈣質來完成一個完美的橢圓形蛋殼。或者，這與當時的**飼料結構**有關，導致蛋在形成過程中受到了外部壓力，使其呈方形。</p>\r\n\r\n            <p>這讓人類學家開始思考：是不是許多我們認為理所當然的「自然」形態，其實都是在特定環境壓力下被塑造出來的？當限制解除，生物便會回歸到能量消耗最低的形態。</p>\r\n\r\n            <h2>給現代的啟示</h2>\r\n\r\n            <p>無論方形蛋的真相是什麼，這個奇特的發現給了我們一個啟示：**限制往往激發出最出乎意料的創意或進化結果**。正如現代工程師在微小晶片上擠壓出巨大性能一樣，古代的生物系統也在極限下找到了生存之道。</p>",
        "excerpt": null,
        "date": "2025-12-05",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily3.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 586,
        "documentId": "yaifpr4ciwvg2zwfrtfn4cax",
        "title": "古代雞蛋其實是方形的？",
        "slug": "2025-12-04",
        "site": "site1",
        "category": "daily",
        "createdAt": "2025-12-03T05:34:55.189Z",
        "updatedAt": "2025-12-04T03:12:30.719Z",
        "publishedAt": "2025-12-04T03:12:30.725Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\r\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily3.webp?raw=true\" alt=\"Game Boy畫面上的俄羅斯方塊，一條長條正在落下\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\r\n            </div>\r\n\r\n            <p>當我們想到雞蛋，腦中自然浮現的是完美的橢圓形。然而，最近在一個遠古文明遺址的壁畫中，考古學家發現了描繪著**方形雞蛋**的奇特圖案。這個發現讓整個生物學界和考古界陷入了沉思：古代的家禽真的產下方形蛋嗎？</p>\r\n\r\n            <p>這項研究指出，方形的結構可能與當時的巢穴設計和運輸方式有關。在沒有現代緩衝材料的古代，方形結構或許能提供更好的堆疊穩定性和抗震能力。</p>\r\n\r\n            <h2>進化的巧合還是必然？</h2>\r\n\r\n            <p>科學家認為，雞蛋的形狀是長期演化的結果，橢圓形能承受壓力且方便母體產出。那麼，為什麼在特定的古代文化中會出現方形蛋？</p>\r\n\r\n            <p>一種可能性是，這是一種**藝術上的簡化**或宗教上的隱喻，就像古代的像素藝術一樣，將複雜的形狀簡化為更容易繪製的幾何圖形。但壁畫上的細節，包括蛋殼的紋理和巢穴的描繪，都暗示著這可能不僅僅是簡化。</p>\r\n\r\n            <h2>形狀的背後：資源限制</h2>\r\n\r\n            <p>另一種有趣的理論是，方形蛋是古代**資源極度限制**下的產物。在資源匱乏的時期，家禽可能無法獲得足夠的鈣質來完成一個完美的橢圓形蛋殼。或者，這與當時的**飼料結構**有關，導致蛋在形成過程中受到了外部壓力，使其呈方形。</p>\r\n\r\n            <p>這讓人類學家開始思考：是不是許多我們認為理所當然的「自然」形態，其實都是在特定環境壓力下被塑造出來的？當限制解除，生物便會回歸到能量消耗最低的形態。</p>\r\n\r\n            <h2>給現代的啟示</h2>\r\n\r\n            <p>無論方形蛋的真相是什麼，這個奇特的發現給了我們一個啟示：**限制往往激發出最出乎意料的創意或進化結果**。正如現代工程師在微小晶片上擠壓出巨大性能一樣，古代的生物系統也在極限下找到了生存之道。</p>",
        "excerpt": null,
        "date": "2025-12-04",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily3.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 587,
        "documentId": "gzj244ps588j8mteijid47vn",
        "title": "俄羅斯方塊其實是心理戰武器？",
        "slug": "2025-12-03",
        "site": "site1",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.549Z",
        "updatedAt": "2025-12-04T03:12:30.935Z",
        "publishedAt": "2025-12-04T03:12:30.940Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\r\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily3.webp?raw=true\" alt=\"Game Boy畫面上的俄羅斯方塊，一條長條正在落下\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\r\n            </div>\r\n\r\n            <p>如果說有一款遊戲能夠跨越國界、語言甚至冷戰的鐵幕，那絕對是《俄羅斯方塊 (Tetris)》。它簡單到連我不玩遊戲的阿嬤都會玩，但又複雜到讓數學家寫論文研究。當年它傳入西方時，甚至有人開玩笑說：「這是蘇聯發明來癱瘓西方生產力的秘密武器。」</p>\r\n\r\n            <p>這玩笑話其實有點道理。你有沒有過這種經驗：原本只想玩個五分鐘放鬆一下，結果一抬頭發現兩個小時過去了？甚至閉上眼睛，腦子裡還是那些方塊在掉落？這叫做「俄羅斯方塊效應」。</p>\r\n\r\n            <h2>為什麼我們停不下來？</h2>\r\n\r\n            <p>心理學上有個概念叫「蔡加尼克效應 (Zeigarnik effect)」，意思是人類對於「未完成的任務」會特別掛念。俄羅斯方塊利用的正是這一點。每一行方塊被消除，都會給你一個短暫的滿足感（多巴胺分泌），但同時，新的方塊又立刻掉下來，創造出新的「未完成任務」。</p>\r\n            \r\n            <p>你的大腦就不斷在「解決問題 -> 獲得獎勵 -> 出現新問題」這個迴圈中打轉。這種機制創造出了極致的「心流」體驗，讓你忘記時間、忘記煩惱，甚至忘記要去接小孩（別問我為什麼知道）。</p>\r\n\r\n            <h2>整齊帶來的療癒</h2>\r\n\r\n            <p>另一個讓人上癮的原因是人類對「秩序」的渴望。現實生活充滿了混亂與不可控，我們無法把亂丟的襪子自動消除，也無法讓討厭的老闆消失。但在《俄羅斯方塊》的世界裡，只要你努力，混亂就會變成秩序，然後消失得無影無蹤。</p>\r\n            \r\n            <p>看著那些坑坑洞洞被填滿，然後「唰」的一聲整行消失，那種心理上的舒壓感是非常強大的。這也是為什麼很多焦慮的人會覺得玩這個遊戲很放鬆。</p>\r\n\r\n            <h2>看似簡單的小細節</h2>\r\n\r\n            <p>不知道大家有沒有注意到一個小細節？在 Game Boy 版本裡，當你拿到高分時，旁邊會出現火箭發射的動畫。那時候小小的螢幕上，幾顆像素點組成的火箭飛上天，對當時的我來說，那就是全世界最棒的獎勵。</p>\r\n\r\n            <p>現在的手遊動不動就送你幾千個金幣、閃亮亮的寶箱，但那種單純的成就感，好像反而變淡了。或許，這也是為什麼我們總是懷念老遊戲的原因吧。</p>",
        "excerpt": null,
        "date": "2025-12-03",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily3.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 588,
        "documentId": "hfm5693ywsmjiamzhbet1h96",
        "title": "魂斗羅的「上上下下」密技是怎麼來的？",
        "slug": "2025-12-02",
        "site": "site1",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.537Z",
        "updatedAt": "2025-12-04T03:12:31.101Z",
        "publishedAt": "2025-12-04T03:12:31.106Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\r\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily2.webp?raw=true\" alt=\"魂斗羅的標題畫面，背景是經典的兩個猛男背對背開槍\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\r\n            </div>\r\n\r\n            <p>如果你抓一個路人問他「上上下下左右左右BA」是什麼，十個有八個會回你：「喔！魂斗羅 30 隻命！」這串被稱為「柯拿米密技 (Konami Code)」的指令，已經成為了流行文化的一部分，甚至出現在電影《無敵破壞王》裡。</p>\r\n            \r\n            <p>但這串密技並不是為了讓玩家爽而設計的，它的誕生其實純屬意外，甚至差點被當成 Bug 刪掉。</p>\r\n\r\n            <h2>橋本和久的煩惱</h2>\r\n\r\n            <p>故事要回到 1986 年，當時 Konami 的工程師橋本和久正在負責將街機遊戲《宇宙巡航艦 (Gradius)》移植到紅白機上。問題來了，這款遊戲難度超級高，彈幕滿天飛。橋本自己在測試的時候，根本玩不下去，一直死一直死，完全無法測試後面的關卡。</p>\r\n            \r\n            <p>為了方便測試，他隨手寫了一段程式碼，只要輸入這串指令，就能獲得全套武器裝備。至於為什麼是這串按鍵？據說是因為好記，而且不容易在亂按手把時誤觸。</p>\r\n\r\n            <h2>忘記刪除的後門</h2>\r\n\r\n            <p>就在遊戲準備發售前，忙昏頭的開發團隊竟然忘記把這段「測試用代碼」刪掉了。等到發現時，遊戲已經量產出貨了。如果這時候回收重做，公司會損失慘重。</p>\r\n            \r\n            <p>Konami 的高層想了想，覺得「這好像也不算壞事」，畢竟遊戲真的很難，給玩家一個作弊的方法說不定能增加銷量。於是，這個秘密就被保留了下來。</p>\r\n\r\n            <h2>發揚光大：魂斗羅</h2>\r\n\r\n            <p>真正讓這串密技爆紅的，是後來推出的《魂斗羅》。這遊戲比《宇宙巡航艦》更難，兩條命根本不夠死。當玩家發現輸入這串指令可以把命加到 30 隻時，簡直像是找到了救世主。這串密技透過口耳相傳（那時候可沒有網際網路），迅速傳遍了全世界的學校操場。</p>\r\n\r\n            <p>我還記得小時候去同學家，開場第一件事就是大家一起喊口令，誰按錯了還會被大家唸。那種大家圍在電視機前，為了通關而一起努力（作弊）的時光，現在想起來還是覺得很溫暖。</p>",
        "excerpt": null,
        "date": "2025-12-02",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily2.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 589,
        "documentId": "roggvd2pi6ghgdcmpj85lnlx",
        "title": "瑪利歐的鬍子其實是為了省畫素？",
        "slug": "2025-12-01",
        "site": "site1",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.522Z",
        "updatedAt": "2025-12-04T03:12:31.258Z",
        "publishedAt": "2025-12-04T03:12:31.260Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\r\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily1.webp?raw=true\" alt=\"放大的8-bit瑪利歐頭像，清楚顯示出鬍子和帽子的像素構成\" style=\"width: 100%; height: auto;\" loading=\"lazy\">\r\n            </div>\r\n\r\n            <p>說到瑪利歐，大家腦中浮現的第一個形象，大概就是那個大鼻子、濃密的鬍子，還有一頂紅色的帽子。這個形象如此經典，以至於我們很少去思考：為什麼他要長這樣？</p>\r\n\r\n            <p>這其實不是因為宮本茂覺得這樣比較帥（雖然現在看來挺有型的），而完全是因為當年的技術限制。那時候的硬體性能弱到讓我們現在難以想像。</p>\r\n\r\n            <h2>嘴巴太難畫，不如遮起來</h2>\r\n\r\n            <p>在 1981 年《大金剛》這款遊戲開發時，角色能使用的像素格數非常有限（大約只有 16x16）。在這麼小的格子裡，要畫出一個「會動的嘴巴」還要表現出表情，簡直是不可能的任務。</p>\r\n\r\n            <p>宮本茂當時大概抓破了頭吧。後來他靈機一動：「乾脆給他加上鬍子好了！」這樣一來，就不需要畫嘴巴了，省下了寶貴的像素，也省去了做嘴部動畫的麻煩。而且，鬍子還能讓鼻子看起來更立體，一舉兩得。</p>\r\n\r\n            <h2>帽子也是懶人救星？</h2>\r\n\r\n            <p>同樣的道理也用在頭髮上。要用那幾個像素點畫出飄逸的頭髮，甚至還要考慮跳躍時頭髮的擺動，這在當時簡直是技術地獄。所以，解決方案很簡單：給他戴個帽子。</p>\r\n\r\n            <p>這樣一來，就不需要處理頭髮的物理動態，也不用擔心頭髮的顏色跟黑色背景混在一起。這讓我想到工程師常常說的一句話：「如果是 Bug 解決不了，就把它變成 Feature。」瑪利歐的設計，大概是這句話最完美的體現。</p>\r\n\r\n            <h2>限制激發創意</h2>\r\n\r\n            <p>有時候想想，現代遊戲雖然畫面精美，什麼都能做得到，但也因此少了一點「巧思」。當年的開發者在極度受限的環境下，被迫用最簡單的方式解決問題，反而創造出了流傳四十年的經典形象。</p>\r\n\r\n            <p>下次當你看到瑪利歐那搓鬍子時，可以多看兩眼。那不只是鬍子，那是早期遊戲開發者在硬體極限下，努力掙扎求生所留下的智慧結晶。</p>",
        "excerpt": null,
        "date": "2025-12-01",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site1-daily1.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 590,
        "documentId": "gxwv2admyd9vingjmrxq5ksp",
        "title": "電競螢幕 144Hz 和 240Hz 真的有差嗎？",
        "slug": "monitor-hz",
        "site": "site2",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.693Z",
        "updatedAt": "2025-12-04T03:12:31.419Z",
        "publishedAt": "2025-12-04T03:12:31.425Z",
        "html": "<h1 style=\"color: var(--text-highlight); font-size: 2.5rem; margin-bottom: 1.5rem;\">電競螢幕 144Hz 和 240Hz 真的有差嗎？</h1>\n            \n            <div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed3.webp?raw=true\" alt=\"兩台螢幕並排，一台顯示流暢畫面，一台顯示殘影畫面\" style=\"width: 100%; border-bottom: 4px solid var(--primary-color);\" loading=\"lazy\">\n            </div>\n\n            <p>這大概是硬體界最大的戰場之一。有人說「人類眼睛每秒只能處理 60 幀，再高都是浪費」，這大概是我聽過最荒謬的偽科學。</p>\n            <p>首先，讓我直接給結論：<strong>60Hz 到 144Hz 是「質的飛躍」，144Hz 到 240Hz 是「細膩度的提升」。</strong></p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">動態視力與資訊量</h2>\n            <p>當你在遊戲中快速轉動視角時，螢幕需要不斷更新畫面。如果是 60Hz，每一幀之間的間隔是 16.6ms；如果是 240Hz，間隔只有 4.16ms。</p>\n            <p>這意味著什麼？意味著當敵人在移動時，240Hz 的螢幕能提供你「更多」敵人的位置資訊。你的大腦接收到的連續動作越完整，你就越容易預判他的走位。這不是玄學，這是純粹的資訊量差異。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">我的親身經歷</h2>\n            <p>我記得第一次從 60Hz 換到 144Hz 時，那種感覺就像是原本在水裡跑步，突然上了岸一樣輕鬆。滑鼠的軌跡變得絲滑無比。</p>\n            <p>後來為了測試，我又升級到了 240Hz。老實說，一開始的驚艷感沒有第一次那麼強烈。但是！但是，重點來了。當我用了一個月的 240Hz，再回頭去看 144Hz 時，我竟然感覺到了「殘影」。</p>\n            <p>這就是所謂的「由奢入儉難」。你的眼睛一旦習慣了那個流暢度，就回不去了。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">你需要買嗎？</h2>\n            <p>如果你的顯卡跑不到 240 FPS，那買 240Hz 螢幕就是浪費錢。但如果你的硬體足夠強大，而且你是認真想打好 FPS 遊戲的，那高刷新率螢幕絕對是必備的投資。</p>\n            <p>別去聽那些說沒差的人的話，通常他們根本沒用過，或者他們的反應速度根本不需要用到這麼好的設備（笑）。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed3.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 591,
        "documentId": "zjh5q2c3b8c5nfww6jaaoux5",
        "title": "機械鍵盤軸體怎麼選？紅軸還是青軸？",
        "slug": "keyboard-switches",
        "site": "site2",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.679Z",
        "updatedAt": "2025-12-04T03:12:31.579Z",
        "publishedAt": "2025-12-04T03:12:31.582Z",
        "html": "<h1 style=\"color: var(--text-highlight); font-size: 2.5rem; margin-bottom: 1.5rem;\">機械鍵盤軸體怎麼選？紅軸還是青軸？</h1>\n            \n            <div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed1.webp?raw=true\" alt=\"拆解開的機械鍵盤軸體特寫，紅軸與青軸對比\" style=\"width: 100%; border-bottom: 4px solid var(--primary-color);\" loading=\"lazy\">\n            </div>\n\n            <p>這是一個我被問了至少一千次的問題：「教練，我想買機械鍵盤，是不是聲音越大聲的越好？」</p>\n\n            <p>每次聽到這句話，我都會深吸一口氣。老實說，這是一個非常嚴重的誤區。很多人被行銷廣告洗腦，以為青軸那種「喀喀喀」的聲音就是電競的象徵。但在真正的競技場上，那個聲音可能就是你輸掉對槍的原因。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">青軸：打字很爽，遊戲很雷</h2>\n\n            <p>青軸（Blue Switch）最大的特色就是有強烈的「段落感」和清脆的聲音。為了產生那個段落感，軸體內部有一個特殊的滑塊結構。這意味著什麼？意味著當你按下按鍵後，如果要再次觸發（Double Tap），你需要讓按鍵回彈到一個比觸發點更高的位置。</p>\n            \n            <p>這在平常打字沒差，但在玩 FPS 或 MOBA 這種需要極速連點（例如 ADAD 急停或技能連招）的遊戲時，那個「回彈延遲」會讓你感到一種微妙的卡頓。雖然只有幾毫秒，但在高手過招時，這就是生與死的距離。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">紅軸與銀軸：速度的極致</h2>\n\n            <p>這就是為什麼絕大多數的職業選手（大約 70% 以上）都選擇紅軸（Red Switch）或更快的銀軸（Speed Silver）。</p>\n\n            <p>紅軸是「線性軸」，直上直下，沒有任何段落感。你按下去多少，它就反應多少。沒有多餘的結構阻礙，讓你的操作可以更直覺。而銀軸則是紅軸的進化版，觸發行程從標準的 2.0mm 縮短到 1.2mm。也就是說，你手指才剛動一點點，技能就已經發出去了。</p>\n\n            <p>我曾經讓一位卡在白金牌位的學員把他的青軸換成銀軸。一開始他不習慣，覺得太靈敏容易誤觸。但適應了一週後，他的急停準度明顯提升了。他說：「以前覺得是手指跟不上腦袋，現在覺得手指終於解放了。」</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">結論：選工具，不要選玩具</h2>\n\n            <p>如果你買鍵盤是為了在宿舍吵室友，或者享受打字的節奏感，那青軸很棒。但如果你是為了贏，為了在那 0.1 秒的瞬間比對手更快開槍，請把那個吵死人的鍵盤收起來。</p>\n\n            <p>去試試紅軸，或者茶軸（如果你真的割捨不下段落感）。在競技的世界裡，安靜通常代表著致命。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed1.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 592,
        "documentId": "goznpxsktwe54qhnucfkxyod",
        "title": "提升 FPS 瞄準率的三個肌肉記憶訓練",
        "slug": "aim-training",
        "site": "site2",
        "category": "fixed",
        "createdAt": "2025-12-01T13:26:34.666Z",
        "updatedAt": "2025-12-04T03:12:31.742Z",
        "publishedAt": "2025-12-04T03:12:31.747Z",
        "html": "<h1 style=\"color: var(--text-highlight); font-size: 2.5rem; margin-bottom: 1.5rem;\">提升 FPS 瞄準率的三個肌肉記憶訓練</h1>\n            \n            <div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed2.webp?raw=true\" alt=\"第一人稱射擊遊戲的準心與目標練習靶，顯示命中率數據\" style=\"width: 100%; border-bottom: 4px solid var(--primary-color);\" loading=\"lazy\">\n            </div>\n\n            <p>我看過太多玩家一上線就直接排位賽，然後在前三回合被打得滿頭包，才開始抱怨「今天手感不好」。</p>\n            <p>讓我告訴你一個殘酷的事實：<strong>手感是不可靠的，肌肉記憶才是真的。</strong> 職業選手之所以穩，不是因為他們每天狀況都好，而是因為他們的肌肉已經記住了準心移動的距離。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">1. 定點跟槍 (Tracking)</h2>\n            <p>很多人以為 FPS 就是「甩槍」，其實「跟槍」才是基本功。找一個固定點（或是訓練場的移動靶），試著讓你的準心一直黏在目標頭上，同時左右移動你的角色。</p>\n            <p>這聽起來很簡單，但實際做起來你會發現準心會一直抖動。這個練習是為了訓練手臂和手腕的微調能力，讓你的準心移動變得平滑。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">2. 慢速定位 (Click Timing)</h2>\n            <p>不要一開始就想學大神那種「甩一下就爆頭」。先求準，再求快。在 Aim Lab 或 KovaaK's 裡，把目標設小，然後用你會覺得「太慢」的速度去瞄準。</p>\n            <p>確保每一發都打在正中心。你的大腦需要先建立正確的路徑神經連結。這就像學鋼琴一樣，你要先慢練，手指才知道該往哪擺。等準度到了 95% 以上，再慢慢加快速度。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">3. 180 度轉身重置</h2>\n            <p>這是一個常被忽略的練習。在遊戲中，你不可能永遠只面對前方。試著快速轉身 180 度，然後立刻把準心拉回原本的目標點。</p>\n            <p>這能訓練你對滑鼠墊空間的感知，以及手臂大幅度移動後的準心回正能力。我看過很多低端位的玩家，一被偷背身就慌了，轉身後準心都不知道飄到哪去了。</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">持之以恆</h2>\n            <p>這些訓練很枯燥，我也知道打 Bot 很無聊。但每天花 15 分鐘，一個月後你會發現，那些以前你覺得「怎麼可能打得到」的槍，現在變成了你的日常操作。這就是競技的魅力。</p>",
        "excerpt": null,
        "date": null,
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-fixed2.webp?raw=true",
        "isFeatured": null
    },
    {
        "id": 593,
        "documentId": "uotnov2r1iyu3l4sjvi9ztbp",
        "title": "測試用測試用測試用",
        "slug": "2025-12-04",
        "site": "site2",
        "category": "daily",
        "createdAt": "2025-12-03T06:14:17.166Z",
        "updatedAt": "2025-12-04T03:12:31.894Z",
        "publishedAt": "2025-12-04T03:12:31.897Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily3.webp?raw=true\" alt=\"遊戲畫面右上角的網路數據，顯示高Ping和掉封包圖示\" style=\"width: 100%; border-bottom: 4px solid var(--primary-color);\" loading=\"lazy\">\n            </div>\n\n            <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">測試用測試用測試</h2>\n            <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用</p>\n            <p>一般來說，玩 FPS 遊戲：</p>\n            <ul style=\"list-style: none; padding-left: 0;\">\n                <li style=\"margin-bottom: 0.5rem; color: #aaa;\">0-20ms：神之領域（通常是住機房隔壁）。</li>\n                <li style=\"margin-bottom: 0.5rem; color: #fff;\">20-50ms：優秀，幾乎感覺不到延遲。</li>\n                <li style=\"margin-bottom: 0.5rem; color: #aaa;\">50-100ms：可玩，但高難度操作會有影響。</li>\n                <li style=\"margin-bottom: 0.5rem; color: var(--primary-color);\">100ms+：建議去玩回合制遊戲。</li>\n            </ul>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">比 Ping 更可怕的敵人：掉封包</h2>\n            <p>有時候你的 Ping 只有 30，但畫面還是一頓一頓的，甚至人物會瞬移。這通常是「掉封包 (Packet Loss)」或「抖動 (Jitter)」造成的。</p>\n            <p>想像你在講電話，聲音沒有延遲，但每講三個字就會漏掉一個字。這比延遲更糟糕。這通常是因為你用了 Wi-Fi 玩遊戲。</p>\n            \n            <p>我給所有學員的第一個建議永遠是：<strong>去買一條網路線。</strong> 插上去，你的世界會變得不一樣。無線網路再怎麼穩，也比不上一條 100 塊的 Cat.6 網路線。</p>",
        "excerpt": null,
        "date": "2025-12-04",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily3.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 594,
        "documentId": "nudh94kqfxircpwf3r6dwx5h",
        "title": "網路延遲 Ping 值多少才算正常？",
        "slug": "2025-12-03",
        "site": "site2",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.643Z",
        "updatedAt": "2025-12-04T03:12:32.048Z",
        "publishedAt": "2025-12-04T03:12:32.052Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily3.webp?raw=true\" alt=\"遊戲畫面右上角的網路數據，顯示高Ping和掉封包圖示\" style=\"width: 100%; border-bottom: 4px solid var(--primary-color);\" loading=\"lazy\">\n            </div>\n\n            <p>這大概是所有玩家最不想看到的畫面：你明明先開槍了，結果死的是你。然後右上角紅字一閃而過。很多人會說：「我有 500M 光纖耶！為什麼還會卡？」</p>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">頻寬 vs. 延遲</h2>\n            <p>這裡要釐清一個觀念：<strong>頻寬（Bandwidth）是高速公路的車道數，而延遲（Latency/Ping）是車子的速度。</strong> 你就算有 100 線道的高速公路，如果車子開得慢（Ping 高），貨物（封包）還是會晚到。</p>\n            <p>一般來說，玩 FPS 遊戲：</p>\n            <ul style=\"list-style: none; padding-left: 0;\">\n                <li style=\"margin-bottom: 0.5rem; color: #aaa;\">0-20ms：神之領域（通常是住機房隔壁）。</li>\n                <li style=\"margin-bottom: 0.5rem; color: #fff;\">20-50ms：優秀，幾乎感覺不到延遲。</li>\n                <li style=\"margin-bottom: 0.5rem; color: #aaa;\">50-100ms：可玩，但高難度操作會有影響。</li>\n                <li style=\"margin-bottom: 0.5rem; color: var(--primary-color);\">100ms+：建議去玩回合制遊戲。</li>\n            </ul>\n\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">比 Ping 更可怕的敵人：掉封包</h2>\n            <p>有時候你的 Ping 只有 30，但畫面還是一頓一頓的，甚至人物會瞬移。這通常是「掉封包 (Packet Loss)」或「抖動 (Jitter)」造成的。</p>\n            <p>想像你在講電話，聲音沒有延遲，但每講三個字就會漏掉一個字。這比延遲更糟糕。這通常是因為你用了 Wi-Fi 玩遊戲。</p>\n            \n            <p>我給所有學員的第一個建議永遠是：<strong>去買一條網路線。</strong> 插上去，你的世界會變得不一樣。無線網路再怎麼穩，也比不上一條 100 塊的 Cat.6 網路線。</p>",
        "excerpt": null,
        "date": "2025-12-03",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily3.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 595,
        "documentId": "ex8qv7ieyk181fcstdkrm2e1",
        "title": "職業選手為什麼都斜著放鍵盤？",
        "slug": "2025-12-02",
        "site": "site2",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.624Z",
        "updatedAt": "2025-12-04T03:12:32.218Z",
        "publishedAt": "2025-12-04T03:12:32.222Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\r\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily2.webp?raw=true\" alt=\"職業電競選手的桌面視角，鍵盤呈現極端的斜放角度\" style=\"width: 100%; border-bottom: 4px solid var(--primary-color);\" loading=\"lazy\">\r\n            </div>\r\n\r\n            <p>這是一個每次線下賽轉播都會被討論的話題。為什麼好好的一個鍵盤，非要擺得歪七扭八？難道這樣按鍵比較快？</p>\r\n            <p>其實，這個習慣最早源自於早期的 LAN Party 和線下比賽環境。</p>\r\n\r\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">寸土寸金的桌面空間</h2>\r\n            <p>在十幾年前的比賽現場，桌子通常都很窄，而且選手之間坐得非常擠。為了讓那張超大的滑鼠墊能放得下，並給右手留出足夠的甩槍空間，選手們被迫把鍵盤側過來放，以減少佔用的水平寬度。</p>\r\n            <p>久而久之，這種「被逼出來」的姿勢變成了習慣。即使現在的比賽場地寬敞了，這些選手（以及模仿他們的後輩）依然覺得這樣擺最舒服。</p>\r\n\r\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">人體工學的意外收穫</h2>\r\n            <p>但除了空間因素，斜放鍵盤其實也有人體工學上的好處。當你把鍵盤向順時針旋轉時，你的左手手腕可以保持更自然的直線狀態，減少尺骨偏移（Ulnar Deviation）的壓力。</p>\r\n            <p>我自己試過之後也回不去了。雖然打字時要轉回來有點麻煩，但在玩遊戲時，那種手肘自然張開的姿勢，確實能減輕長時間比賽的疲勞感。</p>\r\n\r\n            <p>不過要注意，別為了模仿而模仿。如果你覺得手腕痛，那就調整回正常角度。姿勢沒有絕對的對錯，只有適不適合你的骨骼結構。</p>",
        "excerpt": null,
        "date": "2025-12-02",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily2.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 596,
        "documentId": "d02gqo8xwvi0j8udywlrba2h",
        "title": "滑鼠 DPI 不是越高越好？",
        "slug": "2025-12-01",
        "site": "site2",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.603Z",
        "updatedAt": "2025-12-04T03:12:32.391Z",
        "publishedAt": "2025-12-04T03:12:32.394Z",
        "html": "<div class=\"hero-image\" style=\"margin-bottom: 2rem;\">\r\n                <img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily1.webp?raw=true\" alt=\"電競滑鼠底部特寫，顯示光學感應器\" style=\"width: 100%; border-bottom: 4px solid var(--primary-color);\" loading=\"lazy\">\r\n            </div>\r\n\r\n            <p>這是一個經典的行銷陷阱。廠商喜歡在包裝盒上印上大大的「25000 DPI！」好像數字越大，你的槍法就越準一樣。但如果你去調查 <a href=\"https://prosettings.net/\" rel=\"nofollow\" target=\"_blank\">ProSettings</a> 上面的職業選手數據，你會發現一個驚人的事實：絕大多數的頂尖選手，DPI 設定都在 400 到 1600 之間。</p>\r\n\r\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">微小抖動的放大鏡</h2>\r\n            <p>DPI (Dots Per Inch) 代表的是滑鼠游標的移動速度。當 DPI 過高時，感應器會變得極度敏感。敏感是好事嗎？不一定。</p>\r\n            <p>它意味著連你呼吸時手部的微小震動，甚至是你按下滑鼠鍵時那一點點的位移，都會被捕捉並放大到螢幕上。這會導致你的準心產生不必要的「噪點」，讓你難以進行精確的微調。</p>\r\n\r\n            <h2 style=\"color: var(--primary-color); margin-top: 2rem;\">穩定才是王道</h2>\r\n            <p>低 DPI（如 400 或 800）的好處是「容錯率高」。它過濾掉了那些非自願的微小抖動，讓你的每一次移動都是來自於你明確的意圖。</p>\r\n            <p>當然，這並不代表你就不能轉身了。我們用的是「手臂流」操作，大範圍移動靠手臂，微調靠手腕。這需要一張大滑鼠墊，但換來的是無與倫比的穩定性。</p>\r\n\r\n            <p>所以，下次看到那些標榜超高 DPI 的廣告，笑笑就好。適合你的設定，才是最好的設定。</p>",
        "excerpt": null,
        "date": "2025-12-01",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site2-daily1.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 597,
        "documentId": "c9o0gkmhs1od3qoziz22jv37",
        "title": "測試用測試用測試用測試用",
        "slug": "2025-12-04",
        "site": "site3",
        "category": "daily",
        "createdAt": "2025-12-03T08:03:27.238Z",
        "updatedAt": "2025-12-04T03:12:32.579Z",
        "publishedAt": "2025-12-04T03:12:32.583Z",
        "html": "<img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily3.webp?raw=true\" alt=\"深夜的房間，開發者對著雙螢幕寫程式，桌上堆滿了泡麵和草稿紙\" style=\"width: 100%; border-radius: 12px; margin-bottom: 2rem;\" loading=\"lazy\">\r\n\r\n            <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用</p>\r\n            <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用：</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">上午 10:00：與 Bug 的起床氣</h2>\r\n            <p>醒來第一件事不是刷牙，而是打開 Discord 看玩家回報了什麼新 Bug。有時候是一個穿模的貼圖，有時候是導致遊戲崩潰的致命錯誤。早餐通常是在修復昨晚遺留的程式碼中度過的。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">下午 2:00：一人分飾多角</h2>\r\n            <p>因為團隊只有兩個人，他下午要變身成美術，畫幾個像素圖；然後又要變身成行銷，去 Twitter 發文宣傳；偶爾還要客串音效師，拿著錄音筆去廚房錄敲鍋子的聲音（為了做打擊音效）。</p>\r\n            <p>「最累的不是工作量，而是腦袋要一直切換頻道。」他這麼說。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">凌晨 1:00：靈感的微光</h2>\r\n            <p>這是最安靜，也是效率最高的時候。當城市睡著了，他終於可以專注在核心機制的設計上。他說，有時候寫程式寫到一半，看著螢幕上的小人終於按照自己的想法跳起來，那一瞬間的快樂，可以抵消掉整天的疲憊。</p>\r\n            \r\n            <p>獨立開發不是一份工作，而是一種生活方式。他們用肝臟和熱情，去換取那一點點在玩家螢幕上閃爍的光芒。所以，下次玩到一款好玩的獨立遊戲，別忘了去評論區留句「謝謝」，那對他們來說，真的比什麼都重要。</p>",
        "excerpt": null,
        "date": "2025-12-04",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily3.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 598,
        "documentId": "f8ivzns3c3ot0ccaq7jy51tb",
        "title": "獨立遊戲開發者的一天是怎麼過的？",
        "slug": "2025-12-03",
        "site": "site3",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.750Z",
        "updatedAt": "2025-12-04T03:12:32.768Z",
        "publishedAt": "2025-12-04T03:12:32.773Z",
        "html": "<img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily3.webp?raw=true\" alt=\"深夜的房間，開發者對著雙螢幕寫程式，桌上堆滿了泡麵和草稿紙\" style=\"width: 100%; border-radius: 12px; margin-bottom: 2rem;\" loading=\"lazy\">\r\n\r\n            <p>很多人覺得做遊戲很夢幻：可以整天玩遊戲，還能把自己的點子變成現實。但實際上，獨立開發者的生活往往伴隨著大量的孤獨與焦慮。</p>\r\n            <p>我曾經採訪過一位正在開發解謎遊戲的朋友，他的日程表是這樣的：</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">上午 10:00：與 Bug 的起床氣</h2>\r\n            <p>醒來第一件事不是刷牙，而是打開 Discord 看玩家回報了什麼新 Bug。有時候是一個穿模的貼圖，有時候是導致遊戲崩潰的致命錯誤。早餐通常是在修復昨晚遺留的程式碼中度過的。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">下午 2:00：一人分飾多角</h2>\r\n            <p>因為團隊只有兩個人，他下午要變身成美術，畫幾個像素圖；然後又要變身成行銷，去 Twitter 發文宣傳；偶爾還要客串音效師，拿著錄音筆去廚房錄敲鍋子的聲音（為了做打擊音效）。</p>\r\n            <p>「最累的不是工作量，而是腦袋要一直切換頻道。」他這麼說。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">凌晨 1:00：靈感的微光</h2>\r\n            <p>這是最安靜，也是效率最高的時候。當城市睡著了，他終於可以專注在核心機制的設計上。他說，有時候寫程式寫到一半，看著螢幕上的小人終於按照自己的想法跳起來，那一瞬間的快樂，可以抵消掉整天的疲憊。</p>\r\n            \r\n            <p>獨立開發不是一份工作，而是一種生活方式。他們用肝臟和熱情，去換取那一點點在玩家螢幕上閃爍的光芒。所以，下次玩到一款好玩的獨立遊戲，別忘了去評論區留句「謝謝」，那對他們來說，真的比什麼都重要。</p>",
        "excerpt": null,
        "date": "2025-12-03",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily3.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 599,
        "documentId": "nw95s3wl43cx0ujst3cuq5dz",
        "title": "Roguelike 和 Roguelite 到底差在哪？",
        "slug": "2025-12-02",
        "site": "site3",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.730Z",
        "updatedAt": "2025-12-04T03:12:32.964Z",
        "publishedAt": "2025-12-04T03:12:32.968Z",
        "html": "<img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily2.webp?raw=true\" alt=\"陰暗的地下城迷宮，主角站在分岔路口，隨機生成的房間結構\" style=\"width: 100%; border-radius: 12px; margin-bottom: 2rem;\" loading=\"lazy\">\r\n\r\n            <p>這兩個詞長得超像，唸起來也差不多，搞得大家經常混用。連 Steam 標籤有時候都標得亂七八糟。簡單來說，它們就像是「黑咖啡」和「拿鐵」的差別。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">Roguelike：硬派的浪漫</h2>\r\n            <p>Roguelike 指的是嚴格遵循 1980 年遊戲《Rogue》規則的遊戲。它有幾個核心特徵：</p>\r\n            <ul style=\"list-style: disc; padding-left: 2rem; margin-bottom: 1rem;\">\r\n                <li><strong>永久死亡 (Permadeath)：</strong> 死了就是死了，存檔刪除，一切從零開始。你上一場拿到的神裝？沒了。</li>\r\n                <li><strong>回合制：</strong> 你動一下，敵人才動一下。</li>\r\n                <li><strong>沒什麼繼承要素：</strong> 你唯一能繼承的，只有身為玩家的「經驗」和「知識」。</li>\r\n            </ul>\r\n            <p>這類遊戲非常硬核，挫折感很重，但通關時的成就感也是無與倫比的。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">Roguelite：改良後的溫柔</h2>\r\n            <p>現在市面上絕大多數的熱門作（如《Hades》、《死亡細胞》）其實都是 Roguelite（輕度 Rogue）。</p>\r\n            <p>它們保留了隨機地圖和永久死亡的懲罰，但加入了一個關鍵要素：<strong>局外成長 (Meta-progression)</strong>。</p>\r\n            <p>就算你死了，你帶回來的資源可以用來解鎖新武器、提升血量上限。這意味著就算你技術沒有變好，只要你玩得夠久，角色數值也會變強，總有一天能通關。這大大降低了勸退感，讓更多玩家能享受隨機迷宮的樂趣。</p>\r\n            \r\n            <p>所以，下次別再爭這個了。反正不管是 Like 還是 Lite，能讓你心甘情願再按一次「New Game」的，就是好遊戲。</p>",
        "excerpt": null,
        "date": "2025-12-02",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily2.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 600,
        "documentId": "plcgbk21ytcl082omab4gijn",
        "title": "《空洞騎士》的地圖設計邏輯",
        "slug": "2025-12-01",
        "site": "site3",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.707Z",
        "updatedAt": "2025-12-04T03:12:33.144Z",
        "publishedAt": "2025-12-04T03:12:33.150Z",
        "html": "<img src=\"https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily1.webp?raw=true\" alt=\"空洞騎士手繪風格的地圖，標記著各種通道與秘密房間\" style=\"width: 100%; border-radius: 12px; margin-bottom: 2rem;\" loading=\"lazy\">\r\n\r\n            <p>第一次玩《空洞騎士》的人，大概都有過這種崩潰的經驗：掉進一個深坑，四周黑漆漆的，地圖還沒買，身上帶著幾千塊吉歐，然後不知道該往左還是往右。</p>\r\n            <p>這種「迷路」的恐懼感，其實是 Team Cherry 精心設計的體驗。在傳統的遊戲裡，地圖通常是內建的。但在聖巢裡，地圖是你必須去「爭取」的資源。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">未知的恐懼與探索的獎勵</h2>\r\n            <p>你必須先找到繪圖師（那個哼著歌的可愛傢伙），花錢買下草圖，然後自己裝備羽毛筆，坐在椅子上才能更新地圖。這個繁瑣的過程，讓「地圖」本身變得無比珍貴。</p>\r\n            <p>正因為沒有導航，你被迫去觀察環境：牆上的真菌、背景的流水聲、敵人的種類。當你終於找到椅子，把剛剛探索的區域畫出來時，那種「我征服了這片未知」的成就感，是開著 GPS 走路的人永遠無法體會的。</p>\r\n\r\n            <h2 style=\"color: var(--secondary-color); margin-top: 2rem;\">非線性的敘事</h2>\r\n            <p>聖巢的結構是典型的「類銀河戰士惡魔城（Metroidvania）」。你看得見某個平台，但跳不上去。這在你心裡埋下了一個種子：「這裡有個祕密，我以後要回來。」</p>\r\n            <p>這種設計讓每個人的遊戲流程都不同。有人先去水晶山峰，有人先下深巢（勇者...）。這種自由度，讓這個衰敗的昆蟲王國顯得如此真實且龐大。它不是一條直線的遊樂園設施，而是一個活生生的世界。</p>",
        "excerpt": null,
        "date": "2025-12-01",
        "imageUrl": "https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/site3-daily1.webp?raw=true",
        "isFeatured": true
    },
    {
        "id": 601,
        "documentId": "m96ocfghlnv902i2bbca12w9",
        "title": "測試用測試用測試用",
        "slug": "2025-12-04",
        "site": "site4",
        "category": "daily",
        "createdAt": "2025-12-03T08:03:31.458Z",
        "updatedAt": "2025-12-04T03:12:33.377Z",
        "publishedAt": "2025-12-04T03:12:33.381Z",
        "html": "<p class=\"meta\">\r\n                <img src=\"../../shared-assets/site4-hero.webp\" alt=\"2025 12 03\" style=\"width:100%; border-radius:8px; margin: 20px 0;\">\r\n                \r\n                <h2>簡介</h2>\r\n                <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用。</p>\r\n                \r\n                <h2>詳細分析</h2>\r\n                <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用。</p>\r\n                \r\n                <h3>關鍵要點 1</h3>\r\n                <p>首先，請確保你已經準備好了相關的裝備與道具。</p>\r\n                \r\n                <h3>關鍵要點 2</h3>\r\n                <p>其次，觀察敵人的動作模式至關重要。</p>\r\n                \r\n                <h2>總結</h2>\r\n                <p>希望這篇關於 2025 12 03 的文章能對你的冒險有所幫助。</p>",
        "excerpt": null,
        "date": "2025-12-04",
        "imageUrl": "../../shared-assets/site4-hero.webp",
        "isFeatured": true
    },
    {
        "id": 602,
        "documentId": "f7ivatt5owkar0lak5afbm65",
        "title": "每日精選：補血道具的紅色秘密 - 攻略圖書館",
        "slug": "2025-12-03",
        "site": "site4",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.872Z",
        "updatedAt": "2025-12-04T03:12:33.550Z",
        "publishedAt": "2025-12-04T03:12:33.553Z",
        "html": "<p class=\"meta\">\r\n                <img src=\"../../shared-assets/site4-hero.webp\" alt=\"2025 12 03\" style=\"width:100%; border-radius:8px; margin: 20px 0;\">\r\n                \r\n                <h2>簡介</h2>\r\n                <p>這不僅僅是因為紅色代表血液。從色彩心理學到早期硬體限制，紅色藥水背後有一個長達 30 年的設計演變史。在這裡，我們將深入探討遊戲中的各種機制與隱藏要素。</p>\r\n                \r\n                <h2>詳細分析</h2>\r\n                <p>根據我們的測試與研究，這個主題包含了許多值得注意的細節。玩家在進行遊戲時，往往會忽略這些關鍵點。</p>\r\n                \r\n                <h3>關鍵要點 1</h3>\r\n                <p>首先，請確保你已經準備好了相關的裝備與道具。</p>\r\n                \r\n                <h3>關鍵要點 2</h3>\r\n                <p>其次，觀察敵人的動作模式至關重要。</p>\r\n                \r\n                <h2>總結</h2>\r\n                <p>希望這篇關於 2025 12 03 的文章能對你的冒險有所幫助。</p>",
        "excerpt": "這不僅僅是因為紅色代表血液。從色彩心理學到早期硬體限制...",
        "date": "2025-12-03",
        "imageUrl": "../../shared-assets/site4-hero.webp",
        "isFeatured": true
    },
    {
        "id": 603,
        "documentId": "a8vlsvqa9sccelvf6g51c90b",
        "title": "每日精選：存檔點演變史 - 攻略圖書館",
        "slug": "2025-12-02",
        "site": "site4",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.853Z",
        "updatedAt": "2025-12-04T03:12:33.720Z",
        "publishedAt": "2025-12-04T03:12:33.725Z",
        "html": "<p class=\"meta\">\r\n                <img src=\"../../shared-assets/site4-hero.webp\" alt=\"2025 12 02\" style=\"width:100%; border-radius:8px; margin: 20px 0;\">\r\n                \r\n                <h2>簡介</h2>\r\n                <p>還記得以前找步道存檔點的恐懼嗎？現代遊戲的自動存檔雖然方便，卻也少了一種「終於安全了」的如釋重負感。在這裡，我們將深入探討遊戲中的各種機制與隱藏要素。</p>\r\n                \r\n                <h2>詳細分析</h2>\r\n                <p>根據我們的測試與研究，這個主題包含了許多值得注意的細節。玩家在進行遊戲時，往往會忽略這些關鍵點。</p>\r\n                \r\n                <h3>關鍵要點 1</h3>\r\n                <p>首先，請確保你已經準備好了相關的裝備與道具。</p>\r\n                \r\n                <h3>關鍵要點 2</h3>\r\n                <p>其次，觀察敵人的動作模式至關重要。</p>\r\n                \r\n                <h2>總結</h2>\r\n                <p>希望這篇關於 2025 12 02 的文章能對你的冒險有所幫助。</p>",
        "excerpt": "還記得以前找步道存檔點的恐懼嗎？現代遊戲的自動存檔雖然方便...",
        "date": "2025-12-02",
        "imageUrl": "../../shared-assets/site4-hero.webp",
        "isFeatured": true
    },
    {
        "id": 604,
        "documentId": "cs1t6muc82dz8kfmchw0nmc6",
        "title": "每日精選：寶箱怪起源 - 攻略圖書館",
        "slug": "2025-12-01",
        "site": "site4",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.838Z",
        "updatedAt": "2025-12-04T03:12:33.912Z",
        "publishedAt": "2025-12-04T03:12:33.917Z",
        "html": "<p class=\"meta\">\r\n                <img src=\"../../shared-assets/site4-hero.webp\" alt=\"2025 12 01\" style=\"width:100%; border-radius:8px; margin: 20px 0;\">\r\n                \r\n                <h2>簡介</h2>\r\n                <p>第一次被寶箱咬死的陰影揮之不去嗎？這種惡意滿滿的怪物設計，其實源自於龍與地下城的經典設定。在這裡，我們將深入探討遊戲中的各種機制與隱藏要素。</p>\r\n                \r\n                <h2>詳細分析</h2>\r\n                <p>根據我們的測試與研究，這個主題包含了許多值得注意的細節。玩家在進行遊戲時，往往會忽略這些關鍵點。</p>\r\n                \r\n                <h3>關鍵要點 1</h3>\r\n                <p>首先，請確保你已經準備好了相關的裝備與道具。</p>\r\n                \r\n                <h3>關鍵要點 2</h3>\r\n                <p>其次，觀察敵人的動作模式至關重要。</p>\r\n                \r\n                <h2>總結</h2>\r\n                <p>希望這篇關於 2025 12 01 的文章能對你的冒險有所幫助。</p>",
        "excerpt": "一次被寶箱咬死的陰影揮之不去嗎？這種惡意滿滿的怪物設計...",
        "date": "2025-12-01",
        "imageUrl": "../../shared-assets/site4-hero.webp",
        "isFeatured": true
    },
    {
        "id": 605,
        "documentId": "dxcsqtfb1w6mc46vwngav8b8",
        "title": "測試用測試用測試用 - 手遊速報",
        "slug": "2025-12-04",
        "site": "site5",
        "category": "daily",
        "createdAt": "2025-12-03T08:03:36.606Z",
        "updatedAt": "2025-12-04T03:12:34.090Z",
        "publishedAt": "2025-12-04T03:12:34.094Z",
        "html": "<div class=\"post-header\">\r\n                \r\n                <div class=\"post-meta\">2025-12 • 編輯精選</div>\r\n            </div>\r\n            <div class=\"post-content\">\r\n                <img src=\"../../shared-assets/site5-hero.webp\" alt=\"2025 12 03\" style=\"width:100%; border-radius:12px; margin-bottom: 20px;\">\r\n                \r\n                <p class=\"lead\">測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用。</p>\r\n                \r\n                <h2>測試用理</h2>\r\n                <ul>\r\n                    <li>測試用：測試用測試用測試用</li>\r\n                    <li>測試用：測試用測試用</li>\r\n                    <li>測試用：測試用測試用測試用測試用</li>\r\n                </ul>\r\n                \r\n                <h2>詳細內容</h2>\r\n                <p>測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用測試用。</p>\r\n                \r\n                <div class=\"highlight-box\">\r\n                    <strong>小編點評：</strong> 這次的更新誠意滿滿，建議大家不要錯過！\r\n                </div>\r\n                \r\n                <p>更多詳細數據請參考下方的附表。</p>\r\n            </div>",
        "excerpt": null,
        "date": "2025-12-04",
        "imageUrl": "../../shared-assets/site5-hero.webp",
        "isFeatured": true
    },
    {
        "id": 606,
        "documentId": "pwpnhwdswgvm0u4jkwbr4ejc",
        "title": "每日精選：首儲禮包划算嗎？ - 手遊速報",
        "slug": "2025-12-03",
        "site": "site5",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.941Z",
        "updatedAt": "2025-12-04T03:12:34.275Z",
        "publishedAt": "2025-12-04T03:12:34.279Z",
        "html": "<div class=\"post-header\">\r\n                \r\n                <div class=\"post-meta\">2025-12 • 編輯精選</div>\r\n            </div>\r\n            <div class=\"post-content\">\r\n                <img src=\"../../shared-assets/site5-hero.webp\" alt=\"2025 12 03\" style=\"width:100%; border-radius:12px; margin-bottom: 20px;\">\r\n                \r\n                <p class=\"lead\">看到「限時優惠」就忍不住？拆解遊戲公司的定價心理學，告訴你哪些禮包才是真的高 CP 值。</p>\r\n                \r\n                <h2>重點整理</h2>\r\n                <ul>\r\n                    <li>重點一：活動時間與參加資格</li>\r\n                    <li>重點二：卡池機率分析</li>\r\n                    <li>重點三：CP值最高的課金禮包推薦</li>\r\n                </ul>\r\n                \r\n                <h2>詳細內容</h2>\r\n                <p>對於許多休閒玩家來說，如何有效利用碎片時間是關鍵。本篇將教你如何用最少的時間獲得最大的收益。</p>\r\n                \r\n                <div class=\"highlight-box\">\r\n                    <strong>小編點評：</strong> 這次的更新誠意滿滿，建議大家不要錯過！\r\n                </div>\r\n                \r\n                <p>更多詳細數據請參考下方的附表。</p>\r\n            </div>",
        "excerpt": null,
        "date": "2025-12-03",
        "imageUrl": "../../shared-assets/site5-hero.webp",
        "isFeatured": true
    },
    {
        "id": 607,
        "documentId": "m2bgebuhwhrg4b8fkto6gn0u",
        "title": "每日精選：體力制機制 - 手遊速報",
        "slug": "2025-12-02",
        "site": "site5",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.927Z",
        "updatedAt": "2025-12-04T03:12:34.458Z",
        "publishedAt": "2025-12-04T03:12:34.462Z",
        "html": "<div class=\"post-header\">\r\n                \r\n                <div class=\"post-meta\">2025-12 • 編輯精選</div>\r\n            </div>\r\n            <div class=\"post-content\">\r\n                <img src=\"../../shared-assets/site5-hero.webp\" alt=\"2025 12 02\" style=\"width:100%; border-radius:12px; margin-bottom: 20px;\">\r\n                \r\n                <p class=\"lead\">為什麼幾乎所有手遊都有體力限制？這不僅是為了讓你付錢回體，更是為了控制你的遊戲進度。</p>\r\n                \r\n                <h2>重點整理</h2>\r\n                <ul>\r\n                    <li>重點一：活動時間與參加資格</li>\r\n                    <li>重點二：卡池機率分析</li>\r\n                    <li>重點三：CP值最高的課金禮包推薦</li>\r\n                </ul>\r\n                \r\n                <h2>詳細內容</h2>\r\n                <p>對於許多休閒玩家來說，如何有效利用碎片時間是關鍵。本篇將教你如何用最少的時間獲得最大的收益。</p>\r\n                \r\n                <div class=\"highlight-box\">\r\n                    <strong>小編點評：</strong> 這次的更新誠意滿滿，建議大家不要錯過！\r\n                </div>\r\n                \r\n                <p>更多詳細數據請參考下方的附表。</p>\r\n            </div>",
        "excerpt": null,
        "date": "2025-12-02",
        "imageUrl": "../../shared-assets/site5-hero.webp",
        "isFeatured": true
    },
    {
        "id": 608,
        "documentId": "jnxg7zjzzmt54lsfe45avhg1",
        "title": "每日精選：玄學抽卡有用嗎？ - 手遊速報",
        "slug": "2025-12-01",
        "site": "site5",
        "category": "daily",
        "createdAt": "2025-12-01T13:26:34.916Z",
        "updatedAt": "2025-12-04T03:12:34.632Z",
        "publishedAt": "2025-12-04T03:12:34.638Z",
        "html": "<div class=\"post-header\">\r\n                \r\n                <div class=\"post-meta\">2025-12 • 編輯精選</div>\r\n            </div>\r\n            <div class=\"post-content\">\r\n                <img src=\"../../shared-assets/site5-hero.webp\" alt=\"2025 12 01\" style=\"width:100%; border-radius:12px; margin-bottom: 20px;\">\r\n                \r\n                <p class=\"lead\">半夜兩點抽？放好運來當 BGM？我們統計了上萬筆抽卡數據，來看看這些玄學到底有沒有科學根據。</p>\r\n                \r\n                <h2>重點整理</h2>\r\n                <ul>\r\n                    <li>重點一：活動時間與參加資格</li>\r\n                    <li>重點二：卡池機率分析</li>\r\n                    <li>重點三：CP值最高的課金禮包推薦</li>\r\n                </ul>\r\n                \r\n                <h2>詳細內容</h2>\r\n                <p>對於許多休閒玩家來說，如何有效利用碎片時間是關鍵。本篇將教你如何用最少的時間獲得最大的收益。</p>\r\n                \r\n                <div class=\"highlight-box\">\r\n                    <strong>小編點評：</strong> 這次的更新誠意滿滿，建議大家不要錯過！\r\n                </div>\r\n                \r\n                <p>更多詳細數據請參考下方的附表。</p>\r\n            </div>",
        "excerpt": null,
        "date": "2025-12-01",
        "imageUrl": "../../shared-assets/site5-hero.webp",
        "isFeatured": true
    }
];
    console.log(`\n📝 開始同步 ${posts.length} 篇文章...\n`);
    
    for (const post of posts) {
        try {
            const attrs = post.attributes || post;
            const payload = { data: attrs };
            
            // 檢查是否已存在
            const checkUrl = `${STRAPI_URL}/api/posts?filters[site][$eq]=${attrs.site}&filters[slug][$eq]=${attrs.slug}`;
            const checkRes = await fetch(checkUrl);
            const checkData = await checkRes.json();
            const existing = checkData.data?.[0];
            
            let result;
            if (existing) {
                // 更新
                const updateUrl = `${STRAPI_URL}/api/posts/${existing.id}`;
                result = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(`  ✅ 更新文章: ${attrs.site} - ${attrs.slug}`);
                    successCount++;
                } else {
                    console.error(`  ❌ 更新失敗: ${attrs.site} - ${attrs.slug}`);
                    failCount++;
                }
            } else {
                // 建立
                const createUrl = `${STRAPI_URL}/api/posts`;
                result = await fetch(createUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(`  ✅ 建立文章: ${attrs.site} - ${attrs.slug}`);
                    successCount++;
                } else {
                    console.error(`  ❌ 建立失敗: ${attrs.site} - ${attrs.slug}`);
                    failCount++;
                }
            }
        } catch (error) {
            console.error(`  ❌ 錯誤: ${error.message}`);
            failCount++;
        }
    }
    
    console.log(`\n📊 同步完成：成功 ${successCount}，失敗 ${failCount}`);
})();
