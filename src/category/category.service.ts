import {
	ConflictException,
	Injectable,
	NotAcceptableException,
	NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
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
import { ListAllOptions, SortCategory } from './category.interface';
import { MAXIMUM_CATEGORY_PER_PAGE } from './category.constant';

@Injectable()
export class CategoryService implements OptimisticLockableService {
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
		const { name: newName } = dto;

		const exists = await this.categoryModel
			.exists({ name: newName })
			.lean();
		if (exists) throw new ConflictException(`already exists`);

		const { name, id, createdAt } = await this.categoryModel.create({
			name: newName,
		});

		return { name, id, createdAt };
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

	async listAll(opts: ListAllOptions) {
		let { sort, page, limit } = opts;
		console.log('opts: ', opts);

		let query: QueryFilter<Category> = {};

		let totalDocsQuery = this.categoryModel.countDocuments(query).lean();

		const skip = limit * (page - 1);

		let dataQuery = this.categoryModel
			.find(query, { id: 1, name: 1 })
			.sort(sort)
			.skip(skip)
			.limit(limit)
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
				pages: Math.ceil(totalDocs / limit),
			},
		};
	}
}
