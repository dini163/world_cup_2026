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
      }
    },
    {
      source: "World Stadium Guide",
      type: "official",
      title: {
        "zh-CN": "开幕式表演嘉宾阵容曝光：国际巨星将联袂献唱主题歌",
        "en": "Opening Ceremony Artists Leaked: Global pop stars to debut official anthem",
        "es": "Se filtran artistas de la ceremonia inaugural: Estrellas pop cantarán el himno",
        "fr": "Artistes de la cérémonie d'ouverture révélés : Des stars de la pop chanteront l'hymne"
      },
      summary: {
        "zh-CN": "美加墨联合组委会披露了揭幕战前长达30分钟的文艺演出计划，届时三位享誉全球的歌手将现场首唱本届世界杯官方主题单曲。",
        "en": "The joint committee leaked details of the 30-minute ceremony before the kickoff match. Three global charts-topping stars will debut the official song.",
        "es": "El comité organizador filtró detalles del espectáculo de 30 minutos previo al juego inicial, donde tres estrellas mundiales cantarán el tema oficial.",
        "fr": "Le comité a révélé des détails de la cérémonie de 30 minutes avant le match d'ouverture. Trois pop-stars mondiales chanteront l'hymne officiel."
      }
    }
  ];

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

    // Modal triggers
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
        // Prepend new articles
        newArticles.forEach(item => {
          newArrivals.add(item.id);
          allNews.unshift(item);
          
          // Show toast notification for each new article
          const title = getTranslatedText(item.title);
          showToast(`🔔 ${title}`);
        });

        // Re-render feed
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
      // 1. Trigger polling immediately, then set interval
      pollNewsUpdates();
      pollingTimer = setInterval(pollNewsUpdates, 5000); // Poll news.json every 5 seconds

      // 2. Set client-side simulation interval to push updates locally (every 15s)
      simulationTimer = setInterval(simulateLiveArrival, 15000);

      const onMsg = typeof I18n !== 'undefined' ? I18n.t('news_live_stream') + ' ON' : '🔴 Live Feed Activated';
      showToast(onMsg);
    } else {
      // Clean up timers
      if (pollingTimer) clearInterval(pollingTimer);
      if (simulationTimer) clearInterval(simulationTimer);
      
      pollingTimer = null;
      simulationTimer = null;
      showToast('Live Feed Deactivated');
    }
  }

  // Simulate a live article arrival in memory
  function simulateLiveArrival() {
    // Check if there's any template in the pool that hasn't been simulated yet
    const unsimulatedTemplates = SIMULATION_POOL.filter(tpl => 
      !allNews.some(item => getTranslatedText(item.title) === getTranslatedText(tpl.title))
    );

    if (unsimulatedTemplates.length === 0) {
      // If all templates are already added, stop simulation to avoid cluttering
      clearInterval(simulationTimer);
      simulationTimer = null;
      return;
    }

    // Pick a random template
    const template = unsimulatedTemplates[Math.floor(Math.random() * unsimulatedTemplates.length)];
    const storyId = 'SIM_' + Date.now();

    const simulatedStory = {
      id: storyId,
      type: template.type,
      date: new Date().toISOString().split('T')[0],
      likes: Math.floor(80 + Math.random() * 400),
      title: template.title,
      summary: template.summary,
      source: template.source
    };

    // Prepend to array
    newArrivals.add(storyId);
    allNews.unshift(simulatedStory);

    // Re-render and toast
    renderNewsFeed();
    
    const breakingPrefix = typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? '突发新闻: ' : 'BREAKING: ';
    showToast(`🔴 ${breakingPrefix}${getTranslatedText(simulatedStory.title)}`);

    // Remove flashing effect after 3.5 seconds
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
    tips.unshift(tip); // Add to the beginning so it displays first
    localStorage.setItem(USER_TIPS_KEY, JSON.stringify(tips));
  }

  // Retrieve liked news IDs
  function getLikedIds() {
    const data = localStorage.getItem(LIKED_NEWS_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Toggle liked status in storage
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

  // Retrieve custom likes offset count
  function getLikesOffsetMap() {
    const data = localStorage.getItem(LIKES_COUNT_KEY);
    return data ? JSON.parse(data) : {};
  }

  // Increment or decrement likes in offset storage
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

  // Toggle bookmark status in storage
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

  // Multilingual text getter
  function getTranslatedText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'zh-CN';
    return obj[lang] || obj['en'] || obj['zh-CN'] || '';
  }

  function renderNewsFeed() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    // Combine preset news and user tips
    const userTips = getUserTips();
    const mergedList = [...userTips, ...allNews];

    // Remove duplicates by ID (in case user submitted a tip that shares ID or similar)
    const uniqueList = [];
    const seenIds = new Set();
    for (const item of mergedList) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueList.push(item);
      }
    }

    // Sort by date descending
    uniqueList.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      // If dates match, user-contributed or simulated first
      const aScore = (a.isUserContributed ? 2 : 0) + (a.id.startsWith('SIM_') ? 1 : 0);
      const bScore = (b.isUserContributed ? 2 : 0) + (b.id.startsWith('SIM_') ? 1 : 0);
      return bScore - aScore;
    });

    // Apply Filters
    const likedIds = getLikedIds();
    const bookmarkedIds = getBookmarkedIds();
    const likesOffsetMap = getLikesOffsetMap();

    const filtered = uniqueList.filter(item => {
      // 1. Type tab filter
      if (activeType !== 'all') {
        if (activeType === 'official' && item.type !== 'official') return false;
        if (activeType === 'gossip' && item.type !== 'gossip') return false;
      }

      // 2. Bookmark filter
      if (showBookmarksOnly && !bookmarkedIds.includes(item.id)) return false;

      // 3. Search query filter
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

    // Handle Empty State
    if (filtered.length === 0) {
      const noResultsLabel = typeof I18n !== 'undefined' ? I18n.t('news_no_results') : '没有找到匹配的新闻';
      newsGrid.innerHTML = `
      <div class="news-empty-state">
        <p>${noResultsLabel}</p>
        <span>🔍 Try changing your search query or reset filters.</span>
      </div>`;
      return;
    }

    // Render Cards
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

      const likesLabel = typeof I18n !== 'undefined' ? I18n.t('news_likes') : '赞';
      const sourceLabel = typeof I18n !== 'undefined' ? I18n.t('news_source') : '来源';

      return `
      <div class="news-card ${isNew ? 'new-arrival' : ''}" data-id="${item.id}">
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

  function handleLikeClick(id) {
    const isAdded = toggleLikedInStorage(id);
    const offsetChange = isAdded ? 1 : -1;
    updateLikesOffset(id, offsetChange);
    
    // Animate target card like action locally to avoid full re-render
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
    
    // Animate target card bookmark action locally
    const cardEl = document.querySelector(`.news-card[data-id="${id}"]`);
    if (cardEl) {
      const bookmarkBtn = cardEl.querySelector('.bookmark-btn');
      if (bookmarkBtn) {
        bookmarkBtn.classList.toggle('active', isAdded);
        bookmarkBtn.querySelector('span').textContent = isAdded ? '★' : '☆';
      }
    }

    // If bookmark filter is active, full refresh is needed to remove unstarred item
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

    // Create tip object
    const newTip = {
      id: 'USER_' + Date.now(),
      type: type,
      isUserContributed: true,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      title: title,
      summary: content,
      source: author
    };

    // Save and reset
    saveUserTip(newTip);
    
    // Close modal
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    if (tipForm) {
      tipForm.reset();
    }

    // Show Success Toast
    const toastMsg = typeof I18n !== 'undefined' ? I18n.t('news_success_toast') : '爆料提交成功！已加入您的新闻列表。';
    showToast(toastMsg);

    // Prepend to feed with new flash styling
    newArrivals.add(newTip.id);
    
    // Re-render feed
    renderNewsFeed();

    // Clear flash
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

    // Auto-remove toast
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  return {
    init,
    handleLikeClick,
    handleBookmarkClick,
    pollNewsUpdates
  };
})();

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  // Ensure global App init loads components first
  setTimeout(() => {
    NewsPage.init();
  }, 50);
});
