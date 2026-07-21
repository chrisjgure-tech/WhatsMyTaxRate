/* ==========================================================================
   Tax data — the only file that needs a yearly refresh.
   See README.md for the update order and the state data contract.

   Federal figures: IRS Rev. Proc. 2025-32 (2026 inflation adjustments),
   IRS Notice 2025-67 (retirement limits), Rev. Proc. 2025-19 (HSA/HDHP),
   SSA cost-of-living announcement (Social Security wage base).
   ========================================================================== */

window.TAX_FEDERAL = {

  taxYear: 2026,
  dataAsOf: 'July 2026',

  // Hard ceiling on the income input, so the page can never render a
  // nine-figure fantasy that makes the whole tool look broken.
  maxIncome: 10000000,

  standardDeduction: { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 },

  brackets: {
    single: [
      { rate: 0.10, min: 0,      max: 12400 },
      { rate: 0.12, min: 12400,  max: 50400 },
      { rate: 0.22, min: 50400,  max: 105700 },
      { rate: 0.24, min: 105700, max: 201775 },
      { rate: 0.32, min: 201775, max: 256225 },
      { rate: 0.35, min: 256225, max: 640600 },
      { rate: 0.37, min: 640600, max: null }
    ],
    mfj: [
      { rate: 0.10, min: 0,      max: 24800 },
      { rate: 0.12, min: 24800,  max: 100800 },
      { rate: 0.22, min: 100800, max: 211400 },
      { rate: 0.24, min: 211400, max: 403550 },
      { rate: 0.32, min: 403550, max: 512450 },
      { rate: 0.35, min: 512450, max: 768700 },
      { rate: 0.37, min: 768700, max: null }
    ],
    hoh: [
      { rate: 0.10, min: 0,      max: 17700 },
      { rate: 0.12, min: 17700,  max: 67450 },
      { rate: 0.22, min: 67450,  max: 105700 },
      { rate: 0.24, min: 105700, max: 201775 },
      { rate: 0.32, min: 201775, max: 256200 },
      { rate: 0.35, min: 256200, max: 640600 },
      { rate: 0.37, min: 640600, max: null }
    ],
    mfs: [
      { rate: 0.10, min: 0,      max: 12400 },
      { rate: 0.12, min: 12400,  max: 50400 },
      { rate: 0.22, min: 50400,  max: 105700 },
      { rate: 0.24, min: 105700, max: 201775 },
      { rate: 0.32, min: 201775, max: 256225 },
      { rate: 0.35, min: 256225, max: 384350 },
      { rate: 0.37, min: 384350, max: null }
    ]
  },

  fica: {
    ssWageBase: 184500,          // SSA, 2026 taxable maximum
    ssRate: 0.062,
    medicareRate: 0.0145,
    addlMedicareRate: 0.009,     // statutory, not indexed since 2013
    addlMedicareThreshold: { single: 200000, mfj: 250000, hoh: 200000, mfs: 125000 }
  },

  /* Supplemental wage withholding — IRS Publication 15, section 7.
     Under the threshold an employer may use the flat percentage method; above
     it, the top rate is mandatory on the excess. Neither is the tax actually
     owed, which is the entire point of the bonus section. */
  supplementalWithholdingRate: 0.22,
  supplementalWithholdingRateHigh: 0.37,
  supplementalThreshold: 1000000,

  // The aggregate method annualises a combined paycheck, so the assumed number
  // of pay periods materially changes how punishing it looks. 26 = biweekly,
  // the most common US payroll cadence.
  payPeriodsPerYear: 26,

  bonusOptions: [5000, 10000, 25000, 50000],
  exampleBonus: 10000,

  // IRS filing-season statistics, average federal refund. Used only in the
  // withholding section, and clearly labelled there as an average.
  averageRefund: 3100,

  /* ------------------------------------------------------------ shelters
     The interactive "what if I contribute more" panel.

     `savesFica` is the distinction almost every calculator gets wrong.
     Elective deferrals to a 401(k)/403(b)/457 are exempt from income tax but
     are STILL subject to Social Security and Medicare — they come out of the
     paycheck after FICA. Section 125 cafeteria-plan money (health FSA,
     dependent care FSA, and HSA contributed through payroll) escapes FICA as
     well, which makes it quietly worth ~7.65% more per dollar. A Traditional
     IRA is an above-the-line deduction you take at filing, so it never
     touches FICA either.                                                    */

  shelters: [
    {
      key: 'k401', name: '401(k) / 403(b) / 457', short: '401(k)',
      max: 24500, catchUp: 32500, savesFica: false,
      // The deferral limit is per person, so a couple filing jointly with two
      // workplace plans can defer up to double. Only offered when MFJ.
      variants: {
        param: 'k401mode', mfjOnly: true,
        opts: [
          { key: 'one',  label: 'Just me',      max: 24500, suffix: '' },
          { key: 'both', label: 'Both spouses', max: 49000, suffix: 'combined' }
        ]
      },
      blurb: 'Pre-tax salary deferral. Cuts income tax, not FICA.'
    },
    {
      key: 'hsa', name: 'Health Savings Account', short: 'HSA',
      max: 4400, maxAlt: 8750, altLabel: 'family', savesFica: true,
      variants: {
        param: 'hsacov',
        opts: [
          { key: 'self',   label: 'Self-only', max: 4400, suffix: 'self' },
          { key: 'family', label: 'Family',    max: 8750, suffix: 'family' }
        ]
      },
      blurb: 'Funded through payroll it dodges income tax AND FICA — the best dollar-for-dollar shelter a W-2 earner has. Fund it yourself from your bank account instead and you lose the FICA saving, because that money was already taxed as wages. Needs an HSA-eligible high-deductible plan.'
    },
    {
      key: 'fsa', name: 'Health FSA', short: 'Health FSA',
      max: 3400, savesFica: true,
      blurb: 'Pre-tax payroll money for copays, prescriptions and glasses. Also dodges FICA. Mostly expires at year end, so estimate low.'
    },
    {
      key: 'dcfsa', name: 'Dependent Care FSA', short: 'Dependent care',
      max: 7500, savesFica: true,
      blurb: 'Daycare and elder care, pre-tax and FICA-free. The $7,500 limit is new for 2026 and your employer has to opt in.'
    },
    {
      key: 'ira', name: 'Traditional IRA', short: 'Trad. IRA',
      max: 7500, catchUp: 8600, savesFica: false,
      blurb: 'Claimed at filing rather than through payroll, so no FICA saving. The deduction phases out at higher incomes if you also have a workplace plan.'
    }
  ],

  /* ---------------------------------------------------------- deductions */

  deductions: [
    {
      name: 'Standard deduction',
      limit: function (s) {
        return '$' + window.TAX_FEDERAL.standardDeduction[s].toLocaleString('en-US') + ' for your filing status';
      },
      applied: true,
      body: 'Every filer subtracts a flat amount from gross income before any tax is calculated — no receipts, no paperwork. It is already reflected in every number on this page. Itemizing only beats it if your mortgage interest, state taxes and charitable gifts together exceed this figure, which for most W-2 earners they do not.'
    },
    /* The four cards below take their dollar figures from `shelters` via
       capFrom(), so a limit is written down exactly once. Editing a number in
       two places and missing one is how a page ends up contradicting itself. */
    {
      name: '401(k) / 403(b) / 457',
      capFrom: function (sh, m) { return 'Up to ' + m(sh.k401.max) + ' · ' + m(sh.k401.catchUp) + ' if 50+'; },
      body: 'Traditional pre-tax contributions cut your taxable wages dollar for dollar. The money grows tax-deferred and is taxed on withdrawal, ideally at a lower rate in retirement. Contribute at least enough to capture the full employer match first — that is an immediate 50–100% return before markets do anything at all.'
    },
    {
      name: 'Health Savings Account',
      capFrom: function (sh, m) { return 'Up to ' + m(sh.hsa.max) + ' self · ' + m(sh.hsa.maxAlt) + ' family'; },
      body: 'The only triple-tax-advantaged account in the code: contributions are pre-tax, growth is tax-free, and qualified medical withdrawals are tax-free. Requires an HSA-eligible high-deductible plan. Balances roll over forever, so many people invest the account and treat it as stealth retirement savings.'
    },
    {
      name: 'Flexible Spending Account',
      capFrom: function (sh, m) { return 'Up to ' + m(sh.fsa.max) + ' health · ' + m(sh.dcfsa.max) + ' dependent care'; },
      body: 'Funded with pre-tax payroll dollars. A health FSA covers copays, prescriptions and glasses. A dependent care FSA covers daycare or elder care and — unusually — escapes FICA as well as income tax. Unlike an HSA most FSA money expires at year end, so estimate conservatively. The higher dependent care limit is new for 2026 and your employer must opt in.'
    },
    {
      name: 'Traditional IRA',
      capFrom: function (sh, m) { return 'Up to ' + m(sh.ira.max) + ' · ' + m(sh.ira.catchUp) + ' if 50+'; },
      body: 'Deductible in full or in part depending on your income and whether you are covered by a workplace retirement plan. Above roughly $81,000 of income for a covered single filer the deduction phases out, though the account still grows tax-deferred. You have until Tax Day of the following year to contribute for the current year.'
    },
    {
      name: 'Student loan interest',
      limit: 'Up to $2,500, no itemizing needed',
      body: 'An above-the-line deduction, so you claim it whether or not you itemize. It phases out between $85,000 and $100,000 of income for single filers, and $175,000 to $205,000 for joint filers. Married filing separately cannot claim it at all. Your servicer reports the figure on Form 1098-E.'
    }
  ],

  /* ------------------------------------------------------------- credits */

  credits: [
    {
      name: 'Child Tax Credit',
      amount: '$2,200 per child under 17',
      body: 'Comes straight off your tax bill, not your income. Up to $1,700 per child is refundable, meaning it can pay out even if it takes your tax below zero. It begins to phase out above $200,000 of income ($400,000 filing jointly), losing $50 for every $1,000 over the line.'
    },
    {
      name: 'Credit for Other Dependents',
      amount: '$500 per qualifying dependent',
      body: 'Covers dependents who do not qualify for the Child Tax Credit — a child aged 17 or older, a college student, or a dependent parent you support. Non-refundable, so it can reduce your tax to zero but not below it. Shares the same income phase-out as the Child Tax Credit.'
    },
    {
      name: 'American Opportunity Credit',
      amount: 'Up to $2,500 per student, per year',
      body: 'For the first four years of undergraduate study. Worth 100% of the first $2,000 of qualified expenses plus 25% of the next $2,000, and 40% of it — up to $1,000 — is refundable. Compare that with a deduction of the same size, which would be worth only your marginal rate.'
    },
    {
      name: 'Lifetime Learning Credit',
      amount: 'Up to $2,000 per return',
      body: 'Worth 20% of the first $10,000 of qualified education expenses, with no limit on the number of years you can claim it. It covers graduate study and job-skill courses, which the American Opportunity Credit does not. Non-refundable, and you cannot claim both credits for the same student in the same year.'
    },
    {
      name: "Saver's Credit",
      amount: '10%, 20% or 50% of what you contribute',
      body: 'A credit on top of the deduction you already get for retirement contributions — the same dollar working twice. It is aimed at low and moderate incomes and the percentage falls in steps as income rises. Widely missed, because people assume the deduction was the whole benefit.'
    },
    {
      name: 'Earned Income Tax Credit',
      amount: 'Scales with income and children',
      body: 'Fully refundable and among the largest credits available to working households, but it is also the most commonly unclaimed — the IRS estimates roughly one in five eligible filers never claims it. Worth checking even if you owe no tax at all, because it pays out regardless.'
    }
  ]
};

/* ==========================================================================
   Historical top federal marginal rate on ordinary income.
   Source: IRS Statistics of Income, Historical Table 23.
   Excludes surtaxes; statutory top rate only.
   ========================================================================== */

window.TAX_HISTORY = [
  { year: 1955, rate: 91 },
  { year: 1960, rate: 91 },
  { year: 1965, rate: 70 },
  { year: 1970, rate: 70 },
  { year: 1975, rate: 70 },
  { year: 1980, rate: 70 },
  { year: 1982, rate: 50 },
  { year: 1986, rate: 50 },
  { year: 1988, rate: 28 },
  { year: 1991, rate: 31 },
  { year: 1993, rate: 39.6 },
  { year: 2000, rate: 39.6 },
  { year: 2003, rate: 35 },
  { year: 2012, rate: 35 },
  { year: 2013, rate: 39.6 },
  { year: 2017, rate: 39.6 },
  { year: 2018, rate: 37 },
  { year: 2026, rate: 37 }
];

/* State income tax data lives in states.js — see the contract in README.md. */
