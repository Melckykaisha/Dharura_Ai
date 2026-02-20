import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, ReportsModule, EventsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
