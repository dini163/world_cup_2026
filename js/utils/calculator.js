/**
 * 2026 FIFA World Cup — Qualification Calculator
 * Simulates group stage results and determines Round of 32 qualifiers
 */

const Calculator = (() => {
  // Store user simulated results: key = matchId, value = { homeScore, awayScore }
  let simulations = {};

  // Load from localStorage on initialization
  try {
    const saved = localStorage.getItem('wc_group_simulations');
    if (saved) {
      simulations = JSON.parse(saved);
    }
  } catch (err) {
    console.error('[Calculator] Failed to load simulations from localStorage:', err);
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('wc_group_simulations', JSON.stringify(simulations));
    } catch (err) {
      console.error('[Calculator] Failed to save simulations to localStorage:', err);
    }
  }

  function setResult(matchId, homeScore, awayScore) {
    simulations[matchId] = { homeScore, awayScore };
    saveToLocalStorage();
  }

  function clearResult(matchId) {
    delete simulations[matchId];
    saveToLocalStorage();
  }

  function clearAll() {
    simulations = {};
    saveToLocalStorage();
  }

  function getSimulation(matchId) {
    return simulations[matchId] || null;
  }

  /**
   * Apply simulations on top of real match data and compute full standings
   * @param {Array} allMatches - all matches
   * @param {Array} teamsData - all teams for ranking fallback
   * @returns {{ groupStandings, thirdPlaced, qualified }}
   */
  function computeFullStandings(allMatches, teamsData) {
    const groups = Helpers.GROUPS;
    const groupStandings = {};

    // Create a copy of matches with simulations applied
    const effectiveMatches = allMatches.map(m => {
      const sim = simulations[m.id];
      if (sim && m.home_score === null) {
        return { ...m, home_score: sim.homeScore, away_score: sim.awayScore };
      }
      return m;
    });

    // Calculate standings for each group
    groups.forEach(g => {
      const standings = Helpers.calculateGroupStandings(effectiveMatches, g);
      groupStandings[g] = Helpers.sortStandings(standings, teamsData);
    });

    // Determine qualified teams
    const qualified = new Set();
    const eliminated = new Set();
    const thirdPlaced = [];

    groups.forEach(g => {
      const sorted = groupStandings[g];
      if (sorted.length >= 2) {
        // Top 2 automatically qualify
        qualified.add(sorted[0].team);
        qualified.add(sorted[1].team);

        // Third place goes to ranking
        if (sorted.length >= 3) {
          thirdPlaced.push({ ...sorted[2], group: g });
        }
        // Fourth is out
        if (sorted.length >= 4) {
          eliminated.add(sorted[3].team);
        }
      }
    });

    // Sort third-placed teams
    const sortedThirds = Helpers.sortStandings(thirdPlaced, teamsData);
    sortedThirds.forEach((t, i) => {
      if (i < 8) {
        qualified.add(t.team);
        t.qualifies = true;
      } else {
        eliminated.add(t.team);
        t.qualifies = false;
      }
    });

    return {
      groupStandings,
      thirdPlaced: sortedThirds,
      qualified,
      eliminated,
      simulations: { ...simulations },
    };
  }

  /**
   * Quick simulation: set win/draw/loss for a match
   */
  function simulateOutcome(matchId, outcome, home, away) {
    switch (outcome) {
      case 'home':
        setResult(matchId, 1, 0);
        break;
      case 'draw':
        setResult(matchId, 0, 0);
        break;
      case 'away':
        setResult(matchId, 0, 1);
        break;
      case 'clear':
        clearResult(matchId);
        break;
    }
  }

  function hasSimulations() {
    return Object.keys(simulations).length > 0;
  }

  return {
    setResult,
    clearResult,
    clearAll,
    getSimulation,
    computeFullStandings,
    simulateOutcome,
    hasSimulations,
  };
})();
