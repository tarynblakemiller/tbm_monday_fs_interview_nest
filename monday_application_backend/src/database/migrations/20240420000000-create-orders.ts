import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('orders', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    monday_item_id: {
      type: DataTypes.STRING,
      unique: true,
    },
    order_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sales_associate: {
      type: DataTypes.STRING,
    },
    inscription_request: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('NEW', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'),
      defaultValue: 'NEW',
    },
    scent_profiles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    fragrance_recipes: {
      type: DataTypes.TEXT,
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    order_received_date: {
      type: DataTypes.DATE,
    },
    order_complete_date: {
      type: DataTypes.DATE,
    },
    client_first_name: {
      type: DataTypes.STRING,
    },
    client_last_name: {
      type: DataTypes.STRING,
    },
    client_shipping_address: {
      type: DataTypes.STRING,
    },
    client_email: {
      type: DataTypes.STRING,
    },
    client_phone: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Create junction table
  await queryInterface.createTable('order_fragrances', {
    order_id: {
      type: DataTypes.STRING,
      references: {
        model: 'orders',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fragrance_id: {
      type: DataTypes.STRING,
      references: {
        model: 'fragrances',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('order_fragrances');
  await queryInterface.dropTable('orders');
};
