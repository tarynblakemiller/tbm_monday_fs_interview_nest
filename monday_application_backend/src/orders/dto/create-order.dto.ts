import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  boardId: string;

  @IsString()
  itemName: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsObject()
  columnValues: Record<string, any>;

  // @IsOptional()
  // @IsString()
  // monday_item_id?: string;
}
