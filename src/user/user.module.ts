import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserController } from './user.controller';
import { versionFieldMiddleware } from '../common/helpers/mongo.helper';
// import { ClamavModule } from '../clamav/clamav.module';
import { UploadModule } from '../upload/upload.module';
import { ImageQueueModule } from '../queues/image-queue/image-queue.module';
import { FileModule } from '../file/file.module';

@Module({
	imports: [
		ImageQueueModule,
		MongooseModule.forFeatureAsync([
			{
				name: User.name,
				useFactory() {
					const schema = UserSchema;
					versionFieldMiddleware(schema);
					return schema;
				},
			},
		]),
		// ClamavModule,
		FileModule,
		UploadModule,
	],
	providers: [UserService],
	exports: [UserService, MongooseModule],
	controllers: [UserController],
})
export class UserModule {}
