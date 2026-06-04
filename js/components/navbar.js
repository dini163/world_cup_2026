/**
 * 2026 FIFA World Cup — Navbar Component
 */

const Navbar = (() => {
  function render() {
    return `
    <nav class="navbar" id="navbar">
      <div class="navbar-inner">
        <a href="index.html" class="navbar-brand">
          <span class="navbar-logo" style="color:var(--color-gold)">🏆</span>
          <div class="navbar-title">
            FIFA 2026
            <span>World Cup</span>
          </div>
        </a>

        <div class="nav-links" id="navLinks">
          <a href="index.html" class="nav-link" data-page="index" data-i18n="nav_home">首页</a>
          <a href="teams.html" class="nav-link" data-page="teams" data-i18n="nav_teams">参赛球队</a>
          <a href="standings.html" class="nav-link" data-page="standings" data-i18n="nav_standings">积分榜</a>
          <a href="schedule.html" class="nav-link" data-page="schedule" data-i18n="nav_schedule">赛程表</a>
          <a href="predictions.html" class="nav-link" data-page="predictions" data-i18n="nav_predictions">AI预测</a>
          <a href="bracket.html" class="nav-link" data-page="bracket" data-i18n="nav_bracket">淘汰赛</a>
          <a href="news.html" class="nav-link" data-page="news" data-i18n="nav_news">新闻中心</a>
        </div>

        <div class="nav-actions">
          <!-- Theme selector -->
          <button class="theme-toggle" id="themeToggle" title="切换主题">
            <span id="themeIcon">🌙</span>
          </button>

          <!-- Language Selector -->
          <div class="lang-selector-wrapper">
            <select class="lang-selector" id="langSelector" aria-label="Language Selector">
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <!-- Spoiler Shield -->
          <button class="spoiler-toggle" id="spoilerToggle" title="防剧透模式">
            <span class="spoiler-toggle-icon" id="spoilerIcon">👁️</span>
            <span id="spoilerLabel" data-i18n="nav_spoiler">防剧透</span>
          </button>

          <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="菜单">
            ☰
          </button>
        </div>
      </div>

      <div class="mobile-nav" id="mobileNav">
        <a href="index.html" class="nav-link" data-page="index" data-i18n="nav_home">首页</a>
        <a href="teams.html" class="nav-link" data-page="teams" data-i18n="nav_teams">参赛球队</a>
        <a href="standings.html" class="nav-link" data-page="standings" data-i18n="nav_standings">积分榜</a>
        <a href="schedule.html" class="nav-link" data-page="schedule" data-i18n="nav_schedule">赛程表</a>
        <a href="predictions.html" class="nav-link" data-page="predictions" data-i18n="nav_predictions">AI预测</a>
        <a href="bracket.html" class="nav-link" data-page="bracket" data-i18n="nav_bracket">淘汰赛</a>
        <a href="news.html" class="nav-link" data-page="news" data-i18n="nav_news">新闻中心</a>

        <!-- Mobile Actions -->
        <div class="mobile-nav-actions">
          <div class="mobile-nav-action-row">
            <span data-i18n="nav_spoiler">防剧透</span>
            <button class="spoiler-toggle" id="mobileSpoilerToggle" style="margin:0;">
              <span id="mobileSpoilerIcon">👁️</span>
            </button>
          </div>
          <div class="mobile-nav-action-row">
            <span>主题 / Theme</span>
            <button class="theme-toggle" id="mobileThemeToggle" style="margin:0;">
              <span id="mobileThemeIcon">🌙</span>
            </button>
          </div>
          <div class="mobile-nav-action-row">
            <span>语言 / Language</span>
            <select class="lang-selector" id="mobileLangSelector" aria-label="Mobile Language Selector">
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </div>
    </nav>`;
  }

  function init() {
    // Highlight current page
    const page = getCurrentPage();
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.page === page) {
        link.classList.add('active');
      }
    });

    // Scroll effect
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      if (!navbar) return;
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });

    // Mobile menu toggle
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        menuBtn.textContent = isOpen ? '✕' : '☰';
      });
    }

    // Spoiler toggle init
    initSpoilerToggle();

    // i18n initialization
    initLanguageSelectors();

    // Theme initialization
    initThemeToggle();

    // Listen to language changes
    window.addEventListener('lang-change', () => {
      const spoilerOn = isSpoilerActive();
      updateSpoiler(spoilerOn);
    });
  }

  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop().replace('.html', '') || 'index';
    return file;
  }

  /* ──────────────── i18n Actions ──────────────── */
  function initLanguageSelectors() {
    const selectors = ['langSelector', 'mobileLangSelector'];
    const currentLang = typeof I18n !== 'undefined' ? I18n.getLanguage() : 'zh-CN';

    selectors.forEach(id => {
      const select = document.getElementById(id);
      if (select) {
        select.value = currentLang;
        select.addEventListener('change', (e) => {
          const newLang = e.target.value;
          if (typeof I18n !== 'undefined') {
            I18n.setLanguage(newLang);
          }
          // Sync other select
          selectors.forEach(otherId => {
            const otherSelect = document.getElementById(otherId);
            if (otherSelect && otherSelect !== select) {
              otherSelect.value = newLang;
            }
          });
        });
      }
    });
    
    // Initial run to translate the page static labels (including nav items)
    if (typeof I18n !== 'undefined') {
      I18n.translatePage();
    }
  }

  /* ──────────────── Theme Actions ──────────────── */
  function initThemeToggle() {
    const theme = localStorage.getItem('world_cup_theme') || 'dark';
    applyTheme(theme);

    const toggles = ['themeToggle', 'mobileThemeToggle'];
    toggles.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          const currentTheme = localStorage.getItem('world_cup_theme') || 'dark';
          let nextTheme = 'dark';
          if (currentTheme === 'dark') nextTheme = 'light';
          else if (currentTheme === 'light') nextTheme = 'auto';
          else nextTheme = 'dark';

          localStorage.setItem('world_cup_theme', nextTheme);
          applyTheme(nextTheme);
        });
      }
    });

    // Listen for OS scheme preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (localStorage.getItem('world_cup_theme') === 'auto') {
        applyTheme('auto');
      }
    });
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    let actualTheme = theme;
    if (theme === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', actualTheme);
    updateThemeIcons(theme);
  }

  function updateThemeIcons(theme) {
    const icons = { dark: '🌙', light: '☀️', auto: '🌓' };
    const desktopIcon = document.getElementById('themeIcon');
    const mobileIcon = document.getElementById('mobileThemeIcon');
    if (desktopIcon) desktopIcon.textContent = icons[theme];
    if (mobileIcon) mobileIcon.textContent = icons[theme];
  }

  /* ──────────────── Spoiler Shield ──────────────── */
  function initSpoilerToggle() {
    const toggles = ['spoilerToggle', 'mobileSpoilerToggle'];
    let spoilerOn = isSpoilerActive();
    updateSpoiler(spoilerOn);

    toggles.forEach(id => {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.addEventListener('click', () => {
          spoilerOn = !spoilerOn;
          localStorage.setItem('wc_spoiler', String(spoilerOn));
          updateSpoiler(spoilerOn);
          document.dispatchEvent(new CustomEvent('spoiler-change', { detail: { active: spoilerOn } }));
          
          // Sync other toggle UI
          toggles.forEach(otherId => {
            const otherToggle = document.getElementById(otherId);
            if (otherToggle && otherToggle !== toggle) {
              if (spoilerOn) otherToggle.classList.add('active');
              else otherToggle.classList.remove('active');
              const iconId = otherId === 'spoilerToggle' ? 'spoilerIcon' : 'mobileSpoilerIcon';
              const iconEl = document.getElementById(iconId);
              if (iconEl) iconEl.textContent = spoilerOn ? '🙈' : '👁️';
            }
          });
        });
      }
    });
  }

  function updateSpoiler(active) {
    const desktopToggle = document.getElementById('spoilerToggle');
    const mobileToggle = document.getElementById('mobileSpoilerToggle');
    const desktopIcon = document.getElementById('spoilerIcon');
    const mobileIcon = document.getElementById('mobileSpoilerIcon');
    const label = document.getElementById('spoilerLabel');

    const i18nLabel = typeof I18n !== 'undefined' ? I18n.t('nav_spoiler') : '防剧透';

    if (desktopToggle) {
      if (active) desktopToggle.classList.add('active');
      else desktopToggle.classList.remove('active');
    }
    if (mobileToggle) {
      if (active) mobileToggle.classList.add('active');
      else mobileToggle.classList.remove('active');
    }

    if (desktopIcon) desktopIcon.textContent = active ? '🙈' : '👁️';
    if (mobileIcon) mobileIcon.textContent = active ? '🙈' : '👁️';
    if (label) label.textContent = i18nLabel;

    if (active) {
      document.body.classList.add('spoiler-mode');
    } else {
      document.body.classList.remove('spoiler-mode');
    }
  }

  function isSpoilerActive() {
    return localStorage.getItem('wc_spoiler') === 'true';
  }

  return { render, init, isSpoilerActive };
})();
