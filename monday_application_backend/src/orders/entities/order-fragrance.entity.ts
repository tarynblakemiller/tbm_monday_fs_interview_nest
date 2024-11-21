import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { Order } from './order.entity';
import { Fragrance } from '../../fragrances/entities/fragrance.entity';

@Table({ tableName: 'order_fragrances' })
export class OrderFragrance extends Model {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  order_id: string;

  @ForeignKey(() => Fragrance)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fragrance_id: string;

  @Column(DataType.INTEGER)
  quantity: number;
}
