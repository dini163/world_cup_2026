/**
 * 2026 FIFA World Cup — Global App Init
 */

const App = (() => {
  function init() {
    // Insert navbar
    const navPlaceholder = document.getElementById('navPlaceholder');
    if (navPlaceholder) {
      navPlaceholder.innerHTML = Navbar.render();
      Navbar.init();
    }

    // Insert footer
    const footerPlaceholder = document.getElementById('footerPlaceholder');
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = renderFooter();
    }

    // Init scroll animations
    Helpers.initScrollAnimations();

    // Re-run page translation to translate both navbar and footer
    if (typeof I18n !== 'undefined') {
      I18n.translatePage();
    }
  }

  function renderFooter() {
    return `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-brand-name">⚽ FIFA World Cup 2026</div>
          <p data-i18n="footer_desc">2026 美加墨世界杯专题网站<br>实时数据 · AI 预测 · 球迷互动</p>
        </div>
        <div class="footer-section">
          <h4 data-i18n="footer_features">核心功能</h4>
          <div class="footer-links">
            <a href="teams.html" data-i18n="nav_teams">球队全景</a>
            <a href="standings.html" data-i18n="nav_standings">积分排名</a>
            <a href="schedule.html" data-i18n="nav_schedule">完整赛程</a>
          </div>
        </div>
        <div class="footer-section">
          <h4 data-i18n="footer_tournament">赛事信息</h4>
          <div class="footer-links">
            <a href="#" data-i18n="footer_dates">比赛日: 6/11 - 7/19</a>
            <a href="#" data-i18n="footer_cities">16座城市 · 3个国家</a>
            <a href="#" data-i18n="footer_matches">104场比赛</a>
          </div>
        </div>
        <div class="footer-section">
          <h4 data-i18n="footer_about">关于</h4>
          <div class="footer-links">
            <a href="#" data-i18n="footer_source">数据来源: FIFA</a>
            <a href="#" data-i18n="footer_static">静态站点 · GitHub Pages</a>
            <a href="#" data-i18n="footer_open">开源项目</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span data-i18n="footer_copy">© 2026 World Cup Fan Site · 非官方 · 仅供球迷参考</span>
        <div class="footer-social">
          <a href="#" title="GitHub">🐙</a>
          <a href="#" title="Twitter">🐦</a>
        </div>
      </div>
    </footer>`;
  }

  return { init };
})();

// Auto-init when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
