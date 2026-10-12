/* Explicit locale URLs always win. Automatic selection applies only to neutral URLs. */
window.chooseLanguage = function (route, supported = ['tr', 'en']) {
  let preferred;
  try { preferred = localStorage.getItem('hk-language'); } catch { /* Storage can be disabled. */ }
  const primary = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase().split(/[-_]/)[0];
  const language = supported.includes(preferred) ? preferred : supported.includes(primary) ? primary : 'en';
  location.replace('/' + language + '/' + route + location.search + location.hash);
};
