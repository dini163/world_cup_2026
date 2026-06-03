/**
 * 2026 FIFA World Cup — Match Card Component
 */

const MatchCard = (() => {
  function render(match, teams, options = {}) {
    const home = teams.find(t => t.id === match.home);
    const away = teams.find(t => t.id === match.away);
    if (!home || !away) return '';

    const isLive = match.status === 'live';
    const isFinished = match.status === 'finished';
    const spoilerClass = (isFinished && Navbar.isSpoilerActive()) ? 'spoiler-hidden' : '';
    const liveClass = isLive ? 'is-live' : '';
    
    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';
    const groupLabel = match.group ? `${groupText} ${match.group}` : Helpers.getStageShort(match.stage);

    let centerContent;
    if (isFinished || isLive) {
      const liveText = typeof I18n !== 'undefined' ? I18n.t('status_live') : 'LIVE';
      const finText = typeof I18n !== 'undefined' ? I18n.t('status_finished') : 'FT';
      centerContent = `
        <div class="match-score">
          <span>${match.home_score}</span>
          <span class="score-dash">-</span>
          <span>${match.away_score}</span>
        </div>
        <span class="match-status ${match.status}">
          ${isLive ? `<span class="live-dot"></span> ${liveText}` : finText}
        </span>`;
    } else {
      const timeStr = match.time || '--:--';
      centerContent = `
        <span class="match-vs">${timeStr}</span>
        <span class="match-status upcoming">${Helpers.formatDate(match.date, 'short')}</span>`;
    }

    const homeName = Helpers.getTeamName(home);
    const awayName = Helpers.getTeamName(away);
    const cityName = typeof I18n !== 'undefined' ? I18n.getCityName(match.city) : match.city;

    return `
    <div class="match-card ${liveClass} ${spoilerClass}" data-match-id="${match.id}">
      <div class="match-card-header">
        <span class="match-card-group">${groupLabel} · R${match.round || ''}</span>
        <span class="match-card-time">${match.time} ${match.tz}</span>
      </div>
      <div class="match-card-body">
        <div class="match-team">
          <img src="${Helpers.getFlagUrl(home.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${homeName}">
          <span class="match-team-name">${homeName}</span>
        </div>
        <div class="match-score-center">${centerContent}</div>
        <div class="match-team">
          <img src="${Helpers.getFlagUrl(away.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${awayName}">
          <span class="match-team-name">${awayName}</span>
        </div>
      </div>
      <div class="match-card-footer">
        <span>${cityName}</span>
        <span>${match.venue}</span>
      </div>
    </div>`;
  }

  function renderList(matches, teams, container) {
    container.innerHTML = matches.map(m => render(m, teams)).join('');
  }

  return { render, renderList };
})();
