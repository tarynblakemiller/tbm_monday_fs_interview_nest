import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FragrancesService } from './fragrances.service';
import { CreateFragranceDto } from './dto/create-fragrance.dto';
import { UpdateFragranceDto } from './dto/update-fragrance.dto';
import { ApiResponse } from '../interfaces/api-response.interface';

@Controller('fragrances')
export class FragrancesController {
  constructor(private readonly fragrancesService: FragrancesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createFragranceDto: CreateFragranceDto,
  ): Promise<ApiResponse> {
    const fragrance = await this.fragrancesService.create(createFragranceDto);
    return {
      status: 'success',
      data: fragrance,
    };
  }

  @Get()
  async findAll(): Promise<ApiResponse> {
    const fragrances = await this.fragrancesService.findAll();
    return {
      status: 'success',
      data: fragrances,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    const fragrance = await this.fragrancesService.findOne(id);
    return {
      status: 'success',
      data: fragrance,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFragranceDto: UpdateFragranceDto,
  ): Promise<ApiResponse> {
    const fragrance = await this.fragrancesService.update(
      id,
      updateFragranceDto,
    );
    return {
      status: 'success',
      data: fragrance,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    const fragrance = await this.fragrancesService.remove(id);
    return {
      status: 'success',
      data: fragrance,
    };
  }
}
