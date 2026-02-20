"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(createReportDto) {
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
            take: 100,
        });
    }
    async updateStatus(id, status) {
        const report = await this.prisma.emergencyReport.update({
            where: { id },
            data: { status },
        });
        this.eventsGateway.broadcastEmergency(report);
        return report;
    }
    async calculateRisk(type, description, lat, lng) {
        let score = 20;
        const descLower = description.toLowerCase();
        const keywords = {
            [client_1.ReportType.FIRE]: ['smoke', 'flames', 'burning', 'explosion', 'ashes', 'arson'],
            [client_1.ReportType.FLOOD]: ['water', 'drowning', 'river', 'overflow', 'submerged', 'rain'],
            [client_1.ReportType.ACCIDENT]: ['crash', 'collision', 'blood', 'injured', 'car', 'truck', 'bike'],
            [client_1.ReportType.VIOLENCE]: ['gun', 'knife', 'screaming', 'fight', 'robbery', 'attack', 'mob', 'riot'],
            [client_1.ReportType.OTHER]: ['emergency', 'help', 'urgent'],
        };
        const relevantKeywords = keywords[type] || [];
        const hasMatch = relevantKeywords.some(kw => descLower.includes(kw));
        if (hasMatch) {
            score += 20;
        }
        const tenMinsAgo = new Date();
        tenMinsAgo.setMinutes(tenMinsAgo.getMinutes() - 10);
        const radiusApprox = 0.018;
        const nearbyReports = await this.prisma.emergencyReport.count({
            where: {
                createdAt: { gte: tenMinsAgo },
                latitude: { gte: lat - radiusApprox, lte: lat + radiusApprox },
                longitude: { gte: lng - radiusApprox, lte: lng + radiusApprox },
            }
        });
        score += nearbyReports * 15;
        if (score > 100)
            score = 100;
        let severity = client_1.SeverityLevel.LOW;
        if (score >= 70)
            severity = client_1.SeverityLevel.CRITICAL;
        else if (score >= 40)
            severity = client_1.SeverityLevel.WARNING;
        return { confidenceScore: score, severity };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], ReportsService);
//# sourceMappingURL=reports.service.js.map