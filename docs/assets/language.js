/* Explicit locale URLs always win. Automatic selection applies only to neutral URLs. */
window.chooseLanguage = function (route) {
  let preferred;
  try { preferred = localStorage.getItem('hk-language'); } catch { /* Storage can be disabled. */ }
  const primary = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
  const language = ['tr', 'en'].includes(preferred) ? preferred : primary.startsWith('tr') ? 'tr' : 'en';
  location.replace('/' + language + '/' + route + location.search + location.hash);
};
