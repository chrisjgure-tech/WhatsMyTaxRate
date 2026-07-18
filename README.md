# What's My Tax Rate

A dependency-free static site for **whatsmytaxrate.com**.

No framework, no build step, no bundler, no Replit badge. Five files and a
stylesheet. Open `index.html` and it runs.

```
index.html      markup + metadata
styles.css      all styling, design tokens at the top
data.js         federal tax data + explainer copy
states.js       state tax data — 51 jurisdictions
app.js          calculation engine + rendering
favicon.svg     tab icon
og-image.png    1200×630 link-preview card (regenerate from og-image.svg)
netlify.toml    hosting config: redirects, security headers, caching
robots.txt / sitemap.xml
```

---

## Deploying to whatsmytaxrate.com

The site is fully static, so any host works. Netlify and Cloudflare Pages both
have a free tier with a custom domain and automatic HTTPS, and neither injects a
badge into your page.

### Option A — Netlify drop (fastest, no account tooling)

1. Go to <https://app.netlify.com/drop>.
2. Drag this entire folder onto the page. It deploys in seconds.
3. **Site settings → Domain management → Add custom domain** → `whatsmytaxrate.com`.
4. At your registrar, point the domain at Netlify:
   - `A` record, host `@` → `75.2.60.5`
   - `CNAME` record, host `www` → `<your-site>.netlify.app`
   (Or switch the nameservers to Netlify's and skip the records.)
5. Netlify provisions the Let's Encrypt certificate automatically. Give it
   a few minutes, then confirm **Force HTTPS** is on.

### Option B — Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name whats-my-tax-rate
```

Then add the custom domain under **Workers & Pages → your project → Custom
domains**. If the domain is already on Cloudflare DNS the record is created for
you.

### Option C — GitHub Pages

Push the folder to a repo, enable Pages on the `main` branch root, and add a
`CNAME` file containing `whatsmytaxrate.com`. Note that `netlify.toml` is
ignored here, so the security headers and redirects won't apply.

---

## Updating the tax data each year

Everything that goes stale lives in `data.js`. Nothing in `app.js` hardcodes a
rate, a threshold or a limit.

When the IRS publishes the next revenue procedure (usually late October, one
year ahead), update in this order:

1. **`TAX_FEDERAL.taxYear`** and **`TAX_FEDERAL.dataAsOf`** — these drive the
   visible "rates current as of" stamp in the hero and the footer. Update them
   *first* so the page never claims to be fresher than it is.
2. **`standardDeduction`** and **`brackets`** — from the new Rev. Proc.
3. **`fica.ssWageBase`** — from the SSA cost-of-living announcement.
4. **`limits`** — 401(k), IRA, HSA, FSA figures from the IRS notice.
5. **`credits`** — Child Tax Credit and phase-outs.
6. **`states.js`** — the slowest-moving but most error-prone file. Do not
   trust a single aggregator: the Tax Foundation's February 2026 report was
   stale for six states that cut rates *retroactive to 1 January* in spring
   sessions (AR, GA, UT, WV), added a surcharge (ME), or restructured
   outright (SC Act 110). Check each state's own revenue department, and
   check flat-tax states specifically — several are mid-phasedown.

### The state data contract

Each state entry is:

```js
NC: {
  name: 'North Carolina',
  type: 'flat',                     // 'none' | 'flat' | 'graduated'
  brackets: {                       // omit entirely when type is 'none'
    single: [{ rate: 0.0399, min: 0, max: null }],
    mfj: [...], hoh: [...], mfs: [...]
  },
  standardDeduction: { single: 12750, mfj: 25500, hoh: 19125, mfs: 12750 },
  personalExemptionCredit: { ... }, // dollar credit, not a deduction; 0 if none
  notes: 'Local income taxes are not included.'   // shown under the picker
}
```

`max: null` means "and up". `notes` renders as the amber advisory beneath the
state selector — use it for local/municipal taxes the calculator does not
model. Add `provisional: true` when a state hasn't published final figures;
the UI appends its own caution sentence automatically.

**The exemption trap.** Around twenty states grant the personal exemption as
a *deduction* rather than a credit, and ten (IL, IN, MI, NJ, OH, PA, WV, MA,
CT, UT) have no standard deduction at all. `standardDeduction` here is
therefore the **effective** subtraction for one filer with no dependents:
where the exemption is a deduction it is folded in — one exemption for
single/HOH/MFS, two for MFJ. Miss this and Illinois, Michigan, Ohio, New
Jersey and West Virginia all over-tax noticeably. True dollar credits go in
`personalExemptionCredit` instead (CA, DE, IA, NE, OR, AR, UT).

---

## What the engine does and does not model

Deliberately in scope: W-2 wage income, the federal standard deduction, federal
ordinary-income brackets, Social Security up to the wage base, Medicare, the
Additional Medicare Tax, and state income tax computed on **state** taxable
income (gross minus that state's own standard deduction, then its own brackets,
then any personal-exemption credit).

Deliberately out of scope, and disclosed in the footer: local and municipal
income taxes, AMT, the Net Investment Income Tax, capital gains and qualified
dividends, self-employment tax, itemized deductions, and all credits other than
the illustrative ones described in the Credits section.

---

## Regenerating the link-preview image

`og-image.svg` is the source. To re-render the PNG after editing it:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --screenshot=og-image.png \
  --window-size=1200,630 --hide-scrollbars og-image.svg
```

---

## Accessibility notes

- Every control has an associated label; filing status is a keyboard-navigable
  `radiogroup` with arrow-key support.
- All touch targets are at least 44px.
- Both charts carry `role="img"` with a `<title>` and `<desc>`, and a visible
  legend.
- Bracket fill colours pair dark text with pale fills and white text with dark
  fills; every combination clears WCAG AA.
- `prefers-reduced-motion` disables transitions and smooth scrolling.

## Licence

Content and code © whatsmytaxrate.com. Educational use only — not tax advice.
