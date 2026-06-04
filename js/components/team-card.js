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
          ${renderSquadTable(team.squad, team.id)}
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

  function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function getStableColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 45%), hsl(${(hue + 40) % 360}, 75%, 25%))`;
  }

  function renderMiniAvatar(name) {
    const initials = getInitials(name);
    const bg = getStableColor(name);
    return `
      <div class="player-mini-avatar" style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${bg};
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        font-weight: 700;
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        flex-shrink: 0;
      ">
        ${initials}
      </div>`;
  }

  function renderSquadTable(squad, teamId) {
    const noSquadInfo = typeof I18n !== 'undefined' ? I18n.t('no_squad_info') : '暂无阵容信息';
    if (!squad || squad.length === 0) return `<p style="color:var(--text-tertiary);font-size:var(--text-sm)">${noSquadInfo}</p>`;

    const tName = typeof I18n !== 'undefined' ? I18n.t('table_name') : '球员';
    const tPos = typeof I18n !== 'undefined' ? I18n.t('table_pos') : '位置';
    const tAge = typeof I18n !== 'undefined' ? I18n.t('table_age') : '年龄';
    const tClub = typeof I18n !== 'undefined' ? I18n.t('table_club') : '俱乐部';
    const tInjury = typeof I18n !== 'undefined' ? I18n.t('table_injury') : '伤情';

    const rows = squad.map(p => {
      const displayName = typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? (p.name_cn || p.name) : p.name;
      const keyClass = p.is_key ? 'player-key' : '';
      const injuryHtml = p.injury
        ? `<span class="injury-status"><span class="injury-dot ${p.injury.impact}"></span> ${p.injury.type}</span>`
        : '—';
      const avatarHtml = renderMiniAvatar(p.name);
      return `
        <tr onclick="TeamCard.showPlayerDetail('${teamId}', '${p.name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
          <td class="${keyClass}">
            <div style="display:flex; align-items:center; gap:8px;">
              ${avatarHtml}
              <span>${p.is_key ? '⭐ ' : ''}${displayName}</span>
            </div>
          </td>
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

  function generatePlayerStats(player, team) {
    const seed = player.name;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rand = () => {
      let x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };

    const teamOverall = team.strength.overall;
    let overall = teamOverall + Math.floor(rand() * 10 - 5);
    if (player.is_key) {
      overall = Math.max(overall, teamOverall + 5 + Math.floor(rand() * 5));
    }
    overall = Math.min(99, Math.max(50, overall));

    let pac = 50, sho = 50, pas = 50, dri = 50, def = 50, phy = 50;

    if (player.pos === 'FW') {
      pac = 75 + Math.floor(rand() * 20);
      sho = 75 + Math.floor(rand() * 20);
      pas = 65 + Math.floor(rand() * 20);
      dri = 75 + Math.floor(rand() * 20);
      def = 25 + Math.floor(rand() * 25);
      phy = 60 + Math.floor(rand() * 25);
    } else if (player.pos === 'MF') {
      pac = 65 + Math.floor(rand() * 20);
      sho = 60 + Math.floor(rand() * 25);
      pas = 75 + Math.floor(rand() * 20);
      dri = 75 + Math.floor(rand() * 20);
      def = 55 + Math.floor(rand() * 25);
      phy = 65 + Math.floor(rand() * 20);
    } else if (player.pos === 'DF') {
      pac = 60 + Math.floor(rand() * 25);
      sho = 30 + Math.floor(rand() * 30);
      pas = 55 + Math.floor(rand() * 25);
      dri = 60 + Math.floor(rand() * 25);
      def = 75 + Math.floor(rand() * 20);
      phy = 75 + Math.floor(rand() * 20);
    } else if (player.pos === 'GK') {
      pac = 70 + Math.floor(rand() * 25);
      sho = 70 + Math.floor(rand() * 25);
      pas = 60 + Math.floor(rand() * 30);
      dri = 75 + Math.floor(rand() * 20);
      def = 40 + Math.floor(rand() * 30);
      phy = 70 + Math.floor(rand() * 25);
    }

    const scale = (val) => {
      let offset = overall - 75;
      let scaled = val + Math.floor(offset * 0.7);
      return Math.min(99, Math.max(30, scaled));
    };

    return {
      overall,
      pac: scale(pac),
      sho: scale(sho),
      pas: scale(pas),
      dri: scale(dri),
      def: scale(def),
      phy: scale(phy)
    };
  }

  function showPlayerDetail(teamId, playerName) {
    DataLoader.load('teams').then(teams => {
      const team = teams.find(t => t.id === teamId);
      if (!team) return;

      const player = team.squad.find(p => p.name === playerName);
      if (!player) return;

      const overlay = document.getElementById('playerModal');
      const modalBody = document.getElementById('playerModalBody');
      if (!overlay || !modalBody) return;

      const stats = generatePlayerStats(player, team);

      const displayName = typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? (player.name_cn || player.name) : player.name;
      const subName = typeof I18n !== 'undefined' && I18n.getLanguage() === 'zh-CN' ? player.name : (player.name_cn || '');
      const initials = getInitials(player.name);
      const bg = getStableColor(player.name);

      const clubLabel = typeof I18n !== 'undefined' ? I18n.t('table_club') : '俱乐部';
      const leagueLabel = typeof I18n !== 'undefined' ? I18n.t('table_league') : '联赛';
      const ageLabel = typeof I18n !== 'undefined' ? I18n.t('table_age') : '年龄';
      const posLabel = typeof I18n !== 'undefined' ? I18n.t('table_pos') : '位置';
      const injuryLabel = typeof I18n !== 'undefined' ? I18n.t('table_injury') : '伤情';

      const injuryHtml = player.injury
        ? `<span class="injury-status"><span class="injury-dot ${player.injury.impact}"></span> ${player.injury.type}</span>`
        : '—';

      const pacText = player.pos === 'GK' ? 'DIV' : 'PAC';
      const shoText = player.pos === 'GK' ? 'HAN' : 'SHO';
      const pasText = player.pos === 'GK' ? 'KIC' : 'PAS';
      const driText = player.pos === 'GK' ? 'REF' : 'DRI';
      const defText = player.pos === 'GK' ? 'SPD' : 'DEF';
      const phyText = player.pos === 'GK' ? 'POS' : 'PHY';

      modalBody.innerHTML = `
        <div class="fut-card-container">
          <div class="fut-card">
            <div class="fut-card-top">
              <div class="fut-card-badge">
                <div class="fut-card-rating">${stats.overall}</div>
                <div class="fut-card-pos">${player.pos}</div>
                <img src="${Helpers.getFlagUrl(team.flag_code, 'w40')}" class="fut-card-flag" alt="${team.name}">
              </div>
              <div class="fut-card-pic-wrapper">
                <div class="fut-card-pic" style="background: ${bg};">
                  ${initials}
                </div>
              </div>
            </div>
            <div class="fut-card-name">${displayName}</div>
            ${subName ? `<div class="fut-card-name-cn">${subName}</div>` : ''}
            <div class="fut-card-stats">
              <div class="fut-stats-col">
                <div class="fut-stat-row"><span>${pacText}</span><span class="fut-stat-val">${stats.pac}</span></div>
                <div class="fut-stat-row"><span>${shoText}</span><span class="fut-stat-val">${stats.sho}</span></div>
                <div class="fut-stat-row"><span>${pasText}</span><span class="fut-stat-val">${stats.pas}</span></div>
              </div>
              <div class="fut-stats-col">
                <div class="fut-stat-row"><span>${driText}</span><span class="fut-stat-val">${stats.dri}</span></div>
                <div class="fut-stat-row"><span>${defText}</span><span class="fut-stat-val">${stats.def}</span></div>
                <div class="fut-stat-row"><span>${phyText}</span><span class="fut-stat-val">${stats.phy}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="player-info-section">
          <div class="player-info-item">
            <span class="player-info-label">${clubLabel}</span>
            <span class="player-info-val">${player.club}</span>
          </div>
          <div class="player-info-item">
            <span class="player-info-label">${leagueLabel}</span>
            <span class="player-info-val">${player.league}</span>
          </div>
          <div class="player-info-item">
            <span class="player-info-label">${ageLabel}</span>
            <span class="player-info-val">${player.age}</span>
          </div>
          <div class="player-info-item">
            <span class="player-info-label">${posLabel}</span>
            <span class="player-info-val">${player.pos}</span>
          </div>
          <div class="player-info-item">
            <span class="player-info-label">${injuryLabel}</span>
            <span class="player-info-val">${injuryHtml}</span>
          </div>
        </div>
      `;

      overlay.classList.add('is-open');
    });
  }

  function closePlayerModal() {
    const overlay = document.getElementById('playerModal');
    if (overlay) overlay.classList.remove('is-open');
  }

  function closeModal() {
    const overlay = document.getElementById('teamModal');
    if (overlay) overlay.classList.remove('is-open');
  }

  return { render, renderGrid, showDetail, closeModal, showPlayerDetail, closePlayerModal };
})();
