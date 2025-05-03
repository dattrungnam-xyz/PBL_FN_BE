import { Controller, UseInterceptors, ClassSerializerInterceptor, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { chatDTO } from './dto/chat.dto';

@Controller('chat')
@UseInterceptors(ClassSerializerInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: chatDTO) {
    return this.chatService.chat(body);
  }
}
