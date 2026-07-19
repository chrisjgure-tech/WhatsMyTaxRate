/* ==========================================================================
   Vercel Web Analytics bootstrap.

   Lives in its own file rather than an inline <script> so the Content
   Security Policy can stay at `script-src 'self'` — no 'unsafe-inline'.

   PRIVACY, and the reason this file exists at all: the page keeps its state
   in the query string, so a URL looks like

       /?income=185000&status=mfj&state=NJ&k401=24500&hsa=4400

   Shipping that to an analytics backend would mean logging strangers'
   salaries and retirement balances. `beforeSend` strips every financial
   parameter before the beacon leaves the browser. Only `state` and `status`
   survive: useful in aggregate, and they identify nobody.

   Requires Web Analytics to be enabled in the Vercel dashboard
   (Project → Analytics → Enable). The companion script 404s when running
   locally or on any non-Vercel host — expected, and harmless.
   ========================================================================== */
(function () {
  'use strict';

  var SENSITIVE = ['income', 'k401', 'hsa', 'fsa', 'dcfsa', 'ira'];

  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  window.va('beforeSend', function (event) {
    try {
      var u = new URL(event.url);
      SENSITIVE.forEach(function (k) { u.searchParams.delete(k); });
      var out = {};
      for (var key in event) { if (Object.prototype.hasOwnProperty.call(event, key)) out[key] = event[key]; }
      out.url = u.toString();
      return out;
    } catch (e) {
      // Analytics must never be able to break the page. Drop the event
      // rather than risk sending something unredacted.
      return null;
    }
  });
})();
