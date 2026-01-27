import { faker } from '@faker-js/faker';
import { Store, Product, Sale, Customer, Subscription, Employee, Shipment, PortfolioEntity, ControversyScore } from '../types';

export const generateRetailData = () => {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Grocery'];

  const stores: Store[] = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.company.name() + ' Store',
    region: faker.helpers.arrayElement(regions),
    country: faker.location.country(),
  }));

  const products: Product[] = Array.from({ length: 20 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    category: faker.helpers.arrayElement(categories),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
  }));

  const sales: Sale[] = Array.from({ length: 1000 }).map(() => {
    const product = faker.helpers.arrayElement(products);
    const quantity = faker.number.int({ min: 1, max: 5 });
    const revenue = product.price * quantity;
    const profit = revenue * faker.number.float({ min: 0.1, max: 0.4 });
    
    return {
      id: faker.string.uuid(),
      storeId: faker.helpers.arrayElement(stores).id,
      productId: product.id,
      date: faker.date.past({ years: 1 }).toISOString(),
      quantity,
      revenue,
      revenuePL: revenue * faker.number.float({ min: 0.8, max: 1.2 }),
      revenuePY: revenue * faker.number.float({ min: 0.7, max: 1.1 }),
      profit,
      profitPL: profit * faker.number.float({ min: 0.8, max: 1.2 }),
      profitPY: profit * faker.number.float({ min: 0.7, max: 1.1 }),
    };
  });

  return { stores, products, sales };
};

export const generateSaaSData = () => {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const tiers: ('Starter' | 'Professional' | 'Enterprise')[] = ['Starter', 'Professional', 'Enterprise'];

  const customers: Customer[] = Array.from({ length: 50 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    tier: faker.helpers.arrayElement(tiers),
    region: faker.helpers.arrayElement(regions),
  }));

  const subscriptions: Subscription[] = Array.from({ length: 1000 }).map(() => {
    const customer = faker.helpers.arrayElement(customers);
    const baseMrr = customer.tier === 'Enterprise' ? 5000 : customer.tier === 'Professional' ? 500 : 50;
    const mrr = baseMrr + faker.number.int({ min: 0, max: baseMrr * 0.2 }); // Variance
    
    return {
      id: faker.string.uuid(),
      customerId: customer.id,
      date: faker.date.past({ years: 1 }).toISOString(),
      mrr: mrr,
      mrrPL: mrr * faker.number.float({ min: 0.8, max: 1.2 }),
      mrrPY: mrr * faker.number.float({ min: 0.7, max: 1.1 }),
      churn: faker.number.float() < 0.05 ? 1 : 0, // 5% churn rate
      ltv: mrr * faker.number.int({ min: 12, max: 36 }),
    };
  });

  return { customers, subscriptions };
};

export const generateHRData = () => {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Support'];
  
  const employees: Employee[] = Array.from({ length: 200 }).map(() => {
    const department = faker.helpers.arrayElement(departments);
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      department,
      role: faker.person.jobTitle(),
      salary: faker.number.int({ min: 50000, max: 200000 }),
      rating: faker.number.int({ min: 1, max: 5 }),
      attrition: faker.number.float() < 0.15 ? 1 : 0, // 15% attrition
      tenure: faker.number.int({ min: 0, max: 15 })
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
  // Categories organized by tab type for proper filtering
  const categories = [
    // Controversy categories (main tab)
    'Social Impact of Products',
    'Bribery and Corruption',
    'Employee Relations',
    'Environmental Impact',
    'Human Rights',
    'Supply Chain Labor',
    'Data Privacy',
    'Business Ethics',
    'Product Safety',
    'Community Relations',
    'Governance Issues',
    // GSS categories (Global Standards Screening)
    'UN Global Compact Violation',
    'OECD Guidelines Breach',
    'ILO Standards Violation',
    'Global Standards Non-Compliance',
    // Weapons categories
    'Controversial Weapons Involvement',
    'Nuclear Weapons Association',
    'Cluster Munitions',
    'Anti-Personnel Mines',
    // NGO categories
    'NGO Campaign Target',
    'Activist Pressure',
    'Media Controversy',
    'Public Scrutiny'
  ];

  // Bar chart groupings - these are the 9 bars shown in the image
  const barChartGroups = [
    'USA',
    'EMEA',
    'APAC',
    'CEMAR',
    'Gulf+',
    'Basic Capital',
    'Alfa Capital',
    'Asia Market Capital',
    'Euro Growth Fund'
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

  // Generate portfolio entities
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

  // Generate controversy scores
  const controversyScores: ControversyScore[] = [];

  portfolioEntities.forEach((entity) => {
    // Each entity can have 1-3 controversy scores
    const numScores = faker.number.int({ min: 1, max: 3 });

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
