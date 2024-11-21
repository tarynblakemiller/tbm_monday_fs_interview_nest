import { Test, TestingModule } from '@nestjs/testing';
import { FragrancesController } from './fragrances.controller';
import { FragrancesService } from './fragrances.service';

describe('FragrancesController', () => {
  let controller: FragrancesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FragrancesController],
      providers: [FragrancesService],
    }).compile();

    controller = module.get<FragrancesController>(FragrancesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
