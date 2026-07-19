/* ==========================================================================
   Vercel Web Analytics and Speed Insights bootstrap.

   Lives in its own file rather than an inline <script> so the Content
   Security Policy can stay at `script-src 'self'` — no 'unsafe-inline'.

   PRIVACY, and the reason this file exists at all: the page keeps its state
   in the query string, so a URL looks like

       /?income=185000&status=mfj&state=NJ&k401=24500&hsa=4400

   Shipping that to an analytics backend would mean logging strangers'
   salaries and retirement balances. The `beforeSend` hooks strip every
   financial parameter before the beacon leaves the browser. Only `state`
   and `status` survive: useful in aggregate, and they identify nobody.

   Requires Web Analytics and/or Speed Insights to be enabled in the Vercel
   dashboard. The companion script (/_vercel/insights/script.js) handles both
   products through dynamic endpoint discovery. 404s when running locally or
   on any non-Vercel host — expected, and harmless.
   ========================================================================== */
(function () {
  'use strict';

  var SENSITIVE = ['income', 'k401', 'hsa', 'fsa', 'dcfsa', 'ira'];

  // Web Analytics initialization
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  // Speed Insights initialization  
  window.si = window.si || function () {
    (window.siq = window.siq || []).push(arguments);
  };

  // Privacy filter for Web Analytics
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

  // Privacy filter for Speed Insights (if needed in future)
  // Speed Insights primarily sends performance metrics, not URLs with query params,
  // but we initialize the hook in case custom events are added later.
  window.si('beforeSend', function (event) {
    try {
      // Speed Insights events don't typically include URLs with sensitive query params,
      // but apply the same filter for consistency if a URL is present
      if (event.url) {
        var u = new URL(event.url);
        SENSITIVE.forEach(function (k) { u.searchParams.delete(k); });
        var out = {};
        for (var key in event) { if (Object.prototype.hasOwnProperty.call(event, key)) out[key] = event[key]; }
        out.url = u.toString();
        return out;
      }
      return event;
    } catch (e) {
      return null;
    }
  });
})();
