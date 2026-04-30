import {
	ArgumentMetadata,
	InternalServerErrorException,
	NotFoundException,
	PipeTransform,
	Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Article } from '../article.schema';
import { Model, ProjectionType, QueryOptions } from 'mongoose';

export function articleByIdPipe(
	projection?: ProjectionType<Article>,
	options?: QueryOptions<Article>,
): Type<PipeTransform> {
	class ArticleByIdPipe implements PipeTransform {
		constructor(
			@InjectModel(Article.name)
			private readonly articleModel: Model<Article>,
		) {}

		async transform(value: any, metadata: ArgumentMetadata) {
			if (metadata.type === 'param' && metadata.data == 'id') {
				const foundedArticle = await this.articleModel.findOne(
					{
						$and: [
							{ _id: value },
							{ deletedAt: { $exists: false } },
						],
					},
					projection ?? {
						version: 0,
						__v: 0,
						updatedAt: 0,
					},
					options ?? { lean: true },
				);
				if (!foundedArticle)
					throw new NotFoundException(`${Article.name} not found`);
				return foundedArticle;
			}
			throw new InternalServerErrorException('something went wrong');
		}
	}

	return ArticleByIdPipe;
}
