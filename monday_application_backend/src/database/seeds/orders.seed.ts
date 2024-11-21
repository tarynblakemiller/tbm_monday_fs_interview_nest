import { QueryInterface } from 'sequelize';
import { generateOrderId } from '../../utils/generators';

interface IOrderData {
  sales_associate: string;
  inscription_request: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED';
  scent_profiles: string[];
  fragrance_recipes: string;
  quantity: number;
  order_received_date: Date;
  client_first_name: string;
  client_last_name: string;
  client_shipping_address: string;
  client_email: string;
  client_phone: string;
}

interface IOrderComplete extends IOrderData {
  id: string;
  monday_item_id: string;
  order_id: string;
  created_at: Date;
  updated_at: Date;
}

const orderData: IOrderData[] = [
  {
    sales_associate: 'John Doe',
    inscription_request: 'Happy Birthday Mom!',
    status: 'NEW',
    scent_profiles: ['Floral', 'Sweet'],
    fragrance_recipes: 'Rose Garden 70%, Vanilla Dreams 30%',
    quantity: 1,
    order_received_date: new Date(),
    client_first_name: 'Jane',
    client_last_name: 'Smith',
    client_shipping_address: '123 Main St, Anytown, USA 12345',
    client_email: 'jane.smith@example.com',
    client_phone: '555-0123',
  },
  {
    sales_associate: 'Jane Smith',
    inscription_request: 'To my dearest friend',
    status: 'IN_PROGRESS',
    scent_profiles: ['Woody', 'Fresh'],
    fragrance_recipes: 'Cedar Grove 60%, Ocean Breeze 40%',
    quantity: 2,
    order_received_date: new Date(),
    client_first_name: 'Bob',
    client_last_name: 'Johnson',
    client_shipping_address: '456 Oak Ave, Somewhere, USA 67890',
    client_email: 'bob.johnson@example.com',
    client_phone: '555-4567',
  },
];

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const ordersWithIds: IOrderComplete[] = orderData.map((order, index) => ({
    ...order,
    id: String(index + 1),
    monday_item_id: `item_${index + 1}`,
    order_id: generateOrderId(),
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await queryInterface.bulkInsert('orders', ordersWithIds);

  // Junction table using fragrance primary keys (id)
  const orderFragrances = [
    {
      order_id: '1',
      fragrance_id: '1', // id 1 for Vanilla Dreams
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      order_id: '1',
      fragrance_id: '4', // id 4 for Rose Garden
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      order_id: '2',
      fragrance_id: '3', // id 3 for Cedar Grove
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      order_id: '2',
      fragrance_id: '2', // id 2 for Ocean Breeze
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  await queryInterface.bulkInsert('order_fragrances', orderFragrances);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete('order_fragrances', {}, {});
  await queryInterface.bulkDelete('orders', {}, {});
};
