import {
  IsString,
  IsUrl,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum FragranceCategory {
  SWEET = 'Sweet',
  FRESH = 'Fresh',
  WOODY = 'Woody',
  FLORAL = 'Floral',
  CITRUS = 'Citrus',
  SMOKEY = 'Smokey',
  FRUITY = 'Fruity',
  HERBACEOUS = 'Herbaceous',
}

export class CreateFragranceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(FragranceCategory)
  category: FragranceCategory;

  @IsOptional()
  @IsUrl()
  image_url?: string;
}
