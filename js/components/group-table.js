/**
 * 2026 FIFA World Cup — Group Table Component
 */

const GroupTable = (() => {
  function render(group, standings, teams, options = {}) {
    const { showCalc = false, qualified = new Set(), eliminated = new Set() } = options;

    const rows = standings.map((s, i) => {
      const team = teams.find(t => t.id === s.team);
      if (!team) return '';

      let rowClass = '';
      if (i < 2) rowClass = 'qualified-auto';
      else if (i === 2 && qualified.has(s.team)) rowClass = 'qualified-third';
      else if (eliminated.has(s.team)) rowClass = 'eliminated';

      const gdClass = s.gd > 0 ? 'positive' : s.gd < 0 ? 'negative' : 'zero';
      const gdStr = s.gd > 0 ? `+${s.gd}` : String(s.gd);
      const teamName = Helpers.getTeamName(team);

      return `
        <tr class="${rowClass}">
          <td>
            <div class="standings-team">
              <span class="standings-pos">${i + 1}</span>
              <img src="${Helpers.getFlagUrl(team.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${teamName}">
              <span class="standings-name">${teamName}</span>
            </div>
          </td>
          <td>${s.played}</td>
          <td>${s.won}</td>
          <td>${s.drawn}</td>
          <td>${s.lost}</td>
          <td>${s.gf}</td>
          <td>${s.ga}</td>
          <td class="standings-gd ${gdClass}">${gdStr}</td>
          <td class="standings-pts">${s.points}</td>
        </tr>`;
    }).join('');

    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';
    const tTeam = typeof I18n !== 'undefined' ? I18n.t('table_team') : 'Team';
    const tP = typeof I18n !== 'undefined' ? I18n.t('table_played') : 'P';
    const tW = typeof I18n !== 'undefined' ? I18n.t('table_won') : 'W';
    const tD = typeof I18n !== 'undefined' ? I18n.t('table_drawn') : 'D';
    const tL = typeof I18n !== 'undefined' ? I18n.t('table_lost') : 'L';
    const tGF = typeof I18n !== 'undefined' ? I18n.t('table_gf') : 'GF';
    const tGA = typeof I18n !== 'undefined' ? I18n.t('table_ga') : 'GA';
    const tGD = typeof I18n !== 'undefined' ? I18n.t('table_gd') : 'GD';
    const tPts = typeof I18n !== 'undefined' ? I18n.t('table_pts') : 'Pts';

    return `
    <div class="group-panel" id="group-${group}">
      <div class="group-panel-header">
        <div class="group-panel-title">
          <span class="group-letter">${group}</span>
          ${groupText} ${group}
        </div>
      </div>
      <div class="standings-table-wrap">
        <table class="standings-table">
          <thead>
            <tr>
              <th>${tTeam}</th>
              <th data-tooltip="Played">${tP}</th>
              <th data-tooltip="Won">${tW}</th>
              <th data-tooltip="Drawn">${tD}</th>
              <th data-tooltip="Lost">${tL}</th>
              <th data-tooltip="Goals For">${tGF}</th>
              <th data-tooltip="Goals Against">${tGA}</th>
              <th data-tooltip="Goal Difference">${tGD}</th>
              <th data-tooltip="Points">${tPts}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }

  function renderCalcRow(match, teams) {
    const home = teams.find(t => t.id === match.home);
    const away = teams.find(t => t.id === match.away);
    if (!home || !away) return '';

    const sim = Calculator.getSimulation(match.id);
    const homeSelected = sim ? (sim.homeScore > sim.awayScore ? 'selected-win' : '') : '';
    const drawSelected = sim ? (sim.homeScore === sim.awayScore ? 'selected-draw' : '') : '';
    const awaySelected = sim ? (sim.awayScore > sim.homeScore ? 'selected-lose' : '') : '';

    const homeName = Helpers.getTeamName(home);
    const awayName = Helpers.getTeamName(away);

    const winHomeText = typeof I18n !== 'undefined' ? I18n.t('win_home') : 'Home Win';
    const winAwayText = typeof I18n !== 'undefined' ? I18n.t('win_away') : 'Away Win';
    const drawText = typeof I18n !== 'undefined' ? I18n.t('win_draw') : 'Draw';

    const resultText = match.home_score !== null
      ? `<span class="calc-match-result">${match.home_score} - ${match.away_score}</span>`
      : `<div class="sim-btn-group">
           <button class="sim-btn ${homeSelected}" onclick="StandingsPage.simulate('${match.id}','home')" title="${homeName} ${winHomeText}">H</button>
           <button class="sim-btn ${drawSelected}" onclick="StandingsPage.simulate('${match.id}','draw')" title="${drawText}">D</button>
           <button class="sim-btn ${awaySelected}" onclick="StandingsPage.simulate('${match.id}','away')" title="${awayName} ${winAwayText}">A</button>
         </div>`;

    return `
    <div class="calc-match" data-match-id="${match.id}">
      <div class="calc-match-teams">
        <img src="${Helpers.getFlagUrl(home.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${homeName}">
        <span>${homeName}</span>
        <span class="calc-match-vs">vs</span>
        <img src="${Helpers.getFlagUrl(away.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${awayName}">
        <span>${awayName}</span>
      </div>
      ${resultText}
    </div>`;
  }

  function renderAllGroups(allStandings, teams, options = {}) {
    return Helpers.GROUPS.map(g => {
      const standings = allStandings[g] || [];
      return render(g, standings, teams, options);
    }).join('');
  }

  function renderThirdPlaceTable(thirdPlaced, teams) {
    if (!thirdPlaced || thirdPlaced.length === 0) return '';

    const rows = thirdPlaced.map((s, i) => {
      const team = teams.find(t => t.id === s.team);
      if (!team) return '';
      const qualClass = s.qualifies ? 'qualified-third' : (i >= 8 ? 'eliminated' : '');
      const gdClass = s.gd > 0 ? 'positive' : s.gd < 0 ? 'negative' : 'zero';
      const gdStr = s.gd > 0 ? `+${s.gd}` : String(s.gd);
      const teamName = Helpers.getTeamName(team);

      return `
        <tr class="${qualClass}">
          <td>
            <div class="standings-team">
              <span class="standings-pos">${i + 1}</span>
              <img src="${Helpers.getFlagUrl(team.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${teamName}">
              <span class="standings-name">${teamName}</span>
            </div>
          </td>
          <td><span class="badge badge-group">${s.group}</span></td>
          <td>${s.played}</td>
          <td>${s.points}</td>
          <td class="standings-gd ${gdClass}">${gdStr}</td>
          <td>${s.gf}</td>
          <td>${s.qualifies ? '✅' : '❌'}</td>
        </tr>`;
    }).join('');

    const bestThirdTitle = typeof I18n !== 'undefined' ? I18n.t('best_third_title') : '最佳小组第三 Best Third-Placed Teams';
    const tTeam = typeof I18n !== 'undefined' ? I18n.t('table_team') : 'Team';
    const tGroup = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';
    const tP = typeof I18n !== 'undefined' ? I18n.t('table_played') : 'P';
    const tPts = typeof I18n !== 'undefined' ? I18n.t('table_pts') : 'Pts';
    const tGD = typeof I18n !== 'undefined' ? I18n.t('table_gd') : 'GD';
    const tGF = typeof I18n !== 'undefined' ? I18n.t('table_gf') : 'GF';
    const tStatus = typeof I18n !== 'undefined' ? I18n.t('table_status') : 'Status';

    return `
    <div class="third-place-section">
      <h3>${bestThirdTitle}</h3>
      <div class="standings-table-wrap">
        <table class="standings-table">
          <thead><tr><th>${tTeam}</th><th>${tGroup}</th><th>${tP}</th><th>${tPts}</th><th>${tGD}</th><th>${tGF}</th><th>${tStatus}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }

  return {
    render,
    renderCalcRow,
    renderAllGroups,
    renderThirdPlaceTable,
  };
})();
