import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './like.schema';
import { ArticleModule } from '../article/article.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
		ArticleModule,
	],
	controllers: [LikeController],
	providers: [LikeService],
})
export class LikeModule {}
