#!/usr/bin/env python3
# Generate tax-glossary.html from ONE terms list, so the visible definitions
# and the JSON-LD DefinedTermSet can never drift out of sync.
import html, json, pathlib

import os
OUT = pathlib.Path(os.path.join(os.path.dirname(__file__), "tax-glossary.html"))

# Uniform authoritative sources cited on every term (Princeton GEO "cite sources").
IRS = "https://www.irs.gov/"
TF  = "https://taxfoundation.org/taxedu/glossary/"
TPC = "https://www.taxpolicycenter.org/briefing-book"

# name, abbr(optional), definition (plain text), (link_href, link_label) or None
TERMS = [
 ("1099", "series", "A family of IRS forms reporting income that isn't employee wages — freelance and contractor pay (1099-NEC), interest (1099-INT), dividends (1099-DIV), and more. No tax is withheld from 1099 income, so it often means owing tax at filing or paying estimated taxes during the year.", None),
 ("Above-the-Line Deduction", None, "A deduction you can take whether or not you itemize, subtracted “above the line” to arrive at your adjusted gross income. Examples include Health Savings Account contributions, deductible IRA contributions, and student loan interest. Because it lowers your AGI, it can also help you qualify for other income-based tax breaks.", ("/#shelter", "See the pre-tax accounts that lower your income →")),
 ("Additional Medicare Tax", None, "An extra 0.9% Medicare tax on wages and self-employment income above $200,000 (single) or $250,000 (married filing jointly). It applies only to the earnings above those thresholds, which are set in law and not adjusted for inflation.", ("/#breakdown", "See how FICA comes out of your paycheck →")),
 ("Adjusted Gross Income (AGI)", "AGI", "Your total (gross) income minus specific above-the-line adjustments like retirement-account and HSA contributions. AGI is the jumping-off point for your taxable income, and it's the figure many other tax rules — deductions, credits, and phase-outs — are measured against.", None),
 ("Alternative Minimum Tax (AMT)", "AMT", "A parallel tax system with its own rules that runs alongside the regular one to make sure higher-income filers with many deductions still pay a minimum amount. You figure your tax both ways and pay whichever is higher. Most people are never affected.", None),
 ("Capital Gains Rate", None, "The tax rate on profit from selling an asset like stock or property. Assets held longer than a year get preferential long-term rates — 0%, 15%, or 20% depending on income — lower than ordinary income rates. Assets held a year or less are taxed as ordinary income.", None),
 ("Effective Tax Rate", None, "The average percentage of your total income that you actually pay in tax — your total tax divided by your gross income. It's almost always lower than your marginal rate, because your income fills the lower brackets first before any of it reaches the top one.", ("/#brackets", "See how your effective rate is calculated →")),
 ("FICA", None, "The Federal Insurance Contributions Act payroll tax that funds Social Security and Medicare. Employees pay 6.2% for Social Security (up to an annual wage cap) and 1.45% for Medicare, each matched by the employer. It comes out of every paycheck separately from federal income tax.", ("/#breakdown", "See FICA in your paycheck breakdown →")),
 ("Filing Status", None, "The category — single, married filing jointly, married filing separately, or head of household — that sets your standard deduction, your bracket thresholds, and your eligibility for many credits. Your status is based on your situation on the last day of the tax year.", ("/#top", "Switch filing status in the calculator →")),
 ("Gross Income", None, "All the income you receive before any taxes or deductions — wages, salary, tips, interest, dividends, and business income. It's the top line that your entire tax calculation flows down from: gross income, then deductions, then taxable income, then take-home.", None),
 ("Itemized Deductions", None, "Specific deductible expenses — state and local taxes (SALT), mortgage interest, charitable gifts, large medical bills — that you total up and claim instead of the standard deduction. You itemize only when that total beats the standard deduction.", ("/#itemize", "See whether you should itemize →")),
 ("Marginal Tax Rate", None, "The rate applied to your last dollar of income — the top bracket you reach. It does not apply to all your income; only the portion above each bracket threshold is taxed at that bracket's rate. This is why landing in the 22% bracket doesn't mean paying 22% of everything.", ("/#brackets", "See how brackets stack up →")),
 ("Modified Adjusted Gross Income (MAGI)", "MAGI", "Your AGI with certain deductions and excluded income added back in. Different tax rules use slightly different MAGI definitions, and it's usually the income figure that decides your eligibility for credits, deductions, and phase-outs.", None),
 ("Payroll Tax", None, "Tax withheld from wages to fund social-insurance programs — chiefly FICA (Social Security and Medicare). Unlike income tax, payroll tax is a flat rate and applies from your very first dollar of earnings, with no standard deduction in front of it.", ("/#breakdown", "See payroll tax in your breakdown →")),
 ("Phase-out", None, "The gradual reduction of a tax benefit — a deduction, credit, or exemption — as your income rises past a threshold, until it disappears entirely. Phase-outs can quietly push your true marginal rate higher than your bracket alone would suggest.", None),
 ("Pre-Tax Contribution (Tax-Deferred)", None, "Money put into an account like a traditional 401(k) or HSA before income tax is applied, lowering your taxable income now. You pay tax later, when you withdraw — ideally at a lower rate in retirement (an HSA used for medical costs is never taxed).", ("/#shelter", "Model your pre-tax contributions →")),
 ("Progressive Tax", None, "A tax whose rate rises as income rises, so higher earners pay a higher percentage. US federal income tax is progressive: income is taxed in tiers (brackets), each higher slice at a higher rate — never the whole amount at the top rate.", ("/#brackets", "See the progressive brackets →")),
 ("Provisional Income", "combined income", "The figure the IRS uses to decide how much of your Social Security is taxable — your other income, plus tax-exempt interest, plus half of your benefits. Depending on where it lands, 0%, up to 50%, or up to 85% of your benefits become taxable.", ("/#retirement", "See how your Social Security is taxed →")),
 ("Refundable Credit", None, "A tax credit that can pay out even when it's larger than your tax bill — reducing your tax below zero and sending you the difference as a refund. The Earned Income Tax Credit is the best-known example. A nonrefundable credit can only reduce your tax to zero.", ("/#credits", "See how credits differ from deductions →")),
 ("SALT Deduction", "SALT", "The itemized deduction for State And Local Taxes — income (or sales) tax plus property tax. For 2026 it's capped at $40,400, phasing down for high earners toward a $10,000 floor. It's often the largest piece of an itemized return.", ("/#itemize", "See SALT in the itemize tool →")),
 ("Self-Employment Tax", None, "The Social Security and Medicare tax paid by people who work for themselves — 15.3% (12.4% Social Security up to the wage cap, plus 2.9% Medicare). It covers both the employee and employer halves of FICA, since a self-employed person is both. Half of it is deductible.", None),
 ("Social Security Wage Base", None, "The annual cap on earnings subject to the 6.2% Social Security portion of FICA — $184,500 for 2026. Wages above it aren't taxed for Social Security (Medicare has no cap), so a high earner's marginal FICA rate actually drops once they pass it.", None),
 ("Standard Deduction", None, "A flat amount everyone can subtract from income before tax is calculated — $16,100 single / $32,200 married filing jointly for 2026 — with no receipts required. Most filers take it rather than itemize.", ("/#itemize", "Compare it against itemizing →")),
 ("Supplemental Wages", None, "Pay outside your regular salary — bonuses, commissions, severance. Employers often withhold federal tax on them at a flat 22%, but that's a withholding rule, not a special tax rate; the bonus is really taxed at your ordinary marginal rate, and any over-withholding comes back at filing.", ("/#bonuses", "See why your bonus looks over-taxed →")),
 ("Take-Home Pay", None, "What actually reaches your bank account — your gross pay minus federal income tax, FICA, state tax, and any pre-tax deductions. It's the number that reflects your real, all-in tax burden, and the one that matters for budgeting.", ("/#breakdown", "See your take-home breakdown →")),
 ("Tax Bracket", None, "An income range taxed at a specific rate. As your income rises, only the portion inside each bracket is taxed at that bracket's rate — so moving into a higher bracket never lowers your take-home pay.", ("/#brackets", "See your income fill the brackets →")),
 ("Tax Credit vs. Tax Deduction", None, "A deduction lowers the income you're taxed on, so it's worth your marginal rate. A credit lowers your tax bill directly, dollar for dollar — so a $1,000 credit is worth more than a $1,000 deduction to everyone, regardless of bracket.", ("/#credits", "See the deduction-vs-credit comparison →")),
 ("Taxable Income", None, "The income your tax is actually calculated on — your AGI minus your standard or itemized deduction. It's the figure that gets run through the tax brackets to produce what you owe.", ("/#brackets", "See taxable income run through the brackets →")),
 ("W-2", None, "The year-end form your employer sends reporting your wages and the taxes withheld from them. You use it to file your return, and the IRS gets a copy too — which is why the numbers need to match.", None),
 ("W-4", None, "The form you give your employer to set how much federal tax is withheld from each paycheck. Updating it — for a second job, a working spouse, or big deductions — is how you avoid a surprise bill or an oversized refund.", ("/#withholding", "See how withholding works →")),
 ("Withholding", None, "The federal (and often state) income tax your employer estimates and takes out of each paycheck on your behalf, sending it to the IRS through the year. It's a prepayment — you settle up when you file, getting a refund if too much came out.", ("/#withholding", "See why your paycheck looks over-taxed →")),
]


def slug(name):
    import re
    s = name.lower()
    s = re.sub(r'\([^)]*\)', '', s)          # drop parenthetical abbreviations
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s


def sort_key(name):
    # Numbers ("1099") sort under a leading "#" group, then alphabetical.
    first = name[0]
    return ('0' if first.isdigit() else '1', name.lower())


terms = sorted(TERMS, key=lambda t: sort_key(t[0]))

# Group by first character ("#" for digits).
groups = {}
for t in terms:
    g = '#' if t[0][0].isdigit() else t[0][0].upper()
    groups.setdefault(g, []).append(t)
group_order = (['#'] if '#' in groups else []) + [c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' if c in groups]

# ---- JSON-LD -----------------------------------------------------------------
URL = "https://whatsmytaxrate.com/tax-glossary"
defined = [{
    "@type": "DefinedTerm",
    "name": name.split(" (")[0],
    "description": defn,
    "inDefinedTermSet": URL,
    "url": URL + "#" + slug(name)
} for (name, abbr, defn, link) in terms]
term_set = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Tax Rate Glossary",
    "description": "Plain-language definitions of the federal income tax, payroll tax, and retirement tax terms that decide what you actually pay.",
    "url": URL,
    "hasDefinedTerm": defined
}
breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "What's My Tax Rate?", "item": "https://whatsmytaxrate.com/"},
        {"@type": "ListItem", "position": 2, "name": "Tax Glossary", "item": URL}
    ]
}
ldjson = json.dumps(term_set, indent=2, ensure_ascii=False) + "\n</script>\n<script type=\"application/ld+json\">\n" + json.dumps(breadcrumb, indent=2, ensure_ascii=False)

# ---- HTML body ---------------------------------------------------------------
E = html.escape

az = "".join('<a href="#g-%s">%s</a>' % ('num' if g == '#' else g, g) for g in group_order)

body_groups = []
for g in group_order:
    rows = []
    for (name, abbr, defn, link) in groups[g]:
        parts = ['<div class="term" id="%s">' % slug(name)]
        heading = E(name.split(" (")[0])
        # keep the parenthetical/abbr visible in the H3
        if "(" in name:
            heading = E(name)
        parts.append('<h3>%s%s</h3>' % (heading, (' <span class="term__abbr">(%s)</span>' % E(abbr)) if abbr else ''))
        parts.append('<p>%s</p>' % E(defn))
        if link:
            parts.append('<a class="term__link" href="%s">%s</a>' % (E(link[0]), E(link[1])))
        parts.append('<p class="term__src">Sources: '
                     '<a href="%s" rel="noopener">IRS.gov</a> · '
                     '<a href="%s" rel="noopener">Tax Foundation</a> · '
                     '<a href="%s" rel="noopener">Tax Policy Center</a></p>' % (IRS, TF, TPC))
        parts.append('</div>')
        rows.append("".join(parts))
    anchor = 'g-num' if g == '#' else 'g-' + g
    body_groups.append('<div class="gloss__group" id="%s"><div class="gloss__letter">%s</div>%s</div>'
                       % (anchor, ('0–9' if g == '#' else g), "".join(rows)))

PAGE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tax Rate Glossary: Every Term Explained Simply | What's My Tax Rate?</title>
<meta name="description" content="Plain-language definitions of %d tax terms — effective vs. marginal rate, FICA, AGI, AMT, withholding, itemized deductions, capital gains, and more. Every term explained simply, with sources.">
<link rel="canonical" href="%s">
<meta property="og:type" content="article">
<meta property="og:site_name" content="What's My Tax Rate?">
<meta property="og:url" content="%s">
<meta property="og:title" content="Tax Rate Glossary: Every Term Explained Simply">
<meta property="og:description" content="Plain-language definitions of the tax terms that decide what you actually pay.">
<meta property="og:image" content="https://whatsmytaxrate.com/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Tax Rate Glossary: Every Term Explained Simply">
<meta name="twitter:image" content="https://whatsmytaxrate.com/og-image.jpg">
<meta name="theme-color" content="#2E1140">
<script src="ads.js"></script>
<link rel="icon" href="favicon.svg?v=3" type="image/svg+xml">
<link rel="icon" href="favicon.ico?v=3" sizes="any">
<link rel="apple-touch-icon" href="apple-touch-icon.png?v=3">
<link rel="manifest" href="site.webmanifest">
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">
%s
</script>
</head>
<body>

<header class="topbar">
  <div class="topbar__inner">
    <a class="brand" href="/" aria-label="What's My Tax Rate — home">
      <svg class="brand__mark" viewBox="0 -2 48 48" fill="none" aria-hidden="true">
        <rect x="6"  y="30" width="6" height="12" rx="2" fill="#C9B8EC"/>
        <rect x="16" y="24" width="6" height="18" rx="2" fill="#9B7BD4"/>
        <rect x="26" y="17" width="6" height="25" rx="2" fill="#7C3AED"/>
        <rect x="36" y="9"  width="6" height="33" rx="2" fill="#4A1D6A"/>
        <circle cx="39" cy="5" r="3.4" fill="#F2B347"/>
      </svg>
      <span class="brand__name">What's My <em>Tax Rate</em></span>
    </a>
    <nav class="jump" aria-label="Site"><a href="/">Calculator</a></nav>
  </div>
</header>

<main>
<section class="gloss-hero">
  <div class="wrap">
    <h1>Tax Rate Glossary: Every Term Explained Simply</h1>
    <p>The tax words that decide what you actually pay — defined in plain language, with a real example wherever it helps and a link to see each one at work in the calculator. No jargon, no fine print you need a decoder for.</p>
    <a class="btn btn--ghost" href="/">Open the calculator →</a>
  </div>
</section>

<div class="wrap">
  <nav class="az" aria-label="Jump to letter">%s</nav>

  <div class="gloss">
    %s
  </div>

  <section class="gloss-sources">
    <h2>Sources</h2>
    <p>Every definition here is grounded in the primary, non-partisan authorities on US tax. Where a figure is cited (a rate, a threshold, a limit), it reflects the 2026 tax year.</p>
    <ul>
      <li><a href="%s" rel="noopener">Internal Revenue Service (IRS.gov)</a> — the official source for federal tax rules, forms, brackets, and definitions.</li>
      <li><a href="%s" rel="noopener">Tax Foundation — TaxEDU Glossary</a> — plain-language definitions and analysis from a leading non-partisan tax policy nonprofit.</li>
      <li><a href="%s" rel="noopener">Tax Policy Center — Briefing Book</a> — a joint Urban Institute &amp; Brookings resource explaining how the tax system works.</li>
    </ul>
    <p style="margin-bottom:0">For educational purposes only — not tax advice. Individual circumstances vary; consult a qualified tax professional for your situation.</p>
  </section>
</div>
</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <h4>What's My Tax Rate?</h4>
        <p style="line-height:1.65">See your real federal, state and FICA tax rate — not the bracket you land in. Free, plain-language, 2026 tax year.</p>
        <p style="margin-top:14px"><a class="btn btn--ghost btn-share" href="/">Open the calculator →</a></p>
      </div>
      <div>
        <h4>Popular terms</h4>
        <ul>
          <li><a href="#effective-tax-rate">Effective Tax Rate</a></li>
          <li><a href="#marginal-tax-rate">Marginal Tax Rate</a></li>
          <li><a href="#fica">FICA</a></li>
          <li><a href="#withholding">Withholding</a></li>
          <li><a href="#tax-credit-vs-tax-deduction">Credit vs. Deduction</a></li>
        </ul>
      </div>
      <div>
        <h4>Sources</h4>
        <ul>
          <li><a href="%s" rel="noopener">IRS.gov</a></li>
          <li><a href="%s" rel="noopener">Tax Foundation</a></li>
          <li><a href="%s" rel="noopener">Tax Policy Center</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p><strong>For educational purposes only. This is not tax or financial advice.</strong></p>
      <p style="margin-top:9px">Definitions reflect the 2026 tax year. © 2026 whatsmytaxrate.com</p>
    </div>
  </div>
</footer>

<script src="analytics.js"></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
''' % (len(terms), URL, URL, ldjson, az, "\n    ".join(body_groups), IRS, TF, TPC, IRS, TF, TPC)

OUT.write_text(PAGE)
print("wrote", OUT, "-", len(terms), "terms,", len(PAGE), "bytes")
