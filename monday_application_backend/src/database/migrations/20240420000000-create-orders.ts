import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      boardId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      groupId: {
        type: DataTypes.STRING,
      },
      columnValues: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      // monday_item_id: {
      //   type: DataTypes.STRING,
      // },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('orders');
  },
};
