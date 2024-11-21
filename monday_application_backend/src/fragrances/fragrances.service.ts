import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Fragrance } from '../fragrances/entities/fragrance.entity';
import { CreateFragranceDto } from './dto/create-fragrance.dto';
import { UpdateFragranceDto } from './dto/update-fragrance.dto';

@Injectable()
export class FragrancesService {
  constructor(
    @InjectModel(Fragrance)
    private fragranceModel: typeof Fragrance,
  ) {}

  async findAll() {
    const fragrances = await this.fragranceModel.findAll();
    console.log('NestJS response:', fragrances);
    return fragrances;
  }

  async findOne(id: string) {
    const fragrance = await this.fragranceModel.findByPk(id);
    if (!fragrance) {
      throw new NotFoundException('Fragrance not found');
    }
    return fragrance;
  }

  async create(createFragranceDto: CreateFragranceDto) {
    const lastId = await this.fragranceModel.findOne({
      order: [['id', 'DESC']],
      attributes: ['id'],
    });

    const nextId = String(lastId ? parseInt(lastId.id) + 1 : 1);
    const paddedId = nextId.padStart(3, '0');

    return this.fragranceModel.create({
      ...createFragranceDto,
      id: String(nextId),
      fragrance_id: `FRAG-${paddedId}`,
      image_url:
        createFragranceDto.image_url || 'https://example.com/placeholder.jpg',
    });
  }

  async update(id: string, updateFragranceDto: UpdateFragranceDto) {
    const [updated] = await this.fragranceModel.update(updateFragranceDto, {
      where: { id },
    });
    if (!updated) {
      throw new NotFoundException('Fragrance not found');
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    const deleted = await this.fragranceModel.destroy({
      where: { id },
    });
    if (!deleted) {
      throw new NotFoundException('Fragrance not found');
    }
  }
}
