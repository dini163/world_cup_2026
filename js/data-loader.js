/**
 * 2026 FIFA World Cup — Data Loader
 * Centralized JSON data loading with caching
 */

const DataLoader = (() => {
  const cache = {};
  const DATA_DIR = 'data';

  const files = {
    teams: `${DATA_DIR}/teams.json`,
    matches: `${DATA_DIR}/matches.json`,
    predictions: `${DATA_DIR}/predictions.json`,
  };

  async function load(key) {
    if (cache[key]) return cache[key];

    const url = files[key];
    if (!url) throw new Error(`Unknown data key: ${key}`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache[key] = data;
      return data;
    } catch (err) {
      console.error(`[DataLoader] Failed to load ${key}:`, err);
      throw err;
    }
  }

  async function loadAll() {
    const [teams, matchesData] = await Promise.all([
      load('teams'),
      load('matches'),
    ]);
    return { teams, matches: matchesData.matches, venues: matchesData.venues };
  }

  function getTeamById(teams, id) {
    return teams.find(t => t.id === id) || null;
  }

  function getTeamsByGroup(teams, group) {
    return teams.filter(t => t.group === group);
  }

  function getMatchesByGroup(matches, group) {
    return matches.filter(m => m.group === group);
  }

  function getMatchesByDate(matches, dateStr) {
    return matches.filter(m => m.date === dateStr);
  }

  function getMatchesByStage(matches, stage) {
    return matches.filter(m => m.stage === stage);
  }

  function getGroupMatches(matches) {
    return matches.filter(m => m.stage === 'group');
  }

  function getAllGroups() {
    return ['A','B','C','D','E','F','G','H','I','J','K','L'];
  }

  function getAllDates(matches) {
    const dates = [...new Set(matches.map(m => m.date))];
    dates.sort();
    return dates;
  }

  function clearCache() {
    Object.keys(cache).forEach(k => delete cache[k]);
  }

  return {
    load,
    loadAll,
    getTeamById,
    getTeamsByGroup,
    getMatchesByGroup,
    getMatchesByDate,
    getMatchesByStage,
    getGroupMatches,
    getAllGroups,
    getAllDates,
    clearCache,
  };
})();
