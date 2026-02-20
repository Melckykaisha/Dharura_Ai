import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateReportDto } from './dto/create-report.dto';
import { SeverityLevel, ReportType } from '@prisma/client';

@Injectable()
export class ReportsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly eventsGateway: EventsGateway,
    ) { }

    async create(createReportDto: CreateReportDto) {
        const { type, description, latitude, longitude } = createReportDto;

        const { confidenceScore, severity } = await this.calculateRisk(type, description, latitude, longitude);

        const report = await this.prisma.emergencyReport.create({
            data: {
                type,
                description,
                latitude,
                longitude,
                confidenceScore,
                severity,
            },
        });

        this.eventsGateway.broadcastEmergency(report);

        return report;
    }

    async findAll() {
        return this.prisma.emergencyReport.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100, // Returning the latest 100 for hackathon speed
        });
    }

    async updateStatus(id: string, status: any) {
        const report = await this.prisma.emergencyReport.update({
            where: { id },
            data: { status },
        });

        // Broadcast status change too!
        this.eventsGateway.broadcastEmergency(report);
        return report;
    }

    private async calculateRisk(type: ReportType, description: string, lat: number, lng: number): Promise<{ confidenceScore: number, severity: SeverityLevel }> {
        let score = 20; // Base score
        const descLower = description.toLowerCase();

        // 1. Keyword analysis based on type
        const keywords = {
            [ReportType.FIRE]: ['smoke', 'flames', 'burning', 'explosion', 'ashes', 'arson'],
            [ReportType.FLOOD]: ['water', 'drowning', 'river', 'overflow', 'submerged', 'rain'],
            [ReportType.ACCIDENT]: ['crash', 'collision', 'blood', 'injured', 'car', 'truck', 'bike'],
            [ReportType.VIOLENCE]: ['gun', 'knife', 'screaming', 'fight', 'robbery', 'attack', 'mob', 'riot'],
            [ReportType.OTHER]: ['emergency', 'help', 'urgent'],
        };

        const relevantKeywords = keywords[type] || [];
        const hasMatch = relevantKeywords.some(kw => descLower.includes(kw));
        if (hasMatch) {
            score += 20;
        }

        // 2. Spatial-Temporal Engine (2km Radius approx, 10-minute window)
        const tenMinsAgo = new Date();
        tenMinsAgo.setMinutes(tenMinsAgo.getMinutes() - 10);

        const radiusApprox = 0.018; // ~2km in decimal degrees

        const nearbyReports = await this.prisma.emergencyReport.count({
            where: {
                createdAt: { gte: tenMinsAgo },
                latitude: { gte: lat - radiusApprox, lte: lat + radiusApprox },
                longitude: { gte: lng - radiusApprox, lte: lng + radiusApprox },
            }
        });

        // Every nearby report increases confidence by 15. Cap at 100
        score += nearbyReports * 15;
        if (score > 100) score = 100;

        // Determine Severity
        let severity: SeverityLevel = SeverityLevel.LOW;
        if (score >= 70) severity = SeverityLevel.CRITICAL;
        else if (score >= 40) severity = SeverityLevel.WARNING;

        return { confidenceScore: score, severity };
    }
}
