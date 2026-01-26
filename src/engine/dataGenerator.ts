import { faker } from '@faker-js/faker';
import { Store, Product, Sale, Customer, Subscription, Employee, Shipment } from '../types';

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
    return {
      id: faker.string.uuid(),
      storeId: faker.helpers.arrayElement(stores).id,
      productId: product.id,
      date: faker.date.past({ years: 1 }).toISOString(),
      quantity,
      revenue,
      profit: revenue * faker.number.float({ min: 0.1, max: 0.4 }),
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
