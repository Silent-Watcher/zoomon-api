import {
	ArgumentMetadata,
	NotFoundException,
	PipeTransform,
	Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	Model,
	PopulateOptions,
	ProjectionType,
	Query,
	QueryFilter,
	QueryOptions,
} from 'mongoose';
import { Comment } from '../comment.schema';
import { COMMENT_STATUS } from '../comment.constant';

interface CommentByIdPipeOptions {
	projection?: ProjectionType<Comment>;
	queryOptions?: QueryOptions<Comment>;
	populate?: PopulateOptions | PopulateOptions[];
	additionalFilter?: QueryFilter<Comment>;
}

export function commentByIdPipe(
	// projection?: ProjectionType<Comment>,
	// options?: QueryOptions<Comment>,
	config?: CommentByIdPipeOptions,
): Type<PipeTransform> {
	class CommentByIdPipe implements PipeTransform {
		constructor(
			@InjectModel(Comment.name)
			private readonly commentModel: Model<Comment>,
		) {}

		async transform(value: any, metadata: ArgumentMetadata) {
			if (
				metadata.type === 'param' &&
				['parentId', 'id'].includes(metadata?.data!)
			) {
				const { projection, queryOptions, populate, additionalFilter } =
					config ?? {};

				const baseFilter: QueryFilter<Comment> = {
					_id: value,
					deletedAt: { $exists: false },
					status: COMMENT_STATUS.ACTIVE,
				};

				const filter = additionalFilter
					? { $and: [baseFilter, additionalFilter] }
					: baseFilter;

				let query = this.commentModel.findOne(
					filter,
					projection ?? { version: 0, __v: 0 },
					queryOptions ?? { lean: true },
				);

				if (populate) {
					query = query.populate(populate);
				}

				const foundedComment = await query.exec();

				if (!foundedComment)
					throw new NotFoundException(`${Comment.name} not found`);
				return foundedComment;
			}
			return value;
		}
	}

	return CommentByIdPipe;
}
