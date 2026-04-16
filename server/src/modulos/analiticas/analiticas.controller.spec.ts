import { Test, TestingModule } from '@nestjs/testing';
import { AnaliticasController } from './analiticas.controller';

describe('AnaliticasController', () => {
  let controller: AnaliticasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnaliticasController],
    }).compile();

    controller = module.get<AnaliticasController>(AnaliticasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
