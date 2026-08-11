import { Module } from '@nestjs/common'
import { ResultsService } from './results.service'
import { ResultsController } from './results.controller'
import { PrismaService } from '@/prisma.service'

@Module({
  controllers: [ResultsController],
  providers: [ResultsService, PrismaService],
})
export class ResultsModule {}
