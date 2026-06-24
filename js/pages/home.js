/**
 * 2026 FIFA World Cup — Home Page Logic
 */

const HomePage = (() => {
  let teams = [];
  let matches = [];

  async function init() {
    try {
      const data = await DataLoader.loadAll();
      teams = data.teams;
      matches = data.matches;
      renderCountdown();
      renderTicker();
      renderTodayMatches();
      renderBulletin();
      await renderTrendingNews();
      
      // Listen for language changes to re-render
      window.addEventListener('lang-change', () => {
        renderCountdown();
        renderTicker();
        renderTodayMatches();
        renderBulletin();
        renderTrendingNews();
      });

      // Poll for live score updates every 5 minutes (GitHub Pages compatible)
      startLivePolling();
    } catch (err) {
      console.error('[HomePage] Init failed:', err);
    }
  }

  /**
   * Periodically re-fetches matches data to pick up score updates pushed by
   * the GitHub Action. Only runs when the tab is visible to avoid wasted
   * requests. GitHub Pages serves static JSON, so we force a cache-busting
   * reload via DataLoader.load('matches', true).
   */
  let pollTimer = null;
  const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  function startLivePolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const freshMatches = await DataLoader.load('matches', true);
        const newMatches = freshMatches.matches || freshMatches;
        // Only re-render if something actually changed
        if (JSON.stringify(newMatches) !== JSON.stringify(matches)) {
          matches = newMatches;
          renderTicker();
          renderTodayMatches();
          renderBulletin();
          console.log('[HomePage] Live data updated');
        }
      } catch (err) {
        console.warn('[HomePage] Live poll failed:', err);
      }
    }, POLL_INTERVAL_MS);
  }

  function renderCountdown() {
    const container = document.getElementById('heroCountdown');
    if (!container) return;

    const tournamentStart = '2026-06-11';
    const days = Helpers.daysUntil(tournamentStart);
    const suffix = typeof I18n !== 'undefined' ? I18n.t('countdown_suffix') : '后开幕';
    const daysText = typeof I18n !== 'undefined' ? I18n.t('countdown_days') : '天';

    if (days > 0) {
      container.innerHTML = `
        <div class="countdown">
          <div class="countdown-item">
            <span class="countdown-value">${days}</span>
            <span class="countdown-label">${daysText}</span>
          </div>
        </div>
        <p style="margin-top:var(--space-2);font-size:var(--text-sm);color:var(--text-tertiary)">${days} ${suffix}</p>`;
    } else if (days === 0) {
      const todayText = typeof I18n !== 'undefined' ? I18n.t('countdown_today') : '世界杯今日开幕！';
      container.innerHTML = `
        <div class="live-indicator" style="font-size:var(--text-xl)">
          <span class="live-dot"></span> ${todayText}
        </div>`;
    } else {
      const endDate = '2026-07-19';
      const daysToEnd = Helpers.daysUntil(endDate);
      if (daysToEnd >= 0) {
        const inprogressText = typeof I18n !== 'undefined' ? I18n.t('countdown_inprogress') : '世界杯进行中';
        container.innerHTML = `
          <div class="live-indicator" style="font-size:var(--text-lg)">
            <span class="live-dot"></span> ${inprogressText}
          </div>`;
      } else {
        const endedText = typeof I18n !== 'undefined' ? I18n.t('countdown_ended') : '🏆 2026世界杯已圆满结束';
        container.innerHTML = `<p style="color:var(--text-gold);font-size:var(--text-lg)">${endedText}</p>`;
      }
    }
  }

  function renderTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    // Show today's matches or next matchday
    const today = Helpers.getToday();
    let dayMatches = DataLoader.getMatchesByDate(matches, today);

    if (dayMatches.length === 0) {
      // Find next match day
      const futureDates = DataLoader.getAllDates(matches).filter(d => d >= today);
      if (futureDates.length > 0) {
        dayMatches = DataLoader.getMatchesByDate(matches, futureDates[0]);
      }
    }

    if (dayMatches.length === 0) return;

    const singleSet = dayMatches.map(m => {
      const home = DataLoader.getTeamById(teams, m.home);
      const away = DataLoader.getTeamById(teams, m.away);
      if (!home || !away) return '';

      const isLive = m.status === 'live';
      const liveClass = isLive ? 'ticker-live' : '';
      const scoreOrTime = m.home_score !== null
        ? `<span class="ticker-score">${m.home_score} - ${m.away_score}</span>`
        : `<span style="color:var(--text-tertiary);font-size:var(--text-xs)">${m.time}</span>`;

      const homeName = Helpers.getTeamName(home);
      const awayName = Helpers.getTeamName(away);

      return `
        <div class="ticker-item ${liveClass}">
          <img src="${Helpers.getFlagUrl(home.flag_code, 'w40')}" class="flag-icon flag-icon-sm" style="display:inline-block; vertical-align:middle; margin-right:4px" alt="${homeName}">
          <span style="font-weight:600">${homeName}</span>
          ${scoreOrTime}
          <span style="font-weight:600">${awayName}</span>
          <img src="${Helpers.getFlagUrl(away.flag_code, 'w40')}" class="flag-icon flag-icon-sm" style="display:inline-block; vertical-align:middle; margin-left:4px" alt="${awayName}">
          ${isLive ? '<span class="live-dot" style="margin-left:4px"></span>' : ''}
        </div>`;
    }).join('');

    // Determine repeating multiplier to ensure width exceeds screen width
    let K = 2;
    if (dayMatches.length === 1) {
      K = 20;
    } else if (dayMatches.length === 2) {
      K = 10;
    } else if (dayMatches.length === 3) {
      K = 8;
    } else if (dayMatches.length === 4) {
      K = 6;
    } else {
      K = Math.max(2, Math.ceil(20 / dayMatches.length));
    }

    let halfContent = '';
    for (let i = 0; i < K; i++) {
      halfContent += singleSet;
    }

    // Set animation duration dynamically based on item count to maintain constant speed
    const totalItemsInHalf = dayMatches.length * K;
    const duration = Math.max(20, Math.round(totalItemsInHalf * 2.5));
    track.style.animationDuration = `${duration}s`;

    // Seamless scroll content
    track.innerHTML = halfContent + halfContent;
  }

  function renderTodayMatches() {
    const container = document.getElementById('todayMatches');
    const dateLabel = document.getElementById('matchDayLabel');
    if (!container) return;

    const today = Helpers.getToday();
    let dayMatches = DataLoader.getMatchesByDate(matches, today);
    let dateStr = today;

    if (dayMatches.length === 0) {
      // Find the closest matchday (next or previous)
      const allDates = DataLoader.getAllDates(matches);
      const futureDates = allDates.filter(d => d >= today);
      const pastDates = allDates.filter(d => d < today);

      if (futureDates.length > 0) {
        dateStr = futureDates[0];
        dayMatches = DataLoader.getMatchesByDate(matches, dateStr);
      } else if (pastDates.length > 0) {
        dateStr = pastDates[pastDates.length - 1];
        dayMatches = DataLoader.getMatchesByDate(matches, dateStr);
      }
    }

    if (dateLabel) {
      const isT = Helpers.isToday(dateStr);
      let prefix;
      if (isT) {
        const todayPrefix = typeof I18n !== 'undefined' ? I18n.t('match_day') : '今日比赛';
        prefix = `<span class="live-dot" style="display:inline-block; margin-right:8px; width:8px; height:8px; background:var(--color-live); border-radius:50%"></span>${todayPrefix}`;
      } else {
        const isF = Helpers.isFuture(dateStr);
        const nextLabel = typeof I18n !== 'undefined' ? I18n.t('next_match_day') : '下一比赛日';
        const prevLabel = typeof I18n !== 'undefined' ? I18n.t('prev_match_day') : '上一比赛日';
        prefix = isF ? nextLabel : prevLabel;
      }
      dateLabel.innerHTML = `${prefix} · ${Helpers.formatDate(dateStr)}`;
    }

    if (dayMatches.length === 0) {
      const noMatchesTitle = typeof I18n !== 'undefined' ? I18n.t('no_matches_today') : '今日无比赛';
      const scheduleBtnText = typeof I18n !== 'undefined' ? I18n.t('hero_btn_schedule') : '查看完整赛程';
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">${noMatchesTitle}</div>
          <div class="empty-state-desc">${scheduleBtnText}</div>
        </div>`;
      return;
    }

    // Sort by time
    dayMatches.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    MatchCard.renderList(dayMatches, teams, container);
  }

  async function renderTrendingNews() {
    const grid = document.getElementById('trendingNewsGrid');
    if (!grid) return;

    try {
      // Load base news
      const newsData = await DataLoader.load('news');
      
      // Load user tips from localStorage
      const userTipsRaw = localStorage.getItem('wc_user_tips');
      const userTips = userTipsRaw ? JSON.parse(userTipsRaw) : [];
      
      // Merge
      const mergedList = [...userTips, ...newsData];
      
      // De-duplicate by ID
      const uniqueList = [];
      const seenIds = new Set();
      for (const item of mergedList) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueList.push(item);
        }
      }

      // Calculate total likes (base likes + localStorage offset count)
      const likedOffsetRaw = localStorage.getItem('wc_news_likes_map');
      const likedOffsetMap = likedOffsetRaw ? JSON.parse(likedOffsetRaw) : {};
      
      // Add totalLikes field to each item
      uniqueList.forEach(item => {
        const base = item.likes || 0;
        const offset = likedOffsetMap[item.id] || 0;
        item.totalLikes = base + offset;
      });

      // Sort by likes descending, then take top 3
      uniqueList.sort((a, b) => b.totalLikes - a.totalLikes);
      const topNews = uniqueList.slice(0, 3);

      if (topNews.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-secondary); text-align:center;">No news available.</p>';
        return;
      }

      const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'zh-CN';
      
      const getTranslatedText = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[lang] || obj['en'] || obj['zh-CN'] || '';
      };

      const sourceLabel = typeof I18n !== 'undefined' ? I18n.t('news_source') : '来源';

      grid.innerHTML = topNews.map(item => {
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

        return `
        <div class="news-card" onclick="window.location.href='news.html?id=${item.id}'">
          <div class="news-card-header">
            <span class="news-card-tag ${tagClass}">${tagLabel}</span>
            <span class="news-card-date">${item.date}</span>
          </div>
          <h3 class="news-card-title">${title}</h3>
          <p class="news-card-summary">${summary}</p>
          <div class="news-card-footer">
            <span class="news-card-source">${sourceLabel}: ${item.source}</span>
            <div style="display:flex; align-items:center; gap:4px; color:#EF4444; font-weight:600;">
              <span>❤️</span>
              <span>${item.totalLikes}</span>
            </div>
          </div>
        </div>`;
      }).join('');

    } catch (err) {
      console.error('[HomePage] Failed to render trending news:', err);
      grid.innerHTML = `<p style="color:var(--text-secondary); text-align:center;">Failed to load trending news.</p>`;
    }
  }

  function renderBulletin() {
    const container = document.getElementById('matchDayBulletin');
    if (!container) return;

    const today = Helpers.getToday();
    const allDates = DataLoader.getAllDates(matches);

    // Find previous match date (closest date < today that has matches)
    const pastDates = allDates.filter(d => d < today).sort((a, b) => b.localeCompare(a));
    const prevDate = pastDates.find(d => DataLoader.getMatchesByDate(matches, d).length > 0) || null;

    // Find next match date (closest date > today that has matches, to avoid duplicating today's matches)
    const futureDates = allDates.filter(d => d > today).sort((a, b) => a.localeCompare(b));
    const nextDate = futureDates.find(d => DataLoader.getMatchesByDate(matches, d).length > 0) || null;

    const tTitle = typeof I18n !== 'undefined' ? I18n.t('bulletin_title') : '比赛日公告板';
    const tDesc = typeof I18n !== 'undefined' ? I18n.t('bulletin_desc') : '上个比赛日战报 & 下个比赛日预告';
    const tPrev = typeof I18n !== 'undefined' ? I18n.t('bulletin_prev') : '上一个比赛日战报';
    const tNext = typeof I18n !== 'undefined' ? I18n.t('bulletin_next') : '下一个比赛日赛程';
    const tRest = typeof I18n !== 'undefined' ? I18n.t('bulletin_rest') : '今日休赛，球员休整中';

    let prevContentHtml = '';
    if (prevDate) {
      const prevMatches = DataLoader.getMatchesByDate(matches, prevDate);
      prevMatches.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      prevContentHtml = `
        <div class="bulletin-column">
          <div class="bulletin-col-header">
            <span class="bulletin-badge badge-prev">${tPrev}</span>
            <span class="bulletin-date">${typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? Helpers.formatDateCN(prevDate) : Helpers.formatDate(prevDate, 'short')}</span>
          </div>
          <div class="bulletin-match-list">
            ${prevMatches.map(m => {
              const home = DataLoader.getTeamById(teams, m.home);
              const away = DataLoader.getTeamById(teams, m.away);
              const homeName = Helpers.getTeamName(home);
              const awayName = Helpers.getTeamName(away);
              const score = m.home_score !== null ? `${m.home_score} - ${m.away_score}` : 'vs';
              return `
                <div class="bulletin-match-row">
                  <div class="bulletin-team home-team">
                    <span class="team-name">${homeName}</span>
                    <img src="${Helpers.getFlagUrl(home.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${homeName}">
                  </div>
                  <div class="bulletin-score">${score}</div>
                  <div class="bulletin-team away-team">
                    <img src="${Helpers.getFlagUrl(away.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${awayName}">
                    <span class="team-name">${awayName}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let nextContentHtml = '';
    if (nextDate) {
      const nextMatches = DataLoader.getMatchesByDate(matches, nextDate);
      nextMatches.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      nextContentHtml = `
        <div class="bulletin-column">
          <div class="bulletin-col-header">
            <span class="bulletin-badge badge-next">${tNext}</span>
            <span class="bulletin-date">${typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? Helpers.formatDateCN(nextDate) : Helpers.formatDate(nextDate, 'short')}</span>
          </div>
          <div class="bulletin-match-list">
            ${nextMatches.map(m => {
              const home = DataLoader.getTeamById(teams, m.home);
              const away = DataLoader.getTeamById(teams, m.away);
              const homeName = Helpers.getTeamName(home);
              const awayName = Helpers.getTeamName(away);
              return `
                <div class="bulletin-match-row">
                  <div class="bulletin-team home-team">
                    <span class="team-name">${homeName}</span>
                    <img src="${Helpers.getFlagUrl(home.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${homeName}">
                  </div>
                  <div class="bulletin-time-badge">${m.time}</div>
                  <div class="bulletin-team away-team">
                    <img src="${Helpers.getFlagUrl(away.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${awayName}">
                    <span class="team-name">${awayName}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // Check if today is a rest day (i.e. no matches today)
    const todayMatches = DataLoader.getMatchesByDate(matches, today);
    const restDayBanner = todayMatches.length === 0 ? `
      <div class="bulletin-rest-banner">
        <span class="rest-icon">📅</span>
        <span class="rest-text">${tRest}</span>
      </div>
    ` : '';

    container.innerHTML = `
      <div class="bulletin-card">
        <div class="bulletin-header">
          <h3 class="bulletin-title">${tTitle}</h3>
          <p class="bulletin-subtitle">${tDesc}</p>
        </div>
        ${restDayBanner}
        <div class="bulletin-grid">
          ${prevContentHtml}
          ${nextContentHtml}
        </div>
      </div>
    `;
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => HomePage.init());
