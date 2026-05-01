import { Query, Schema, SortValues } from 'mongoose';

interface WithVersion {
	version: number;
}

export function versionFieldMiddleware<T extends WithVersion>(
	schema: Schema<T>,
): void {
	const addVersionIncrement = function (this: Query<any, any>) {
		const updateQuery = this.getUpdate();

		if (!updateQuery) return;
		if (updateQuery && !updateQuery['$inc']) {
			updateQuery['$inc'] = {};
		}

		updateQuery['$inc'].version = 1;
	};

	schema.pre(['updateOne', 'findOneAndUpdate'], addVersionIncrement);
	schema.pre('updateMany', addVersionIncrement);

	// ! this will not be an atomic operation use updateOne and findOneAndUpdate
	schema.pre('save', function () {
		if (!this.isNew) {
			this.increment(); // increments __v
			(this as T).version += 1;
		}
	});
}

export function extractMongoDuplicateKeyValueFromError(
	errMsg: string,
): string | null {
	const duplicateKey = errMsg.slice(errMsg.indexOf('{'));
	if (!duplicateKey) return null;
	return duplicateKey;
}

export type SortObject<T> = {
	[K in keyof Partial<T>]: SortValues;
};
