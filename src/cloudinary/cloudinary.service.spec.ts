import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryOutput } from './cloudinary.output';

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  beforeEach(async () => {
    let mockCloudinaryService = {
      uploadImage: jest.fn(),
      uploadVideoStream: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService, CloudinaryProvider],
    })
      .overrideProvider(CloudinaryService)
      .useValue(mockCloudinaryService)
      .compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('uploadImage', () => {
    it('should upload an image and return the response', async () => {
      const file = {
        buffer: Buffer.from('file-buffer'),
        mimetype: 'image/png',
      } as Express.Multer.File;

      const mockResponse = {
        url: 'url_image',
        type: 'photo',
      } as CloudinaryOutput;

      jest.spyOn(service, 'uploadImage').mockResolvedValue(mockResponse);

      expect(await service.uploadImage(file)).toBe(mockResponse);

      expect(service.uploadImage).toHaveBeenCalledWith(file);
    });
  });

  describe('uploadVideoStream', () => {
    it('should upload a video and return the response', async () => {
      const file = {
        buffer: Buffer.from('file-buffer'),
      } as Express.Multer.File;
      const mockResponse = {
        url: 'video_url',
        type: 'video',
      } as CloudinaryOutput;

      jest.spyOn(service, 'uploadVideoStream').mockResolvedValue(mockResponse);

      expect(await service.uploadVideoStream(file)).toBe(mockResponse);

      expect(service.uploadVideoStream).toHaveBeenCalledWith(file);
      // expect(result).toEqual(mockResponse);
    });
  });
});
