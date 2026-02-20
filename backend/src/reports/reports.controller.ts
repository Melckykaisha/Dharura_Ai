import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post()
    create(@Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(createReportDto);
    }

    @Get()
    findAll() {
        return this.reportsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: any) {
        return this.reportsService.updateStatus(id, status);
    }
}
