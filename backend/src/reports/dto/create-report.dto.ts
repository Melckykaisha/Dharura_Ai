import { IsString, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
    @IsEnum(ReportType)
    @IsNotEmpty()
    type: ReportType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;
}
