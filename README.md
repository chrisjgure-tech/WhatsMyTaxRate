# What's My Tax Rate

A dependency-free static site for **whatsmytaxrate.com**.

No framework, no build step, no bundler, no Replit badge. Five files and a
stylesheet. Open `index.html` and it runs.

```
index.html      markup + metadata
analytics.js    Vercel Analytics bootstrap + URL redaction
styles.css      all styling, design tokens at the top
data.js         federal tax data + explainer copy
states.js       state tax data — 51 jurisdictions
app.js          calculation engine + rendering
favicon.svg     tab icon (rounded tile + bracket mark)
logo-mark.svg   the mark alone, transparent — for any background
social-avatar.svg   1024² social profile source (bars on gradient tile)
apple-touch-icon.png / icon-192 / icon-512 / favicon-32 · favicon-48
social-avatar-512.png / -1024.png   ready-to-upload profile images
site.webmanifest    PWA/home-screen metadata
og-image.jpg    1200×630 link-preview card (regenerate from og-image.svg)
netlify.toml    Netlify config: redirects, security headers, caching
vercel.json     Vercel config: the same headers and caching rules
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

### Option B — Vercel (best if you want auto-deploy from GitHub)

No CLI needed. Push the repo to GitHub first, then:

1. <https://vercel.com/new> → **Import Git Repository** → authorise GitHub →
   pick `whats-my-tax-rate`.
2. Framework preset: **Other**. Build command: leave empty. Output directory:
   leave empty (the repo root is the site).
3. Deploy. Then **Settings → Domains** → add `whatsmytaxrate.com`.
4. At your registrar, point the domain at Vercel. Use whatever Vercel's
   Domains panel shows you rather than a value from any guide, this one
   included — Vercel is expanding its IP range and the panel is authoritative.
   Currently:
   - `A` record, host `@` → `216.198.79.1` (the older `76.76.21.21` still
     works but is no longer what Vercel recommends)
   - `CNAME` record, host `www` → `cname.vercel-dns.com`
5. **Delete any record the registrar added on signup.** Namecheap in
   particular parks new domains on `192.64.119.225` and adds a `www` CNAME to
   `parkingpage.namecheap.com`. Leaving the parking A record in place gives
   the apex two A records, DNS round-robins between them, and roughly half
   your visitors get the parking page — Vercel reports "Invalid
   Configuration" and the TLS certificate never provisions.
6. In **Settings → Domains**, set `whatsmytaxrate.com` as primary and mark
   `www` as a redirect to it.

`vercel.json` supplies the security headers and cache rules; `netlify.toml`
is ignored here (and vice versa), so keeping both costs nothing.

After this, every `git push` to `main` redeploys automatically.

### Option C — Cloudflare Pages

```bash
npx wrangler pages deploy . --project-name whats-my-tax-rate
```

Then add the custom domain under **Workers & Pages → your project → Custom
domains**. If the domain is already on Cloudflare DNS the record is created for
you.

### Option D — GitHub Pages

Push the folder to a repo, enable Pages on the `main` branch root, and add a
`CNAME` file containing `whatsmytaxrate.com`. Note that neither
`netlify.toml` nor `vercel.json` applies here, so you lose the security
headers and redirects — prefer Vercel, Netlify or Cloudflare.

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
4. **`shelters`** — the 401(k), HSA, FSA and IRA contribution caps, from the
   IRS notice. These drive the sliders in the "What if you sheltered more?"
   panel **and** the limit line on each card further down, so each figure is
   written once. Do not add a second copy anywhere.
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
  pretaxConformity: { k401: false }, // optional; see below. Omit if the state
                                     // follows federal treatment (most do)
  notes: 'Local income taxes are not included.'   // shown under the picker
}
```

`max: null` means "and up". `notes` renders as the amber advisory beneath the
state selector — use it for local/municipal taxes the calculator does not
model. Add `provisional: true` when a state hasn't published final figures;
the UI appends its own caution sentence automatically.

**Shelter variant toggles.** A shelter may carry a `variants` block that adds
a small toggle to its slider row and switches the contribution ceiling. Two
exist: HSA `hsacov` (self-only $4,400 / family $8,750) and 401(k) `k401mode`
(just me $24,500 / both spouses $49,000). A variant may set `mfjOnly: true`
so it only appears for joint filers — the 401(k) doubling does, because the
deferral limit is per person. Leaving MFJ hides the toggle, resets it, and
clamps any over-limit contribution. The chosen option rides in the share URL
under its `param`. Both HSA coverage and IRA are per-person too; only 401(k)
and HSA expose a toggle today.

**Pre-tax conformity.** Four states tax contributions the federal system
exempts, so the shelter panel must not credit a state saving there. Set
`pretaxConformity` with `false` for each vehicle the state taxes anyway —
keys match `TAX_FEDERAL.shelters` (`k401`, `hsa`, `fsa`, `dcfsa`, `ira`).
Currently: **PA** taxes all elective deferrals and allows no IRA deduction;
**NJ** never adopted IRC 125, so HSA and both FSAs are taxable wages, plus no
IRA deduction; **CA** has never conformed on HSAs; **MA** allows no IRA
deduction. Alabama is often miscited as a third HSA non-conformer — it has
conformed since 2018, so leave it out.

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

Also in scope, via the shelter panel: pre-tax contributions, with the
distinction that makes the panel worth having. Elective deferrals to a
401(k)/403(b)/457 reduce income tax but **remain in the FICA wage base**.
Section 125 money — health FSA, dependent care FSA, and an HSA funded through
payroll — escapes FICA as well, worth an extra 7.65% below the wage base. A
Traditional IRA is claimed at filing, so it never touches FICA. That is the
`savesFica` flag on each shelter; changing it changes real numbers.

Deliberately out of scope, and disclosed in the footer: local and municipal
income taxes, AMT, the Net Investment Income Tax, capital gains and qualified
dividends, self-employment tax, itemized deductions, and all credits other than
the illustrative ones described in the Credits section.

---

## The logo

The mark is four ascending bars — the tax brackets your income climbs — crowned
by a gold dot on the tallest bar (which reads as an "i", a person, "you are
here"). Brand palette: deep purple `#4A1D6A`, violet `#7C3AED`, gold `#F2B347`,
with a light purple ramp `#C9B8EC → #9B7BD4` for the shorter bars.

Two source variants: `logo-mark.svg` for light backgrounds (dark top bar),
`logo-mark-white.svg` for dark (white top bar). `favicon.svg` and
`social-avatar.svg` put the light mark on the purple gradient tile.

Note the site keeps **green** as its data colour (take-home, effective rate,
"you are here" on the charts) and uses **gold** only as the logo's brand
accent — two roles, so they don't compete. Don't recolour the charts to gold.

`logo-mark.svg` is the source of truth. To re-render the raster assets after
editing it, load a size-wrapped copy in headless Chrome — the pattern is in
the git history for this commit. All PNGs are regenerated from SVG, so nothing
here is hand-drawn pixels.

For social profiles upload `social-avatar-512.png` (or `-1024` where allowed).
The bars sit inside the central 62% so nothing clips when a platform crops the
avatar to a circle.

Channel banners are pre-sized per platform:
- `banner-x-1500x500.png` — X / Twitter header
- `banner-linkedin-1584x396.png` — LinkedIn personal banner
- `banner-youtube-2560x1440.png` — YouTube (content sits in the 1546×423
  centre safe area so it survives every device crop)
- `banner-facebook-1640x856.png` — Facebook page cover
TikTok has no banner — it uses the avatar only. Regenerate all four from
`gen-banners.py` in the session scratchpad if the tagline or sizes change.

## Regenerating the link-preview image

`og-image.svg` is the source. To re-render the PNG after editing it:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --screenshot=og-image.png \
  --window-size=1200,630 --hide-scrollbars og-image.svg

sips -s format jpeg -s formatOptions 45 og-image.png --out og-image.jpg
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
- Contribution sliders are native `<input type="range">`, so they work with
  arrow keys and screen readers; each carries a live `aria-valuetext` giving
  the dollar amount rather than a bare number.

---

## Analytics

Vercel Web Analytics, cookieless, no consent banner required. Two steps:
enable it in the dashboard (**Project → Analytics → Enable**), and keep the
two script tags at the bottom of `index.html`. The framework snippet in
Vercel's docs is for React — it does not apply here; this site has no build
step and no npm.

**Why `analytics.js` exists.** The page keeps its state in the query string,
so a real URL looks like `/?income=185000&status=mfj&state=NJ&k401=24500`.
Sent as-is, that logs strangers' salaries and retirement contributions into
an analytics dashboard. The `beforeSend` hook strips every financial
parameter before the beacon leaves the browser; `state` and `status` survive
because they are useful in aggregate and identify nobody. A malformed URL
drops the event entirely rather than risk sending it unredacted.

If you add a query parameter that carries anything personal, add its key to
`SENSITIVE` in that file.

## Testing

There is no test runner — the checks are standalone HTML files run through
headless Chrome, because the app has no build step and no Node dependency.

Before shipping a data change, verify three things:

1. **Syntax.** Load each of `data.js`, `states.js` and `app.js` in a page with
   an `window.onerror` handler. A stray apostrophe inside a single-quoted
   string silently undefines `TAX_STATES` and kills the whole site — this has
   happened once already, and the page still renders enough to look fine.
2. **The federal engine**, against hand-computed values: all four filing
   statuses, the FICA wage-base cap, the Additional Medicare threshold,
   bracket continuity, and a monotonicity sweep proving take-home never falls
   as income rises.
3. **The state table**: all 51 present, no bracket gaps or overlaps, no
   decreasing rates, plausible effective rates, and monotonic tax across
   $0–500k in every jurisdiction.
4. **The Content Security Policy**, by copying the site to a scratch folder
   and injecting the `vercel.json` policy as a `<meta http-equiv>` tag. This
   is not optional paranoia: `style-src 'self'` silently rendered the split
   bar at zero width and flattened the proportional bracket fill to equal
   segments, and none of it reproduced over `file://` because the headers
   only exist when a host serves them. `style-src` therefore carries
   `'unsafe-inline'` — do not remove it without re-running this check.
   `script-src` stays strict, which is why the analytics bootstrap is a file
   rather than an inline tag.

Read the rendered numbers, not the HTML placeholders — several result fields
ship with `$0` and `$1.00` defaults, which look exactly like a correct
zero-contribution result.

## Licence

Content and code © whatsmytaxrate.com. Educational use only — not tax advice.
