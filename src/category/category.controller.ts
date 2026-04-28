import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Etag } from '../common/decorators/etag.decorator';
import { OptimisticLock } from '../common/decorators/optimistic-lock.decorator';
import { ReplaceCategoryDto } from './dtos/update-category.dto';
import { CacheWithEtag } from '../common/decorators/cache-with-etag.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
@Etag('id', CategoryService)
@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Post()
	create(@Body() createCategoryDto: CreateCategoryDto) {
		return this.categoryService.create(createCategoryDto);
	}

	@CacheWithEtag()
	@Get(':id')
	getOne(@Param('id', ParseObjectIdPipe) id: string) {
		return this.categoryService.getOne(id);
	}

	@OptimisticLock()
	@Put(':id')
	replaceOne(
		@Param('id', ParseObjectIdPipe) id: string,
		@Body() replaceDto: ReplaceCategoryDto,
	) {
		return this.categoryService.replaceOne(id, replaceDto);
	}

	@Delete(':id')
	deleteOne(@Param('id') id: string) {
		return this.categoryService.deleteOne(id);
	}
}
