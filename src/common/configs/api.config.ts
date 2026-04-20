import { registerAs } from '@nestjs/config';

export type ApiConfig = {
	globalPrefix: string;
	appName: string;
};

export default registerAs('api', (): ApiConfig => {
	const apiConfig = {
		globalPrefix: 'api',
		appName: 'zoomon',
	};
	return apiConfig;
});
