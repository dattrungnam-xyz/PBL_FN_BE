import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Put,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { VerifyService } from './verify.service';
import { CreateVerifyDTO } from './dto/createVerify.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/authGuard.jwt';
import { User } from '../users/entity/user.entity';
import { CurrentUser } from '../common/decorator/currentUser.decorator';
import { UpdateVerifyDTO } from './dto/updateVerify.dto';
import { VerifyOCOPStatus } from '../common/type/verifyOCOP.type';
@Controller('verify')
export class VerifyController {
  constructor(
    private readonly verifyService: VerifyService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createVerify(
    @Body() createVerifyDTO: CreateVerifyDTO,
    @CurrentUser() user: User,
  ) {
    if (createVerifyDTO.images) {
      const uploadedImages = await Promise.all(
        createVerifyDTO.images.map((image) =>
          image.startsWith('data:image')
            ? this.cloudinaryService.uploadImageBase64(image)
            : image,
        ),
      );
      createVerifyDTO.images = uploadedImages.map((image) =>
        typeof image === 'string' ? image : image.url,
      );
    }
    return this.verifyService.createVerify(user.storeId, createVerifyDTO);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getVerifyById(@Param('id') id: string) {
    return this.verifyService.getVerifyById(id);
  }

  @Get('seller/:id')
  @UseGuards(JwtAuthGuard)
  async getVerifyBySellerId(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('status') status?: VerifyOCOPStatus,
    @Query('search') search?: string,
  ) {
    return this.verifyService.getVerifyByStoreId(id, {
      limit,
      page,
      status,
      search,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateVerifyById(
    @Param('id') id: string,
    @Body() updateVerifyDTO: UpdateVerifyDTO,
  ) {
    if (updateVerifyDTO.images) {
      const uploadedImages = await Promise.all(
        updateVerifyDTO.images.map((image) =>
          image.startsWith('data:image')
            ? this.cloudinaryService.uploadImageBase64(image)
            : image,
        ),
      );
      updateVerifyDTO.images = uploadedImages.map((image) =>
        typeof image === 'string' ? image : image.url,
      );
    }
    return this.verifyService.updateVerify(id, updateVerifyDTO);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteVerifyById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.verifyService.deleteVerify(id, user.storeId);
  }
}
