import { Test, TestingModule } from '@nestjs/testing';
import { SearchServiceService } from './search-service.service';

describe('SearchServiceService', () => {
  let service: SearchServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchServiceService],
    }).compile();

    service = module.get<SearchServiceService>(SearchServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
