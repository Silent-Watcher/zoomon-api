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
			useFactory(clamConfig: ConfigType<typeof clamavConfig>) {
				return new NodeClam().init(clamConfig);
			},
			inject: [clamavConfig.KEY],
		},

		ClamavService,
	],
	exports: [CLAMAV],
})
export class ClamavModule {}
