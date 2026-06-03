/**
 * 2026 FIFA World Cup — Teams Page Logic
 */

const TeamsPage = (() => {
  let teams = [];
  let currentFilter = 'all';

  async function init() {
    try {
      teams = await DataLoader.load('teams');
      renderFilters();
      renderTeams(teams);
      initModalClose();

      // Listen for language changes to re-render
      window.addEventListener('lang-change', () => {
        renderFilters();
        filter(currentFilter);
      });
    } catch (err) {
      console.error('[TeamsPage] Init failed:', err);
    }
  }

  function renderFilters() {
    const container = document.getElementById('teamsFilter');
    if (!container) return;

    const filterText = typeof I18n !== 'undefined' ? I18n.t('filter_continent') : '按大洲筛选:';
    const filters = [
      { key: 'all', label: typeof I18n !== 'undefined' ? I18n.t('filter_all') : '全部 All' },
      { key: 'UEFA', label: typeof I18n !== 'undefined' ? I18n.t('filter_uefa') : '🇪🇺 欧洲 UEFA' },
      { key: 'CONMEBOL', label: typeof I18n !== 'undefined' ? I18n.t('filter_conmebol') : '🌎 南美 CONMEBOL' },
      { key: 'CONCACAF', label: typeof I18n !== 'undefined' ? I18n.t('filter_concacaf') : '🌎 北中美 CONCACAF' },
      { key: 'CAF', label: typeof I18n !== 'undefined' ? I18n.t('filter_caf') : '🌍 非洲 CAF' },
      { key: 'AFC', label: typeof I18n !== 'undefined' ? I18n.t('filter_afc') : '🌏 亚洲 AFC' },
      { key: 'OFC', label: typeof I18n !== 'undefined' ? I18n.t('filter_ofc') : '🌊 大洋洲 OFC' },
    ];

    container.innerHTML = `
      <span class="teams-filter-label">${filterText}</span>
      <div class="filter-chips">
        ${filters.map(f => `
          <button class="chip ${f.key === currentFilter ? 'active' : ''}"
                  data-filter="${f.key}"
                  onclick="TeamsPage.filter('${f.key}')">
            ${f.label}
          </button>
        `).join('')}
      </div>`;
  }

  function filter(key) {
    currentFilter = key;
    const filtered = key === 'all' ? teams : teams.filter(t => t.confederation === key);
    renderTeams(filtered);
    renderFilters();
  }

  function renderTeams(list) {
    const container = document.getElementById('teamsGrid');
    if (!container) return;
    // Sort by FIFA ranking
    const sorted = [...list].sort((a, b) => a.fifa_ranking - b.fifa_ranking);
    TeamCard.renderGrid(sorted, container);
  }

  function initModalClose() {
    const overlay = document.getElementById('teamModal');
    if (!overlay) return;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) TeamCard.closeModal();
    });

    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => TeamCard.closeModal());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') TeamCard.closeModal();
    });
  }

  return { init, filter };
})();

document.addEventListener('DOMContentLoaded', () => TeamsPage.init());
