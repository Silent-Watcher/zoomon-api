import { registerAs } from '@nestjs/config';
import z from 'zod';
import { fromError } from 'zod-validation-error';
import { UPLOAD_STORAGE } from '../constants/storage.constant';

const storageProviderConfigSchema = z.enum(UPLOAD_STORAGE).nonoptional();

const minioStorageConfigSchema = z.object({
	accessKey: z.string().trim().nonempty().nonoptional(),
	secretKey: z.string().trim().nonempty().nonoptional(),
	endpoint: z.string().trim().nonempty().nonoptional(),
	port: z.coerce.number().nonoptional(),
	useSsl: z.coerce.boolean().default(false),
	bucketName: z.string().trim().nonempty().nonoptional(),
	baseUrl: z.string().trim().nonempty().nonoptional(),
});

export type MinioStorageConfigSchema = z.infer<typeof minioStorageConfigSchema>;

export default registerAs('storage', () => {
	let config: {
		provider: string;
		minio: MinioStorageConfigSchema;
	} = {
		provider: process.env.STORAGE_PROVIDER!,

		minio: {
			port: Number(process.env.MINIO_PORT),
			endpoint: process.env.MINIO_ENDPOINT!,
			accessKey: process.env.MINIO_ACCESS_KEY!,
			secretKey: process.env.MINIO_SECRET_KEY!,
			bucketName: process.env.MINIO_BUCKET_NAME!,
			useSsl: process.env.MINIO_USE_SSL == 'false' ? false : true,
			baseUrl: process.env.MINIO_PUBLIC_URL!,
		},
	};

	const minioConfigParseResult = minioStorageConfigSchema.safeParse(
		config.minio,
	);
	const storageProviderParseResult = storageProviderConfigSchema.safeParse(
		config.provider,
	);

	if (!minioConfigParseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(minioConfigParseResult.error).toString()}`,
		);
	}
	if (!storageProviderParseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(storageProviderParseResult.error).toString()}`,
		);
	}

	config.minio = minioConfigParseResult.data;
	return config;
});
