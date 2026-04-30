import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptiosn } from './common/configs';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseModuleAsyncOptions } from './common/configs/mongo.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OtpModule } from './otp/otp.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { OptimisticLockInterceptor } from './common/interceptors/optimistic-lock.interceptor';
import { EtagInterceptor } from './common/interceptors/etag.interceptor';
import { CacheWithEtagInterceptor } from './common/interceptors/cache-with-etag.interceptor';
import { Secured } from './auth/guards/secured.guard';
import { BlockIfAuthenticatedGuard } from './auth/guards/blockIfAuthenticated.guard';
import { LikeModule } from './like/like.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';

@Module({
	imports: [
		LoggerModule,
		ConfigModule.forRoot(configModuleOptiosn),
		MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
		AuthModule,
		UserModule,
		OtpModule,
		LikeModule,
		ArticleModule,
		CategoryModule,
		CommentModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: BlockIfAuthenticatedGuard,
		},
		{
			provide: APP_GUARD,
			useClass: Secured,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: EtagInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: OptimisticLockInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheWithEtagInterceptor,
		},
	],
})
export class AppModule {}
