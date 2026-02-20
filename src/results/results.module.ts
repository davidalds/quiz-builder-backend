import { Module } from '@nestjs/common'
import { ResultsService } from './results.service'
import { ResultsController } from './results.controller'
import { QuizzesModule } from 'src/quizzes/quizzes.module'
import { PrismaService } from 'src/prisma.service'

@Module({
  imports: [QuizzesModule],
  controllers: [ResultsController],
  providers: [ResultsService, PrismaService],
})
export class ResultsModule {}
