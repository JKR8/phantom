import { faker } from '@faker-js/faker';
import { Store, Product, Sale } from '../types';

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
