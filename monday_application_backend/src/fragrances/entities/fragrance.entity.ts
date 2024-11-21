import { Column, Model, Table, BelongsToMany } from 'sequelize-typescript';
import { Order } from 'src/orders/entities/order.entity';
import { OrderFragrance } from 'src/orders/entities/order-fragrance.entity';

@Table({
  tableName: 'fragrances',
  timestamps: true,
  underscored: true,
})
export class Fragrance extends Model {
  @Column({ primaryKey: true })
  id: string;

  @Column({ unique: true })
  fragrance_id: string;

  @Column
  name: string;

  @Column
  description: string;

  @Column
  category: string;

  @Column
  image_url: string;

  @BelongsToMany(() => Order, () => OrderFragrance)
  orders: Order[];

  static generateIds(index: number) {
    const paddedIndex = String(index + 1).padStart(3, '0');
    return {
      id: String(index + 1),
      fragrance_id: `FRAG-${paddedIndex}`,
    };
  }
}
