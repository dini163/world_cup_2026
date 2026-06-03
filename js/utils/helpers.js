/**
 * 2026 FIFA World Cup — Utility Helpers
 */

const Helpers = (() => {
  const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  /** Format date string for display */
  function formatDate(dateStr, style = 'long') {
    const d = new Date(dateStr + 'T00:00:00');
    if (style === 'short') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (style === 'weekday') {
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  /** Format date for the Chinese locale */
  function formatDateCN(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['日','一','二','三','四','五','六'];
    return `${m}月${day}日 周${weekdays[d.getDay()]}`;
  }

  /** Get today's date as YYYY-MM-DD */
  function getToday() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /** Check if a date is today */
  function isToday(dateStr) {
    return dateStr === getToday();
  }

  /** Check if date is in the past */
  function isPast(dateStr) {
    return dateStr < getToday();
  }

  /** Check if date is in the future */
  function isFuture(dateStr) {
    return dateStr > getToday();
  }

  /** Days until a date */
  function daysUntil(dateStr) {
    const now = new Date();
    const target = new Date(dateStr + 'T00:00:00');
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /** Get flag CDN URL */
  function getFlagUrl(code, size = 'w40') {
    if (!code) return '';
    // Handle special codes
    const mapped = {
      'gb-eng': 'gb-eng',
      'gb-sct': 'gb-sct',
    };
    const c = mapped[code] || code;
    return `https://flagcdn.com/${size}/${c}.png`;
  }

  /** Sort standings by FIFA rules: points > GD > GF > discipline > ranking */
  function sortStandings(standings, teamsData) {
    return [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      // Fall back to FIFA ranking (lower = better)
      const teamA = teamsData?.find(t => t.id === a.team);
      const teamB = teamsData?.find(t => t.id === b.team);
      return (teamA?.fifa_ranking || 999) - (teamB?.fifa_ranking || 999);
    });
  }

  /** Calculate standings from match results for a group */
  function calculateGroupStandings(matches, group) {
    const groupMatches = matches.filter(m => m.group === group && m.stage === 'group');
    const teams = {};

    // Init
    groupMatches.forEach(m => {
      [m.home, m.away].forEach(id => {
        if (id && !teams[id]) {
          teams[id] = { team: id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
        }
      });
    });

    // Process completed matches
    groupMatches.forEach(m => {
      if (m.home_score === null || m.away_score === null) return;
      const h = teams[m.home];
      const a = teams[m.away];
      if (!h || !a) return;

      h.played++; a.played++;
      h.gf += m.home_score; h.ga += m.away_score;
      a.gf += m.away_score; a.ga += m.home_score;
      h.gd = h.gf - h.ga;
      a.gd = a.gf - a.ga;

      if (m.home_score > m.away_score) {
        h.won++; h.points += 3;
        a.lost++;
      } else if (m.home_score < m.away_score) {
        a.won++; a.points += 3;
        h.lost++;
      } else {
        h.drawn++; h.points += 1;
        a.drawn++; a.points += 1;
      }
    });

    return Object.values(teams);
  }

  /** Get best third-placed teams across all groups */
  function getBestThirdPlaced(allGroupStandings, teamsData) {
    const thirds = [];
    Object.keys(allGroupStandings).forEach(group => {
      const sorted = sortStandings(allGroupStandings[group], teamsData);
      if (sorted.length >= 3) {
        thirds.push({ ...sorted[2], group });
      }
    });

    const sorted = sortStandings(thirds, teamsData);
    return sorted.map((t, i) => ({ ...t, qualifies: i < 8 }));
  }

  /** Debounce function */
  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(null, args), ms);
    };
  }

  /** Throttle function */
  function throttle(fn, ms = 100) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(null, args);
      }
    };
  }

  /** Scroll animation observer */
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
    return observer;
  }

  /** Create element with classes and attributes */
  function createElement(tag, classNames = '', attrs = {}) {
    const el = document.createElement(tag);
    if (classNames) el.className = classNames;
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    });
    return el;
  }

  /** Escape HTML */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /** Get stage display name */
  function getStageName(stage) {
    if (typeof I18n !== 'undefined') {
      return I18n.getStageName(stage);
    }
    const names = {
      group: '小组赛 Group Stage',
      round32: '32强 Round of 32',
      round16: '16强 Round of 16',
      quarter: '1/4决赛 Quarter-finals',
      semi: '半决赛 Semi-finals',
      third: '季军赛 Third-place',
      final: '决赛 Final',
    };
    return names[stage] || stage;
  }

  function getStageShort(stage) {
    if (typeof I18n !== 'undefined') {
      const lang = I18n.getLanguage();
      if (lang !== 'zh-CN') {
        const names = {
          group: 'Group',
          round32: 'R32',
          round16: 'R16',
          quarter: 'QF',
          semi: 'SF',
          third: '3rd',
          final: 'Final',
        };
        return names[stage] || stage;
      }
    }
    const names = {
      group: '小组赛',
      round32: '32强',
      round16: '16强',
      quarter: '8强',
      semi: '半决赛',
      third: '季军赛',
      final: '决赛',
    };
    return names[stage] || stage;
  }

  /** Get team name */
  function getTeamName(team) {
    if (typeof I18n !== 'undefined') {
      return I18n.getTeamName(team);
    }
    if (typeof team === 'object') {
      return team.name_cn || team.name;
    }
    return team;
  }

  return {
    GROUPS,
    formatDate,
    formatDateCN,
    getToday,
    isToday,
    isPast,
    isFuture,
    daysUntil,
    getFlagUrl,
    sortStandings,
    calculateGroupStandings,
    getBestThirdPlaced,
    debounce,
    throttle,
    initScrollAnimations,
    createElement,
    escapeHtml,
    getStageName,
    getStageShort,
    getTeamName,
  };
})();

