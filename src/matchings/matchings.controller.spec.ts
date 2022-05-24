import { Test, TestingModule } from '@nestjs/testing';
import { MatchingsController } from './matchings.controller';

describe('MatchingsController', () => {
  let controller: MatchingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchingsController],
    }).compile();

    controller = module.get<MatchingsController>(MatchingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
