import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppLogger } from "./logger/logger.service";
import { VersioningType } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});
	app.useLogger(new AppLogger());
	app.setGlobalPrefix("api");
	app.enableVersioning({
		type: VersioningType.MEDIA_TYPE,
		key: "v=",
		defaultVersion: "1",
	});
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
