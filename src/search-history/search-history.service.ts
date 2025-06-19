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
  async create(createSearchHistoryDto: CreateSearchHistoryDTO, userId: string) {
    for (const search of createSearchHistoryDto.search) {
      const searchHistory = this.searchHistoryRepository.create({
        search,
        user: { id: userId },
      });
      await this.searchHistoryRepository.save(searchHistory);
    }
    const allHistories = await this.searchHistoryRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    if (allHistories.length > 10) {
      const historiesToDelete = allHistories.slice(10);
      const idsToDelete = historiesToDelete.map((h) => h.id);
      await this.searchHistoryRepository.delete(idsToDelete);
    }

    return {
      message: 'Search history created successfully',
    };
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
