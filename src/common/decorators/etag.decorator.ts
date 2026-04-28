import { SetMetadata, Type } from '@nestjs/common';

export const ETAG_METADATA_KEY = 'etag_config';

export interface EtagConfig {
	dataKey?: string;
	serviceToken?: Type<any> | string;
	paramName?: string;
}

export function Etag(dataKey?: string);
export function Etag(paramName?: string, serviceToken?: Type<any> | string);
export function Etag(
	dataKeyOrService?: string,
	serviceToken?: Type<any> | string,
) {
	const config: EtagConfig =
		// typeof dataKeyOrService === 'string'
		// 	? { dataKey: dataKeyOrService }
		// 	: { paramName: dataKeyOrService, serviceToken };
		serviceToken
			? { paramName: dataKeyOrService, serviceToken }
			: { dataKey: dataKeyOrService };
	return SetMetadata(ETAG_METADATA_KEY, config);
}
