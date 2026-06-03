/**
 * 2026 FIFA World Cup — Team Card Component
 */

const TeamCard = (() => {
  function render(team) {
    const keyPlayers = team.key_players.slice(0, 3).map(p =>
      `<span class="team-card-player">${p}</span>`
    ).join('');

    const mainName = Helpers.getTeamName(team);
    const subName = typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? team.name : (team.name_cn || '');
    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';
    const keyPlayersLabel = typeof I18n !== 'undefined' ? I18n.t('label_key_players') : 'Key Players';

    return `
    <div class="team-card scroll-animate" data-team-id="${team.id}" onclick="TeamCard.showDetail('${team.id}')">
      <div class="team-card-banner"></div>
      <div class="team-card-body">
        <div class="team-card-top">
          <div class="team-card-identity">
            <img src="${Helpers.getFlagUrl(team.flag_code, 'w40')}" class="flag-icon" alt="${mainName}">
            <div class="team-card-info">
              <div class="team-card-name">${mainName}</div>
              ${subName ? `<div class="team-card-name-cn">${subName}</div>` : ''}
            </div>
          </div>
          <div class="team-card-rank">
            <span class="team-card-rank-label">FIFA</span>
            <span class="team-card-rank-value">#${team.fifa_ranking}</span>
          </div>
        </div>
        <div class="team-card-meta">
          <span class="badge badge-primary">${groupText} ${team.group}</span>
          <span class="badge badge-group">${team.formation}</span>
          <span class="badge badge-group">${team.confederation}</span>
        </div>
        <div class="team-card-players">
          <span class="team-card-players-label">${keyPlayersLabel}</span>
          <div class="team-card-player-list">${keyPlayers}</div>
        </div>
      </div>
    </div>`;
  }

  function renderGrid(teams, container) {
    container.innerHTML = teams.map(t => render(t)).join('');
    Helpers.initScrollAnimations();
  }

  /** Show team detail modal */
  function showDetail(teamId) {
    const overlay = document.getElementById('teamModal');
    if (!overlay) return;

    DataLoader.load('teams').then(teams => {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      const modalBody = overlay.querySelector('.modal-body');
      const modalTitle = overlay.querySelector('.modal-header h3');

      const mainName = Helpers.getTeamName(team);
      const subName = typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? team.name : (team.name_cn || '');

      modalTitle.innerHTML = `<img src="${Helpers.getFlagUrl(team.flag_code, 'w40')}" class="flag-icon flag-icon-sm" style="display:inline-block; vertical-align:middle; margin-right:8px" alt="${mainName}"> ${mainName} ${subName ? `<small style="color:var(--text-tertiary);font-weight:normal">${subName}</small>` : ''}`;

      const s = team.strength;
      const fifaLabel = typeof I18n !== 'undefined' ? I18n.t('label_fifa_ranking') : 'FIFA 排名';
      const formationLabel = typeof I18n !== 'undefined' ? I18n.t('label_formation') : '阵型';
      const overallLabel = typeof I18n !== 'undefined' ? I18n.t('label_overall') : '总评';
      const bestFinishLabel = typeof I18n !== 'undefined' ? I18n.t('label_best_finish') : '历史最佳';
      const coachLabel = typeof I18n !== 'undefined' ? I18n.t('label_coach') : '主教练';
      const attackLabel = typeof I18n !== 'undefined' ? I18n.t('label_attack') : '进攻';
      const midfieldLabel = typeof I18n !== 'undefined' ? I18n.t('label_midfield') : '中场';
      const defenseLabel = typeof I18n !== 'undefined' ? I18n.t('label_defense') : '防守';
      const squadLabel = typeof I18n !== 'undefined' ? I18n.t('label_squad') : '参赛阵容';

      modalBody.innerHTML = `
        <div class="team-detail-stats">
          <div class="team-stat-item">
            <div class="team-stat-value">#${team.fifa_ranking}</div>
            <div class="team-stat-label">${fifaLabel}</div>
          </div>
          <div class="team-stat-item">
            <div class="team-stat-value">${team.formation}</div>
            <div class="team-stat-label">${formationLabel}</div>
          </div>
          <div class="team-stat-item">
            <div class="team-stat-value">${s.overall}</div>
            <div class="team-stat-label">${overallLabel}</div>
          </div>
        </div>

        <div style="margin-top:var(--space-4)">
          <p style="font-size:var(--text-sm);color:var(--text-tertiary);margin-bottom:var(--space-1)">🏆 ${bestFinishLabel}: ${team.best_finish}</p>
          <p style="font-size:var(--text-sm);color:var(--text-tertiary)">👔 ${coachLabel}: ${team.coach}</p>
        </div>

        <div style="margin-top:var(--space-6)">
          <div class="strength-meter" style="margin-bottom:var(--space-3)">
            <span style="font-size:var(--text-xs);color:var(--text-tertiary);min-width:50px">${attackLabel}</span>
            <div class="strength-bar-track"><div class="strength-bar-fill" style="width:${s.attack}%"></div></div>
            <span class="strength-value">${s.attack}</span>
          </div>
          <div class="strength-meter" style="margin-bottom:var(--space-3)">
            <span style="font-size:var(--text-xs);color:var(--text-tertiary);min-width:50px">${midfieldLabel}</span>
            <div class="strength-bar-track"><div class="strength-bar-fill" style="width:${s.midfield}%"></div></div>
            <span class="strength-value">${s.midfield}</span>
          </div>
          <div class="strength-meter">
            <span style="font-size:var(--text-xs);color:var(--text-tertiary);min-width:50px">${defenseLabel}</span>
            <div class="strength-bar-track"><div class="strength-bar-fill" style="width:${s.defense}%"></div></div>
            <span class="strength-value">${s.defense}</span>
          </div>
        </div>

        ${renderRadarChart(s)}

        <div class="squad-section">
          <h4>${squadLabel}</h4>
          ${renderSquadTable(team.squad)}
        </div>`;

      overlay.classList.add('is-open');
    });
  }

  function renderRadarChart(s) {
    const size = 220, cx = 110, cy = 110, r = 85;
    
    const attackLabel = typeof I18n !== 'undefined' ? I18n.t('label_attack') : 'Attack';
    const midfieldLabel = typeof I18n !== 'undefined' ? I18n.t('label_midfield') : 'Midfield';
    const defenseLabel = typeof I18n !== 'undefined' ? I18n.t('label_defense') : 'Defense';

    const labels = [attackLabel, midfieldLabel, defenseLabel];
    const values = [s.attack, s.midfield, s.defense];
    const angles = values.map((_, i) => (Math.PI * 2 * i) / values.length - Math.PI / 2);

    const gridLevels = [0.25, 0.5, 0.75, 1];
    const gridPaths = gridLevels.map(level => {
      const pts = angles.map(a =>
        `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`
      );
      return `<polygon class="radar-grid" points="${pts.join(' ')}"/>`;
    }).join('');

    const axisLines = angles.map(a =>
      `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}"/>`
    ).join('');

    const dataPts = values.map((v, i) => {
      const scale = v / 100;
      return `${cx + r * scale * Math.cos(angles[i])},${cy + r * scale * Math.sin(angles[i])}`;
    });

    const labelEls = labels.map((l, i) => {
      const lx = cx + (r + 18) * Math.cos(angles[i]);
      const ly = cy + (r + 18) * Math.sin(angles[i]);
      return `<text class="radar-label" x="${lx}" y="${ly}">${l}</text>`;
    }).join('');

    const dots = values.map((v, i) => {
      const scale = v / 100;
      return `<circle class="radar-point" cx="${cx + r * scale * Math.cos(angles[i])}" cy="${cy + r * scale * Math.sin(angles[i])}" r="4"/>`;
    }).join('');

    return `
    <div class="radar-chart-container">
      <svg class="radar-chart" viewBox="0 0 ${size} ${size}">
        ${gridPaths}${axisLines}
        <polygon class="radar-area" points="${dataPts.join(' ')}"/>
        ${dots}${labelEls}
      </svg>
    </div>`;
  }

  function renderSquadTable(squad) {
    const noSquadInfo = typeof I18n !== 'undefined' ? I18n.t('no_squad_info') : '暂无阵容信息';
    if (!squad || squad.length === 0) return `<p style="color:var(--text-tertiary);font-size:var(--text-sm)">${noSquadInfo}</p>`;

    const tName = typeof I18n !== 'undefined' ? I18n.t('table_name') : '球员';
    const tPos = typeof I18n !== 'undefined' ? I18n.t('table_pos') : '位置';
    const tAge = typeof I18n !== 'undefined' ? I18n.t('table_age') : '年龄';
    const tClub = typeof I18n !== 'undefined' ? I18n.t('table_club') : '俱乐部';
    const tInjury = typeof I18n !== 'undefined' ? I18n.t('table_injury') : '伤情';

    const rows = squad.map(p => {
      const keyClass = p.is_key ? 'player-key' : '';
      const injuryHtml = p.injury
        ? `<span class="injury-status"><span class="injury-dot ${p.injury.impact}"></span> ${p.injury.type}</span>`
        : '—';
      return `
        <tr>
          <td class="${keyClass}">${p.is_key ? '⭐ ' : ''}${p.name}</td>
          <td>${p.pos}</td>
          <td>${p.age}</td>
          <td>${p.club}</td>
          <td>${injuryHtml}</td>
        </tr>`;
    }).join('');

    return `
      <table class="squad-table">
        <thead><tr><th>${tName}</th><th>${tPos}</th><th>${tAge}</th><th>${tClub}</th><th>${tInjury}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function closeModal() {
    const overlay = document.getElementById('teamModal');
    if (overlay) overlay.classList.remove('is-open');
  }

  return { render, renderGrid, showDetail, closeModal };
})();
