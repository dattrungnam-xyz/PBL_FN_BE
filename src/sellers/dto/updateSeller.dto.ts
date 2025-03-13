import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerDTO } from './createSeller.dto';

export class UpdateSellerDTO extends PartialType(CreateSellerDTO) {}
