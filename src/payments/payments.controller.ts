import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateZaloPaymentDTO } from './dto/createZaloPayment.dto';
import { ZaloPayCallbackDTO } from './dto/zaloPayCallback.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("zalopay")
  createPayment(@Body() createZaloPaymentDTO: CreateZaloPaymentDTO) {
    return this.paymentsService.createZaloPayment(createZaloPaymentDTO);
  }

  @Post('zalopay/callback')
  zaloPayCallback(@Body() zaloPayCallbackDTO: ZaloPayCallbackDTO) {
    return this.paymentsService.zaloPayCallback(zaloPayCallbackDTO);
  }
}
