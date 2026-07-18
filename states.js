/* ==========================================================================
   State individual income tax — tax year 2026.

   MODELLING NOTE, important when reading these numbers:
   `standardDeduction` here is the *effective* subtraction for one filer with
   no dependents. Roughly twenty states grant a personal exemption as a
   DEDUCTION rather than a credit, and several (IL, IN, MI, NJ, OH, PA, WV,
   MA, CT, UT) have no standard deduction at all — so ignoring the exemption
   would materially over-tax those states. Where a state's exemption is a
   deduction it is folded in here: one exemption for single/HOH/MFS, two for
   MFJ. Where it is a true dollar credit it lives in personalExemptionCredit.

   Not modelled anywhere: local and municipal income taxes (flagged per state
   in `notes`), deduction and exemption phase-outs, low-income tax tables,
   alternative minimum calculations, and dependants.

   `provisional: true` marks a jurisdiction whose 2026 figures rest on
   pre-publication sources; the UI surfaces a caution for these.

   Primary sources: state revenue department 2026 rate schedules, withholding
   guides and enacted 2026 session legislation. Tax Foundation's February 2026
   report was used only as a cross-check — it is stale for six states that cut
   rates retroactively after it went to press (AR, GA, UT, WV, SC, ME).
   ========================================================================== */

window.TAX_STATES = {

  /* ---- No tax on wage income ------------------------------------------ */

  AK: { name: 'Alaska', type: 'none' },
  FL: { name: 'Florida', type: 'none' },
  NV: { name: 'Nevada', type: 'none' },
  SD: { name: 'South Dakota', type: 'none' },
  TN: { name: 'Tennessee', type: 'none' },
  TX: { name: 'Texas', type: 'none' },
  WY: { name: 'Wyoming', type: 'none' },
  NH: { name: 'New Hampshire', type: 'none',
        notes: 'No income tax of any kind — the interest and dividends tax was fully repealed after 2024.' },
  WA: { name: 'Washington', type: 'none',
        notes: 'No tax on wages. Washington does levy a capital gains excise tax on large long-term gains, which this calculator does not model.' },

  /* ---- Flat-rate states ----------------------------------------------- */

  AZ: { name: 'Arizona', type: 'flat',
        brackets: { single: [{ rate: 0.025, min: 0, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        notes: 'Arizona conforms to the federal standard deduction. A per-dependent credit is available and is not modelled.' },

  CO: { name: 'Colorado', type: 'flat',
        brackets: { single: [{ rate: 0.044, min: 0, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        notes: 'Colorado starts from federal taxable income, so the federal standard deduction carries through. Proposition MM limits that deduction for filers above $300,000 of income — not modelled.' },

  GA: { name: 'Georgia', type: 'flat',
        brackets: { single: [{ rate: 0.0499, min: 0, max: null }] },
        standardDeduction: { single: 15000, mfj: 30000, hoh: 15000, mfs: 15000 },
        notes: 'Rate cut to 4.99% and the standard deduction raised by HB 463, retroactive to 1 January 2026.' },

  ID: { name: 'Idaho', type: 'graduated',   // zero bracket, then one rate
        brackets: { single: [{ rate: 0, min: 0, max: 4811 }, { rate: 0.053, min: 4811, max: null }],
                    mfj:    [{ rate: 0, min: 0, max: 9622 }, { rate: 0.053, min: 9622, max: null }],
                    hoh:    [{ rate: 0, min: 0, max: 9622 }, { rate: 0.053, min: 9622, max: null }],
                    mfs:    [{ rate: 0, min: 0, max: 4811 }, { rate: 0.053, min: 4811, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        provisional: true,
        notes: 'Effectively 5.3% above an exempt band. Idaho has not published its 2026 indexed thresholds; 2025 figures are carried forward.' },

  IL: { name: 'Illinois', type: 'flat',
        brackets: { single: [{ rate: 0.0495, min: 0, max: null }] },
        standardDeduction: { single: 2925, mfj: 5850, hoh: 2925, mfs: 2925 },
        notes: 'Illinois has no standard deduction. The figure used here is the personal exemption allowance, which is disallowed entirely above $250,000 of income ($500,000 joint).' },

  IN: { name: 'Indiana', type: 'flat',
        brackets: { single: [{ rate: 0.0295, min: 0, max: null }] },
        standardDeduction: { single: 1000, mfj: 2000, hoh: 1000, mfs: 1000 },
        notes: 'All 92 Indiana counties levy their own income tax of roughly 0.5%–3%. That is not included here and will add meaningfully to your bill.' },

  IA: { name: 'Iowa', type: 'flat',
        brackets: { single: [{ rate: 0.038, min: 0, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        personalExemptionCredit: { single: 40, mfj: 80, hoh: 80, mfs: 40 },
        notes: 'Some Iowa school districts levy a surtax on state tax liability, which is not included.' },

  KY: { name: 'Kentucky', type: 'flat',
        brackets: { single: [{ rate: 0.035, min: 0, max: null }] },
        standardDeduction: { single: 3360, mfj: 3360, hoh: 3360, mfs: 3360 },
        notes: 'Kentucky’s standard deduction is not doubled for joint filers — it is $3,360 per return. Widespread city and county occupational (payroll) taxes of 0.5%–2.5% are not included.' },

  LA: { name: 'Louisiana', type: 'flat',
        brackets: { single: [{ rate: 0.03, min: 0, max: null }] },
        standardDeduction: { single: 12875, mfj: 25750, hoh: 25750, mfs: 12875 } },

  MI: { name: 'Michigan', type: 'flat',
        brackets: { single: [{ rate: 0.0425, min: 0, max: null }] },
        standardDeduction: { single: 5900, mfj: 11800, hoh: 5900, mfs: 5900 },
        notes: 'Michigan has no standard deduction; the figure used is the personal exemption. Around two dozen cities levy their own income tax — Detroit at 2.4% for residents — which is not included.' },

  MS: { name: 'Mississippi', type: 'graduated',   // zero bracket, then one rate
        brackets: { single: [{ rate: 0, min: 0, max: 10000 }, { rate: 0.04, min: 10000, max: null }] },
        standardDeduction: { single: 8300, mfj: 16600, hoh: 12900, mfs: 8300 },
        notes: 'The first $10,000 of taxable income is exempt. Figures combine the standard deduction with the personal exemption.' },

  NC: { name: 'North Carolina', type: 'flat',
        brackets: { single: [{ rate: 0.0399, min: 0, max: null }] },
        standardDeduction: { single: 12750, mfj: 25500, hoh: 19125, mfs: 12750 },
        notes: 'Flat 3.99% for 2026, down from 4.25% in 2025. Further trigger-based cuts are possible from 2027.' },

  PA: { name: 'Pennsylvania', type: 'flat',
        brackets: { single: [{ rate: 0.0307, min: 0, max: null }] },
        standardDeduction: { single: 0, mfj: 0, hoh: 0, mfs: 0 },
        notes: 'Pennsylvania has no standard deduction and no personal exemption. Nearly every municipality levies a local earned income tax — commonly 1%, and about 3.75% in Philadelphia — which is not included.' },

  UT: { name: 'Utah', type: 'flat',
        brackets: { single: [{ rate: 0.0445, min: 0, max: null }] },
        standardDeduction: { single: 0, mfj: 0, hoh: 0, mfs: 0 },
        personalExemptionCredit: { single: 966, mfj: 1932, hoh: 1449, mfs: 966 },
        provisional: true,
        notes: 'Rate cut to 4.45% by SB 60, retroactive to 1 January 2026. Utah grants a taxpayer credit rather than a deduction; it phases out as income rises, which is not modelled, so tax here is understated at higher incomes.' },

  /* ---- Graduated states ----------------------------------------------- */

  AL: { name: 'Alabama', type: 'graduated',
        brackets: { single: [{ rate: 0.02, min: 0, max: 500 }, { rate: 0.04, min: 500, max: 3000 }, { rate: 0.05, min: 3000, max: null }],
                    mfj:    [{ rate: 0.02, min: 0, max: 1000 }, { rate: 0.04, min: 1000, max: 6000 }, { rate: 0.05, min: 6000, max: null }] },
        standardDeduction: { single: 4500, mfj: 11500, hoh: 8200, mfs: 5750 },
        notes: 'Head of family and separate filers use the single rate schedule. The standard deduction phases down as income rises — not modelled, so tax is understated at higher incomes. Municipal occupational taxes are not included.' },

  AR: { name: 'Arkansas', type: 'graduated',
        brackets: { single: [{ rate: 0.02, min: 0, max: 4700 }, { rate: 0.037, min: 4700, max: null }] },
        standardDeduction: { single: 2470, mfj: 4940, hoh: 2470, mfs: 2470 },
        personalExemptionCredit: { single: 29, mfj: 58, hoh: 58, mfs: 29 },
        provisional: true,
        notes: 'Top rate cut to 3.7% retroactive to 1 January 2026. Brackets do not vary by filing status. A separate low-income tax table applies below roughly $94,700 and is not modelled. 2026 deduction amounts are not yet published.' },

  CA: { name: 'California', type: 'graduated',
        brackets: {
          single: [{ rate: 0.01, min: 0, max: 11079 }, { rate: 0.02, min: 11079, max: 26264 }, { rate: 0.04, min: 26264, max: 41452 },
                   { rate: 0.06, min: 41452, max: 57542 }, { rate: 0.08, min: 57542, max: 72724 }, { rate: 0.093, min: 72724, max: 371479 },
                   { rate: 0.103, min: 371479, max: 445771 }, { rate: 0.113, min: 445771, max: 742953 },
                   { rate: 0.123, min: 742953, max: 1000000 }, { rate: 0.133, min: 1000000, max: null }],
          mfj:    [{ rate: 0.01, min: 0, max: 22158 }, { rate: 0.02, min: 22158, max: 52528 }, { rate: 0.04, min: 52528, max: 82904 },
                   { rate: 0.06, min: 82904, max: 115084 }, { rate: 0.08, min: 115084, max: 145448 }, { rate: 0.093, min: 145448, max: 742958 },
                   { rate: 0.103, min: 742958, max: 891542 }, { rate: 0.113, min: 891542, max: 1485906 },
                   { rate: 0.123, min: 1485906, max: 2000000 }, { rate: 0.133, min: 2000000, max: null }],
          hoh:    [{ rate: 0.01, min: 0, max: 22173 }, { rate: 0.02, min: 22173, max: 52530 }, { rate: 0.04, min: 52530, max: 67716 },
                   { rate: 0.06, min: 67716, max: 83805 }, { rate: 0.08, min: 83805, max: 98990 }, { rate: 0.093, min: 98990, max: 505208 },
                   { rate: 0.103, min: 505208, max: 606251 }, { rate: 0.113, min: 606251, max: 1010417 },
                   { rate: 0.123, min: 1010417, max: null }],
          mfs:    [{ rate: 0.01, min: 0, max: 11079 }, { rate: 0.02, min: 11079, max: 26264 }, { rate: 0.04, min: 26264, max: 41452 },
                   { rate: 0.06, min: 41452, max: 57542 }, { rate: 0.08, min: 57542, max: 72724 }, { rate: 0.093, min: 72724, max: 371479 },
                   { rate: 0.103, min: 371479, max: 445771 }, { rate: 0.113, min: 445771, max: 500000 },
                   { rate: 0.123, min: 500000, max: 742953 }, { rate: 0.133, min: 742953, max: null }] },
        standardDeduction: { single: 5706, mfj: 11412, hoh: 11412, mfs: 5706 },
        personalExemptionCredit: { single: 153, mfj: 306, hoh: 153, mfs: 153 },
        provisional: true,
        notes: 'Top rates include the 1% Mental Health Services surtax. Excludes the State Disability Insurance payroll tax, which has no wage ceiling and adds over 1% to the effective rate on wages. The Franchise Tax Board has not yet published final 2026 indexed amounts.' },

  CT: { name: 'Connecticut', type: 'graduated',
        brackets: {
          single: [{ rate: 0.02, min: 0, max: 10000 }, { rate: 0.045, min: 10000, max: 50000 }, { rate: 0.055, min: 50000, max: 100000 },
                   { rate: 0.06, min: 100000, max: 200000 }, { rate: 0.065, min: 200000, max: 250000 },
                   { rate: 0.069, min: 250000, max: 500000 }, { rate: 0.0699, min: 500000, max: null }],
          mfj:    [{ rate: 0.02, min: 0, max: 20000 }, { rate: 0.045, min: 20000, max: 100000 }, { rate: 0.055, min: 100000, max: 200000 },
                   { rate: 0.06, min: 200000, max: 400000 }, { rate: 0.065, min: 400000, max: 500000 },
                   { rate: 0.069, min: 500000, max: 1000000 }, { rate: 0.0699, min: 1000000, max: null }],
          hoh:    [{ rate: 0.02, min: 0, max: 16000 }, { rate: 0.045, min: 16000, max: 80000 }, { rate: 0.055, min: 80000, max: 160000 },
                   { rate: 0.06, min: 160000, max: 320000 }, { rate: 0.065, min: 320000, max: 400000 },
                   { rate: 0.069, min: 400000, max: 800000 }, { rate: 0.0699, min: 800000, max: null }],
          mfs:    [{ rate: 0.02, min: 0, max: 10000 }, { rate: 0.045, min: 10000, max: 50000 }, { rate: 0.055, min: 50000, max: 100000 },
                   { rate: 0.06, min: 100000, max: 200000 }, { rate: 0.065, min: 200000, max: 250000 },
                   { rate: 0.069, min: 250000, max: 500000 }, { rate: 0.0699, min: 500000, max: null }] },
        standardDeduction: { single: 15000, mfj: 24000, hoh: 19000, mfs: 12000 },
        notes: 'Connecticut has no standard deduction; the figure used is the personal exemption, which phases out completely by around $56,000 of income for a single filer — not modelled, so tax is understated in the middle of the range. A benefit recapture applies to high earners.' },

  DE: { name: 'Delaware', type: 'graduated',
        brackets: { single: [{ rate: 0, min: 0, max: 2000 }, { rate: 0.022, min: 2000, max: 5000 }, { rate: 0.039, min: 5000, max: 10000 },
                             { rate: 0.048, min: 10000, max: 20000 }, { rate: 0.052, min: 20000, max: 25000 },
                             { rate: 0.0555, min: 25000, max: 60000 }, { rate: 0.066, min: 60000, max: null }] },
        standardDeduction: { single: 3250, mfj: 6500, hoh: 3250, mfs: 3250 },
        personalExemptionCredit: { single: 110, mfj: 220, hoh: 110, mfs: 110 },
        notes: 'One rate schedule applies to every filing status. Wilmington levies a 1.25% city wage tax that is not included.' },

  DC: { name: 'District of Columbia', type: 'graduated',
        brackets: { single: [{ rate: 0.04, min: 0, max: 10000 }, { rate: 0.06, min: 10000, max: 40000 }, { rate: 0.065, min: 40000, max: 60000 },
                             { rate: 0.085, min: 60000, max: 250000 }, { rate: 0.0925, min: 250000, max: 500000 },
                             { rate: 0.0975, min: 500000, max: 1000000 }, { rate: 0.1075, min: 1000000, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        notes: 'One rate schedule for every filing status. The standard deduction tracks the federal amount; DC’s personal exemption is repealed.' },

  HI: { name: 'Hawaii', type: 'graduated',
        brackets: {
          single: [{ rate: 0.014, min: 0, max: 9600 }, { rate: 0.032, min: 9600, max: 14400 }, { rate: 0.055, min: 14400, max: 19200 },
                   { rate: 0.064, min: 19200, max: 24000 }, { rate: 0.068, min: 24000, max: 36000 }, { rate: 0.072, min: 36000, max: 48000 },
                   { rate: 0.076, min: 48000, max: 125000 }, { rate: 0.079, min: 125000, max: 175000 }, { rate: 0.0825, min: 175000, max: 225000 },
                   { rate: 0.09, min: 225000, max: 275000 }, { rate: 0.1, min: 275000, max: 325000 }, { rate: 0.11, min: 325000, max: null }],
          mfj:    [{ rate: 0.014, min: 0, max: 19200 }, { rate: 0.032, min: 19200, max: 28800 }, { rate: 0.055, min: 28800, max: 38400 },
                   { rate: 0.064, min: 38400, max: 48000 }, { rate: 0.068, min: 48000, max: 72000 }, { rate: 0.072, min: 72000, max: 96000 },
                   { rate: 0.076, min: 96000, max: 250000 }, { rate: 0.079, min: 250000, max: 350000 }, { rate: 0.0825, min: 350000, max: 450000 },
                   { rate: 0.09, min: 450000, max: 550000 }, { rate: 0.1, min: 550000, max: 650000 }, { rate: 0.11, min: 650000, max: null }],
          hoh:    [{ rate: 0.014, min: 0, max: 14400 }, { rate: 0.032, min: 14400, max: 21600 }, { rate: 0.055, min: 21600, max: 28800 },
                   { rate: 0.064, min: 28800, max: 36000 }, { rate: 0.068, min: 36000, max: 54000 }, { rate: 0.072, min: 54000, max: 72000 },
                   { rate: 0.076, min: 72000, max: 187500 }, { rate: 0.079, min: 187500, max: 262500 }, { rate: 0.0825, min: 262500, max: 337500 },
                   { rate: 0.09, min: 337500, max: 412500 }, { rate: 0.1, min: 412500, max: 487500 }, { rate: 0.11, min: 487500, max: null }] },
        standardDeduction: { single: 9144, mfj: 18288, hoh: 13144, mfs: 9144 },
        notes: 'Act 46 raised the standard deduction for 2026. Figures include the personal exemption. Hawaii’s 13% top bracket begins in 2027, not 2026.' },

  KS: { name: 'Kansas', type: 'graduated',
        brackets: { single: [{ rate: 0.052, min: 0, max: 23000 }, { rate: 0.0558, min: 23000, max: null }],
                    mfj:    [{ rate: 0.052, min: 0, max: 46000 }, { rate: 0.0558, min: 46000, max: null }] },
        standardDeduction: { single: 12765, mfj: 26560, hoh: 15340, mfs: 13280 },
        notes: 'Head of household and separate filers use the single rate schedule. Figures include Kansas’s substantial personal exemption, which is a deduction rather than a credit.' },

  ME: { name: 'Maine', type: 'graduated',
        brackets: {
          single: [{ rate: 0.058, min: 0, max: 27400 }, { rate: 0.0675, min: 27400, max: 64850 },
                   { rate: 0.0715, min: 64850, max: 1000000 }, { rate: 0.0915, min: 1000000, max: null }],
          mfj:    [{ rate: 0.058, min: 0, max: 54850 }, { rate: 0.0675, min: 54850, max: 129750 },
                   { rate: 0.0715, min: 129750, max: 1500000 }, { rate: 0.0915, min: 1500000, max: null }],
          hoh:    [{ rate: 0.058, min: 0, max: 41100 }, { rate: 0.0675, min: 41100, max: 97300 },
                   { rate: 0.0715, min: 97300, max: 1500000 }, { rate: 0.0915, min: 1500000, max: null }],
          mfs:    [{ rate: 0.058, min: 0, max: 27400 }, { rate: 0.0675, min: 27400, max: 64850 },
                   { rate: 0.0715, min: 64850, max: 750000 }, { rate: 0.0915, min: 750000, max: null }] },
        standardDeduction: { single: 21000, mfj: 42000, hoh: 28850, mfs: 21000 },
        notes: 'A new 2% high-income surcharge took effect for 2026, producing the 9.15% top rate. Figures include the personal exemption.' },

  MD: { name: 'Maryland', type: 'graduated',
        brackets: {
          single: [{ rate: 0.02, min: 0, max: 1000 }, { rate: 0.03, min: 1000, max: 2000 }, { rate: 0.04, min: 2000, max: 3000 },
                   { rate: 0.0475, min: 3000, max: 100000 }, { rate: 0.05, min: 100000, max: 125000 }, { rate: 0.0525, min: 125000, max: 150000 },
                   { rate: 0.055, min: 150000, max: 250000 }, { rate: 0.0575, min: 250000, max: 500000 },
                   { rate: 0.0625, min: 500000, max: 1000000 }, { rate: 0.065, min: 1000000, max: null }],
          mfj:    [{ rate: 0.02, min: 0, max: 1000 }, { rate: 0.03, min: 1000, max: 2000 }, { rate: 0.04, min: 2000, max: 3000 },
                   { rate: 0.0475, min: 3000, max: 150000 }, { rate: 0.05, min: 150000, max: 175000 }, { rate: 0.0525, min: 175000, max: 225000 },
                   { rate: 0.055, min: 225000, max: 300000 }, { rate: 0.0575, min: 300000, max: 600000 },
                   { rate: 0.0625, min: 600000, max: 1200000 }, { rate: 0.065, min: 1200000, max: null }],
          hoh:    [{ rate: 0.02, min: 0, max: 1000 }, { rate: 0.03, min: 1000, max: 2000 }, { rate: 0.04, min: 2000, max: 3000 },
                   { rate: 0.0475, min: 3000, max: 150000 }, { rate: 0.05, min: 150000, max: 175000 }, { rate: 0.0525, min: 175000, max: 225000 },
                   { rate: 0.055, min: 225000, max: 300000 }, { rate: 0.0575, min: 300000, max: 600000 },
                   { rate: 0.0625, min: 600000, max: 1200000 }, { rate: 0.065, min: 1200000, max: null }],
          mfs:    [{ rate: 0.02, min: 0, max: 1000 }, { rate: 0.03, min: 1000, max: 2000 }, { rate: 0.04, min: 2000, max: 3000 },
                   { rate: 0.0475, min: 3000, max: 100000 }, { rate: 0.05, min: 100000, max: 125000 }, { rate: 0.0525, min: 125000, max: 150000 },
                   { rate: 0.055, min: 150000, max: 250000 }, { rate: 0.0575, min: 250000, max: 500000 },
                   { rate: 0.0625, min: 500000, max: 1000000 }, { rate: 0.065, min: 1000000, max: null }] },
        standardDeduction: { single: 6600, mfj: 13250, hoh: 10050, mfs: 6600 },
        provisional: true,
        notes: 'Every Maryland county and Baltimore City levies a local income tax of roughly 2.25%–3.20% — the heaviest local income tax burden in the country — and it is NOT included here, so your real bill will be materially higher. The 15%-of-income cap on the standard deduction was repealed for 2025 onward; the 2026 indexed amounts for joint and head-of-household filers are not yet published.' },

  MA: { name: 'Massachusetts', type: 'graduated',
        brackets: { single: [{ rate: 0.05, min: 0, max: 1083150 }, { rate: 0.09, min: 1083150, max: null }] },
        standardDeduction: { single: 4400, mfj: 8800, hoh: 6800, mfs: 4400 },
        notes: 'Flat 5% plus a 4% surtax on income above $1,083,150, the same threshold for every filing status. Massachusetts has no standard deduction; the figure used is the personal exemption.' },

  MN: { name: 'Minnesota', type: 'graduated',
        brackets: {
          single: [{ rate: 0.0535, min: 0, max: 33310 }, { rate: 0.068, min: 33310, max: 109430 },
                   { rate: 0.0785, min: 109430, max: 203150 }, { rate: 0.0985, min: 203150, max: null }],
          mfj:    [{ rate: 0.0535, min: 0, max: 48700 }, { rate: 0.068, min: 48700, max: 193480 },
                   { rate: 0.0785, min: 193480, max: 337930 }, { rate: 0.0985, min: 337930, max: null }],
          mfs:    [{ rate: 0.0535, min: 0, max: 24350 }, { rate: 0.068, min: 24350, max: 96740 },
                   { rate: 0.0785, min: 96740, max: 168965 }, { rate: 0.0985, min: 168965, max: null }] },
        standardDeduction: { single: 15300, mfj: 30600, hoh: 23000, mfs: 15300 },
        provisional: true,
        notes: 'Minnesota publishes a distinct head-of-household rate schedule that could not be verified for 2026; head-of-household filers here use the single schedule and will see a slightly overstated figure. The standard deduction phases down above roughly $244,400.' },

  MO: { name: 'Missouri', type: 'graduated',
        brackets: { single: [{ rate: 0, min: 0, max: 1348 }, { rate: 0.02, min: 1348, max: 2696 }, { rate: 0.025, min: 2696, max: 4044 },
                             { rate: 0.03, min: 4044, max: 5392 }, { rate: 0.035, min: 5392, max: 6740 }, { rate: 0.04, min: 6740, max: 8088 },
                             { rate: 0.045, min: 8088, max: 9436 }, { rate: 0.047, min: 9436, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        notes: 'One rate schedule for every filing status; the standard deduction tracks the federal amount. Kansas City and St. Louis each levy a 1% earnings tax that is not included.' },

  MT: { name: 'Montana', type: 'graduated',
        brackets: { single: [{ rate: 0.047, min: 0, max: 47500 }, { rate: 0.0565, min: 47500, max: null }],
                    mfj:    [{ rate: 0.047, min: 0, max: 95000 }, { rate: 0.0565, min: 95000, max: null }],
                    hoh:    [{ rate: 0.047, min: 0, max: 71250 }, { rate: 0.0565, min: 71250, max: null }],
                    mfs:    [{ rate: 0.047, min: 0, max: 47500 }, { rate: 0.0565, min: 47500, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        provisional: true,
        notes: 'Top rate cut to 5.65% for 2026, with a further cut scheduled for 2027. The head-of-household threshold is derived and unverified.' },

  NE: { name: 'Nebraska', type: 'graduated',
        brackets: { single: [{ rate: 0.0246, min: 0, max: 4130 }, { rate: 0.0351, min: 4130, max: 24760 }, { rate: 0.0455, min: 24760, max: null }],
                    mfj:    [{ rate: 0.0246, min: 0, max: 8250 }, { rate: 0.0351, min: 8250, max: 49530 }, { rate: 0.0455, min: 49530, max: null }] },
        standardDeduction: { single: 8850, mfj: 17700, hoh: 12950, mfs: 8850 },
        personalExemptionCredit: { single: 176, mfj: 352, hoh: 176, mfs: 176 },
        provisional: true,
        notes: 'Top rate cut to 4.55% for 2026. Nebraska has a distinct head-of-household schedule that could not be verified; those filers use the single schedule here.' },

  NJ: { name: 'New Jersey', type: 'graduated',
        brackets: {
          single: [{ rate: 0.014, min: 0, max: 20000 }, { rate: 0.0175, min: 20000, max: 35000 }, { rate: 0.035, min: 35000, max: 40000 },
                   { rate: 0.05525, min: 40000, max: 75000 }, { rate: 0.0637, min: 75000, max: 500000 },
                   { rate: 0.0897, min: 500000, max: 1000000 }, { rate: 0.1075, min: 1000000, max: null }],
          mfj:    [{ rate: 0.014, min: 0, max: 20000 }, { rate: 0.0175, min: 20000, max: 50000 }, { rate: 0.0245, min: 50000, max: 70000 },
                   { rate: 0.035, min: 70000, max: 80000 }, { rate: 0.05525, min: 80000, max: 150000 }, { rate: 0.0637, min: 150000, max: 500000 },
                   { rate: 0.0897, min: 500000, max: 1000000 }, { rate: 0.1075, min: 1000000, max: null }],
          hoh:    [{ rate: 0.014, min: 0, max: 20000 }, { rate: 0.0175, min: 20000, max: 50000 }, { rate: 0.0245, min: 50000, max: 70000 },
                   { rate: 0.035, min: 70000, max: 80000 }, { rate: 0.05525, min: 80000, max: 150000 }, { rate: 0.0637, min: 150000, max: 500000 },
                   { rate: 0.0897, min: 500000, max: 1000000 }, { rate: 0.1075, min: 1000000, max: null }],
          mfs:    [{ rate: 0.014, min: 0, max: 20000 }, { rate: 0.0175, min: 20000, max: 35000 }, { rate: 0.035, min: 35000, max: 40000 },
                   { rate: 0.05525, min: 40000, max: 75000 }, { rate: 0.0637, min: 75000, max: 500000 },
                   { rate: 0.0897, min: 500000, max: 1000000 }, { rate: 0.1075, min: 1000000, max: null }] },
        standardDeduction: { single: 1000, mfj: 2000, hoh: 1000, mfs: 1000 },
        notes: 'Head of household uses the joint schedule. New Jersey has no standard deduction; the figure used is the personal exemption.' },

  NM: { name: 'New Mexico', type: 'graduated',
        brackets: {
          single: [{ rate: 0.015, min: 0, max: 5500 }, { rate: 0.032, min: 5500, max: 16500 }, { rate: 0.043, min: 16500, max: 33500 },
                   { rate: 0.047, min: 33500, max: 66500 }, { rate: 0.049, min: 66500, max: 210000 }, { rate: 0.059, min: 210000, max: null }],
          mfj:    [{ rate: 0.015, min: 0, max: 8000 }, { rate: 0.032, min: 8000, max: 25000 }, { rate: 0.043, min: 25000, max: 50000 },
                   { rate: 0.047, min: 50000, max: 100000 }, { rate: 0.049, min: 100000, max: 315000 }, { rate: 0.059, min: 315000, max: null }],
          hoh:    [{ rate: 0.015, min: 0, max: 8000 }, { rate: 0.032, min: 8000, max: 25000 }, { rate: 0.043, min: 25000, max: 50000 },
                   { rate: 0.047, min: 50000, max: 100000 }, { rate: 0.049, min: 100000, max: 315000 }, { rate: 0.059, min: 315000, max: null }],
          mfs:    [{ rate: 0.015, min: 0, max: 4000 }, { rate: 0.032, min: 4000, max: 12500 }, { rate: 0.043, min: 12500, max: 25000 },
                   { rate: 0.047, min: 25000, max: 50000 }, { rate: 0.049, min: 50000, max: 157500 }, { rate: 0.059, min: 157500, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        notes: 'The standard deduction tracks the federal amount.' },

  NY: { name: 'New York', type: 'graduated',
        brackets: {
          single: [{ rate: 0.039, min: 0, max: 8500 }, { rate: 0.044, min: 8500, max: 11700 }, { rate: 0.0515, min: 11700, max: 13900 },
                   { rate: 0.054, min: 13900, max: 80650 }, { rate: 0.059, min: 80650, max: 215400 }, { rate: 0.0685, min: 215400, max: 1077550 },
                   { rate: 0.0965, min: 1077550, max: 5000000 }, { rate: 0.103, min: 5000000, max: 25000000 }, { rate: 0.109, min: 25000000, max: null }],
          mfj:    [{ rate: 0.039, min: 0, max: 17150 }, { rate: 0.044, min: 17150, max: 23600 }, { rate: 0.0515, min: 23600, max: 27900 },
                   { rate: 0.054, min: 27900, max: 161550 }, { rate: 0.059, min: 161550, max: 323200 }, { rate: 0.0685, min: 323200, max: 2155350 },
                   { rate: 0.0965, min: 2155350, max: 5000000 }, { rate: 0.103, min: 5000000, max: 25000000 }, { rate: 0.109, min: 25000000, max: null }],
          hoh:    [{ rate: 0.039, min: 0, max: 12800 }, { rate: 0.044, min: 12800, max: 17650 }, { rate: 0.0515, min: 17650, max: 20900 },
                   { rate: 0.054, min: 20900, max: 107650 }, { rate: 0.059, min: 107650, max: 269300 }, { rate: 0.0685, min: 269300, max: 1616450 },
                   { rate: 0.0965, min: 1616450, max: 5000000 }, { rate: 0.103, min: 5000000, max: 25000000 }, { rate: 0.109, min: 25000000, max: null }],
          mfs:    [{ rate: 0.039, min: 0, max: 8500 }, { rate: 0.044, min: 8500, max: 11700 }, { rate: 0.0515, min: 11700, max: 13900 },
                   { rate: 0.054, min: 13900, max: 80650 }, { rate: 0.059, min: 80650, max: 215400 }, { rate: 0.0685, min: 215400, max: 1077550 },
                   { rate: 0.0965, min: 1077550, max: 5000000 }, { rate: 0.103, min: 5000000, max: 25000000 }, { rate: 0.109, min: 25000000, max: null }] },
        standardDeduction: { single: 8000, mfj: 16050, hoh: 11200, mfs: 8000 },
        provisional: true,
        notes: 'New York City residents pay an additional city income tax of roughly 3.1%–3.9%, and Yonkers levies a surcharge. Neither is included here, so a city resident’s real bill is substantially higher. Head-of-household thresholds are approximate.' },

  ND: { name: 'North Dakota', type: 'graduated',
        brackets: { single: [{ rate: 0, min: 0, max: 49575 }, { rate: 0.0195, min: 49575, max: 250400 }, { rate: 0.025, min: 250400, max: null }],
                    mfj:    [{ rate: 0, min: 0, max: 82800 }, { rate: 0.0195, min: 82800, max: 304850 }, { rate: 0.025, min: 304850, max: null }],
                    hoh:    [{ rate: 0, min: 0, max: 66400 }, { rate: 0.0195, min: 66400, max: 277600 }, { rate: 0.025, min: 277600, max: null }],
                    mfs:    [{ rate: 0, min: 0, max: 41400 }, { rate: 0.0195, min: 41400, max: 152425 }, { rate: 0.025, min: 152425, max: null }] },
        standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },
        notes: 'The lowest bracket is 0%, so most North Dakota filers owe no state income tax at all.' },

  OH: { name: 'Ohio', type: 'graduated',
        brackets: { single: [{ rate: 0, min: 0, max: 26050 }, { rate: 0.0275, min: 26050, max: null }] },
        standardDeduction: { single: 2400, mfj: 4800, hoh: 2400, mfs: 2400 },
        provisional: true,
        notes: 'Ohio completed its move to a single rate in 2026: nothing on the first $26,050, then 2.75%. Hundreds of Ohio municipalities and some school districts levy income taxes of roughly 1%–3% that are NOT included. The personal exemption used here shrinks as income rises and disappears above $500,000.' },

  OK: { name: 'Oklahoma', type: 'graduated',
        brackets: { single: [{ rate: 0, min: 0, max: 3750 }, { rate: 0.025, min: 3750, max: 4900 }, { rate: 0.035, min: 4900, max: 7200 },
                             { rate: 0.045, min: 7200, max: null }],
                    mfj:    [{ rate: 0, min: 0, max: 7500 }, { rate: 0.025, min: 7500, max: 9800 }, { rate: 0.035, min: 9800, max: 14400 },
                             { rate: 0.045, min: 14400, max: null }],
                    hoh:    [{ rate: 0, min: 0, max: 7500 }, { rate: 0.025, min: 7500, max: 9800 }, { rate: 0.035, min: 9800, max: 14400 },
                             { rate: 0.045, min: 14400, max: null }],
                    mfs:    [{ rate: 0, min: 0, max: 3750 }, { rate: 0.025, min: 3750, max: 4900 }, { rate: 0.035, min: 4900, max: 7200 },
                             { rate: 0.045, min: 7200, max: null }] },
        standardDeduction: { single: 7350, mfj: 14700, hoh: 10350, mfs: 7350 },
        notes: 'HB 2764 collapsed Oklahoma’s six brackets into three plus a zero bracket, effective 2026. Figures include the personal exemption.' },

  OR: { name: 'Oregon', type: 'graduated',
        brackets: { single: [{ rate: 0.0475, min: 0, max: 4550 }, { rate: 0.0675, min: 4550, max: 11400 },
                             { rate: 0.0875, min: 11400, max: 125000 }, { rate: 0.099, min: 125000, max: null }],
                    mfj:    [{ rate: 0.0475, min: 0, max: 9100 }, { rate: 0.0675, min: 9100, max: 22800 },
                             { rate: 0.0875, min: 22800, max: 250000 }, { rate: 0.099, min: 250000, max: null }],
                    hoh:    [{ rate: 0.0475, min: 0, max: 9100 }, { rate: 0.0675, min: 9100, max: 22800 },
                             { rate: 0.0875, min: 22800, max: 250000 }, { rate: 0.099, min: 250000, max: null }],
                    mfs:    [{ rate: 0.0475, min: 0, max: 4550 }, { rate: 0.0675, min: 4550, max: 11400 },
                             { rate: 0.0875, min: 11400, max: 125000 }, { rate: 0.099, min: 125000, max: null }] },
        standardDeduction: { single: 2910, mfj: 5820, hoh: 4680, mfs: 2910 },
        personalExemptionCredit: { single: 263, mfj: 526, hoh: 263, mfs: 263 },
        notes: 'The Portland metro area and Multnomah County levy additional local income taxes that are not included. The exemption credit phases out at higher incomes.' },

  RI: { name: 'Rhode Island', type: 'graduated',
        brackets: { single: [{ rate: 0.0375, min: 0, max: 82050 }, { rate: 0.0475, min: 82050, max: 186450 },
                             { rate: 0.0599, min: 186450, max: null }] },
        standardDeduction: { single: 16450, mfj: 32900, hoh: 22050, mfs: 16450 },
        notes: 'One rate schedule for every filing status. Figures include the personal exemption; both it and the standard deduction phase out between roughly $261,000 and $291,000 of income.' },

  SC: { name: 'South Carolina', type: 'graduated',
        brackets: { single: [{ rate: 0.0199, min: 0, max: 30000 }, { rate: 0.0521, min: 30000, max: null }] },
        standardDeduction: { single: 15000, mfj: 30000, hoh: 22500, mfs: 15000 },
        notes: 'Act 110, signed March 2026, replaced the old three-bracket schedule for 2026 and swapped the standard deduction for the South Carolina Individual Adjusted Deduction. That deduction phases out as income rises — not modelled — so tax is understated above roughly $55,000 for a single filer.' },

  VT: { name: 'Vermont', type: 'graduated',
        brackets: {
          single: [{ rate: 0.0335, min: 0, max: 49400 }, { rate: 0.066, min: 49400, max: 119700 },
                   { rate: 0.076, min: 119700, max: 249700 }, { rate: 0.0875, min: 249700, max: null }],
          mfj:    [{ rate: 0.0335, min: 0, max: 82500 }, { rate: 0.066, min: 82500, max: 199450 },
                   { rate: 0.076, min: 199450, max: 304000 }, { rate: 0.0875, min: 304000, max: null }],
          hoh:    [{ rate: 0.0335, min: 0, max: 66200 }, { rate: 0.066, min: 66200, max: 171000 },
                   { rate: 0.076, min: 171000, max: 276850 }, { rate: 0.0875, min: 276850, max: null }],
          mfs:    [{ rate: 0.0335, min: 0, max: 41250 }, { rate: 0.066, min: 41250, max: 99725 },
                   { rate: 0.076, min: 99725, max: 152000 }, { rate: 0.0875, min: 152000, max: null }] },
        standardDeduction: { single: 12950, mfj: 25900, hoh: 16750, mfs: 12950 },
        provisional: true,
        notes: 'Vermont publishes its schedules in December, so these are 2025 figures used as a 2026 proxy. Filers above $150,000 of income pay the greater of the calculated tax or 3% of income — not modelled. Figures include the personal exemption.' },

  VA: { name: 'Virginia', type: 'graduated',
        brackets: { single: [{ rate: 0.02, min: 0, max: 3000 }, { rate: 0.03, min: 3000, max: 5000 },
                             { rate: 0.05, min: 5000, max: 17000 }, { rate: 0.0575, min: 17000, max: null }] },
        standardDeduction: { single: 9680, mfj: 19360, hoh: 9680, mfs: 9680 },
        notes: 'Virginia has no head-of-household status — those filers use the single schedule. The top 5.75% rate begins at just $17,000, so most Virginians pay close to a flat rate. Figures include the personal exemption.' },

  WV: { name: 'West Virginia', type: 'graduated',
        brackets: { single: [{ rate: 0.0211, min: 0, max: 10000 }, { rate: 0.0281, min: 10000, max: 25000 },
                             { rate: 0.0316, min: 25000, max: 40000 }, { rate: 0.0422, min: 40000, max: 60000 },
                             { rate: 0.0458, min: 60000, max: null }],
                    mfs:    [{ rate: 0.0211, min: 0, max: 5000 }, { rate: 0.0281, min: 5000, max: 12500 },
                             { rate: 0.0316, min: 12500, max: 20000 }, { rate: 0.0422, min: 20000, max: 30000 },
                             { rate: 0.0458, min: 30000, max: null }] },
        standardDeduction: { single: 2000, mfj: 4000, hoh: 2000, mfs: 2000 },
        notes: 'A 5% across-the-board rate cut took effect retroactive to 1 January 2026. Single, joint and head-of-household filers share one schedule. West Virginia has no standard deduction; the figure used is the personal exemption.' },

  WI: { name: 'Wisconsin', type: 'graduated',
        brackets: { single: [{ rate: 0.035, min: 0, max: 15110 }, { rate: 0.044, min: 15110, max: 51950 },
                             { rate: 0.053, min: 51950, max: 332720 }, { rate: 0.0765, min: 332720, max: null }],
                    mfj:    [{ rate: 0.035, min: 0, max: 20150 }, { rate: 0.044, min: 20150, max: 69260 },
                             { rate: 0.053, min: 69260, max: 443630 }, { rate: 0.0765, min: 443630, max: null }],
                    mfs:    [{ rate: 0.035, min: 0, max: 10080 }, { rate: 0.044, min: 10080, max: 34630 },
                             { rate: 0.053, min: 34630, max: 221820 }, { rate: 0.0765, min: 221820, max: null }] },
        standardDeduction: { single: 14660, mfj: 27240, hoh: 18710, mfs: 12970 },
        provisional: true,
        notes: 'Head-of-household filers use the single schedule, as Wisconsin prints. The standard deduction phases out to zero by roughly $136,000 of income — not modelled — so tax is understated for middle and higher earners. Figures include the personal exemption.' }
};
