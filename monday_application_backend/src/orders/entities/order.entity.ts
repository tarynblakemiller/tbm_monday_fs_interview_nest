import {
  Column,
  Model,
  Table,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { OrderStatus } from '../enums/order-status.enum';
import { Fragrance } from '../../fragrances/entities/fragrance.entity';
import { OrderFragrance } from './order-fragrance.entity';

@Table({ tableName: 'orders' })
export class Order extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  monday_item_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  order_id: string;

  @Column(DataType.STRING)
  sales_associate: string;

  @Column(DataType.TEXT)
  inscription_request: string;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    defaultValue: OrderStatus.NEW,
  })
  status: OrderStatus;

  @Column(DataType.ARRAY(DataType.STRING))
  scent_profiles: string[];

  @Column(DataType.TEXT)
  fragrance_recipes: string;

  @Column(DataType.INTEGER)
  quantity: number;

  @Column(DataType.DATE)
  order_received_date: Date;

  @Column(DataType.DATE)
  order_complete_date: Date;

  @Column(DataType.STRING)
  client_first_name: string;

  @Column(DataType.STRING)
  client_last_name: string;

  @Column(DataType.STRING)
  client_shipping_address: string;

  @Column(DataType.STRING)
  client_email: string;

  @Column(DataType.STRING)
  client_phone: string;

  @BelongsToMany(() => Fragrance, () => OrderFragrance)
  fragrances: Fragrance[];
}
