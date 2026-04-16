import { Test, TestingModule } from '@nestjs/testing';
import { AnaliticasService } from './analiticas.service';

describe('AnaliticasService', () => {
  let service: AnaliticasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnaliticasService],
    }).compile();

    service = module.get<AnaliticasService>(AnaliticasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
