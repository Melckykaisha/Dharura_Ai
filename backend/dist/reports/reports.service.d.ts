import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsService {
    private readonly prisma;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(createReportDto: CreateReportDto): Promise<{
        description: string;
        type: import(".prisma/client").$Enums.ReportType;
        latitude: number;
        longitude: number;
        confidenceScore: number;
        severity: import(".prisma/client").$Enums.SeverityLevel;
        id: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        description: string;
        type: import(".prisma/client").$Enums.ReportType;
        latitude: number;
        longitude: number;
        confidenceScore: number;
        severity: import(".prisma/client").$Enums.SeverityLevel;
        id: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    updateStatus(id: string, status: any): Promise<{
        description: string;
        type: import(".prisma/client").$Enums.ReportType;
        latitude: number;
        longitude: number;
        confidenceScore: number;
        severity: import(".prisma/client").$Enums.SeverityLevel;
        id: string;
        status: import(".prisma/client").$Enums.ReportStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private calculateRisk;
}
