import { ConfigType } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ClamavService } from './clamav.service';
import clamavConfig from '../common/configs/clamav.config';
import NodeClam from 'clamscan';
import { CLAMAV } from '../common/constants/clamav.constant';

@Module({
	providers: [
		{
			provide: CLAMAV,
			async useFactory(clamConfig: ConfigType<typeof clamavConfig>) {
				const clamscan = await new NodeClam().init(clamConfig);
				return clamscan;
			},
			inject: [clamavConfig.KEY],
		},

		ClamavService,
	],
	exports: [CLAMAV],
})
export class ClamavModule {}
