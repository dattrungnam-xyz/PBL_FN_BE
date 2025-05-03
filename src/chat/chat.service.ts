import { Injectable } from '@nestjs/common';
import { chatDTO } from './dto/chat.dto';
import axios from 'axios';
@Injectable()
export class ChatService {
  constructor() {}
  async chat(body: chatDTO) {
    const response = await axios.post(
      `${process.env.CHAT_SERVICE_URL}/chatbot`,
      {
        query: body.message,
      },
    );
    return response.data;
  }
}
