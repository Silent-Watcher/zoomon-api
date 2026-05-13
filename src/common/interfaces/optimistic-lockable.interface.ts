import { Document, ProjectionType, QueryOptions, Types } from 'mongoose';

export interface OptimisticLockable extends Document {
	_id: Types.ObjectId;
	updatedAt: Date;
	createdAt: Date;
	version: number;
}

export interface OptimisticLockableService<P, O> {
	findById(
		id: string,
		projection: ProjectionType<P>,
		options: QueryOptions,
	): Promise<O | null>;
}
