import { test, expect } from '@playwright/test';

test.describe('Data Engine Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  // --- Distribution Functions ---

  test('paretoSample produces skewed distribution (top 20% holds majority)', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const samples = debug.paretoSample(100, 1.1, 42);
      samples.sort((a: number, b: number) => b - a);
      const total = samples.reduce((s: number, v: number) => s + v, 0);
      const top20Sum = samples.slice(0, 20).reduce((s: number, v: number) => s + v, 0);
      return { length: samples.length, top20Pct: top20Sum / total, allPositive: samples.every((v: number) => v > 0) };
    });

    expect(result.length).toBe(100);
    expect(result.allPositive).toBe(true);
    // Top 20% should hold at least 50% (Pareto-like skew)
    expect(result.top20Pct).toBeGreaterThan(0.5);
  });

  test('logNormalSample produces positive values with expected shape', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const samples = debug.logNormalSample(1000, 4.5, 0.8, 42);
      const mean = samples.reduce((s: number, v: number) => s + v, 0) / samples.length;
      const median = [...samples].sort((a: number, b: number) => a - b)[500];
      return {
        length: samples.length,
        allPositive: samples.every((v: number) => v > 0),
        mean: Math.round(mean),
        median: Math.round(median),
        // Mean should be greater than median (right-skewed)
        rightSkewed: mean > median,
      };
    });

    expect(result.length).toBe(1000);
    expect(result.allPositive).toBe(true);
    expect(result.rightSkewed).toBe(true);
    // mu=4.5 gives median ≈ e^4.5 ≈ 90
    expect(result.median).toBeGreaterThan(50);
    expect(result.median).toBeLessThan(200);
  });

  test('exponentialDecaySample produces declining frequency', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const samples = debug.exponentialDecaySample(1000, 0.5, 42);
      const belowMedian = samples.filter((v: number) => v < 1.4).length; // theoretical median ≈ ln(2)/0.5 ≈ 1.39
      return {
        length: samples.length,
        allNonNeg: samples.every((v: number) => v >= 0),
        belowMedianPct: belowMedian / samples.length,
      };
    });

    expect(result.length).toBe(1000);
    expect(result.allNonNeg).toBe(true);
    // ~50% should be below theoretical median
    expect(result.belowMedianPct).toBeGreaterThan(0.35);
    expect(result.belowMedianPct).toBeLessThan(0.65);
  });

  test('boxMuller produces standard normal variates', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const rand = debug.createSeededRandom(42);
      const samples = Array.from({ length: 5000 }, () => debug.boxMuller(rand));
      const mean = samples.reduce((s: number, v: number) => s + v, 0) / samples.length;
      const variance = samples.reduce((s: number, v: number) => s + (v - mean) ** 2, 0) / samples.length;
      const within2Sigma = samples.filter((v: number) => Math.abs(v) < 2).length / samples.length;
      return { mean: Math.abs(mean), variance, within2Sigma };
    });

    // Mean should be close to 0 (within 0.1)
    expect(result.mean).toBeLessThan(0.1);
    // Variance should be close to 1 (within 0.2)
    expect(result.variance).toBeGreaterThan(0.8);
    expect(result.variance).toBeLessThan(1.2);
    // ~95% within 2 sigma
    expect(result.within2Sigma).toBeGreaterThan(0.90);
    expect(result.within2Sigma).toBeLessThan(0.99);
  });

  test('ar1Process produces autocorrelated time series', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const series = debug.ar1Process(200, 0.8, 0.5, 42);
      // Check autocorrelation: consecutive values should be correlated
      let crossProduct = 0;
      for (let i = 1; i < series.length; i++) {
        crossProduct += series[i] * series[i - 1];
      }
      const avgCross = crossProduct / (series.length - 1);
      return {
        length: series.length,
        startsAtZero: series[0] === 0,
        avgCrossProduct: avgCross,
      };
    });

    expect(result.length).toBe(200);
    expect(result.startsAtZero).toBe(true);
    // Positive autocorrelation (phi=0.8) means consecutive values move together
    expect(result.avgCrossProduct).toBeGreaterThan(0);
  });

  test('createSeededRandom is reproducible', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const r1 = debug.createSeededRandom(42);
      const r2 = debug.createSeededRandom(42);
      const seq1 = Array.from({ length: 10 }, () => r1());
      const seq2 = Array.from({ length: 10 }, () => r2());
      return { match: JSON.stringify(seq1) === JSON.stringify(seq2), inRange: seq1.every((v: number) => v >= 0 && v < 1) };
    });

    expect(result.match).toBe(true);
    expect(result.inRange).toBe(true);
  });

  test('clamp bounds values correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      return {
        below: debug.clamp(-5, 0, 10),
        within: debug.clamp(5, 0, 10),
        above: debug.clamp(15, 0, 10),
        atMin: debug.clamp(0, 0, 10),
        atMax: debug.clamp(10, 0, 10),
      };
    });

    expect(result.below).toBe(0);
    expect(result.within).toBe(5);
    expect(result.above).toBe(10);
    expect(result.atMin).toBe(0);
    expect(result.atMax).toBe(10);
  });

  test('normalizeToTotal scales values to target', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const normalized = debug.normalizeToTotal([2, 3, 5], 100);
      return { values: normalized, sum: normalized.reduce((s: number, v: number) => s + v, 0) };
    });

    expect(result.sum).toBeCloseTo(100, 5);
    expect(result.values[0]).toBeCloseTo(20, 5);
    expect(result.values[1]).toBeCloseTo(30, 5);
    expect(result.values[2]).toBeCloseTo(50, 5);
  });

  test('weightedChoice respects weights', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const rand = debug.createSeededRandom(42);
      const items = ['A', 'B', 'C'];
      const weights = [80, 15, 5]; // A should dominate
      const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
      for (let i = 0; i < 1000; i++) {
        counts[debug.weightedChoice(items, weights, rand)]++;
      }
      return counts;
    });

    // A (weight 80) should appear most, C (weight 5) least
    expect(result.A).toBeGreaterThan(result.B);
    expect(result.B).toBeGreaterThan(result.C);
    expect(result.A).toBeGreaterThan(600); // ~80%
  });

  // --- Data Generator Shape Validation ---

  test('Retail generator: 30 stores, 80 products, 2000 sales', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const data = debug.generateRetailData();
      const sale = data.sales[0];
      return {
        storeCount: data.stores.length,
        productCount: data.products.length,
        salesCount: data.sales.length,
        saleFields: Object.keys(sale).sort(),
        hasDiscount: 'discount' in sale,
        hasPLPY: 'revenuePL' in sale && 'revenuePY' in sale && 'profitPL' in sale && 'profitPY' in sale,
      };
    });

    expect(result.storeCount).toBe(30);
    expect(result.productCount).toBe(80);
    expect(result.salesCount).toBe(2000);
    expect(result.hasDiscount).toBe(true);
    expect(result.hasPLPY).toBe(true);
  });

  test('SaaS generator: 150 customers, 2400 subscriptions with tier distribution', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const data = debug.generateSaaSData();
      const sub = data.subscriptions[0];
      const tierCounts: Record<string, number> = {};
      data.customers.forEach((c: any) => { tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1; });
      return {
        customerCount: data.customers.length,
        subscriptionCount: data.subscriptions.length,
        subFields: Object.keys(sub).sort(),
        tierCounts,
        hasMRR: 'mrr' in sub,
        hasARR: 'arr' in sub,
        hasCAC: 'cac' in sub,
        hasLTV: 'ltv' in sub,
      };
    });

    expect(result.customerCount).toBe(150);
    expect(result.subscriptionCount).toBe(2400);
    expect(result.hasMRR).toBe(true);
    expect(result.hasARR).toBe(true);
    expect(result.hasCAC).toBe(true);
    expect(result.hasLTV).toBe(true);
    // Free tier should be most common (~65%)
    expect(result.tierCounts['Free']).toBeGreaterThan(result.tierCounts['Enterprise']);
  });

  test('HR generator: 300 employees with boxMuller salary distribution', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const data = debug.generateHRData();
      const emp = data.employees[0];
      const salaries = data.employees.map((e: any) => e.salary);
      salaries.sort((a: number, b: number) => a - b);
      const median = salaries[150];
      const mean = salaries.reduce((s: number, v: number) => s + v, 0) / salaries.length;
      const deptCounts: Record<string, number> = {};
      data.employees.forEach((e: any) => { deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });
      return {
        employeeCount: data.employees.length,
        hasOffice: 'office' in emp,
        hasTenure: 'tenure' in emp,
        hasAttrition: 'attrition' in emp,
        medianSalary: median,
        meanSalary: Math.round(mean),
        // boxMuller produces right-skewed log-normal: mean > median
        rightSkewed: mean > median,
        deptCounts,
        allSalariesPositive: salaries.every((s: number) => s > 0),
      };
    });

    expect(result.employeeCount).toBe(300);
    expect(result.hasOffice).toBe(true);
    expect(result.hasTenure).toBe(true);
    expect(result.hasAttrition).toBe(true);
    expect(result.allSalariesPositive).toBe(true);
    // Log-normal salaries should be right-skewed
    expect(result.rightSkewed).toBe(true);
    // Engineering should be the most common department (~30%)
    expect(result.deptCounts['Engineering']).toBeGreaterThan(result.deptCounts['HR']);
  });

  test('Logistics generator: 500 shipments with expected fields', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const data = debug.generateLogisticsData();
      const ship = data.shipments[0];
      const statusCounts: Record<string, number> = {};
      data.shipments.forEach((s: any) => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
      return {
        shipmentCount: data.shipments.length,
        fields: Object.keys(ship).sort(),
        hasOnTime: 'onTime' in ship,
        hasCost: 'cost' in ship,
        statusCounts,
      };
    });

    expect(result.shipmentCount).toBe(500);
    expect(result.hasOnTime).toBe(true);
    expect(result.hasCost).toBe(true);
    expect(result.statusCounts['Delivered']).toBeGreaterThan(0);
    expect(result.statusCounts['In Transit']).toBeGreaterThan(0);
    expect(result.statusCounts['Delayed']).toBeGreaterThan(0);
  });

  test('Portfolio generator: entities and controversy scores', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const data = debug.generatePortfolioData();
      const entity = data.portfolioEntities[0];
      const score = data.controversyScores[0];
      return {
        entityCount: data.portfolioEntities.length,
        scoreCount: data.controversyScores.length,
        entityFields: Object.keys(entity).sort(),
        scoreFields: Object.keys(score).sort(),
        hasJustification: 'justification' in score,
        hasGroup: 'group' in score,
        hasBarChartGroups: data.barChartGroups.length > 0,
        scoresPerEntity: data.controversyScores.length / data.portfolioEntities.length,
      };
    });

    // 49 companies in the list
    expect(result.entityCount).toBeGreaterThan(40);
    // Each entity gets 3-5 scores
    expect(result.scoresPerEntity).toBeGreaterThan(2.5);
    expect(result.scoresPerEntity).toBeLessThan(5.5);
    expect(result.hasJustification).toBe(true);
    expect(result.hasGroup).toBe(true);
    expect(result.hasBarChartGroups).toBe(true);
  });

  test('Social generator: 1200 posts with sentiment distribution', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const data = debug.generateSocialData();
      const post = data.socialPosts[0];
      const sentimentCounts: Record<string, number> = {};
      data.socialPosts.forEach((p: any) => { sentimentCounts[p.sentiment] = (sentimentCounts[p.sentiment] || 0) + 1; });
      return {
        postCount: data.socialPosts.length,
        hasSentimentScore: 'sentimentScore' in post,
        hasMentions: 'mentions' in post,
        hasEngagements: 'engagements' in post,
        hasPlatform: 'platform' in post,
        sentimentCounts,
      };
    });

    expect(result.postCount).toBe(1200);
    expect(result.hasSentimentScore).toBe(true);
    expect(result.hasMentions).toBe(true);
    expect(result.hasEngagements).toBe(true);
    expect(result.hasPlatform).toBe(true);
    // All three sentiments should be present
    expect(result.sentimentCounts['Positive']).toBeGreaterThan(0);
    expect(result.sentimentCounts['Neutral']).toBeGreaterThan(0);
    expect(result.sentimentCounts['Negative']).toBeGreaterThan(0);
  });

  test('Finance generator: 1200 records (400 × 3 scenarios) with correlated variance', async ({ page }) => {
    const result = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const data = debug.generateFinanceData();
      const rec = data.financeRecords[0];
      const scenarioCounts: Record<string, number> = {};
      data.financeRecords.forEach((r: any) => { scenarioCounts[r.scenario] = (scenarioCounts[r.scenario] || 0) + 1; });
      return {
        recordCount: data.financeRecords.length,
        hasVariance: 'variance' in rec,
        hasBusinessUnit: 'businessUnit' in rec,
        hasAccount: 'account' in rec,
        scenarioCounts,
      };
    });

    expect(result.recordCount).toBe(1200); // 400 × 3 scenarios
    expect(result.hasVariance).toBe(true);
    expect(result.hasBusinessUnit).toBe(true);
    expect(result.hasAccount).toBe(true);
    // Equal split across Actual, Budget, Forecast
    expect(result.scenarioCounts['Actual']).toBe(400);
    expect(result.scenarioCounts['Budget']).toBe(400);
    expect(result.scenarioCounts['Forecast']).toBe(400);
  });

  // --- Scenario Switching Data Integrity ---

  test('scenario switch generates correct data for each scenario', async ({ page }) => {
    const scenarios = ['Retail', 'SaaS', 'HR', 'Logistics', 'Portfolio', 'Social', 'Finance'];
    const expectedDataKeys: Record<string, string> = {
      Retail: 'sales',
      SaaS: 'subscriptions',
      HR: 'employees',
      Logistics: 'shipments',
      Portfolio: 'controversyScores',
      Social: 'socialPosts',
      Finance: 'financeRecords',
    };

    for (const scenario of scenarios) {
      const result = await page.evaluate((s: string) => {
        const debug = (window as any).__phantomDebug;
        debug.useStore.getState().setScenario(s);
        const state = debug.useStore.getState();
        return {
          scenario: state.scenario,
          dataKey: s,
          hasData: ((state as any)[
            s === 'Retail' ? 'sales' :
            s === 'SaaS' ? 'subscriptions' :
            s === 'HR' ? 'employees' :
            s === 'Logistics' ? 'shipments' :
            s === 'Portfolio' ? 'controversyScores' :
            s === 'Social' ? 'socialPosts' :
            'financeRecords'
          ] || []).length > 0,
        };
      }, scenario);

      expect(result.scenario).toBe(scenario);
      expect(result.hasData, `${scenario} should have data loaded`).toBe(true);
    }
  });
});
