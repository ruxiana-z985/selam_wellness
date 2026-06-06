import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { WellnessController } from './wellness/wellness.controller';
import { WellnessService } from './wellness/wellness.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [WellnessController],
  providers: [PrismaService, WellnessService],
})
export class AppModule {}
