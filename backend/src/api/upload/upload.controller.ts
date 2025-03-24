// import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, InternalServerErrorException } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { UploadService } from './upload.service';
//
// @Controller('upload')
// export class UploadController {
//     constructor(private readonly uploadService: UploadService) {}
//
//     @Post()
//     @UseInterceptors(FileInterceptor('file'))
//     async uploadFile(@UploadedFile() file: Express.Multer.File) {
//         try {
//             if (!file) {
//                 throw new BadRequestException('Файл не найден');
//             }
//
//             const photoUrl = await this.uploadService.saveFile(file);
//             return { photoUrl };
//         } catch (error) {
//             console.error('Error uploading file:', error);
//         }
//     }
// }

import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        try {
            if (!file) {
                throw new BadRequestException('Файл не найден');
            }

            const photoUrl = await this.uploadService.saveFile(file);
            return { photoUrl };
        } catch (error) {
            throw new InternalServerErrorException('Ошибка при загрузке файла');
        }
    }
}