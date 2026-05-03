import { registerAs } from '@nestjs/config';
import z from 'zod';
import type { Options } from 'clamscan';
import NodeClam from 'clamscan';
import { fromError } from 'zod-validation-error';

const clamavConfigSchema = z
	.object({
		host: z.string().nonoptional(),
		port: z.coerce.number().nonoptional(),
		timeout: z.coerce.number().nonoptional(),
	})
	.loose();

export default registerAs('clamav', (): NodeClam.Options => {
	const config: Options = {
		removeInfected: false,
		quarantineInfected: false,
		clamdscan: {
			host: process.env?.CLAMAV_HOST!,
			port: Number(process.env?.CLAMAV_PORT!),
			timeout: Number(process.env?.CLAMAV_TIMEOUT!),
			socket: false,
		},
		preference: 'clamdscan',
	} as const;

	const parseResult = clamavConfigSchema.safeParse(config.clamdscan);

	if (!parseResult.success) {
		throw new Error(
			`Config validation error: ${fromError(parseResult.error).toString()}`,
		);
	}

	return config;
});
