import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService {
	constructor(
		@InjectModel(Category.name)
		private readonly categoryModel: Model<Category>,
	) {}

	async create(dto: CreateCategoryDto) {
		const { name } = dto;

		const exists = await this.categoryModel.exists({ name }).lean();
		if (exists) throw new ConflictException(`already exists`);

		return this.categoryModel.create({ name });
	}
}
