import {
  Controller,
  Get,
  Post,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common'
import { ResultsService } from './results.service'
import { CreateResultDto } from './dto/create-result.dto'
import { Public } from 'src/auth/metadatas'
import { Result } from 'generated/prisma'

@Public()
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  async recordQuizScore(
    @Query('quizId', ParseIntPipe) quizId: number,
    @Body() data: CreateResultDto,
  ) {
    return this.resultsService.recordQuizScore({ id: quizId }, data)
  }

  @Get()
  async getQuizScore(
    @Query('quizId', ParseIntPipe) quizId: number,
    @Query('guestId') guestId: string,
  ): Promise<Result> {
    return this.resultsService.getQuizScore({ id: quizId }, guestId)
  }
}
