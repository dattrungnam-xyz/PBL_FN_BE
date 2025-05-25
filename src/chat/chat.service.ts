import { Injectable } from '@nestjs/common';
import { chatDTO } from './dto/chat.dto';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from '../products/entity/product.entity';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  async chat(body: chatDTO) {
    const response = await axios.post(
      `${process.env.CHAT_SERVICE_URL}/chatbot`,
      {
        query: body.message,
      },
    );
    const { id_product, message } = response.data;
    const products = await this.productRepository.find({
      where: { id: In(id_product) },
      relations: ['reviews', 'orderDetails'],
    });
    return {
      products: products,
      message: message,
    };
  }
}
