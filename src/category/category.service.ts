import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
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
	UpdateResult,
} from 'mongoose';
import { ReplaceCategoryDto } from './dtos/update-category.dto';
import { OptimisticLockableService } from '../common/interfaces/optimistic-lockable.interface';
import { Article } from '../article/article.schema';
import { SortCategory } from './category.interface';
import { ListAllOptions } from '../common/interfaces/api.interface';
import { MongoServerError } from 'mongodb';
import { MONGODB_ERROR_CODES } from '../common/constants/mongo.constant';
import { extractMongoDuplicateKeyValueFromError } from '../common/helpers/mongo.helper';

@Injectable()
export class CategoryService implements OptimisticLockableService<
	Category,
	CategoryDocument | Category | null
> {
	constructor(
		@InjectModel(Category.name)
		private readonly categoryModel: Model<Category>,
		@InjectModel(Article.name)
		private readonly articleModel: Model<Article>,
		@InjectConnection() private readonly connection: Connection,
	) {}

	findById(id: string): Promise<any | null> {
		return this.categoryModel.findById(id, { __v: 0 }, { lean: true });
	}

	async create(
		dto: CreateCategoryDto,
	): Promise<Pick<Category, 'name' | 'id' | 'createdAt'>> {
		try {
			const { name: newName } = dto;

			const exists = await this.categoryModel
				.exists({ name: newName })
				.lean();
			if (exists) throw new ConflictException(`already exists`);

			const { name, id, createdAt } = await this.categoryModel.create({
				name: newName,
			});

			return { name, id, createdAt };
		} catch (error) {
			//! TODO: put this inside exception filter!
			if (error instanceof MongoServerError) {
				if (MONGODB_ERROR_CODES.DUPLICATE_KEY === error.code) {
					const duplicateKey = extractMongoDuplicateKeyValueFromError(
						error.message,
					);
					throw new BadRequestException(
						`Duplicate key error ${duplicateKey}`,
					);
				}
			}
			throw new InternalServerErrorException('failed to create');
		}
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
