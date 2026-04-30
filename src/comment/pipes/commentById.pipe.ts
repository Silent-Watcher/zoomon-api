import {
	ArgumentMetadata,
	InternalServerErrorException,
	NotFoundException,
	PipeTransform,
	Type,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, QueryOptions } from 'mongoose';
import { Comment } from '../comment.schema';
import { COMMENT_STATUS } from '../comment.constant';

export function commentByIdPipe(
	projection?: ProjectionType<Comment>,
	options?: QueryOptions<Comment>,
): Type<PipeTransform> {
	class CommentByIdPipe implements PipeTransform {
		constructor(
			@InjectModel(Comment.name)
			private readonly commentModel: Model<Comment>,
		) {}

		async transform(value: any, metadata: ArgumentMetadata) {
			if (metadata.type === 'param' && metadata.data == 'parentId') {
				const foundedComment = await this.commentModel.findOne(
					{
						$and: [
							{ _id: value },
							{ deletedAt: { $exists: false } },
							{ status: COMMENT_STATUS.ACTIVE },
						],
					},
					projection ?? {
						version: 0,
						__v: 0,
					},
					options ?? { lean: true },
				);
				if (!foundedComment)
					throw new NotFoundException(`${Comment.name} not found`);
				return foundedComment;
			}
			return value;
		}
	}

	return CommentByIdPipe;
}
