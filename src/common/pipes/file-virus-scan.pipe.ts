import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileVirusScanPipe implements PipeTransform {
	transform(value: Express.Multer.File, metadata: ArgumentMetadata) {}
}
