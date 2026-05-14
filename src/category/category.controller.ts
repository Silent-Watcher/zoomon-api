import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
	UsePipes,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { Etag } from '../common/decorators/etag.decorator';
import { OptimisticLock } from '../common/decorators/optimistic-lock.decorator';
import { ReplaceCategoryDto } from './dtos/update-category.dto';
import { CacheWithEtag } from '../common/decorators/cache-with-etag.decorator';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import type { SortCategory } from './category.interface';
import { MAXIMUM_CATEGORY_PER_PAGE } from './category.constant';
import { sortPipe } from '../common/pipes/sort.pipe';
import { SortCategorySchema } from './validation/sort.schema';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { User } from '../user/decorators/user.decorator';
import { IdempotencyData } from '../common/decorators/idempotency-data.decorator';
import type { IdempotencyRequestData } from '../idempotency/idempotency.interface';
import { ApiUtil } from '../util/api.util';
import type { Request } from 'express';
@Etag('id', CategoryService)
@Controller('categories')
export class CategoryController {
	constructor(
		private readonly categoryService: CategoryService,
		private readonly apiUtil: ApiUtil,
	) {}

	@Idempotent()
	@Post()
	async create(
		@IdempotencyData()
		idempotencyRequestData: IdempotencyRequestData,
		@Body() createCategoryDto: CreateCategoryDto,
		@User('id') userId: string,
		@Req() req: Request,
	) {
		const result = await this.categoryService.create(
			createCategoryDto,
			userId,
			idempotencyRequestData,
		);

		const __location = this.apiUtil.getEntityLocationHeaderValue(
			result.responseBody.id,
			req,
		);

		return { __location, ...result };
	}

	@CacheWithEtag()
	@Get(':id')
	getOne(@Param('id', ParseObjectIdPipe) id: string) {
		return this.categoryService.getOne(id);
	}

	@UsePipes(sortPipe(SortCategorySchema))
	@Get()
	listAll(
		@Query('sort', new DefaultValuePipe({ name: 1 })) sort: SortCategory,
		@Query(
			'page',
			new DefaultValuePipe(1),
			new ParseIntPipe({ optional: true }),
		)
		page: number,
		@Query(
			'limit',
			new DefaultValuePipe(MAXIMUM_CATEGORY_PER_PAGE),
			new ParseIntPipe({ optional: true }),
		)
		limit: number,
	) {
		return this.categoryService.listAll({ page, limit, sort });
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
