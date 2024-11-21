import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @IsString()
  monday_item_id: string;

  @IsOptional()
  @IsString()
  sales_associate?: string;

  @IsOptional()
  @IsString()
  inscription_request?: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsArray()
  @IsString({ each: true })
  scent_profiles: string[];

  @IsOptional()
  @IsString()
  fragrance_recipes?: string;

  @IsNumber()
  quantity: number;

  @IsDateString()
  order_received_date: Date;

  @IsOptional()
  @IsDateString()
  order_complete_date?: Date;

  @IsString()
  client_first_name: string;

  @IsString()
  client_last_name: string;

  @IsString()
  client_shipping_address: string;

  @IsEmail()
  client_email: string;

  @IsOptional()
  @IsString()
  client_phone?: string;

  @IsArray()
  @IsString({ each: true })
  fragrance_ids: string[];
}
