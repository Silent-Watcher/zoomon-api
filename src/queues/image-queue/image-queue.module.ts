import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { IMAGE_QUEUE } from '../../common/constants/queue.constant';
import { ImageConsumer } from './image.consumer';
import { ImageQueueService } from './image-queue.service';
import { FileModule } from '../../file/file.module';
import { UploadModule } from '../../upload/upload.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User as UserEntity, UserSchema } from '../../user/user.schema';
import { versionFieldMiddleware } from '../../common/helpers/mongo.helper';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: UserEntity.name,
				useFactory() {
					const schema = UserSchema;
					versionFieldMiddleware(schema);
					return schema;
				},
			},
		]),
		BullModule.registerQueue({
			name: IMAGE_QUEUE,
		}),
		UploadModule,
		FileModule,
	],
	providers: [ImageConsumer, ImageQueueService],
	exports: [BullModule, ImageQueueService],
})
export class ImageQueueModule {}
