import { PartialType } from '@nestjs/mapped-types';
import { CreateFragranceDto } from './create-fragrance.dto';

export class UpdateFragranceDto extends PartialType(CreateFragranceDto) {}
