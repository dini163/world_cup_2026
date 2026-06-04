/**
 * 2026 FIFA World Cup — News Page Controller
 */

const NewsPage = (() => {
  let allNews = [];
  let activeType = 'all';
  let searchQuery = '';
  let showBookmarksOnly = false;
  let isLiveStreamActive = false;

  // Timers
  let pollingTimer = null;
  let simulationTimer = null;
  let isPolling = false;
  const newArrivals = new Set(); // Stores IDs of newly arrived news to apply flash styles

  // LocalStorage keys
  const USER_TIPS_KEY = 'wc_user_tips';
  const LIKED_NEWS_KEY = 'wc_news_liked_ids';
  const BOOKMARKED_NEWS_KEY = 'wc_news_bookmarked_ids';
  const LIKES_COUNT_KEY = 'wc_news_likes_map';

  // Live Stream Simulation Pool
  const SIMULATION_POOL = [
    {
      source: "L'Equipe",
      type: "official",
      title: {
        "zh-CN": "最新消息：姆巴佩已恢复全队合练，首发概率增至90%",
        "en": "Breaking: Mbappe returns to full training, start probability rises to 90%",
        "es": "Última Hora: Mbappé entrena al 100%, titularidad al 90%",
        "fr": "Dernière Minute : Mbappé de retour à l'entraînement collectif, 90% de chances de débuter"
      },
      summary: {
        "zh-CN": "法国队前锋姆巴佩今天顺利参与了全部战术演练，主教练表示其脚踝伤势恢复良好，有望首发打满全场。",
        "en": "France forward Kylian Mbappe fully participated in team tactics today. The coach confirmed his ankle recovery is on track for a full start.",
        "es": "El atacante francés Kylian Mbappé completó la sesión táctica. El DT confirmó que su tobillo está recuperado para iniciar el duelo.",
        "fr": "L'attaquant français Kylian Mbappé a participé à toute la séance tactique. Le sélectionneur a terminé son aptitude à débuter le match."
      },
      content: {
        "zh-CN": "法国队前锋姆巴佩今天顺利参与了全部战术演练，主教练表示其脚踝伤势恢复良好，有望首发打满全场。\n\n在早些时候的小组赛首秀中，姆巴佩曾因轻微扭伤被换下，引发法国球迷广泛关注。在经过三天密集的理疗后，今天的公开对抗训练显示他状态优异，在中前场的跑位和突破极具威胁。\n\n“姆巴佩是不可替代的，我们很高兴能迎来他的全面复出，”法国队助理教练在接受本报专访时表示。",
        "en": "France forward Kylian Mbappe fully participated in team tactics today. The coach confirmed his ankle recovery is on track for a full start.\n\nMbappe was subbed off during the opening group match due to a minor sprain, sparking concern among French fans. Following three days of intensive physiotherapy, today's training demonstrated he is back to full fitness.\n\n'Mbappe is irreplaceable, and we are thrilled to have him back at 100%,' the assistant manager confirmed.",
        "es": "El atacante francés Kylian Mbappé completó la sesión táctica. El DT confirmó que su tobillo está recuperado para iniciar el duelo.\n\nMbappé abandonó el juego anterior por una torcedura menor de tobillo. Tras tres días de intensa fisioterapia, la práctica de hoy evidenció su excelente condición física.\n\n'Kylian es irremplazable, nos alegra tenerlo de vuelta al 100%', comentó el entrenador asistente.",
        "fr": "L'attaquant français Kylian Mbappé a participé à toute la séance tactique. Le sélectionneur a terminé son aptitude à débuter le match.\n\nSorti sur blessure lors du premier match de poule suite à une entorse mineure, le buteur a suivi trois jours de soins intenses. La séance du jour montre qu'il a retrouvé toute sa vivacité.\n\n'Kylian est indispensable et nous sommes ravis de le retrouver au top', a déclaré l'entraîneur adjoint."
      }
    },
    {
      source: "La Gazzetta",
      type: "gossip",
      title: {
        "zh-CN": "爆料：神秘中东财团意图以天价合约签约阿根廷新星",
        "en": "Leak: Middle East investors plan astronomical bid for Argentina talent",
        "es": "Cotilleo: Inversores de Medio Oriente planean oferta astronómica por la joya argentina",
        "fr": "Info : Des investisseurs du Moyen-Orient préparent une offre record pour la pépite argentine"
      },
      summary: {
        "zh-CN": "一份来自多哈的超级报价正在酝酿，准备开出五年2.5亿欧元的天价合同，以期在世界杯后立刻将这位中场新核收入麾下。",
        "en": "An astronomical contract offer is being prepared in Doha, offering 250M euros over five years to sign the midfield playmaker after the World Cup.",
        "es": "Se prepara una oferta de contrato de 250 millones de euros desde Doha por cinco temporadas para fichar al mediocampista tras la Copa del Mundo.",
        "fr": "Un contrat record de 250 millions d'euros sur cinq ans se prépare à Doha pour s'attacher les services du milieu de terrain après le Mondial."
      },
      content: {
        "zh-CN": "一份来自多哈的超级报价正在酝酿，准备开出五年2.5亿欧元的天价合同，以期在世界杯后立刻将这位中场新核收入麾下。\n\n这名年轻中场在小组赛两轮过后送出了3次助攻和1次进球，是阿根廷中前场的绝对节拍器。虽然有传言称球员目前在马德里过得很开心，但这份无法拒绝的报价依然引发了其经纪团队的密切接洽。\n\n有专家分析，如果这笔巨额交易在世界杯后达成，它将直接打破全球中场球员的最高转会费纪录。",
        "en": "An astronomical contract offer is being prepared in Doha, offering 250M euros over five years to sign the midfield playmaker after the World Cup.\n\nThe young midfielder has put up a spectacular display with 3 assists and 1 goal in the first two group fixtures. While rumors suggest the player is happy in Madrid, the financial weight of this bid has forced his agents to the negotiating table.\n\nTactical analysts point out that if completed, this record deal would shatter the world-record transfer fee for a midfielder.",
        "es": "Se prepara una oferta de contrato de 250 millones de euros desde Doha por cinco temporadas para fichar al mediocampista tras la Copa del Mundo.\n\nLa joya albiceleste brilla en el torneo con 3 asistencias y 1 gol en la fase de grupos. Pese a rumores sobre su comodidad en Madrid, las cifras de la oferta han llevado a su agente a iniciar conversaciones.\n\nAnalistas señalan que de concretarse, esta transferencia rompería todos los récords históricos de su posición.",
        "fr": "Un contrat record de 250 millions d'euros sur cinq ans se prépare à Doha pour s'attacher les services du milieu de terrain après le Mondial.\n\nLe prodige argentin impressionne avec 3 passes décisives et 1 but en phase de poules. Malgré des rumeurs de satisfaction à Madrid, l'offre colossale a forcé son agent à ouvrir les négociations.\n\nSelon plusieurs experts, ce transfert exceptionnel briserait le record du monde pour un milieu de terrain."
      }
    },
    {
      source: "Estadio Diario",
      type: "gossip",
      title: {
        "zh-CN": "传闻：墨西哥队秘密演练高空轰炸，揭幕战意在空中突击",
        "en": "Rumor: Mexico secretly drills aerial crossing to counter South Africa in opener",
        "es": "Rumor: México entrena juego aéreo en secreto para contrarrestar a Sudáfrica",
        "fr": "Rumeur : Le Mexique prépare des centres en secret pour surprendre l'Afrique du Sud"
      },
      summary: {
        "zh-CN": "根据基地附近的知情人员爆料，墨西哥主帅秘密召开了越位和高空球战术会，意在利用身高优势突破南非的空中防线。",
        "en": "Insiders close to the training ground report that the Mexico coach is focusing heavily on high crosses and set-pieces to exploit South Africa's defense.",
        "es": "Fuentes cercanas al campamento informan que el técnico mexicano ensaya centros y balón parado para explotar las debilidades defensivas de Sudáfrica.",
        "fr": "Des sources proches du camp révèlent que le coach mexicain insiste sur les centres et ballons arrêtés pour surprendre la défense sud-africaine."
      },
      content: {
        "zh-CN": "根据基地附近的知情人员爆料，墨西哥主帅秘密召开了越位和高空球战术会，意在利用身高优势突破南非的空中防线。\n\n墨西哥队在开幕战上面临极大的出线舆论压力，主帅希望通过边路快速下底、传中落点打击对手防区的结合部。助理教练在训练场边放置了多个特定落点的标靶，并安排了数名身材魁梧的前锋进行反复抢点冲顶测试。\n\n“南非的空中争顶效率稍有欠缺，这就是我们要强攻的地方，”一名随队球探透露。",
        "en": "Insiders close to the training ground report that the Mexico coach is focusing heavily on high crosses and set-pieces to exploit South Africa's defense.\n\nUnder pressure to perform on opening day, the coaching staff is designing routes targeting South Africa's central center-backs. Precision targets were set up for crosses today, with tall forwards rehearsing repetitive header drills.\n\n'South Africa has struggled slightly with aerial duels, and that is exactly where we intend to put pressure,' a team analyst confirmed.",
        "es": "Fuentes cercanas al campamento informan que el técnico mexicano ensaya centros y balón parado para explotar las debilidades defensivas de Sudáfrica.\n\nCon alta presión para ganar el partido de apertura, el staff técnico del tri entrena jugadas para dañar la zaga central. El delantero titular ensayó remates de cabeza con centros de precisión.\n\n'Sudáfrica ha mostrado dificultades en duelos aéreos, y ahí es donde buscaremos hacer daño', apuntó un analista táctico.",
        "fr": "Des sources proches du camp révèlent que le coach mexicain insiste sur les centres et ballons arrêtés pour surprendre la défense sud-africaine.\n\nSous pression pour le match d'ouverture, l'équipe technique mexicaine prépare des plans pour transpercer l'axe adverse. L'attaquant vedette a multiplié les têtes sur des centres précis.\n\n'L'Afrique du Sud a connu des difficultés dans les airs, et c'est exactement là que nous allons appuyer', a rapporté un analyste."
      }
    }
  ];

  // Mock comments database based on active language
  const MOCK_COMMENTS_POOL = {
    'zh-CN': [
      { author: "球场老顽童", time: "2小时前", text: "这届比赛准备得真充分，期待揭幕战打响！" },
      { author: "理性看球", time: "4小时前", text: "希望能多有一些官方报道，少一些捕风捉影的花边谣言。" },
      { author: "世界杯常驻球迷", time: "6小时前", text: "阿兹特克球场是足坛圣地，能在这里踢球真是荣幸。" },
      { author: "战术板分析师", time: "10小时前", text: "高海拔确实是个大问题，体能出色的球队这届占优势。" },
      { author: "梅西的小迷妹", time: "12小时前", text: "球王最后一舞的战靴太漂亮了，我已经预定了一双！" },
      { author: "超级懂球帝", time: "15小时前", text: "这篇分析很到位，给作者点个赞！" }
    ],
    'en': [
      { author: "PitchWatcher", time: "2h ago", text: "Estadio Azteca is a legendary place. Can't wait for the opening match!" },
      { author: "TacticsExpert", time: "4h ago", text: "The travel schedule seems brutal. Recovery will define the champion." },
      { author: "FanaticMessi", time: "6h ago", text: "Those golden boots are beautiful, a true piece of history." },
      { author: "FairPlayOnly", time: "8h ago", text: "The new automated offside tech will make the game much fairer." },
      { author: "SoccerGeek", time: "11h ago", text: "A very detailed writeup, appreciate the solid information." }
    ],
    'es': [
      { author: "Goleador9", time: "Hace 2h", text: "¡El Azteca es un templo del fútbol mundial! Orgullo mexicano." },
      { author: "AnalistaTactico", time: "Hace 5h", text: "Las distancias de viaje serán clave en el rendimiento físico." },
      { author: "LeoLeyenda", time: "Hace 8h", text: "Esas botas doradas son una locura, las quiero ya." },
      { author: "Futbolero", time: "Hace 12h", text: "Excelente cobertura, sigan subiendo estas primicias." }
    ],
    'fr': [
      { author: "SupporterBleu", time: "Il y a 3h", text: "Hâte de voir Mbappé et les Bleus débuter au Mexique !" },
      { author: "FootDroit", time: "Il y a 6h", text: "La technologie de hors-jeu a l'air très efficace." },
      { author: "StadeFan", time: "Il y a 9h", text: "L'altitude de Mexico va faire très mal aux jambes." },
      { author: "ChroniqueurFoot", time: "Il y a 13h", text: "Article très complet et bien rédigé. Merci !" }
    ]
  };

  async function init() {
    // 1. Load prepopulated news
    try {
      const data = await DataLoader.load('news');
      allNews = data || [];
    } catch (e) {
      console.error('Failed to load news data:', e);
      allNews = [];
    }

    // 2. Bind event listeners
    bindEvents();

    // 3. Render feed
    renderNewsFeed();

    // 4. Check URL parameters for deep links
    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('id');
    if (newsId) {
      setTimeout(() => {
        openNewsDetail(newsId);
      }, 100);
    }
  }

  function bindEvents() {
    // Category tabs
    const tabButtons = document.querySelectorAll('#newsTypeSelector .tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeType = e.target.getAttribute('data-type');
        renderNewsFeed();
      });
    });

    // Bookmarks checkbox filter
    const bookmarkFilter = document.getElementById('bookmarkFilter');
    if (bookmarkFilter) {
      bookmarkFilter.addEventListener('change', (e) => {
        showBookmarksOnly = e.target.checked;
        renderNewsFeed();
      });
    }

    // Live Stream checkbox toggle
    const liveStreamToggle = document.getElementById('liveStreamToggle');
    if (liveStreamToggle) {
      liveStreamToggle.addEventListener('change', (e) => {
        isLiveStreamActive = e.target.checked;
        toggleLiveStream(isLiveStreamActive);
      });
    }

    // Search input
    const searchInput = document.getElementById('newsSearch');
    if (searchInput) {
      searchInput.addEventListener('input', Helpers.debounce((e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderNewsFeed();
      }, 250));
    }

    // Tip Modal triggers
    const openModalBtn = document.getElementById('openTipModalBtn');
    const closeModalBtn = document.getElementById('closeTipModalBtn');
    const modalOverlay = document.getElementById('tipModalOverlay');
    const tipForm = document.getElementById('tipForm');

    if (openModalBtn && modalOverlay) {
      openModalBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeModalBtn && modalOverlay) {
      closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        tipForm.reset();
      });
    }

    // Detail Modal Close
    const closeDetailBtn = document.getElementById('closeDetailModalBtn');
    const detailOverlay = document.getElementById('newsDetailOverlay');
    if (closeDetailBtn && detailOverlay) {
      closeDetailBtn.addEventListener('click', () => {
        detailOverlay.classList.remove('active');
        document.body.style.overflow = '';
      });
      
      // Close on clicking overlay background
      detailOverlay.addEventListener('click', (e) => {
        if (e.target === detailOverlay) {
          detailOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Submit rumor tip
    if (tipForm) {
      tipForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitUserTip();
      });
    }

    // Listen to global language change
    window.addEventListener('lang-change', () => {
      renderNewsFeed();
      // If detail modal is open, re-render its text too
      const detailOverlay = document.getElementById('newsDetailOverlay');
      if (detailOverlay && detailOverlay.classList.contains('active')) {
        const id = detailOverlay.getAttribute('data-active-id');
        if (id) openNewsDetail(id);
      }
    });
  }

  // Polling Server for new updates
  async function pollNewsUpdates() {
    if (isPolling) return;
    isPolling = true;
    try {
      const freshNews = await DataLoader.load('news', true); // forceReload = true to bypass cache
      const newArticles = freshNews.filter(freshItem => !allNews.some(oldItem => oldItem.id === freshItem.id));
      
      if (newArticles.length > 0) {
        newArticles.forEach(item => {
          newArrivals.add(item.id);
          allNews.unshift(item);
          
          const title = getTranslatedText(item.title);
          showToast(`🔔 ${title}`);
        });

        renderNewsFeed();

        // Clear highlight classes after 3.5 seconds
        setTimeout(() => {
          newArticles.forEach(item => newArrivals.delete(item.id));
          renderNewsFeed();
        }, 3500);
      }
    } catch (e) {
      console.warn('[News Polling] Failed to fetch news updates:', e);
    } finally {
      isPolling = false;
    }
  }

  // Toggle Live updates
  function toggleLiveStream(enabled) {
    if (enabled) {
      pollNewsUpdates();
      pollingTimer = setInterval(pollNewsUpdates, 5000);
      simulationTimer = setInterval(simulateLiveArrival, 15000);

      const onMsg = typeof I18n !== 'undefined' ? I18n.t('news_live_stream') + ' ON' : '🔴 Live Feed Activated';
      showToast(onMsg);
    } else {
      if (pollingTimer) clearInterval(pollingTimer);
      if (simulationTimer) clearInterval(simulationTimer);
      
      pollingTimer = null;
      simulationTimer = null;
      showToast('Live Feed Deactivated');
    }
  }

  // Simulate a live article arrival in memory
  function simulateLiveArrival() {
    const unsimulatedTemplates = SIMULATION_POOL.filter(tpl => 
      !allNews.some(item => getTranslatedText(item.title) === getTranslatedText(tpl.title))
    );

    if (unsimulatedTemplates.length === 0) {
      clearInterval(simulationTimer);
      simulationTimer = null;
      return;
    }

    const template = unsimulatedTemplates[Math.floor(Math.random() * unsimulatedTemplates.length)];
    const storyId = 'SIM_' + Date.now();

    const simulatedStory = {
      id: storyId,
      type: template.type,
      date: new Date().toISOString().split('T')[0],
      likes: Math.floor(80 + Math.random() * 400),
      title: template.title,
      summary: template.summary,
      content: template.content || template.summary,
      source: template.source
    };

    newArrivals.add(storyId);
    allNews.unshift(simulatedStory);

    renderNewsFeed();
    
    const breakingPrefix = typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? '突发新闻: ' : 'BREAKING: ';
    showToast(`🔴 ${breakingPrefix}${getTranslatedText(simulatedStory.title)}`);

    setTimeout(() => {
      newArrivals.delete(storyId);
      renderNewsFeed();
    }, 3500);
  }

  // Retrieve user contributed tips from localStorage
  function getUserTips() {
    const data = localStorage.getItem(USER_TIPS_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Save a new user tip
  function saveUserTip(tip) {
    const tips = getUserTips();
    tips.unshift(tip);
    localStorage.setItem(USER_TIPS_KEY, JSON.stringify(tips));
  }

  // Retrieve liked news IDs
  function getLikedIds() {
    const data = localStorage.getItem(LIKED_NEWS_KEY);
    return data ? JSON.parse(data) : [];
  }

  function toggleLikedInStorage(id) {
    const liked = getLikedIds();
    const index = liked.indexOf(id);
    let added = false;
    if (index === -1) {
      liked.push(id);
      added = true;
    } else {
      liked.splice(index, 1);
    }
    localStorage.setItem(LIKED_NEWS_KEY, JSON.stringify(liked));
    return added;
  }

  function getLikesOffsetMap() {
    const data = localStorage.getItem(LIKES_COUNT_KEY);
    return data ? JSON.parse(data) : {};
  }

  function updateLikesOffset(id, amount) {
    const map = getLikesOffsetMap();
    map[id] = (map[id] || 0) + amount;
    localStorage.setItem(LIKES_COUNT_KEY, JSON.stringify(map));
  }

  // Retrieve bookmarked news IDs
  function getBookmarkedIds() {
    const data = localStorage.getItem(BOOKMARKED_NEWS_KEY);
    return data ? JSON.parse(data) : [];
  }

  function toggleBookmarkedInStorage(id) {
    const bookmarked = getBookmarkedIds();
    const index = bookmarked.indexOf(id);
    let added = false;
    if (index === -1) {
      bookmarked.push(id);
      added = true;
    } else {
      bookmarked.splice(index, 1);
    }
    localStorage.setItem(BOOKMARKED_NEWS_KEY, JSON.stringify(bookmarked));
    return added;
  }

  function getTranslatedText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'zh-CN';
    return obj[lang] || obj['en'] || obj['zh-CN'] || '';
  }

  function renderNewsFeed() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    const userTips = getUserTips();
    const mergedList = [...userTips, ...allNews];

    const uniqueList = [];
    const seenIds = new Set();
    for (const item of mergedList) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueList.push(item);
      }
    }

    uniqueList.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      const aScore = (a.isUserContributed ? 2 : 0) + (a.id.startsWith('SIM_') ? 1 : 0);
      const bScore = (b.isUserContributed ? 2 : 0) + (b.id.startsWith('SIM_') ? 1 : 0);
      return bScore - aScore;
    });

    const likedIds = getLikedIds();
    const bookmarkedIds = getBookmarkedIds();
    const likesOffsetMap = getLikesOffsetMap();

    const filtered = uniqueList.filter(item => {
      if (activeType !== 'all') {
        if (activeType === 'official' && item.type !== 'official') return false;
        if (activeType === 'gossip' && item.type !== 'gossip') return false;
      }
      if (showBookmarksOnly && !bookmarkedIds.includes(item.id)) return false;
      if (searchQuery) {
        const title = getTranslatedText(item.title).toLowerCase();
        const summary = getTranslatedText(item.summary).toLowerCase();
        const source = (item.source || '').toLowerCase();
        
        if (!title.includes(searchQuery) && 
            !summary.includes(searchQuery) && 
            !source.includes(searchQuery)) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      const noResultsLabel = typeof I18n !== 'undefined' ? I18n.t('news_no_results') : '没有找到匹配的新闻';
      newsGrid.innerHTML = `
      <div class="news-empty-state">
        <p>${noResultsLabel}</p>
        <span>🔍 Try changing your search query or reset filters.</span>
      </div>`;
      return;
    }

    newsGrid.innerHTML = filtered.map(item => {
      const isLiked = likedIds.includes(item.id);
      const isBookmarked = bookmarkedIds.includes(item.id);
      const isNew = newArrivals.has(item.id);
      
      const baseLikes = item.likes || 0;
      const offset = likesOffsetMap[item.id] || 0;
      const totalLikes = baseLikes + offset;

      const title = getTranslatedText(item.title);
      const summary = getTranslatedText(item.summary);
      
      let tagClass = 'tag-gossip';
      let tagLabel = typeof I18n !== 'undefined' ? I18n.t('news_tag_gossip') : '花边传闻';

      if (item.isUserContributed) {
        tagClass = 'tag-user';
        tagLabel = typeof I18n !== 'undefined' ? I18n.t('news_tag_user') : '球迷投递';
      } else if (item.type === 'official') {
        tagClass = 'tag-official';
        tagLabel = typeof I18n !== 'undefined' ? I18n.t('news_tag_official') : '官方报道';
      }

      const sourceLabel = typeof I18n !== 'undefined' ? I18n.t('news_source') : '来源';

      return `
      <div class="news-card ${isNew ? 'new-arrival' : ''}" data-id="${item.id}" onclick="NewsPage.handleCardClick(event, '${item.id}')">
        <div class="news-card-header">
          <span class="news-card-tag ${tagClass}">${tagLabel}</span>
          <span class="news-card-date">${item.date}</span>
        </div>
        <h3 class="news-card-title">${title}</h3>
        <p class="news-card-summary">${summary}</p>
        <div class="news-card-footer">
          <span class="news-card-source">${sourceLabel}: ${item.source}</span>
          <div class="news-card-actions">
            <button class="news-action-btn like-btn ${isLiked ? 'active' : ''}" onclick="NewsPage.handleLikeClick('${item.id}')">
              <span>${isLiked ? '❤️' : '🤍'}</span>
              <span class="like-count">${totalLikes}</span>
            </button>
            <button class="news-action-btn bookmark-btn ${isBookmarked ? 'active' : ''}" onclick="NewsPage.handleBookmarkClick('${item.id}')">
              <span>${isBookmarked ? '★' : '☆'}</span>
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function handleCardClick(e, id) {
    // If the click is on a like/bookmark action button, prevent opening the details
    if (e.target.closest('.news-action-btn')) return;
    openNewsDetail(id);
  }

  function openNewsDetail(id) {
    const userTips = getUserTips();
    const mergedList = [...userTips, ...allNews];
    const item = mergedList.find(n => n.id === id);
    if (!item) return;

    const modal = document.getElementById('newsDetailOverlay');
    const titleEl = document.getElementById('detailTitle');
    const tagEl = document.getElementById('detailTag');
    const dateEl = document.getElementById('detailDate');
    const sourceEl = document.getElementById('detailSource');
    const contentEl = document.getElementById('detailContent');
    const commentsEl = document.getElementById('detailComments');

    if (!modal || !titleEl || !tagEl || !dateEl || !sourceEl || !contentEl || !commentsEl) return;

    // Set attributes for translation syncing
    modal.setAttribute('data-active-id', id);

    // Populate data
    titleEl.textContent = getTranslatedText(item.title);
    dateEl.textContent = item.date;
    sourceEl.textContent = `${typeof I18n !== 'undefined' ? I18n.t('news_source') : '来源'}: ${item.source}`;
    
    // Display detailed content, fallback to summary if content isn't present
    contentEl.textContent = getTranslatedText(item.content || item.summary);

    // Style tag
    tagEl.className = 'news-card-tag';
    if (item.isUserContributed) {
      tagEl.classList.add('tag-user');
      tagEl.textContent = typeof I18n !== 'undefined' ? I18n.t('news_tag_user') : '球迷投递';
    } else if (item.type === 'official') {
      tagEl.classList.add('tag-official');
      tagEl.textContent = typeof I18n !== 'undefined' ? I18n.t('news_tag_official') : '官方报道';
    } else {
      tagEl.classList.add('tag-gossip');
      tagEl.textContent = typeof I18n !== 'undefined' ? I18n.t('news_tag_gossip') : '花边传闻';
    }

    // Populate Dynamic Comments
    const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'zh-CN';
    const commentsPool = MOCK_COMMENTS_POOL[lang] || MOCK_COMMENTS_POOL['en'];
    
    // Pick 3 deterministic comments based on news ID hash, so comments stay constant for the same news
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const selectedComments = [];
    const poolSize = commentsPool.length;
    for (let i = 0; i < 3; i++) {
      const idx = (hash + i * 3) % poolSize;
      selectedComments.push(commentsPool[idx]);
    }

    commentsEl.innerHTML = selectedComments.map(c => `
      <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:var(--space-3); font-size:0.9rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-weight:600; font-size:0.82rem;">
          <span style="color:var(--text-main);">${c.author}</span>
          <span style="color:var(--text-muted); font-weight:400;">${c.time}</span>
        </div>
        <p style="color:var(--text-secondary); margin:0; line-height:1.4;">${c.text}</p>
      </div>
    `).join('');

    // Open Modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function handleLikeClick(id) {
    const isAdded = toggleLikedInStorage(id);
    const offsetChange = isAdded ? 1 : -1;
    updateLikesOffset(id, offsetChange);
    
    const cardEl = document.querySelector(`.news-card[data-id="${id}"]`);
    if (cardEl) {
      const likeBtn = cardEl.querySelector('.like-btn');
      const countEl = cardEl.querySelector('.like-count');
      if (likeBtn && countEl) {
        likeBtn.classList.toggle('active', isAdded);
        likeBtn.querySelector('span').textContent = isAdded ? '❤️' : '🤍';
        countEl.textContent = parseInt(countEl.textContent) + offsetChange;
      }
    }
  }

  function handleBookmarkClick(id) {
    const isAdded = toggleBookmarkedInStorage(id);
    
    const cardEl = document.querySelector(`.news-card[data-id="${id}"]`);
    if (cardEl) {
      const bookmarkBtn = cardEl.querySelector('.bookmark-btn');
      if (bookmarkBtn) {
        bookmarkBtn.classList.toggle('active', isAdded);
        bookmarkBtn.querySelector('span').textContent = isAdded ? '★' : '☆';
      }
    }

    if (showBookmarksOnly) {
      renderNewsFeed();
    }
  }

  function submitUserTip() {
    const titleEl = document.getElementById('tipTitle');
    const contentEl = document.getElementById('tipContent');
    const authorEl = document.getElementById('tipAuthor');
    const typeEl = document.getElementById('tipType');
    const modalOverlay = document.getElementById('tipModalOverlay');
    const tipForm = document.getElementById('tipForm');

    if (!titleEl || !contentEl || !authorEl || !typeEl) return;

    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    const author = authorEl.value.trim();
    const type = typeEl.value;

    if (!title || !content || !author) return;

    const newTip = {
      id: 'USER_' + Date.now(),
      type: type,
      isUserContributed: true,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      title: title,
      summary: content.length > 80 ? content.substring(0, 80) + '...' : content,
      content: content,
      source: author
    };

    saveUserTip(newTip);
    
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    if (tipForm) {
      tipForm.reset();
    }

    const toastMsg = typeof I18n !== 'undefined' ? I18n.t('news_success_toast') : '爆料提交成功！已加入您的新闻列表。';
    showToast(toastMsg);

    newArrivals.add(newTip.id);
    renderNewsFeed();

    setTimeout(() => {
      newArrivals.delete(newTip.id);
      renderNewsFeed();
    }, 3500);
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>📢</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  return {
    init,
    handleCardClick,
    handleLikeClick,
    handleBookmarkClick,
    pollNewsUpdates
  };
})();

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    NewsPage.init();
  }, 50);
});
