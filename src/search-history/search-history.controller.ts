import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SearchHistoryService } from './search-history.service';
import { CreateSearchHistoryDTO } from './dto/create-search-history.dto';
import { UpdateSearchHistoryDTO } from './dto/update-search-history.dto';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { User } from '../users/entity/user.entity';
import { CurrentUser } from '../common/decorator/currentUser.decorator';

@Controller('search-history')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createSearchHistoryDto: CreateSearchHistoryDTO,
    @CurrentUser() user: User,
  ) {
    return this.searchHistoryService.create(createSearchHistoryDto, user.id);
  }

  @Get()
  findAll() {
    return this.searchHistoryService.findAll();
  }

  @Get('user/:id')
  findAllByUser(@Param('id') id: string) {
    return this.searchHistoryService.findAllByUser(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchHistoryService.findOne(id);
  }
}
