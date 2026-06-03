/**
 * 2026 FIFA World Cup — Bracket Page Logic
 */

const BracketPage = (() => {
  let teams = [];
  let matches = [];
  
  // Store knockout winners: key = matchId, value = teamId
  let knockoutWinners = {};

  async function init() {
    try {
      const data = await DataLoader.loadAll();
      teams = data.teams;
      matches = data.matches;

      // Load knockout simulations from localStorage
      const savedKnockouts = localStorage.getItem('wc_knockout_simulations');
      if (savedKnockouts) {
        knockoutWinners = JSON.parse(savedKnockouts);
      }

      // Bind button events
      document.getElementById('btnAutoSimGroup').addEventListener('click', autoSimGroupStage);
      document.getElementById('btnResetBracket').addEventListener('click', resetBracket);
      document.getElementById('btnResetAll').addEventListener('click', resetAll);

      renderBracket();

      // Listen for language changes to re-render
      window.addEventListener('lang-change', () => {
        renderBracket();
      });
    } catch (err) {
      console.error('[BracketPage] Init failed:', err);
    }
  }

  function saveKnockouts() {
    try {
      localStorage.setItem('wc_knockout_simulations', JSON.stringify(knockoutWinners));
    } catch (err) {
      console.error('[BracketPage] Failed to save knockout simulations:', err);
    }
  }

  function getProgression(matchId) {
    const mapping = {
      'M73': { nextId: 'M89', slot: 'home' },
      'M74': { nextId: 'M89', slot: 'away' },
      'M75': { nextId: 'M90', slot: 'home' },
      'M76': { nextId: 'M90', slot: 'away' },
      'M77': { nextId: 'M91', slot: 'home' },
      'M78': { nextId: 'M91', slot: 'away' },
      'M79': { nextId: 'M92', slot: 'home' },
      'M80': { nextId: 'M92', slot: 'away' },
      'M81': { nextId: 'M93', slot: 'home' },
      'M82': { nextId: 'M93', slot: 'away' },
      'M83': { nextId: 'M94', slot: 'home' },
      'M84': { nextId: 'M94', slot: 'away' },
      'M85': { nextId: 'M95', slot: 'home' },
      'M86': { nextId: 'M95', slot: 'away' },
      'M87': { nextId: 'M96', slot: 'home' },
      'M88': { nextId: 'M96', slot: 'away' },

      'M89': { nextId: 'M97', slot: 'home' },
      'M90': { nextId: 'M97', slot: 'away' },
      'M91': { nextId: 'M98', slot: 'home' },
      'M92': { nextId: 'M98', slot: 'away' },
      'M93': { nextId: 'M99', slot: 'home' },
      'M94': { nextId: 'M99', slot: 'away' },
      'M95': { nextId: 'M100', slot: 'home' },
      'M96': { nextId: 'M100', slot: 'away' },

      'M97': { nextId: 'M101', slot: 'home' },
      'M98': { nextId: 'M101', slot: 'away' },
      'M99': { nextId: 'M102', slot: 'home' },
      'M100': { nextId: 'M102', slot: 'away' },

      'M101': { nextId: 'M104', slot: 'home', loserNextId: 'M103', loserSlot: 'home' },
      'M102': { nextId: 'M104', slot: 'away', loserNextId: 'M103', loserSlot: 'away' }
    };
    return mapping[matchId] || null;
  }

  function getPrevMatches(matchId) {
    const mapping = {
      'M89': { homeId: 'M73', awayId: 'M74' },
      'M90': { homeId: 'M75', awayId: 'M76' },
      'M91': { homeId: 'M77', awayId: 'M78' },
      'M92': { homeId: 'M79', awayId: 'M80' },
      'M93': { homeId: 'M81', awayId: 'M82' },
      'M94': { homeId: 'M83', awayId: 'M84' },
      'M95': { homeId: 'M85', awayId: 'M86' },
      'M96': { homeId: 'M87', awayId: 'M88' },

      'M97': { homeId: 'M89', awayId: 'M90' },
      'M98': { homeId: 'M91', awayId: 'M92' },
      'M99': { homeId: 'M93', awayId: 'M94' },
      'M100': { homeId: 'M95', awayId: 'M96' },

      'M101': { homeId: 'M97', awayId: 'M98' },
      'M102': { homeId: 'M99', awayId: 'M100' },

      'M103': { homeId: 'M101', awayId: 'M102' },
      'M104': { homeId: 'M101', awayId: 'M102' }
    };
    return mapping[matchId] || null;
  }

  function getR32Teams(matchId, groupWinners, groupRunnersUp, bestThirds) {
    const pairings = {
      'M73': { home: '1A', away: 'T1' },
      'M74': { home: '1B', away: 'T2' },
      'M75': { home: '1C', away: 'T3' },
      'M76': { home: '1D', away: 'T4' },
      'M77': { home: '1E', away: 'T5' },
      'M78': { home: '1F', away: 'T6' },
      'M79': { home: '1G', away: 'T7' },
      'M80': { home: '1H', away: 'T8' },
      'M81': { home: '1I', away: '2A' },
      'M82': { home: '1J', away: '2B' },
      'M83': { home: '1K', away: '2C' },
      'M84': { home: '1L', away: '2D' },
      'M85': { home: '2E', away: '2I' },
      'M86': { home: '2F', away: '2J' },
      'M87': { home: '2G', away: '2K' },
      'M88': { home: '2H', away: '2L' }
    };

    const pair = pairings[matchId];
    if (!pair) return { home: null, away: null };

    const getTeamFromCode = (code) => {
      if (code.startsWith('1')) {
        const g = code.charAt(1);
        return groupWinners[g] || null;
      }
      if (code.startsWith('2')) {
        const g = code.charAt(1);
        return groupRunnersUp[g] || null;
      }
      if (code.startsWith('T')) {
        const idx = parseInt(code.substring(1)) - 1;
        return bestThirds[idx] || null;
      }
      return null;
    };

    return {
      home: getTeamFromCode(pair.home),
      away: getTeamFromCode(pair.away)
    };
  }

  function getMatchTeams(matchId, groupWinners, groupRunnersUp, bestThirds) {
    if (matchId >= 'M73' && matchId <= 'M88') {
      return getR32Teams(matchId, groupWinners, groupRunnersUp, bestThirds);
    }

    const prev = getPrevMatches(matchId);
    if (!prev) return { home: null, away: null };

    let homeTeam = null;
    let awayTeam = null;

    if (matchId === 'M103') {
      const sf1Winner = knockoutWinners['M101'];
      const sf2Winner = knockoutWinners['M102'];
      
      const sf1Teams = getMatchTeams('M101', groupWinners, groupRunnersUp, bestThirds);
      const sf2Teams = getMatchTeams('M102', groupWinners, groupRunnersUp, bestThirds);

      if (sf1Teams.home && sf1Teams.away && sf1Winner) {
        homeTeam = (sf1Winner === sf1Teams.home) ? sf1Teams.away : sf1Teams.home;
      }
      if (sf2Teams.home && sf2Teams.away && sf2Winner) {
        awayTeam = (sf2Winner === sf2Teams.home) ? sf2Teams.away : sf2Teams.home;
      }
    } else {
      homeTeam = knockoutWinners[prev.homeId] || null;
      awayTeam = knockoutWinners[prev.awayId] || null;
    }

    return { home: homeTeam, away: awayTeam };
  }

  function selectWinner(matchId, teamId) {
    if (knockoutWinners[matchId] === teamId) {
      delete knockoutWinners[matchId];
      clearDescendants(matchId);
    } else {
      knockoutWinners[matchId] = teamId;
      clearDescendants(matchId);
    }
    
    saveKnockouts();
    renderBracket();
  }

  function clearDescendants(matchId) {
    const prog = getProgression(matchId);
    if (prog) {
      delete knockoutWinners[prog.nextId];
      if (prog.loserNextId) delete knockoutWinners[prog.loserNextId];
      clearDescendants(prog.nextId);
      if (prog.loserNextId) clearDescendants(prog.loserNextId);
    }
  }

  function getMatchLabel(matchId) {
    const r32Text = Helpers.getStageShort('round32');
    const r16Text = Helpers.getStageShort('round16');
    const qfText = Helpers.getStageShort('quarter');
    const sfText = Helpers.getStageShort('semi');
    const thirdText = Helpers.getStageShort('third');
    const finalText = Helpers.getStageShort('final');

    const labels = {
      'M73': `${r32Text}-1`, 'M74': `${r32Text}-2`, 'M75': `${r32Text}-3`, 'M76': `${r32Text}-4`,
      'M77': `${r32Text}-5`, 'M78': `${r32Text}-6`, 'M79': `${r32Text}-7`, 'M80': `${r32Text}-8`,
      'M81': `${r32Text}-9`, 'M82': `${r32Text}-10`, 'M83': `${r32Text}-11`, 'M84': `${r32Text}-12`,
      'M85': `${r32Text}-13`, 'M86': `${r32Text}-14`, 'M87': `${r32Text}-15`, 'M88': `${r32Text}-16`,
      'M89': `${r16Text}-1`, 'M90': `${r16Text}-2`, 'M91': `${r16Text}-3`, 'M92': `${r16Text}-4`,
      'M93': `${r16Text}-5`, 'M94': `${r16Text}-6`, 'M95': `${r16Text}-7`, 'M96': `${r16Text}-8`,
      'M97': `${qfText}-1`, 'M98': `${qfText}-2`, 'M99': `${qfText}-3`, 'M100': `${qfText}-4`,
      'M101': `${sfText}-1`, 'M102': `${sfText}-2`,
      'M103': typeof I18n !== 'undefined' ? `${I18n.t('stage_third')} ${thirdText}` : '季军赛 3RD',
      'M104': typeof I18n !== 'undefined' ? `${I18n.t('stage_final')} ${finalText}` : '决赛 FINAL'
    };
    return labels[matchId] || matchId;
  }

  function renderBracket() {
    const container = document.getElementById('bracketWrapper');
    if (!container) return;

    // 1. Calculate Group Standings
    const standingsResult = Calculator.computeFullStandings(matches, teams);
    const groupWinners = {};
    const groupRunnersUp = {};
    const bestThirds = standingsResult.thirdPlaced.filter(t => t.qualifies).map(t => t.team);

    Helpers.GROUPS.forEach(g => {
      const groupList = standingsResult.groupStandings[g] || [];
      if (groupList.length >= 1) groupWinners[g] = groupList[0].team;
      if (groupList.length >= 2) groupRunnersUp[g] = groupList[1].team;
    });

    const renderCard = (matchId) => renderMatchCard(matchId, groupWinners, groupRunnersUp, bestThirds);

    const tChampTitle = typeof I18n !== 'undefined' ? I18n.t('champion') : '冠军';
    const tChampTbd = typeof I18n !== 'undefined' ? I18n.t('status_waiting') : '待产生 TBD';
    const finalLabel = typeof I18n !== 'undefined' ? I18n.t('stage_final') : '决赛';
    const thirdLabel = typeof I18n !== 'undefined' ? I18n.t('stage_third') : '季军争夺战';

    // 2. Build HTML structure
    let html = `
      <div class="bracket-tree">
        <!-- Left Side (Matches 1-8 of R32, 1-4 of R16, 1-2 of QF, SF-1) -->
        <div class="bracket-side left-side">
          <div class="bracket-round round-32">
            ${['M73', 'M74', 'M75', 'M76', 'M77', 'M78', 'M79', 'M80'].map(renderCard).join('')}
          </div>
          <div class="bracket-round round-16">
            ${['M89', 'M90', 'M91', 'M92'].map(renderCard).join('')}
          </div>
          <div class="bracket-round round-qf">
            ${['M97', 'M98'].map(renderCard).join('')}
          </div>
          <div class="bracket-round round-sf">
            ${renderCard('M101')}
          </div>
        </div>

        <!-- Center (Finals and Champion Display) -->
        <div class="bracket-center">
          <div class="bracket-center-section">
            <div class="trophy-container">🏆</div>
            <div class="champion-display" id="championDisplay">
              <span class="bracket-center-title" style="font-size:0.75rem">2026 ${tChampTitle}</span>
              <span class="champion-name" id="championName">${tChampTbd}</span>
            </div>
          </div>

          <div class="bracket-center-section">
            <span class="bracket-center-title">${finalLabel}</span>
            ${renderCard('M104')}
          </div>

          <div class="bracket-center-section">
            <span class="bracket-center-title">${thirdLabel}</span>
            ${renderCard('M103')}
          </div>
        </div>

        <!-- Right Side (Matches 9-16 of R32, 5-8 of R16, 3-4 of QF, SF-2) -->
        <div class="bracket-side right-side">
          <div class="bracket-round round-sf">
            ${renderCard('M102')}
          </div>
          <div class="bracket-round round-qf">
            ${['M99', 'M100'].map(renderCard).join('')}
          </div>
          <div class="bracket-round round-16">
            ${['M93', 'M94', 'M95', 'M96'].map(renderCard).join('')}
          </div>
          <div class="bracket-round round-32">
            ${['M81', 'M82', 'M83', 'M84', 'M85', 'M86', 'M87', 'M88'].map(renderCard).join('')}
          </div>
        </div>
      </div>`;

    container.innerHTML = html;

    // 3. Update Champion Banner
    const championNameEl = document.getElementById('championName');
    const finalWinnerId = knockoutWinners['M104'];
    if (finalWinnerId && championNameEl) {
      const champ = DataLoader.getTeamById(teams, finalWinnerId);
      if (champ) {
        const champName = Helpers.getTeamName(champ);
        championNameEl.innerHTML = `
          <img src="${Helpers.getFlagUrl(champ.flag_code, 'w40')}" class="flag-icon" style="margin-bottom:var(--space-2)" alt="${champName}">
          <div style="font-size:var(--text-xl); font-weight:var(--font-extrabold); color:var(--text-gold); text-shadow:0 0 10px rgba(197, 168, 128, 0.4)">${champName}</div>`;
      }
    }
  }

  function renderMatchCard(matchId, groupWinners, groupRunnersUp, bestThirds) {
    const matchObj = matches.find(m => m.id === matchId);
    const label = getMatchLabel(matchId);
    
    const { home: homeId, away: awayId } = getMatchTeams(matchId, groupWinners, groupRunnersUp, bestThirds);
    const homeTeam = homeId ? DataLoader.getTeamById(teams, homeId) : null;
    const awayTeam = awayId ? DataLoader.getTeamById(teams, awayId) : null;
    
    const winnerId = knockoutWinners[matchId];
    
    const homeClass = !homeTeam ? 'empty' : (winnerId ? (winnerId === homeId ? 'winner' : 'loser') : '');
    const awayClass = !awayTeam ? 'empty' : (winnerId ? (winnerId === awayId ? 'winner' : 'loser') : '');
    
    const homeName = homeTeam ? Helpers.getTeamName(homeTeam) : (typeof I18n !== 'undefined' ? I18n.t('status_waiting') : '待定 TBD');
    const awayName = awayTeam ? Helpers.getTeamName(awayTeam) : (typeof I18n !== 'undefined' ? I18n.t('status_waiting') : '待定 TBD');

    const homeFlag = homeTeam ? `<img src="${Helpers.getFlagUrl(homeTeam.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${homeName}">` : '';
    const awayFlag = awayTeam ? `<img src="${Helpers.getFlagUrl(awayTeam.flag_code, 'w40')}" class="flag-icon flag-icon-sm" alt="${awayName}">` : '';
    
    const homeClick = homeTeam ? `onclick="BracketPage.selectWinner('${matchId}', '${homeId}')"` : '';
    const awayClick = awayTeam ? `onclick="BracketPage.selectWinner('${matchId}', '${awayId}')"` : '';

    const cityName = matchObj ? (typeof I18n !== 'undefined' ? I18n.getCityName(matchObj.city) : matchObj.city) : '';

    return `
      <div class="bracket-match" data-match-id="${matchId}">
        <div class="bracket-match-header">
          <span>${label}</span>
          <span>${cityName}</span>
        </div>
        <div class="bracket-match-body">
          <div class="bracket-team-row ${homeClass}" ${homeClick}>
            <div class="bracket-team-info">
              ${homeFlag}
              <span class="bracket-team-name">${homeName}</span>
            </div>
          </div>
          <div class="bracket-team-row ${awayClass}" ${awayClick}>
            <div class="bracket-team-info">
              ${awayFlag}
              <span class="bracket-team-name">${awayName}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function autoSimGroupStage() {
    // Loop through group stage matches and set score
    const groupMatches = matches.filter(m => m.stage === 'group');
    
    groupMatches.forEach(m => {
      if (m.home_score !== null) return;
      
      const home = DataLoader.getTeamById(teams, m.home);
      const away = DataLoader.getTeamById(teams, m.away);
      if (!home || !away) return;

      const hs = home.strength?.overall || 70;
      const as = away.strength?.overall || 70;
      
      const diff = hs - as;
      let homeScore, awayScore;
      
      if (diff > 15) {
        homeScore = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
        awayScore = Math.floor(Math.random() * 2); // 0, 1
      } else if (diff < -15) {
        homeScore = Math.floor(Math.random() * 2);
        awayScore = Math.floor(Math.random() * 3) + 2;
      } else {
        const coin = Math.random();
        if (coin < 0.3) {
          homeScore = Math.floor(Math.random() * 3);
          awayScore = homeScore;
        } else if (coin < 0.65) {
          awayScore = Math.floor(Math.random() * 2);
          homeScore = awayScore + Math.floor(Math.random() * 2) + 1;
        } else {
          homeScore = Math.floor(Math.random() * 2);
          awayScore = homeScore + Math.floor(Math.random() * 2) + 1;
        }
      }
      
      Calculator.setResult(m.id, homeScore, awayScore);
    });

    renderBracket();
  }

  function resetBracket() {
    knockoutWinners = {};
    saveKnockouts();
    renderBracket();
  }

  function resetAll() {
    Calculator.clearAll();
    knockoutWinners = {};
    saveKnockouts();
    renderBracket();
  }

  return { init, selectWinner };
})();

document.addEventListener('DOMContentLoaded', () => BracketPage.init());
