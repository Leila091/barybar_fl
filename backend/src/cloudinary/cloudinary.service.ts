import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        this.logger.log('Cloudinary настроен');
    }

    async uploadFile(file: Express.Multer.File): Promise<{ secure_url: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                    if (error) {
                        this.logger.error('Upload failed:', error);
                        reject(error);
                    } else if (!result) {
                        this.logger.error('Cloudinary returned undefined result');
                        reject(new Error('Cloudinary returned undefined result'));
                    } else {
                        this.logger.log('Upload successful:', result);
                        resolve({ secure_url: result.secure_url });
                    }
                },
            );

            const readableStream = Readable.from(file.buffer);
            readableStream.on('error', (error) => {
                this.logger.error('Stream error:', error);
                reject(error);
            });

            readableStream.pipe(uploadStream);
        });
    }
}