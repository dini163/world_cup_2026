/**
 * 2026 FIFA World Cup — Schedule Page Logic
 */

const SchedulePage = (() => {
  let teams = [];
  let matches = [];
  let allDates = [];
  let currentDateIndex = 0;
  let viewMode = 'date'; // 'date', 'group', 'stage'

  async function init() {
    try {
      const data = await DataLoader.loadAll();
      teams = data.teams;
      matches = data.matches;
      allDates = DataLoader.getAllDates(matches);

      // Default to today or first match day
      const today = Helpers.getToday();
      const idx = allDates.findIndex(d => d >= today);
      currentDateIndex = idx >= 0 ? idx : 0;

      renderViewToggle();
      renderContent();

      // Listen for language changes to re-render
      window.addEventListener('lang-change', () => {
        renderViewToggle();
        renderContent();
      });
    } catch (err) {
      console.error('[SchedulePage] Init failed:', err);
    }
  }

  function renderViewToggle() {
    const container = document.getElementById('viewToggle');
    if (!container) return;

    const tDate = typeof I18n !== 'undefined' ? I18n.t('view_by_date') : '按日期';
    const tGroup = typeof I18n !== 'undefined' ? I18n.t('view_by_group') : '按小组';
    const tStage = typeof I18n !== 'undefined' ? I18n.t('view_by_stage') : '按阶段';

    container.innerHTML = `
      <div class="tab-bar">
        <button class="tab ${viewMode === 'date' ? 'active' : ''}" onclick="SchedulePage.setView('date')">📅 ${tDate}</button>
        <button class="tab ${viewMode === 'group' ? 'active' : ''}" onclick="SchedulePage.setView('group')">🏷️ ${tGroup}</button>
        <button class="tab ${viewMode === 'stage' ? 'active' : ''}" onclick="SchedulePage.setView('stage')">🏆 ${tStage}</button>
      </div>`;
  }

  function setView(mode) {
    viewMode = mode;
    renderViewToggle();
    renderContent();
  }

  function renderContent() {
    switch (viewMode) {
      case 'date': renderByDate(); break;
      case 'group': renderByGroup(); break;
      case 'stage': renderByStage(); break;
    }
  }

  function renderByDate() {
    const navContainer = document.getElementById('dateNav');
    const contentContainer = document.getElementById('scheduleContent');
    if (!contentContainer) return;

    const date = allDates[currentDateIndex];
    const dayMatches = DataLoader.getMatchesByDate(matches, date);

    if (navContainer) {
      navContainer.innerHTML = `
        <div class="date-nav">
          <button class="date-nav-btn" onclick="SchedulePage.prevDate()" ${currentDateIndex === 0 ? 'disabled' : ''}>◀</button>
          <div class="date-nav-current">${Helpers.formatDate(date)}</div>
          <button class="date-nav-btn" onclick="SchedulePage.nextDate()" ${currentDateIndex >= allDates.length - 1 ? 'disabled' : ''}>▶</button>
        </div>`;
    }

    if (dayMatches.length === 0) {
      const emptyTitle = typeof I18n !== 'undefined' ? I18n.t('no_matches_on_day') : '该日无比赛';
      const emptyDesc = typeof I18n !== 'undefined' ? I18n.t('use_arrows_to_switch_date') : '使用箭头切换日期';
      contentContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">${emptyTitle}</div>
          <div class="empty-state-desc">${emptyDesc}</div>
        </div>`;
      return;
    }

    dayMatches.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
    const countText = typeof I18n !== 'undefined' ? I18n.t('matches_label') : '场比赛';
    
    contentContainer.innerHTML = `
      <div class="schedule-day-group">
        <div class="schedule-date-header">
          <span class="schedule-date-label">${Helpers.formatDate(date, 'weekday')}</span>
          <span class="schedule-date-count">${dayMatches.length} ${countText}</span>
          ${Helpers.isToday(date) ? '<span class="badge badge-danger">TODAY</span>' : ''}
        </div>
        <div class="schedule-match-list">
          ${dayMatches.map(m => renderScheduleRow(m)).join('')}
        </div>
      </div>`;

    renderCalendar(date);
  }

  function renderByGroup() {
    const navContainer = document.getElementById('dateNav');
    const contentContainer = document.getElementById('scheduleContent');
    if (!contentContainer) return;
    if (navContainer) navContainer.innerHTML = '';

    const countText = typeof I18n !== 'undefined' ? I18n.t('matches_label') : '场比赛';
    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';

    let html = '';
    Helpers.GROUPS.forEach(g => {
      const gMatches = DataLoader.getMatchesByGroup(matches, g);
      gMatches.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

      html += `
        <div class="schedule-day-group">
          <div class="schedule-date-header">
            <span class="schedule-date-label">${groupText} ${g}</span>
            <span class="schedule-date-count">${gMatches.length} ${countText}</span>
          </div>
          <div class="schedule-match-list">
            ${gMatches.map(m => renderScheduleRow(m)).join('')}
          </div>
        </div>`;
    });

    contentContainer.innerHTML = html;
  }

  function renderByStage() {
    const navContainer = document.getElementById('dateNav');
    const contentContainer = document.getElementById('scheduleContent');
    if (!contentContainer) return;
    if (navContainer) navContainer.innerHTML = '';

    const stages = ['group', 'round32', 'round16', 'quarter', 'semi', 'third', 'final'];
    const countText = typeof I18n !== 'undefined' ? I18n.t('matches_label') : '场';
    let html = '';

    stages.forEach(stage => {
      const stageMatches = DataLoader.getMatchesByStage(matches, stage);
      stageMatches.sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

      if (stageMatches.length === 0) return;

      html += `
        <div class="schedule-day-group">
          <div class="schedule-date-header">
            <span class="schedule-date-label">${Helpers.getStageName(stage)}</span>
            <span class="schedule-date-count">${stageMatches.length} ${countText}</span>
          </div>
          <div class="schedule-match-list">
            ${stageMatches.map(m => renderScheduleRow(m)).join('')}
          </div>
        </div>`;
    });

    contentContainer.innerHTML = html;
  }

  function renderScheduleRow(m) {
    const home = DataLoader.getTeamById(teams, m.home);
    const away = DataLoader.getTeamById(teams, m.away);
    const homeName = home ? Helpers.getTeamName(home) : 'TBD';
    const awayName = away ? Helpers.getTeamName(away) : 'TBD';

    const homeFlagHtml = home 
      ? `<img src="${Helpers.getFlagUrl(home.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${homeName}">`
      : `<span class="flag-placeholder" style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); display:inline-block; vertical-align:middle"></span>`;
    const awayFlagHtml = away 
      ? `<img src="${Helpers.getFlagUrl(away.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${awayName}">`
      : `<span class="flag-placeholder" style="width:24px; height:24px; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); display:inline-block; vertical-align:middle"></span>`;

    const isFinished = m.status === 'finished';
    const isLive = m.status === 'live';
    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';
    const groupTag = m.group ? `${groupText} ${m.group}` : Helpers.getStageShort(m.stage);

    let centerContent;
    if (isFinished || isLive) {
      const liveText = typeof I18n !== 'undefined' ? I18n.t('status_live') : 'LIVE';
      const finText = typeof I18n !== 'undefined' ? I18n.t('status_finished') : 'FT';
      centerContent = `<span class="schedule-score-final">${m.home_score} - ${m.away_score}</span>
        ${isLive ? `<span class="live-indicator"><span class="live-dot"></span>${liveText}</span>` : `<span style="font-size:var(--text-xs);color:var(--color-success)">${finText}</span>`}`;
    } else {
      centerContent = `<span class="schedule-time">${m.time || 'TBD'}</span>
        <span class="schedule-group-tag">${groupTag}</span>`;
    }

    const cityName = typeof I18n !== 'undefined' ? I18n.getCityName(m.city) : m.city;

    return `
    <div class="schedule-match">
      <div class="schedule-home">
        <span class="schedule-team-name">${homeName}</span>
        ${homeFlagHtml}
      </div>
      <div class="schedule-center">${centerContent}</div>
      <div class="schedule-away">
        ${awayFlagHtml}
        <span class="schedule-team-name">${awayName}</span>
      </div>
      <div class="schedule-meta">
        <span>${cityName}</span>
      </div>
    </div>`;
  }

  function renderCalendar(selectedDate) {
    const container = document.getElementById('calendarMini');
    if (!container) return;

    const d = new Date(selectedDate + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = Helpers.getToday();

    const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'en';
    const locales = { 'zh-CN': 'zh-CN', en: 'en-US', es: 'es-ES', fr: 'fr-FR' };
    const monthName = d.toLocaleDateString(locales[lang] || 'en-US', { month: 'long', year: 'numeric' });

    let dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    if (lang === 'zh-CN') {
      dayNames = ['日','一','二','三','四','五','六'];
    } else if (lang === 'es') {
      dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    } else if (lang === 'fr') {
      dayNames = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    }

    // Build match dates set for this month
    const matchDatesInMonth = new Set(
      allDates.filter(dt => dt.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    );

    let cells = dayNames.map(dn => `<div class="calendar-day-name">${dn}</div>`).join('');

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells += '<div class="calendar-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = dateStr === selectedDate;
      const isTodayDate = dateStr === today;
      const hasMatches = matchDatesInMonth.has(dateStr);
      const isPast = dateStr < today;

      let classes = 'calendar-day';
      if (isTodayDate) classes += ' today';
      if (isSelected && !isTodayDate) classes += ' selected';
      if (hasMatches) classes += ' has-matches';
      if (isPast) classes += ' past';

      const clickHandler = hasMatches ? `onclick="SchedulePage.goToDate('${dateStr}')"` : '';
      cells += `<div class="${classes}" ${clickHandler}>${day}</div>`;
    }

    container.innerHTML = `
      <div class="calendar-mini">
        <div class="calendar-header">
          <span class="calendar-month">${monthName}</span>
        </div>
        <div class="calendar-grid">${cells}</div>
      </div>`;
  }

  function prevDate() {
    if (currentDateIndex > 0) {
      currentDateIndex--;
      renderContent();
    }
  }

  function nextDate() {
    if (currentDateIndex < allDates.length - 1) {
      currentDateIndex++;
      renderContent();
    }
  }

  function goToDate(dateStr) {
    const idx = allDates.indexOf(dateStr);
    if (idx >= 0) {
      currentDateIndex = idx;
      renderContent();
    }
  }

  return { init, setView, prevDate, nextDate, goToDate };
})();

document.addEventListener('DOMContentLoaded', () => SchedulePage.init());
