/* ==========================================================================
   What's My Tax Rate — application logic
   Vanilla JS, no dependencies, no build step.
   ========================================================================== */
(function () {
  'use strict';

  var F = window.TAX_FEDERAL;
  var S = window.TAX_STATES;
  var H = window.TAX_HISTORY;

  /* ---------------------------------------------------------------- utils */

  var $ = function (id) { return document.getElementById(id); };

  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function moneyPrecise(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  /* FIX #2 — every rate on the page goes through here. Nothing renders a raw
     float ever again. */
  function pct(n, dp) {
    if (!isFinite(n)) n = 0;
    return n.toFixed(dp === undefined ? 1 : dp) + '%';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------ tax engine */

  // Walk a bracket array, returning total tax, the marginal rate reached, and
  // a per-bracket ledger. Shared by federal and graduated-state calculations.
  function applyBrackets(taxable, brackets) {
    var tax = 0, marginal = 0, rows = [];
    for (var i = 0; i < brackets.length; i++) {
      var b = brackets[i];
      var top = (b.max === null || b.max === undefined) ? Infinity : b.max;
      var amt = clamp(taxable - b.min, 0, top - b.min);
      var owed = amt * b.rate;
      if (amt > 0) { tax += owed; marginal = b.rate; }
      rows.push({ rate: b.rate, min: b.min, max: top, amount: amt, tax: owed });
    }
    return { tax: tax, marginal: marginal, rows: rows };
  }

  function federal(gross, status) {
    var std = F.standardDeduction[status];
    var taxable = Math.max(0, gross - std);
    var r = applyBrackets(taxable, F.brackets[status]);
    return {
      standardDeduction: std,
      taxable: taxable,
      tax: r.tax,
      marginal: r.marginal,
      rows: r.rows
    };
  }

  // FIX #17 — wage-base cap, and the Additional Medicare Tax above the
  // filing-status threshold, are both modelled explicitly.
  function fica(gross, status) {
    var ss = Math.min(gross, F.fica.ssWageBase) * F.fica.ssRate;
    var medicare = gross * F.fica.medicareRate;
    var addlThreshold = F.fica.addlMedicareThreshold[status];
    var addl = Math.max(0, gross - addlThreshold) * F.fica.addlMedicareRate;
    return {
      ss: ss,
      medicare: medicare,
      addl: addl,
      tax: ss + medicare + addl,
      // Marginal FICA on the next dollar — drops to 1.45% above the wage base.
      marginal: (gross < F.fica.ssWageBase ? F.fica.ssRate : 0)
              + F.fica.medicareRate
              + (gross >= addlThreshold ? F.fica.addlMedicareRate : 0)
    };
  }

  /* FIX (P0 from the audit) — state tax is computed on STATE taxable income:
     gross minus that state's own standard deduction, then its own brackets,
     then any personal-exemption credit. It is never a flat rate on gross. */
  function state(gross, status, code) {
    var st = S[code];
    if (!st || st.type === 'none') {
      return { tax: 0, marginal: 0, taxable: 0, standardDeduction: 0, name: st ? st.name : '', none: true };
    }
    var std = (st.standardDeduction && st.standardDeduction[status]) || 0;
    var taxable = Math.max(0, gross - std);
    var brackets = st.brackets[status] || st.brackets.single;
    var r = applyBrackets(taxable, brackets);
    var credit = (st.personalExemptionCredit && st.personalExemptionCredit[status]) || 0;
    var tax = Math.max(0, r.tax - credit);
    return {
      tax: tax,
      marginal: r.marginal,
      taxable: taxable,
      standardDeduction: std,
      credit: credit,
      name: st.name,
      none: false
    };
  }

  function compute(gross, status, code) {
    var f = federal(gross, status);
    var c = fica(gross, status);
    var s = state(gross, status, code);
    var total = f.tax + c.tax + s.tax;
    return {
      gross: gross,
      federal: f,
      fica: c,
      state: s,
      totalTax: total,
      takeHome: gross - total,
      fedEffective: gross > 0 ? (f.tax / gross) * 100 : 0,
      fedMarginal: f.marginal * 100,
      allInEffective: gross > 0 ? (total / gross) * 100 : 0,
      allInMarginal: (f.marginal + c.marginal + s.marginal) * 100
    };
  }

  /* -------------------------------------------------------------- state UI */

  var STATUSES = [
    { key: 'single', label: 'Single' },
    { key: 'mfj',    label: 'Married, joint' },
    { key: 'hoh',    label: 'Head of household' },
    { key: 'mfs',    label: 'Married, separate' }
  ];
  var QUICKPICKS = [50000, 75000, 100000, 150000, 250000];
  var RAISE_AMOUNTS = [1000, 5000, 10000];

  var ui = { gross: 75000, status: 'single', state: 'NC', raise: 1000 };

  /* FIX #9 — the whole state of the page lives in the URL, so any result is
     a shareable link. */
  function readURL() {
    var p = new URLSearchParams(location.search);
    var inc = parseInt(p.get('income'), 10);
    if (isFinite(inc) && inc >= 0) ui.gross = clamp(inc, 0, F.maxIncome);
    var st = p.get('status');
    if (st && F.standardDeduction[st] !== undefined) ui.status = st;
    var stt = (p.get('state') || '').toUpperCase();
    if (stt && S[stt]) ui.state = stt;
  }

  function writeURL() {
    var p = new URLSearchParams();
    p.set('income', String(ui.gross));
    p.set('status', ui.status);
    p.set('state', ui.state);
    history.replaceState(null, '', location.pathname + '?' + p.toString());
  }

  /* ---------------------------------------------------------------- render */

  var el = {};

  function buildControls() {
    // Quick picks
    el.quickpicks.innerHTML = QUICKPICKS.map(function (v) {
      return '<button type="button" class="chip" data-income="' + v + '" aria-pressed="false">$'
        + (v / 1000) + 'k</button>';
    }).join('');

    // Filing status
    el.status.innerHTML = STATUSES.map(function (s) {
      return '<button type="button" class="seg" role="radio" data-status="' + s.key
        + '" aria-checked="false">' + esc(s.label) + '</button>';
    }).join('');

    // States, alphabetical by display name
    var codes = Object.keys(S).sort(function (a, b) {
      return S[a].name.localeCompare(S[b].name);
    });
    if (codes.indexOf(ui.state) === -1 && codes.length) ui.state = codes[0];
    el.state.innerHTML = codes.map(function (c) {
      return '<option value="' + c + '">' + esc(S[c].name) + '</option>';
    }).join('');

    // Raise amounts
    el.raiseAmts.innerHTML = RAISE_AMOUNTS.map(function (v) {
      return '<button type="button" class="raise__amt" data-raise="' + v
        + '" aria-pressed="false">+' + money(v) + '</button>';
    }).join('');
  }

  function syncControls() {
    el.income.value = ui.gross.toLocaleString('en-US');
    Array.prototype.forEach.call(el.quickpicks.children, function (b) {
      b.setAttribute('aria-pressed', String(+b.dataset.income === ui.gross));
    });
    Array.prototype.forEach.call(el.status.children, function (b) {
      var on = b.dataset.status === ui.status;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    el.state.value = ui.state;
    Array.prototype.forEach.call(el.raiseAmts.children, function (b) {
      b.setAttribute('aria-pressed', String(+b.dataset.raise === ui.raise));
    });
  }

  function renderHeadline(r) {
    /* FIX #1 — like-for-like. Federal effective sits next to federal
       marginal; the all-in rate is reported separately and labelled. */
    el.fedEff.textContent = pct(r.fedEffective);
    el.fedMarg.textContent = pct(r.fedMarginal, 0);
    el.allIn.textContent = pct(r.allInEffective);

    var gap = r.fedMarginal - r.fedEffective;
    if (r.gross <= 0) {
      el.gapnote.innerHTML = 'Enter an income above to see your rates.';
    } else if (gap < 0.5) {
      el.gapnote.innerHTML = 'At this income your effective and marginal federal rates are close, '
        + 'because nearly all of your taxable income sits in a single bracket.';
    } else {
      el.gapnote.innerHTML = 'You sit in the <b>' + pct(r.fedMarginal, 0) + ' bracket</b>, but you pay '
        + '<b>' + pct(r.fedEffective) + '</b> of your income in federal tax — a gap of <b>'
        + pct(gap) + '</b>. That gap is the standard deduction plus every lower bracket your income '
        + 'passed through on the way up.';
    }

    // Split bar
    var segs = [
      { k: 'Federal', v: r.federal.tax, c: 'var(--c-federal)' },
      { k: 'FICA',    v: r.fica.tax,    c: 'var(--c-fica)' },
      { k: r.state.none ? 'State' : r.state.name, v: r.state.tax, c: 'var(--c-state)' },
      { k: 'Take-home', v: r.takeHome, c: 'var(--take)' }
    ].filter(function (s) { return s.v > 0; });

    var g = r.gross || 1;
    el.splitbar.innerHTML = segs.map(function (s) {
      return '<div class="splitbar__seg" style="width:' + (s.v / g * 100).toFixed(3)
        + '%;background:' + s.c + '"></div>';
    }).join('');
    el.splitkey.innerHTML = segs.map(function (s) {
      return '<span><i style="background:' + s.c + '"></i>' + esc(s.k) + ' ' + money(s.v) + '</span>';
    }).join('');
  }

  function renderBreakdown(r) {
    var g = r.gross || 1;
    var cards = [
      { cls: 'bd--federal', name: 'Federal income tax', sub: 'Progressive brackets', amt: r.federal.tax },
      { cls: 'bd--fica',    name: 'FICA', sub: 'Social Security + Medicare', amt: r.fica.tax },
      { cls: 'bd--state',   name: (r.state.none ? 'State income tax' : r.state.name + ' tax'),
        sub: r.state.none ? 'No state income tax' : 'State income tax', amt: r.state.tax },
      { cls: 'bd--total',   name: 'Total tax', sub: 'All three combined', amt: r.totalTax },
      { cls: 'bd--take',    name: 'Take-home pay', sub: 'What actually reaches you', amt: r.takeHome, isTake: true }
    ];
    el.breakdownCards.innerHTML = cards.map(function (c) {
      return '<div class="bd ' + c.cls + '">'
        + '<div class="bd__name">' + esc(c.name) + '</div>'
        + '<div class="bd__sub">' + esc(c.sub) + '</div>'
        + '<div class="bd__amt num">' + money(c.amt) + '</div>'
        + '<div class="bd__pct num">' + pct(c.amt / g * 100) + (c.isTake ? ' of gross' : ' effective') + '</div>'
        + '</div>';
    }).join('');
  }

  var BR_COLORS = { 0.10: '#E9DFF7', 0.12: '#D2BEF0', 0.22: '#B292E4',
                    0.24: '#8759CC', 0.32: '#6D3A9E', 0.35: '#4E2470', 0.37: '#2E1140' };
  // FIX #16 — dark text on the pale fills, white only on the dark ones.
  // Every pairing below clears WCAG AA for normal text.
  var BR_INK = { 0.10: '#2E1140', 0.12: '#2E1140', 0.22: '#221033',
                 0.24: '#FFFFFF', 0.32: '#FFFFFF', 0.35: '#FFFFFF', 0.37: '#FFFFFF' };

  function renderBrackets(r) {
    var rows = r.federal.rows;
    var used = rows.filter(function (b) { return b.amount > 0; });
    var taxable = r.federal.taxable;

    /* FIX #15 — width is strictly (dollars in this bracket / total taxable),
       so a $8,500 sliver renders as a $8,500 sliver. */
    el.fillTrack.innerHTML = used.map(function (b) {
      var w = taxable > 0 ? (b.amount / taxable * 100) : 0;
      var label = w >= 9 ? pct(b.rate * 100, 0) : '';
      return '<div class="fill__seg" style="width:' + w.toFixed(3) + '%;background:'
        + BR_COLORS[b.rate] + ';color:' + BR_INK[b.rate] + '" title="'
        + pct(b.rate * 100, 0) + ' on ' + money(b.amount) + '">' + label + '</div>';
    }).join('') || '<div class="fill__seg" style="width:100%;background:var(--bg-alt);color:var(--ink-3)">No taxable income</div>';

    el.fillMax.textContent = money(taxable) + ' taxable';
    el.fillCap.innerHTML = 'Your ' + money(r.gross) + ' gross, minus the '
      + money(r.federal.standardDeduction) + ' standard deduction, leaves <b>'
      + money(taxable) + '</b> of taxable income. Segment widths are proportional to the dollars taxed in each bracket.';

    el.brkBody.innerHTML = rows.map(function (b) {
      var empty = b.amount <= 0;
      var top = b.max === Infinity ? 'and up' : money(b.max);
      var range = b.max === Infinity ? money(b.min) + '+' : money(b.min) + ' – ' + top;
      var isTop = !empty && b.rate === r.federal.marginal;
      return '<tr' + (empty ? ' class="is-empty"' : '') + '>'
        + '<td><span class="swatch" style="background:' + BR_COLORS[b.rate] + '"></span>' + range
        + (isTop ? '<span class="brk__here">your bracket</span>' : '') + '</td>'
        + '<td class="num">' + pct(b.rate * 100, 0) + '</td>'
        + '<td class="r num">' + (empty ? '—' : money(b.amount)) + '</td>'
        + '<td class="r num">' + (empty ? '—' : money(b.tax)) + '</td>'
        + '</tr>';
    }).join('');

    el.brkTotal.textContent = money(r.federal.tax);
    el.brkSource.innerHTML = '2026 brackets and the ' + money(r.federal.standardDeduction)
      + ' standard deduction per <a href="https://www.irs.gov/pub/irs-drop/rp-25-32.pdf" rel="noopener">IRS Rev. Proc. 2025-32</a>. Ordinary income only.';
  }

  function renderRaise(r) {
    var amt = ui.raise;
    var after = compute(r.gross + amt, ui.status, ui.state);
    var extraTax = after.totalTax - r.totalTax;
    var keep = amt - extraTax;
    var effRate = amt > 0 ? (extraTax / amt) * 100 : 0;

    el.raiseGross.textContent = '+' + money(amt);
    el.raiseTax.textContent = '−' + money(extraTax);
    el.raiseKeep.textContent = '+' + money(keep);

    var newBracket = after.fedMarginal > r.fedMarginal;
    el.raiseVerdict.innerHTML = 'On the next ' + money(amt) + ' you earn, you keep <b>'
      + money(keep) + '</b> — that\'s ' + pct(100 - effRate) + ' of it. The combined bite is '
      + pct(effRate) + ' (federal ' + pct(r.fedMarginal, 0) + ', FICA, and state). '
      + (newBracket
          ? 'This raise does push part of your income into the ' + pct(after.fedMarginal, 0)
            + ' bracket — but <b>only the dollars above the threshold</b> are taxed at that rate. '
            + 'Your earlier income is untouched, and your take-home still goes up.'
          : 'A raise never costs you money. Only the new dollars are taxed at the higher rate, and you always keep the majority of them.');
  }

  function renderWithholding(r) {
    /* The honest contrast: the rate people quote (their all-in marginal rate)
       versus the rate they actually pay (all-in effective). */
    el.whFeels.textContent = pct(r.allInMarginal);
    el.whReal.textContent = pct(r.allInEffective);

    var perCheck = F.averageRefund / 26;
    el.whRefund.innerHTML = 'The average federal refund is about <b>' + money(F.averageRefund)
      + '</b>. That is not a windfall — it is money you overpaid during the year and lent to the '
      + 'Treasury at 0% interest. Spread across 26 pay periods it is roughly <b>' + money(perCheck)
      + ' per paycheck</b> you could have had all along. Adjusting your W-4 does not change what you '
      + 'owe; it changes when you get it.';
  }

  function renderBonus(r) {
    var bonus = F.exampleBonus;

    // FICA and state are withheld the same way in both columns — the only
    // thing that differs is the FEDERAL treatment, so that is what the
    // verdict compares.
    var ficaOnBonus = bonus * r.fica.marginal;
    var stateOnBonus = bonus * r.state.marginal;
    var fedWithheld = bonus * F.supplementalWithholdingRate;
    var fedActual = bonus * (r.fedMarginal / 100);

    var landsIn = bonus - fedWithheld - ficaOnBonus - stateOnBonus;
    var reallyYours = bonus - fedActual - ficaOnBonus - stateOnBonus;

    var stateRow = r.state.none ? '' : row('State @ ' + pct(r.state.marginal * 100), '−' + money(stateOnBonus));

    el.bonusWithheld.innerHTML =
        row('Bonus', money(bonus))
      + row('Federal @ ' + pct(F.supplementalWithholdingRate * 100, 0) + ' flat supplemental rate', '−' + money(fedWithheld))
      + row('FICA', '−' + money(ficaOnBonus))
      + stateRow
      + row('Lands in your account', money(landsIn), true);

    el.bonusActual.innerHTML =
        row('Bonus', money(bonus))
      + row('Federal @ your ' + pct(r.fedMarginal, 0) + ' marginal rate', '−' + money(fedActual))
      + row('FICA', '−' + money(ficaOnBonus))
      + stateRow
      + row('Actually yours', money(reallyYours), true);

    var diff = fedWithheld - fedActual;   // positive = over-withheld
    var verdict;
    if (Math.abs(diff) < 25) {
      verdict = 'Your federal marginal rate is ' + pct(r.fedMarginal, 0) + ', so the flat '
        + pct(F.supplementalWithholdingRate * 100, 0) + ' supplemental rate lands almost exactly right '
        + 'for you. Nothing meaningful to true up in April — but note that the bonus was never taxed at '
        + 'a special rate. It is ordinary income like any other dollar.';
    } else if (diff > 0) {
      verdict = 'Your federal marginal rate is only ' + pct(r.fedMarginal, 0) + ', so your employer '
        + 'withheld about <b>' + money(diff) + ' more federal tax than this bonus actually costs you</b>. '
        + 'The bonus was not taxed at a punitive rate — it was over-withheld, and the difference comes '
        + 'back to you as part of your refund.';
    } else {
      verdict = 'Your federal marginal rate is ' + pct(r.fedMarginal, 0) + ', above the flat '
        + pct(F.supplementalWithholdingRate * 100, 0) + ' supplemental rate — so withholding falls about '
        + '<b>' + money(-diff) + ' short</b> of what this bonus really costs you. It looks generous on '
        + 'the day it lands, but set that difference aside rather than being surprised when you file.';
    }
    el.bonusVerdict.innerHTML = verdict + ' Illustrated on a ' + money(bonus) + ' bonus.';

    function row(label, val, sum) {
      return '<div class="ledger__row' + (sum ? ' ledger__row--sum' : '') + '"><span>'
        + esc(label) + '</span><b class="num">' + val + '</b></div>';
    }
  }

  function renderLevers(r) {
    var marg = r.fedMarginal / 100;
    var margAll = marg + r.state.marginal; // deductions cut state tax too
    el.dedRateInline.textContent = pct(r.fedMarginal, 0);
    el.dcRate.textContent = pct(r.fedMarginal, 0);

    // Deduction vs credit visual (FIX #12)
    var dedValue = 2000 * margAll;
    var credValue = 2000;
    el.dcDedBar.style.width = clamp(dedValue / credValue * 100, 12, 100) + '%';
    el.dcDedBar.textContent = money(dedValue);
    el.dcCredBar.style.width = '100%';
    el.dcCredBar.textContent = money(credValue);
    el.dcDedNote.innerHTML = 'Worth only <b>' + money(dedValue) + '</b> to you — the deduction saves '
      + 'you tax at your marginal rate, not at face value. A filer in a lower bracket would save less.';

    el.chrStd.textContent = money(r.federal.standardDeduction);
    el.chrVal.textContent = money(1000 * margAll);

    // Deduction cards
    el.deductionCards.innerHTML = F.deductions.map(function (d) {
      var cap = typeof d.limit === 'function' ? d.limit(ui.status) : d.limit;
      var save = d.amountForSaving ? d.amountForSaving(ui.status) : 0;
      var savings = save * margAll;
      return '<div class="lv">'
        + '<div class="lv__h">' + esc(d.name) + '</div>'
        + '<div class="lv__cap">' + esc(cap) + '</div>'
        + (d.applied ? '<span class="lv__badge">Already in your numbers</span>' : '')
        + '<p class="lv__body">' + d.body + '</p>'
        + (savings > 0
            ? '<p class="lv__save">Max out and you cut your tax by about <b>' + money(savings)
              + '</b> this year.</p>'
            : '')
        + '</div>';
    }).join('');

    el.dedSource.innerHTML = 'Contribution limits are for the 2026 tax year. Phase-outs and eligibility '
      + 'vary with income and filing status. Estimated savings apply your combined federal + state marginal '
      + 'rate of ' + pct(margAll * 100) + ' and assume you remain in the same bracket.';

    // Credit cards
    el.creditCards.innerHTML = F.credits.map(function (c) {
      return '<div class="lv">'
        + '<div class="lv__h">' + esc(c.name) + '</div>'
        + '<div class="lv__cap">' + esc(c.amount) + '</div>'
        + '<p class="lv__body">' + c.body + '</p>'
        + '</div>';
    }).join('');
  }

  /* ---------------------------------------------------------------- charts */

  function svgEl(name, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function clearChart(svg) {
    // Keep <title>/<desc> for accessibility, drop the drawn layer.
    var old = svg.querySelector('g[data-layer]');
    if (old) old.remove();
    var g = svgEl('g', { 'data-layer': '1' });
    svg.appendChild(g);
    return g;
  }

  var CH = { w: 640, h: 320, l: 46, r: 14, t: 14, b: 34 };

  function renderHistory(r) {
    var svg = $('chart-history');
    var g = clearChart(svg);
    var pw = CH.w - CH.l - CH.r, ph = CH.h - CH.t - CH.b;
    var years = H.map(function (d) { return d.year; });
    var y0 = years[0], y1 = years[years.length - 1];
    var X = function (y) { return CH.l + (y - y0) / (y1 - y0) * pw; };
    var Y = function (v) { return CH.t + (1 - v / 100) * ph; };

    // gridlines
    [0, 25, 50, 75, 100].forEach(function (v) {
      g.appendChild(svgEl('line', { x1: CH.l, x2: CH.w - CH.r, y1: Y(v), y2: Y(v),
        stroke: 'rgba(255,255,255,.14)', 'stroke-width': 1 }));
      var t = svgEl('text', { x: CH.l - 9, y: Y(v) + 4, 'text-anchor': 'end',
        fill: '#9C90AC', 'font-size': 11, 'font-weight': 600 });
      t.textContent = pct(v, 0);
      g.appendChild(t);
    });

    // x labels
    H.filter(function (d, i) { return i % 3 === 0 || i === H.length - 1; }).forEach(function (d) {
      var t = svgEl('text', { x: X(d.year), y: CH.h - 10, 'text-anchor': 'middle',
        fill: '#9C90AC', 'font-size': 11, 'font-weight': 600 });
      t.textContent = d.year;
      g.appendChild(t);
    });

    // top statutory rate — red dashed, matching the legend
    var path = H.map(function (d, i) { return (i ? 'L' : 'M') + X(d.year) + ' ' + Y(d.rate); }).join(' ');
    g.appendChild(svgEl('path', { d: path, fill: 'none', stroke: '#F87171',
      'stroke-width': 2.4, 'stroke-dasharray': '7 5', 'stroke-linejoin': 'round' }));

    // your all-in effective rate — solid purple
    var yv = Y(r.allInEffective);
    g.appendChild(svgEl('line', { x1: CH.l, x2: CH.w - CH.r, y1: yv, y2: yv,
      stroke: '#C4B5FD', 'stroke-width': 2.6 }));
    var lbl = svgEl('text', { x: CH.l + 8, y: yv - 9, fill: '#C4B5FD', 'font-size': 12, 'font-weight': 800 });
    lbl.textContent = 'You: ' + pct(r.allInEffective) + ' all-in';
    g.appendChild(lbl);
  }

  function renderCurve(r) {
    var svg = $('chart-curve');
    var g = clearChart(svg);
    var pw = CH.w - CH.l - CH.r, ph = CH.h - CH.t - CH.b;

    // Sample the real engine across the income range.
    var lo = 10000, hi = Math.max(300000, Math.ceil(r.gross * 1.4 / 50000) * 50000);
    var pts = [];
    for (var i = 0; i <= 60; i++) {
      var inc = lo + (hi - lo) * (i / 60);
      pts.push({ x: inc, y: compute(inc, ui.status, ui.state).allInEffective });
    }

    /* FIX #2 — the axis maximum is a rounded, sane number derived from the
       data, capped at a rate an effective rate can plausibly reach. Labels are
       always whole percentages. */
    var peak = pts.reduce(function (m, p) { return Math.max(m, p.y); }, 0);
    peak = Math.max(peak, r.allInEffective);

    /* Pick a round step first, then snap the maximum to a multiple of it, so
       every gridline label is a whole, tidy percentage — never 8.75%. */
    var step = (peak + 3) <= 20 ? 5 : 10;
    var axisMax = clamp(Math.ceil((peak + 3) / step) * step, 15, 50);

    var X = function (v) { return CH.l + (v - lo) / (hi - lo) * pw; };
    var Y = function (v) { return CH.t + (1 - clamp(v, 0, axisMax) / axisMax) * ph; };

    for (var v = 0; v <= axisMax + 0.001; v += step) {
      g.appendChild(svgEl('line', { x1: CH.l, x2: CH.w - CH.r, y1: Y(v), y2: Y(v),
        stroke: 'rgba(255,255,255,.14)', 'stroke-width': 1 }));
      var t = svgEl('text', { x: CH.l - 9, y: Y(v) + 4, 'text-anchor': 'end',
        fill: '#9C90AC', 'font-size': 11, 'font-weight': 600 });
      t.textContent = pct(v, 0);     // never a raw float
      g.appendChild(t);
    }

    [lo, lo + (hi - lo) / 3, lo + 2 * (hi - lo) / 3, hi].forEach(function (v) {
      var t = svgEl('text', { x: X(v), y: CH.h - 10, 'text-anchor': 'middle',
        fill: '#9C90AC', 'font-size': 11, 'font-weight': 600 });
      t.textContent = '$' + Math.round(v / 1000) + 'k';
      g.appendChild(t);
    });

    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1); }).join(' ');
    g.appendChild(svgEl('path', { d: d + ' L' + X(hi) + ' ' + Y(0) + ' L' + X(lo) + ' ' + Y(0) + ' Z',
      fill: 'rgba(196,181,253,.14)', stroke: 'none' }));
    g.appendChild(svgEl('path', { d: d, fill: 'none', stroke: '#C4B5FD',
      'stroke-width': 2.6, 'stroke-linejoin': 'round' }));

    // "You are here"
    if (r.gross >= lo && r.gross <= hi) {
      var cx = X(r.gross), cy = Y(r.allInEffective);
      g.appendChild(svgEl('line', { x1: cx, x2: cx, y1: cy, y2: CH.t + ph,
        stroke: '#4ADE80', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }));
      g.appendChild(svgEl('circle', { cx: cx, cy: cy, r: 6, fill: '#4ADE80',
        stroke: '#1F0B2E', 'stroke-width': 2.5 }));
      var anchor = cx > CH.w - 130 ? 'end' : 'start';
      var t2 = svgEl('text', { x: cx + (anchor === 'end' ? -11 : 11), y: cy - 12,
        'text-anchor': anchor, fill: '#4ADE80', 'font-size': 12, 'font-weight': 800 });
      t2.textContent = 'You: ' + pct(r.allInEffective);
      g.appendChild(t2);
    }
  }

  /* ----------------------------------------------------------------- share */

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.setAttribute('data-show', '1');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.toast.setAttribute('data-show', '0'); }, 2600);
  }

  function share() {
    writeURL();
    var r = compute(ui.gross, ui.status, ui.state);
    var text = 'I earn ' + money(ui.gross) + ' and my real federal tax rate is '
      + pct(r.fedEffective) + ' — not the ' + pct(r.fedMarginal, 0) + ' bracket everyone quotes.';
    var url = location.href;
    if (navigator.share) {
      navigator.share({ title: "What's My Tax Rate?", text: text, url: url })
        .catch(function () { /* user dismissed */ });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        toast('Link copied — it includes your numbers');
      }, function () { toast('Could not copy link'); });
    }
  }

  /* --------------------------------------------------------------- wire up */

  function render() {
    var r = compute(ui.gross, ui.status, ui.state);

    renderHeadline(r);
    renderBreakdown(r);
    renderBrackets(r);
    renderRaise(r);
    renderWithholding(r);
    renderBonus(r);
    renderLevers(r);
    renderHistory(r);
    renderCurve(r);

    // Local-tax disclosure + provisional-data caution (FIX #17)
    var stMeta = S[ui.state] || { name: '—', notes: '' };
    var note = stMeta.notes || '';
    if (stMeta.provisional) {
      note += (note ? ' ' : '')
        + 'These 2026 figures are provisional — the state has not published final amounts yet.';
    }
    if (note) {
      el.localnoteText.textContent = note;
      el.localnote.hidden = false;
    } else {
      el.localnote.hidden = true;
    }

    // Sticky mini bar
    el.miniCtx.textContent = money(ui.gross) + ' · ' + statusLabel(ui.status) + ' · ' + stMeta.name;
    el.miniEff.textContent = pct(r.fedEffective);
    el.miniMarg.textContent = pct(r.fedMarginal, 0);
    el.miniTake.textContent = money(r.takeHome);

    writeURL();
  }

  function statusLabel(k) {
    for (var i = 0; i < STATUSES.length; i++) if (STATUSES[i].key === k) return STATUSES[i].label;
    return k;
  }

  function setIncomeFromInput() {
    var raw = el.income.value.replace(/[^0-9]/g, '');
    var n = raw === '' ? 0 : parseInt(raw, 10);
    // FIX — hard cap, so the page can't render a nine-figure fantasy.
    ui.gross = clamp(isFinite(n) ? n : 0, 0, F.maxIncome);
    var caret = el.income.selectionStart;
    var before = el.income.value.length;
    el.income.value = ui.gross.toLocaleString('en-US');
    var after = el.income.value.length;
    try { el.income.setSelectionRange(caret + (after - before), caret + (after - before)); } catch (e) {}
    syncControls();
    render();
  }

  function init() {
    el = {
      income: $('income'), quickpicks: $('quickpicks'), status: $('status'), state: $('state'),
      localnote: $('localnote'), localnoteText: $('localnote-text'),
      fedEff: $('fed-eff'), fedMarg: $('fed-marg'), allIn: $('allin'), gapnote: $('gapnote'),
      splitbar: $('splitbar'), splitkey: $('splitkey'),
      raiseAmts: $('raise-amts'), raiseGross: $('raise-gross'), raiseTax: $('raise-tax'),
      raiseKeep: $('raise-keep'), raiseVerdict: $('raise-verdict'),
      breakdownCards: $('breakdown-cards'),
      fillTrack: $('fill-track'), fillMax: $('fill-max'), fillCap: $('fill-cap'),
      brkBody: $('brk-body'), brkTotal: $('brk-total'), brkSource: $('brk-source'),
      whFeels: $('wh-feels'), whReal: $('wh-real'), whRefund: $('wh-refund'),
      bonusWithheld: $('bonus-withheld'), bonusActual: $('bonus-actual'), bonusVerdict: $('bonus-verdict'),
      dedRateInline: $('ded-rate-inline'), dedSource: $('ded-source'), deductionCards: $('deduction-cards'),
      dcRate: $('dc-rate'), dcDedBar: $('dc-ded-bar'), dcCredBar: $('dc-cred-bar'), dcDedNote: $('dc-ded-note'),
      creditCards: $('credit-cards'), chrStd: $('chr-std'), chrVal: $('chr-val'),
      ministrip: $('ministrip'), miniCtx: $('mini-ctx'), miniEff: $('mini-eff'),
      miniMarg: $('mini-marg'), miniTake: $('mini-take'),
      toast: $('toast')
    };

    readURL();
    buildControls();
    syncControls();
    render();

    // Inputs
    el.income.addEventListener('input', setIncomeFromInput);
    el.income.addEventListener('focus', function () { el.income.select(); });

    el.quickpicks.addEventListener('click', function (e) {
      var b = e.target.closest('[data-income]'); if (!b) return;
      ui.gross = +b.dataset.income; syncControls(); render();
    });

    el.status.addEventListener('click', function (e) {
      var b = e.target.closest('[data-status]'); if (!b) return;
      ui.status = b.dataset.status; syncControls(); render();
    });
    // Arrow-key support for the radiogroup
    el.status.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].indexOf(e.key) === -1) return;
      e.preventDefault();
      var i = STATUSES.findIndex(function (s) { return s.key === ui.status; });
      var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      ui.status = STATUSES[(i + d + STATUSES.length) % STATUSES.length].key;
      syncControls(); render();
      el.status.querySelector('[aria-checked="true"]').focus();
    });

    el.state.addEventListener('change', function () { ui.state = el.state.value; render(); });

    el.raiseAmts.addEventListener('click', function (e) {
      var b = e.target.closest('[data-raise]'); if (!b) return;
      ui.raise = +b.dataset.raise; syncControls();
      render();
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-share]'), function (b) {
      b.addEventListener('click', share);
    });

    // Sticky mini bar appears once the calculator result scrolls out of view
    var calc = document.querySelector('.calc__result');
    if ('IntersectionObserver' in window && calc) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        el.ministrip.setAttribute('data-show', vis ? '0' : '1');
        el.ministrip.setAttribute('aria-hidden', vis ? 'true' : 'false');
      }, { rootMargin: '-120px 0px 0px 0px' }).observe(calc);
    }

    // Date stamps
    var stamped = F.dataAsOf;
    ['stamp-date', 'foot-updated'].forEach(function (id) { if ($(id)) $(id).textContent = stamped; });
    if ($('foot-year')) $('foot-year').textContent = F.taxYear;
    if ($('foot-copy')) $('foot-copy').textContent = F.taxYear;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
