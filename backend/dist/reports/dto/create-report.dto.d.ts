import { ReportType } from '@prisma/client';
export declare class CreateReportDto {
    type: ReportType;
    description: string;
    latitude: number;
    longitude: number;
}
