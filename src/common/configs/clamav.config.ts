import { registerAs } from '@nestjs/config';
import z from 'zod';
import { validateSchemaAndReturnData } from '../helpers/validation.helper';
import type { Options } from 'clamscan';
import NodeClam from 'clamscan';

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

	return validateSchemaAndReturnData(clamavConfigSchema, config);
});
