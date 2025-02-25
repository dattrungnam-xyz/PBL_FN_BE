/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryOutput } from './cloudinary.output';
import { CloudinaryResponse } from './cloudinary-response';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  private logger = new Logger(CloudinaryService.name);
  constructor() {}
  async uploadImage(file: Express.Multer.File): Promise<CloudinaryOutput> {
    const b64 = Buffer.from(file.buffer).toString('base64');
    let data: string = 'data:' + file.mimetype + ';base64,' + b64;
    return await this.uploadImageBase64(data, file.originalname);
  }
  async uploadImageBase64(
    data: string,
    name: string = '',
  ): Promise<CloudinaryOutput> {
    let res: CloudinaryResponse = await cloudinary.uploader.upload(data, {
      resource_type: 'auto',
    });
    return { name: name, url: res.url, type: 'image' } as CloudinaryOutput;
  }
  async uploadAudioStream(
    file: Express.Multer.File,
  ): Promise<CloudinaryOutput> {
    let res: CloudinaryResponse = await new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'video' },
          async (error, uploadResult) => {
            return resolve(uploadResult);
          },
        )
        .end(file.buffer);
    });
    return {
      name: file.originalname,
      url: res.url,
      type: 'audio',
    } as CloudinaryOutput;
  }
  async uploadListImage(files: Express.Multer.File[]) {
    const imagePromise = files.map((file) => {
      return this.uploadImage(file);
    });
    return await Promise.all(imagePromise);
  }
  async uploadListAudio(files: Express.Multer.File[]) {
    const audioPromise = files.map((file) => {
      return this.uploadAudioStream(file);
    });
    return await Promise.all(audioPromise);
  }
  async uploadBase64(data: string) {
    let res: CloudinaryResponse = await cloudinary.uploader.upload(data, {
      resource_type: 'auto',
    });
    return res.url;
  }
}
