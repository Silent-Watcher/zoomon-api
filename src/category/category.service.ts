import {
	ConflictException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './category.schema';
import {
	Connection,
	DeleteResult,
	Model,
	QueryFilter,
	Types,
	UpdateResult,
} from 'mongoose';
import { ReplaceCategoryDto } from './dtos/update-category.dto';
import { OptimisticLockableService } from '../common/interfaces/optimistic-lockable.interface';
import { Article } from '../article/article.schema';
import { SortCategory } from './category.interface';
import { ListAllOptions } from '../common/interfaces/api.interface';
import { IdempotencyService } from '../idempotency/idempotency.service';
import { IdempotentService } from '../idempotency/idempotent-service.abstract';
import { IDEMPOTENCY_OPERATION } from '../idempotency/idempotency.constant';
import { IdempotencyRequestData } from '../idempotency/idempotency.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { AppLogger } from '../logger/logger.service';

@Injectable()
export class CategoryService
	extends IdempotentService
	implements
		OptimisticLockableService<Category, CategoryDocument | Category | null>
{
	constructor(
		@InjectModel(Category.name)
		private readonly categoryModel: Model<Category>,
		@InjectModel(Article.name)
		private readonly articleModel: Model<Article>,
		@InjectConnection() private readonly connection: Connection,
		protected readonly idempotencyService: IdempotencyService,
		@InjectRedis() protected readonly redis: Redis,
		protected readonly logger: AppLogger,
	) {
		super(idempotencyService, redis, logger);
	}

	findById(id: string) {
		return this.categoryModel.findById(id, { __v: 0 }, { lean: true });
	}

	async create(
		dto: CreateCategoryDto,
		userId: string,
		idempotencyData: IdempotencyRequestData,
	) {
		const session = await this.connection.startSession();
		session.startTransaction();

		const newCategoryId = new Types.ObjectId();
		return this.executeIdempotent(
			IDEMPOTENCY_OPERATION.CREATE_CATEGORY,
			idempotencyData,
			userId,
			newCategoryId.toHexString(),
			async () => {
				const { name: newName } = dto;

				const exists = await this.categoryModel
					.exists({ name: newName })
					.lean();
				if (exists) throw new ConflictException(`already exists`);

				const newCategory = new this.categoryModel(
					{
						name: newName,
						_id: newCategoryId,
					},
					{ name: 1, id: 1, _id: 1, createdAt: 1 },
				);

				await newCategory.save({ session });

				return {
					code: HttpStatus.CREATED,
					body: newCategory.toJSON(),
				};
			},
			{ session },
		);
	}

	async replaceOne(
		id: string,
		dto: ReplaceCategoryDto,
	): Promise<Pick<UpdateResult, 'acknowledged' | 'modifiedCount'>> {
		const { name } = dto;
		const { acknowledged, modifiedCount } =
			await this.categoryModel.replaceOne(
				{ _id: id },
				{ name },
				{ lean: true },
			);
		return { acknowledged, modifiedCount };
	}

	async getOne(id: string): Promise<Category> {
		const foundedCategory = await this.categoryModel
			.findById(id, { _id: 1, name: 1 })
			.lean();
		if (!foundedCategory) throw new NotFoundException('not found');
		return foundedCategory;
	}

	async deleteOne(id: string): Promise<DeleteResult> {
		const session = await this.connection.startSession();
		session.startTransaction();
		await this.articleModel.updateMany(
			{},
			{ $pull: { categories: id } },
			{ session },
		);
		const { acknowledged, deletedCount } =
			await this.categoryModel.deleteOne({ _id: id }, { session });
		await session.commitTransaction();
		await session.endSession();
		return { acknowledged, deletedCount };
	}

	async listAll(opts: ListAllOptions<SortCategory>) {
		let { sort, page, limit } = opts;

		let query: QueryFilter<Category> = {};

		let totalDocsQuery = this.categoryModel.countDocuments(query).lean();

		const skip = (limit as number) * ((page as number) - 1);

		let dataQuery = this.categoryModel
			.find(query, { id: 1, name: 1 })
			.sort(sort as any)
			.skip(skip)
			.limit(limit as number)
			.lean();

		const [totalDocs, data] = await Promise.all([
			totalDocsQuery,
			dataQuery,
		]);

		return {
			data,
			meta: {
				total: totalDocs,
				page,
				pages: Math.ceil(totalDocs / (limit as number)),
			},
		};
	}
}
