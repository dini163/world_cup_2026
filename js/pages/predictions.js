/**
 * 2026 FIFA World Cup — AI Predictions Page Logic
 */

const PredictionsPage = (() => {
  let teams = [];
  let matches = [];
  let predictions = {};
  let predMatches = []; // matches that have predictions
  let allDates = [];
  let currentDate = '';
  let searchText = '';
  
  // Track active persona ('expert' or 'poison') for each match card
  let activePersonas = {};

  async function init() {
    try {
      // Load data
      const allData = await DataLoader.loadAll();
      teams = allData.teams;
      matches = allData.matches;
      
      predictions = await DataLoader.load('predictions');
      
      // Filter matches that actually have predictions
      predMatches = matches.filter(m => predictions[m.id]);
      
      // Get all unique dates of matches that have predictions
      allDates = [...new Set(predMatches.map(m => m.date))];
      allDates.sort();

      // Default to first prediction date
      if (allDates.length > 0) {
        const today = Helpers.getToday();
        if (allDates.includes(today)) {
          currentDate = today;
        } else {
          currentDate = allDates[0];
        }
      }

      // Initialize default personas
      predMatches.forEach(m => {
        activePersonas[m.id] = 'expert';
      });

      // Bind search event
      const searchInput = document.getElementById('teamSearch');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchText = e.target.value.trim().toLowerCase();
          renderContent();
        });
      }

      renderDateSelector();
      renderContent();

      // Listen for language changes to re-render
      window.addEventListener('lang-change', () => {
        renderDateSelector();
        renderContent();
      });
    } catch (err) {
      console.error('[PredictionsPage] Init failed:', err);
    }
  }

  function renderDateSelector() {
    const container = document.getElementById('dateSelector');
    if (!container) return;

    if (allDates.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="filter-chips" style="justify-content: center; overflow-x: auto; white-space: nowrap; padding-bottom: var(--space-2)">
        ${allDates.map(date => `
          <button class="chip ${date === currentDate ? 'active' : ''}" 
                  data-date="${date}"
                  onclick="PredictionsPage.setDate('${date}')">
            ${Helpers.formatDate(date)}
          </button>
        `).join('')}
      </div>`;
  }

  function setDate(date) {
    currentDate = date;
    renderDateSelector();
    renderContent();
  }

  function getTranslatedComment(match, home, away, type) {
    const lang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'zh-CN';
    const pred = predictions[match.id];
    if (!pred) return '';
    if (lang === 'zh-CN') {
      return type === 'expert' ? pred.expertComment : pred.poisonComment;
    }

    const homeName = Helpers.getTeamName(home);
    const awayName = Helpers.getTeamName(away);
    const playerA = home.key_players && home.key_players[0] ? home.key_players[0] : 'Key Player';
    const playerB = away.key_players && away.key_players[0] ? away.key_players[0] : 'Key Player';

    if (type === 'expert') {
      if (lang === 'en') {
        return `The matchup between ${homeName} and ${awayName} hinges on midfield efficiency. ${playerA} and ${playerB}, as key players for their respective sides, will play a decisive role. With both teams closely matched, expect a hard-fought defensive battle, likely resulting in a draw.`;
      }
      if (lang === 'es') {
        return `El enfrentamiento entre ${homeName} y ${awayName} depende de la eficiencia del mediocampo. ${playerA} y ${playerB}, como jugadores clave de sus respectivos equipos, jugarán un papel decisivo. Con ambos equipos muy igualados, se espera una dura batalla defensiva, probablemente resultando en un empate.`;
      }
      if (lang === 'fr') {
        return `La confrontation entre ${homeName} et ${awayName} dépend de l'efficacité du milieu de terrain. ${playerA} et ${playerB}, en tant que joueurs clés de leurs équipes respectives, joueront un rôle décisif. Les deux équipes étant très proches, on s'attend à une dure bataille défensive, se terminant probablement par un match nul.`;
      }
    } else {
      if (lang === 'en') {
        return `A draw? Impossible, never in this lifetime! One of them must fall. My ultimate prediction is a goals galore where both defenses will be wide open! Mark my words: go for high goals, both backlines are acting as charities today!`;
      }
      if (lang === 'es') {
        return `¿Un empate? ¡Imposible, nunca en la vida! Uno de ellos debe caer. ¡Mi predicción definitiva es un festival de goles donde ambas defensas estarán totalmente abiertas! Escúchame: apuesta por goles altos, ¡ambas líneas defensas actúan como caridad hoy!`;
      }
      if (lang === 'fr') {
        return `Un match nul ? Impossible, jamais de la vie ! L'un d'eux doit tomber. Ma prédiction ultime est un festival de buts où les deux défenses seront totalement ouvertes ! Écoutez-moi : pariez sur beaucoup de buts, les deux lignes défensives font de la charité aujourd'hui !`;
      }
    }
    return type === 'expert' ? pred.expertComment : pred.poisonComment;
  }

  function togglePersona(matchId, persona) {
    activePersonas[matchId] = persona;
    
    const cardEl = document.querySelector(`.pred-card[data-match-id="${matchId}"]`);
    if (!cardEl) return;

    const expertBtn = cardEl.querySelector('.pred-persona-btn.expert');
    const poisonBtn = cardEl.querySelector('.pred-persona-btn.poison');
    const commentBox = cardEl.querySelector('.pred-comment-box');
    
    const match = matches.find(m => m.id === matchId);
    const home = DataLoader.getTeamById(teams, match.home);
    const away = DataLoader.getTeamById(teams, match.away);
    const pred = predictions[matchId];
    if (!pred || !home || !away) return;

    if (persona === 'expert') {
      expertBtn.classList.add('active');
      poisonBtn.classList.remove('active');
      commentBox.className = 'pred-comment-box expert-active';
      commentBox.textContent = getTranslatedComment(match, home, away, 'expert');
    } else {
      expertBtn.classList.remove('active');
      poisonBtn.classList.add('active');
      commentBox.className = 'pred-comment-box poison-active';
      commentBox.textContent = getTranslatedComment(match, home, away, 'poison');
    }
  }

  function renderContent() {
    const grid = document.getElementById('predictionsGrid');
    if (!grid) return;

    let filteredMatches = predMatches;
    
    if (currentDate) {
      filteredMatches = filteredMatches.filter(m => m.date === currentDate);
    }

    if (searchText) {
      filteredMatches = filteredMatches.filter(m => {
        const home = DataLoader.getTeamById(teams, m.home);
        const away = DataLoader.getTeamById(teams, m.away);
        const homeName = home ? Helpers.getTeamName(home).toLowerCase() : '';
        const awayName = away ? Helpers.getTeamName(away).toLowerCase() : '';
        return homeName.includes(searchText) || awayName.includes(searchText);
      });
    }

    if (filteredMatches.length === 0) {
      const emptyTitle = typeof I18n !== 'undefined' ? I18n.t('no_predictions_found') : '未找到匹配的预测';
      const emptyDesc = typeof I18n !== 'undefined' ? I18n.t('change_date_or_search') : '请尝试更改日期或搜索条件';
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; width: 100%">
          <div class="empty-state-title">${emptyTitle}</div>
          <div class="empty-state-desc">${emptyDesc}</div>
        </div>`;
      return;
    }

    const groupText = typeof I18n !== 'undefined' ? I18n.t('group') : 'Group';
    const predScoreText = typeof I18n !== 'undefined' ? I18n.t('ai_score_label') : 'AI 预测比分';
    const winHomeText = typeof I18n !== 'undefined' ? I18n.t('win_home') : '胜';
    const winAwayText = typeof I18n !== 'undefined' ? I18n.t('win_away') : '负';
    const winDrawText = typeof I18n !== 'undefined' ? I18n.t('win_draw') : '平';
    const personaExpertText = typeof I18n !== 'undefined' ? I18n.t('persona_expert') : '👨‍🏫 理智懂球帝';
    const personaPoisonText = typeof I18n !== 'undefined' ? I18n.t('persona_poison') : '🦑 乌贼毒奶机';

    grid.innerHTML = filteredMatches.map(m => {
      const pred = predictions[m.id];
      const home = DataLoader.getTeamById(teams, m.home);
      const away = DataLoader.getTeamById(teams, m.away);
      if (!home || !away || !pred) return '';

      const persona = activePersonas[m.id] || 'expert';
      const commentText = getTranslatedComment(m, home, away, persona);
      const commentClass = persona === 'expert' ? 'expert-active' : 'poison-active';
      
      const groupLabel = m.group ? `${groupText} ${m.group}` : Helpers.getStageName(m.stage);
      const homeName = Helpers.getTeamName(home);
      const awayName = Helpers.getTeamName(away);
      const cityName = typeof I18n !== 'undefined' ? I18n.getCityName(m.city) : m.city;

      return `
        <div class="card pred-card" data-match-id="${m.id}">
          <div class="pred-card-header">
            <span>${groupLabel}</span>
            <span>${m.time} · ${m.venue} (${cityName})</span>
          </div>

          <div class="pred-teams">
            <div class="pred-team">
              <img src="${Helpers.getFlagUrl(home.flag_code, 'w40')}" class="flag-icon" alt="${homeName}">
              <span class="pred-team-name">${homeName}</span>
              <span style="font-size:0.7rem; color:var(--text-tertiary)">FIFA #${home.fifa_ranking}</span>
            </div>
            
            <div class="pred-score-center">
              <span class="pred-predicted-label">${predScoreText}</span>
              <span class="pred-score-value">${pred.predictedScore}</span>
            </div>

            <div class="pred-team">
              <img src="${Helpers.getFlagUrl(away.flag_code, 'w40')}" class="flag-icon" alt="${awayName}">
              <span class="pred-team-name">${awayName}</span>
              <span style="font-size:0.7rem; color:var(--text-tertiary)">FIFA #${away.fifa_ranking}</span>
            </div>
          </div>

          <!-- Probability Bar -->
          <div class="pred-probabilities">
            <div class="pred-prob-labels">
              <span class="pred-prob-label win">${winHomeText} ${pred.homeProb}%</span>
              <span class="pred-prob-label draw">${winDrawText} ${pred.drawProb}%</span>
              <span class="pred-prob-label lose">${winAwayText} ${pred.awayProb}%</span>
            </div>
            <div class="pred-prob-bar">
              <div class="pred-prob-segment home" style="width: ${pred.homeProb}%"></div>
              <div class="pred-prob-segment draw" style="width: ${pred.drawProb}%"></div>
              <div class="pred-prob-segment away" style="width: ${pred.awayProb}%"></div>
            </div>
          </div>

          <!-- Persona Toggles -->
          <div class="pred-persona-toggles">
            <button class="pred-persona-btn expert ${persona === 'expert' ? 'active' : ''}" 
                    onclick="PredictionsPage.togglePersona('${m.id}', 'expert')">
              ${personaExpertText}
            </button>
            <button class="pred-persona-btn poison ${persona === 'poison' ? 'active' : ''}" 
                    onclick="PredictionsPage.togglePersona('${m.id}', 'poison')">
              ${personaPoisonText}
            </button>
          </div>

          <!-- Comment Box -->
          <div class="pred-comment-box ${commentClass}">
            ${commentText}
          </div>
        </div>`;
    }).join('');
  }

  return { init, setDate, togglePersona };
})();

document.addEventListener('DOMContentLoaded', () => PredictionsPage.init());
