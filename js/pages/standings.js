/**
 * 2026 FIFA World Cup — Standings Page Logic
 */

const StandingsPage = (() => {
  let teams = [];
  let matches = [];
  let currentGroup = 'all';

  async function init() {
    try {
      const data = await DataLoader.loadAll();
      teams = data.teams;
      matches = data.matches;
      renderGroupTabs();
      renderStandings();

      // Listen for language changes to re-render
      window.addEventListener('lang-change', () => {
        renderGroupTabs();
        renderStandings();
      });
    } catch (err) {
      console.error('[StandingsPage] Init failed:', err);
    }
  }

  function renderGroupTabs() {
    const container = document.getElementById('groupTabs');
    if (!container) return;

    const allBtn = `<button class="group-tab ${currentGroup === 'all' ? 'active' : ''}" onclick="StandingsPage.selectGroup('all')">ALL</button>`;
    const tabs = Helpers.GROUPS.map(g =>
      `<button class="group-tab ${currentGroup === g ? 'active' : ''}" onclick="StandingsPage.selectGroup('${g}')">${g}</button>`
    ).join('');

    container.innerHTML = allBtn + tabs;
  }

  function selectGroup(group) {
    currentGroup = group;
    renderGroupTabs();
    renderStandings();
  }

  function renderStandings() {
    const container = document.getElementById('standingsContent');
    const thirdContainer = document.getElementById('thirdPlaceContent');
    const calcContainer = document.getElementById('calculatorContent');
    if (!container) return;

    const result = Calculator.computeFullStandings(matches, teams);
    const { groupStandings, thirdPlaced, qualified, eliminated } = result;

    if (currentGroup === 'all') {
      container.innerHTML = `<div class="groups-grid">${
        GroupTable.renderAllGroups(groupStandings, teams, { qualified, eliminated })
      }</div>`;

      if (thirdContainer) {
        thirdContainer.innerHTML = GroupTable.renderThirdPlaceTable(thirdPlaced, teams);
      }

      if (calcContainer) {
        renderCalculatorAll(groupStandings);
      }
    } else {
      const standings = groupStandings[currentGroup] || [];
      container.innerHTML = GroupTable.render(currentGroup, standings, teams, { qualified, eliminated });

      if (thirdContainer) {
        thirdContainer.innerHTML = GroupTable.renderThirdPlaceTable(thirdPlaced, teams);
      }

      if (calcContainer) {
        renderCalculatorGroup(currentGroup);
      }
    }

    // Update legend
    const legend = document.getElementById('standingsLegend');
    if (legend) {
      const lAuto = typeof I18n !== 'undefined' ? I18n.t('legend_auto') : '自动出线 (小组前2)';
      const lThird = typeof I18n !== 'undefined' ? I18n.t('legend_third') : '最佳第3名出线';
      const lOut = typeof I18n !== 'undefined' ? I18n.t('legend_out') : '淘汰';
      
      legend.innerHTML = `
        <div class="standings-legend">
          <div class="legend-item"><span class="legend-dot auto"></span> ${lAuto}</div>
          <div class="legend-item"><span class="legend-dot third"></span> ${lThird}</div>
          <div class="legend-item"><span class="legend-dot out"></span> ${lOut}</div>
        </div>`;
    }
  }

  function renderCalculatorGroup(group) {
    const container = document.getElementById('calculatorContent');
    if (!container) return;

    const groupMatches = matches.filter(m => m.group === group && m.stage === 'group');
    const unplayed = groupMatches.filter(m => m.home_score === null);

    if (unplayed.length === 0) {
      const completedText = typeof I18n !== 'undefined' ? I18n.t('group_matches_completed') : '本组所有比赛已完赛';
      container.innerHTML = `<p style="color:var(--text-tertiary);text-align:center;padding:var(--space-4)">${completedText}</p>`;
      return;
    }

    const calcTitle = typeof I18n !== 'undefined' ? I18n.t('calc_title') : '出线算分器';
    const resetText = typeof I18n !== 'undefined' ? I18n.t('btn_reset') : '重置';
    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';

    container.innerHTML = `
      <div class="calculator-section">
        <div class="calculator-header">
          <h3>${calcTitle} · ${groupText} ${group}</h3>
          <button class="btn btn-ghost btn-sm calculator-reset" onclick="StandingsPage.resetCalc()">${resetText}</button>
        </div>
        <div class="calc-match-list">
          ${unplayed.map(m => GroupTable.renderCalcRow(m, teams)).join('')}
        </div>
      </div>`;
  }

  function renderCalculatorAll(groupStandings) {
    const container = document.getElementById('calculatorContent');
    if (!container) return;

    const unplayed = matches.filter(m => m.stage === 'group' && m.home_score === null);
    if (unplayed.length === 0) {
      container.innerHTML = '';
      return;
    }

    const groupedUnplayed = {};
    unplayed.forEach(m => {
      if (!groupedUnplayed[m.group]) groupedUnplayed[m.group] = [];
      groupedUnplayed[m.group].push(m);
    });

    const calcTitle = typeof I18n !== 'undefined' ? I18n.t('calc_title') : '出线算分器';
    const resetText = typeof I18n !== 'undefined' ? I18n.t('btn_reset') : '重置';
    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';

    let html = `
      <div class="calculator-section">
        <div class="calculator-header">
          <h3>${calcTitle}</h3>
          <button class="btn btn-ghost btn-sm calculator-reset" onclick="StandingsPage.resetCalc()">${resetText}</button>
        </div>`;

    Object.keys(groupedUnplayed).sort().forEach(g => {
      html += `<h4 style="margin:var(--space-4) 0 var(--space-2);color:var(--text-secondary)">${groupText} ${g}</h4>`;
      html += `<div class="calc-match-list" style="margin-bottom:var(--space-4)">${
        groupedUnplayed[g].map(m => GroupTable.renderCalcRow(m, teams)).join('')
      }</div>`;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  function simulate(matchId, outcome) {
    Calculator.simulateOutcome(matchId, outcome);
    renderStandings();
  }

  function resetCalc() {
    Calculator.clearAll();
    renderStandings();
  }

  return { init, selectGroup, simulate, resetCalc };
})();

document.addEventListener('DOMContentLoaded', () => StandingsPage.init());
