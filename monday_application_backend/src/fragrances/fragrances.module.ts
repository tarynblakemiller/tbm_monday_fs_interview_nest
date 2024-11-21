import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Fragrance } from './entities/fragrance.entity';
import { FragrancesService } from './fragrances.service';
import { FragrancesController } from './fragrances.controller';

@Module({
  imports: [SequelizeModule.forFeature([Fragrance])],
  controllers: [FragrancesController],
  providers: [FragrancesService],
  exports: [FragrancesService],
})
export class FragrancesModule {}
