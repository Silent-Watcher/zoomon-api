import { Document, Types } from 'mongoose';

export interface OptimisticLockable extends Document {
	_id: Types.ObjectId;
	updatedAt: Date;
	createdAt: Date;
	version: number;
}

export interface OptimisticLockableService {
	findById(id: string): Promise<any | null>;
}
