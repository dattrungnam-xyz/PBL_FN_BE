import { Controller } from '@nestjs/common';
import { RestockingService } from './restocking.service';

@Controller('restocking')
export class RestockingController {
  constructor(private readonly restockingService: RestockingService) {}
}
