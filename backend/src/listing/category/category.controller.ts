import { Controller, Get, Param, Logger } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
    private readonly logger = new Logger(CategoryController.name);

    constructor(private readonly categoryService: CategoryService) {
        this.logger.log('📌 CategoryController подключен!');
    }

    @Get()
    async getCategories() {
        this.logger.log('➡️ Вызван GET /category');
        return this.categoryService.getAllCategories();
    }

    @Get(':id')
    async getCategoryById(@Param('id') id: string) {
        this.logger.log(`➡️ Вызван GET /category/${id}`);
        return this.categoryService.getCategoryById(Number(id));
    }
}
