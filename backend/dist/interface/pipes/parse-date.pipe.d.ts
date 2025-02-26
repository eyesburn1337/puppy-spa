import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class ParseDatePipe implements PipeTransform<string, Date> {
    transform(value: string, metadata: ArgumentMetadata): Date;
}
