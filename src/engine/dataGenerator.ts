import { faker } from '@faker-js/faker';
import { Store, Product, Sale, Customer, Subscription, Employee, Shipment, PortfolioEntity, ControversyScore, SocialPost, FinanceRecord } from '../types';
import { paretoSample, logNormalSample, exponentialDecaySample, weightedChoice, createSeededRandom, clamp } from './distributions';
import { generateSeasonalDates } from './seasonality';

export const generateRetailData = () => {
  const rand = createSeededRandom(2024);
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const categories = [
    'Electronics', 'Furniture', 'Clothing', 'Grocery',
    'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Books', 'Automotive'
  ];

  // 30 stores with log-normal revenue weighting
  const stores: Store[] = Array.from({ length: 30 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.company.name() + ' Store',
    region: faker.helpers.arrayElement(regions),
    country: faker.location.country(),
  }));

  // 80 products across 10 categories
  const products: Product[] = Array.from({ length: 80 }).map(() => {
    const category = categories[Math.floor(rand() * categories.length)];
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      category,
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    };
  });

  // Pareto weights for products (top 20% = ~80% revenue)
  const productWeights = paretoSample(products.length, 1.1, 100);
  // Log-normal weights for stores (top 10% = ~40% revenue)
  const storeWeights = logNormalSample(stores.length, 2.0, 1.0, 200);

  // Generate 24 months of seasonal dates
  const dates = generateSeasonalDates(2000, 24, 'Retail', rand);

  // Log-normal AOV distribution (median ~$90)
  const aovFactors = logNormalSample(2000, 4.5, 0.8, 300);

  const sales: Sale[] = dates.map((date, i) => {
    const product = weightedChoice(products, productWeights, rand);
    const store = weightedChoice(stores, storeWeights, rand);
    const quantity = Math.max(1, Math.round(rand() * 4 + 1));
    const baseRevenue = aovFactors[i % aovFactors.length] * quantity * 0.1;
    const revenue = Math.round(baseRevenue * 100) / 100;
    const marginRate = 0.15 + rand() * 0.25; // 15-40% margin
    const profit = Math.round(revenue * marginRate * 100) / 100;
    const discountRate = rand() < 0.3 ? Math.round(rand() * 30) / 100 : 0; // 30% of sales have discount 0-30%
    const discount = Math.round(revenue * discountRate * 100) / 100;

    return {
      id: faker.string.uuid(),
      storeId: store.id,
      productId: product.id,
      date,
      quantity,
      revenue,
      revenuePL: Math.round(revenue * (0.85 + rand() * 0.30) * 100) / 100,
      revenuePY: Math.round(revenue * (0.75 + rand() * 0.35) * 100) / 100,
      profit,
      profitPL: Math.round(profit * (0.85 + rand() * 0.30) * 100) / 100,
      profitPY: Math.round(profit * (0.75 + rand() * 0.35) * 100) / 100,
      discount,
    };
  });

  return { stores, products, sales };
};

export const generateSaaSData = () => {
  const rand = createSeededRandom(2025);
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const tiers: Array<'Free' | 'Starter' | 'Professional' | 'Enterprise'> = ['Free', 'Starter', 'Professional', 'Enterprise'];
  const tierWeights = [65, 18, 12, 5]; // Realistic tier distribution
  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Media', 'Government'];

  // 150 customers with weighted tier distribution
  const customers: Customer[] = Array.from({ length: 150 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    tier: weightedChoice(tiers, tierWeights, rand),
    region: faker.helpers.arrayElement(regions),
    industry: faker.helpers.arrayElement(industries),
  }));

  // MRR by tier
  const mrrByTier: Record<string, { base: number; variance: number }> = {
    Free: { base: 0, variance: 0 },
    Starter: { base: 49, variance: 20 },
    Professional: { base: 499, variance: 150 },
    Enterprise: { base: 4999, variance: 2000 },
  };

  // Generate 24 months of data
  const dates = generateSeasonalDates(2400, 24, 'SaaS_B2B', rand);

  const subscriptions: Subscription[] = dates.map((date, i) => {
    const customer = customers[Math.floor(rand() * customers.length)];
    const tierConfig = mrrByTier[customer.tier];
    const mrr = Math.max(0, Math.round(tierConfig.base + (rand() - 0.5) * tierConfig.variance));
    const arr = mrr * 12;

    // Churn: higher for early months, lower for established
    const monthIndex = i % 24;
    const churnProb = monthIndex < 3 ? 0.05 + rand() * 0.03 : 0.015 + rand() * 0.005;
    const churn = rand() < churnProb ? 1 : 0;

    const ltv = mrr * (12 + Math.floor(rand() * 24));
    const cac = customer.tier === 'Enterprise'
      ? Math.round(2000 + rand() * 3000)
      : customer.tier === 'Professional'
        ? Math.round(500 + rand() * 1000)
        : customer.tier === 'Starter'
          ? Math.round(100 + rand() * 200)
          : 0;

    return {
      id: faker.string.uuid(),
      customerId: customer.id,
      date,
      mrr,
      mrrPL: Math.round(mrr * (0.85 + rand() * 0.30)),
      mrrPY: Math.round(mrr * (0.75 + rand() * 0.35)),
      churn,
      ltv,
      arr,
      cac,
    };
  });

  return { customers, subscriptions };
};

export const generateHRData = () => {
  const rand = createSeededRandom(2026);

  // Weighted department distribution: Eng 30%, Sales 20%, Marketing 19%, G&A 16%, HR 8%, Finance 7%
  const departments = ['Engineering', 'Sales', 'Marketing', 'G&A', 'HR', 'Finance'];
  const deptWeights = [30, 20, 19, 16, 8, 7];

  const offices = ['New York', 'San Francisco', 'London', 'Berlin', 'Singapore', 'Sydney', 'Toronto'];
  const officeWeights = [25, 22, 18, 12, 10, 7, 6];

  // Salary bands per department (log-normal within band)
  const salaryBands: Record<string, { mu: number; sigma: number }> = {
    Engineering: { mu: 11.6, sigma: 0.35 },   // median ~$110K
    Sales: { mu: 11.3, sigma: 0.40 },         // median ~$80K
    Marketing: { mu: 11.2, sigma: 0.35 },      // median ~$73K
    'G&A': { mu: 11.0, sigma: 0.30 },         // median ~$60K
    HR: { mu: 11.1, sigma: 0.30 },            // median ~$66K
    Finance: { mu: 11.4, sigma: 0.35 },        // median ~$90K
  };

  // Exponential tenure distribution (many short-tenure, few long-tenure)
  const tenureValues = exponentialDecaySample(300, 0.25, 400);

  const employees: Employee[] = Array.from({ length: 300 }).map((_, i) => {
    const department = weightedChoice(departments, deptWeights, rand);
    const office = weightedChoice(offices, officeWeights, rand);
    const band = salaryBands[department] || { mu: 11.2, sigma: 0.3 };
    const salary = Math.round(Math.exp(band.mu + band.sigma * (rand() * 2 - 1)));
    const tenure = Math.round(clamp(tenureValues[i], 0, 20) * 10) / 10;

    // Attrition: exponential decay - 38% Year 1, much lower after
    const attritionProb = tenure < 1 ? 0.38 : tenure < 2 ? 0.18 : tenure < 3 ? 0.10 : 0.05;
    const attrition = rand() < attritionProb ? 1 : 0;

    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      department,
      role: faker.person.jobTitle(),
      office,
      salary,
      rating: clamp(Math.round(2.5 + rand() * 3 - 0.5), 1, 5),
      attrition,
      tenure,
    };
  });

  return { employees };
};

export const generateLogisticsData = () => {
  const carriers = ['FedEx', 'UPS', 'DHL', 'USPS'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'London', 'Berlin', 'Tokyo'];
  const statuses: ('Delivered' | 'In Transit' | 'Delayed')[] = ['Delivered', 'In Transit', 'Delayed'];

  const shipments: Shipment[] = Array.from({ length: 500 }).map(() => ({
    id: faker.string.uuid(),
    origin: faker.helpers.arrayElement(cities),
    destination: faker.helpers.arrayElement(cities),
    carrier: faker.helpers.arrayElement(carriers),
    cost: faker.number.float({ min: 10, max: 500 }),
    weight: faker.number.float({ min: 1, max: 100 }),
    status: faker.helpers.arrayElement(statuses),
    date: faker.date.recent({ days: 90 }).toISOString(),
    onTime: faker.number.float() < 0.85 ? 1 : 0
  }));

  return { shipments };
};

export const generatePortfolioData = () => {
  const regions = ['USA', 'EMEA', 'APAC', 'CEMAR', 'Gulf+'];
  const sectors = ['Basic Materials', 'Technology', 'Healthcare', 'Financials', 'Energy', 'Consumer Goods', 'Industrials'];
  const sources = ['MSCI ESG', 'Sustainalytics', 'Bloomberg ESG', 'ISS ESG', 'RepRisk'];
  const categories = [
    'Social Impact of Products', 'Bribery and Corruption', 'Employee Relations',
    'Environmental Impact', 'Human Rights', 'Supply Chain Labor', 'Data Privacy',
    'Business Ethics', 'Product Safety', 'Community Relations', 'Governance Issues',
    'UN Global Compact Violation', 'OECD Guidelines Breach', 'ILO Standards Violation',
    'Global Standards Non-Compliance', 'Controversial Weapons Involvement',
    'Nuclear Weapons Association', 'Cluster Munitions', 'Anti-Personnel Mines',
    'NGO Campaign Target', 'Activist Pressure', 'Media Controversy', 'Public Scrutiny'
  ];

  const barChartGroups = [
    'USA', 'EMEA', 'APAC', 'CEMAR', 'Gulf+',
    'Basic Capital', 'Alfa Capital', 'Asia Market Capital', 'Euro Growth Fund'
  ];

  const companyNames = [
    'Northern Trust Corp', 'Asseco South Eastern Europe S.A.', 'China Feihe Limited',
    'China Mobile Ltd', 'Cimpress plc', 'Bayer US Finance LLC', 'Tesla Inc',
    'Apple Inc', 'Microsoft Corp', 'Amazon.com Inc', 'Meta Platforms Inc',
    'Alphabet Inc', 'NVIDIA Corp', 'JPMorgan Chase & Co', 'Johnson & Johnson',
    'Procter & Gamble Co', 'Exxon Mobil Corp', 'Chevron Corp', 'Pfizer Inc',
    'UnitedHealth Group Inc', 'Visa Inc', 'Mastercard Inc', 'Coca-Cola Co',
    'PepsiCo Inc', 'Walt Disney Co', 'Netflix Inc', 'Intel Corp', 'AMD',
    'Cisco Systems Inc', 'Oracle Corp', 'Salesforce Inc', 'Adobe Inc',
    'PayPal Holdings Inc', 'Comcast Corp', 'AT&T Inc', 'Verizon Communications',
    'Bank of America Corp', 'Wells Fargo & Co', 'Goldman Sachs Group Inc',
    'Morgan Stanley', 'Citigroup Inc', 'American Express Co', 'Boeing Co',
    'Lockheed Martin Corp', 'Raytheon Technologies', 'General Electric Co',
    '3M Company', 'Caterpillar Inc', 'Honeywell International Inc'
  ];

  const accountReportNames = [
    'Global Equity Fund', 'North American Growth', 'European Value Fund',
    'Asia Pacific Fund', 'Emerging Markets Fund', 'Technology Innovation Fund',
    'Healthcare Opportunities', 'Sustainable Future Fund', 'Infrastructure Fund',
    'Real Assets Fund'
  ];

  const justificationTemplates = [
    'Sustainalytics assesses this impact event as Category {score} based on the severity of impact on stakeholders and the company\'s response. The incident involves {category} concerns with significant regulatory and reputational implications. Management has taken preliminary steps to address the situation, but full remediation is expected to require {months} months.',
    'The score reflects ongoing concerns related to {category}. Recent investigations have revealed systematic issues in the company\'s governance and risk management frameworks. Stakeholder engagement has been limited, and the company\'s disclosure practices fall below industry standards.',
    'Assessment based on {category} controversies. The company has demonstrated partial commitment to addressing the underlying issues through policy updates and stakeholder dialogues. However, implementation gaps remain, and third-party verification of improvement measures is pending.',
    'This rating considers the company\'s involvement in {category} incidents over the assessment period. While the direct financial impact has been contained, reputational damage and regulatory scrutiny continue to affect stakeholder confidence.',
    'Score reflects materialized risks in {category}. The company has established remediation plans aligned with international standards, though progress monitoring indicates slower-than-expected implementation across affected business units.'
  ];

  const portfolioEntities: PortfolioEntity[] = companyNames.map((name, index) => ({
    id: faker.string.uuid(),
    name,
    sector: sectors[index % sectors.length],
    region: regions[index % regions.length],
    marketValue: faker.number.float({ min: 1000000, max: 50000000000, fractionDigits: 2 }),
    sourceRegion: regions[index % regions.length],
    source: faker.helpers.arrayElement(sources),
    accountReportName: faker.helpers.arrayElement(accountReportNames),
    accountCode: `ACC${String(index + 1).padStart(3, '0')}`,
  }));

  const controversyScores: ControversyScore[] = [];

  portfolioEntities.forEach((entity) => {
    const numScores = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < numScores; i++) {
      const category = faker.helpers.arrayElement(categories);
      const previousScore = faker.number.int({ min: 1, max: 5 });
      const scoreChange = faker.helpers.arrayElement([-2, -1, 0, 1, 2, 3]);
      const score = Math.max(1, Math.min(5, previousScore + scoreChange));

      const justificationTemplate = faker.helpers.arrayElement(justificationTemplates);
      const justification = justificationTemplate
        .replace('{score}', String(score))
        .replace('{category}', category.toLowerCase())
        .replace('{months}', String(faker.number.int({ min: 6, max: 24 })));

      controversyScores.push({
        id: faker.string.uuid(),
        entityId: entity.id,
        entityName: entity.name,
        category,
        score,
        previousScore,
        scoreChange: score - previousScore,
        validFrom: faker.date.past({ years: 1 }).toISOString(),
        marketValue: entity.marketValue,
        justification,
        source: entity.source,
        region: entity.region,
        group: faker.helpers.arrayElement(barChartGroups),
      });
    }
  });

  return { portfolioEntities, controversyScores, barChartGroups };
};

export const generateSocialData = () => {
  const platforms = ['X', 'LinkedIn', 'Instagram', 'TikTok', 'Reddit', 'YouTube'];
  const locations = ['New York', 'London', 'Berlin', 'Toronto', 'Sydney', 'Singapore', 'Dubai', 'Sao Paulo'];
  const sentiments: Array<'Positive' | 'Neutral' | 'Negative'> = ['Positive', 'Neutral', 'Negative'];

  const socialPosts: SocialPost[] = Array.from({ length: 1200 }).map(() => {
    const sentiment = faker.helpers.arrayElement(sentiments);
    const baseScore = sentiment === 'Positive'
      ? faker.number.float({ min: 0.2, max: 1 })
      : sentiment === 'Negative'
        ? faker.number.float({ min: -1, max: -0.2 })
        : faker.number.float({ min: -0.2, max: 0.2 });

    return {
      id: faker.string.uuid(),
      date: faker.date.recent({ days: 180 }).toISOString(),
      user: faker.internet.username(),
      location: faker.helpers.arrayElement(locations),
      platform: faker.helpers.arrayElement(platforms),
      sentiment,
      engagements: faker.number.int({ min: 10, max: 5000 }),
      mentions: faker.number.int({ min: 1, max: 250 }),
      sentimentScore: parseFloat(baseScore.toFixed(2)),
    };
  });

  return { socialPosts };
};

export const generateFinanceData = () => {
  const rand = createSeededRandom(2027);
  const accounts = ['Revenue', 'COGS', 'Operating Expenses', 'Marketing', 'R&D', 'G&A'];
  const regions = ['North America', 'Europe', 'APAC', 'LATAM'];
  const businessUnits = ['Consumer', 'Enterprise', 'SMB', 'Platform'];
  const scenarios: Array<'Actual' | 'Budget' | 'Forecast'> = ['Actual', 'Budget', 'Forecast'];

  // Variance bands per account type (from research)
  const varianceBands: Record<string, { minPct: number; maxPct: number }> = {
    Revenue: { minPct: -0.05, maxPct: 0.05 },       // ±3-5% tight
    COGS: { minPct: -0.10, maxPct: 0.10 },           // ±10%
    'Operating Expenses': { minPct: -0.05, maxPct: 0.05 },
    Marketing: { minPct: -0.30, maxPct: 0.30 },      // ±15-30% variable
    'R&D': { minPct: -0.10, maxPct: 0.10 },
    'G&A': { minPct: -0.05, maxPct: 0.05 },          // ±0-5% fixed
  };

  // Base amounts per account
  const baseAmounts: Record<string, number> = {
    Revenue: 400000,
    COGS: 200000,
    'Operating Expenses': 80000,
    Marketing: 60000,
    'R&D': 100000,
    'G&A': 50000,
  };

  const dates = generateSeasonalDates(1200, 24, 'Finance', rand);

  const financeRecords: FinanceRecord[] = [];

  // Generate correlated Actual/Budget/Forecast records
  for (let i = 0; i < 400; i++) {
    const account = accounts[Math.floor(rand() * accounts.length)];
    const region = regions[Math.floor(rand() * regions.length)];
    const businessUnit = businessUnits[Math.floor(rand() * businessUnits.length)];
    const date = dates[i % dates.length];
    const base = baseAmounts[account] || 100000;
    const band = varianceBands[account] || { minPct: -0.10, maxPct: 0.10 };

    // Budget: baseline
    const budgetAmount = Math.round(base * (0.8 + rand() * 0.4));

    // Actual: budget + correlated variance within band
    const variancePct = band.minPct + rand() * (band.maxPct - band.minPct);
    const actualAmount = Math.round(budgetAmount * (1 + variancePct));

    // Forecast: between actual and budget
    const forecastAmount = Math.round(budgetAmount * (1 + variancePct * 0.6));

    for (const scenario of scenarios) {
      const amount = scenario === 'Actual' ? actualAmount : scenario === 'Budget' ? budgetAmount : forecastAmount;
      const variance = scenario === 'Actual' ? actualAmount - budgetAmount : scenario === 'Forecast' ? forecastAmount - budgetAmount : 0;

      financeRecords.push({
        id: faker.string.uuid(),
        date,
        account,
        region,
        businessUnit,
        scenario,
        amount,
        variance,
      });
    }
  }

  return { financeRecords };
};
