import { PartialType } from '@nestjs/mapped-types';
import { CreateSearchHistoryDTO } from './create-search-history.dto';

export class UpdateSearchHistoryDTO extends PartialType(CreateSearchHistoryDTO) {}
