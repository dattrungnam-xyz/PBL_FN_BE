import { Injectable } from '@nestjs/common';
import { CreateSearchHistoryDTO } from './dto/create-search-history.dto';
import { UpdateSearchHistoryDTO } from './dto/update-search-history.dto';
import { SearchHistory } from './entities/search-history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
  ) {}
  create(createSearchHistoryDto: CreateSearchHistoryDTO, userId: string) {
    const searchHistory = this.searchHistoryRepository.create({
      ...createSearchHistoryDto,
      user: { id: userId },
    });
    return this.searchHistoryRepository.save(searchHistory);
  }

  findAll() {
    return this.searchHistoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  findAllByUser(userId: string) {
    return this.searchHistoryRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  findOne(id: string) {
    return this.searchHistoryRepository.findOne({
      where: { id },
    });
  }
}
