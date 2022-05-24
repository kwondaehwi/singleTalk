import { Test, TestingModule } from '@nestjs/testing';
import { MatchingsService } from './matchings.service';

describe('MatchingsService', () => {
  let service: MatchingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchingsService],
    }).compile();

    service = module.get<MatchingsService>(MatchingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
