import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { underscoredIf } from 'sequelize/types/utils';

@Table({ tableName: 'orders', underscored: false })
export class Order extends Model {
  @Column
  boardId: string;

  @Column
  itemName: string;

  @Column
  groupId: string;

  @Column({ type: DataType.JSONB })
  columnValues: Record<string, any>;
}
