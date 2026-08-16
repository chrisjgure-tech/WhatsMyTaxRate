/* ==========================================================================
   Google Ads global site tag (gtag.js) bootstrap.

   Lives in its own file — not inline — so the Content Security Policy can keep
   script-src strict (no 'unsafe-inline'). The remote tag is loaded from
   googletagmanager.com, which the CSP allows explicitly.

   PRIVACY, and the reason this file isn't the copy-pasted Google snippet:
   this page keeps its state in the query string, so a URL carries the
   visitor's income, Social Security benefit, and retirement contributions.
   Google Ads/Analytics logs page_location by default — which would send all
   of that to Google. We override page_location with a redacted URL that strips
   every financial parameter before anything leaves the browser.

   Also gated to the production host, so local and preview loads don't pollute
   the ad account's data.
   ========================================================================== */
(function () {
  'use strict';
  // Production only — but accept www too (it still serves the site until the
  // www→apex redirect is set), so no conversions are missed.
  if (location.hostname !== 'whatsmytaxrate.com' && location.hostname !== 'www.whatsmytaxrate.com') return;

  var SENSITIVE = ['income', 'ss', 'oi', 'k401', 'hsa', 'fsa', 'dcfsa', 'ira', 'pt', 'mi', 'ch', 'med'];

  function redactedLocation() {
    try {
      var u = new URL(location.href);
      SENSITIVE.forEach(function (k) { u.searchParams.delete(k); });
      return u.toString();
    } catch (e) {
      return location.origin + location.pathname;
    }
  }

  var ID = 'AW-18364877636';

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', ID, {
    page_location: redactedLocation(),
    // Don't let Google collapse the redacted URL back to the raw one.
    allow_enhanced_conversions: false
  });

  // Load the remote tag last, only on production.
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
})();
