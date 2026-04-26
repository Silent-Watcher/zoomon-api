import { Schema } from 'mongoose';

interface WithVersion {
	version: number;
}

export function versionFieldMiddleware<T extends WithVersion>(
	schema: Schema<T>,
): void {
	schema.pre(['updateOne', 'findOneAndUpdate'], function () {
		const updateQuery = this.getUpdate();

		if (!updateQuery) return;
		if (updateQuery && !updateQuery['$inc']) {
			updateQuery['$inc'] = {};
		}

		updateQuery['$inc'].version = 1;
	});

	// ! this will not be an atomic operation use updateOne and findOneAndUpdate
	schema.pre('save', function () {
		if (!this.isNew) {
			this.increment(); // increments __v
			(this as T).version += 1;
		}
	});
}
