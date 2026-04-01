import {
  Controller,
  Get,
  Post,
  Body,
  ParseIntPipe,
  Query,
  Req,
  DefaultValuePipe,
} from '@nestjs/common'
import { ResultsService } from './results.service'
import { CreateResultDto } from './dto/create-result.dto'
import { Public } from 'src/auth/metadatas'
import type { ReqType } from 'src/types'

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Public()
  @Post()
  async recordQuizScore(
    @Query('quizId', ParseIntPipe) quizId: number,
    @Body() data: CreateResultDto,
    @Req() req: ReqType,
  ) {
    const user = req['user']
    return this.resultsService.recordQuizScore(
      { id: quizId },
      {
        ...user,
      },
      data,
    )
  }

  @Get('/quizzes')
  async getQuizzesByResult(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: ReqType,
  ) {
    const user = req['user']
    return this.resultsService.getQuizzesByResult(offset, limit, { ...user })
  }

  @Public()
  @Get()
  async getQuizScore(
    @Query('quizId', ParseIntPipe) quizId: number,
    @Query('guestId') guestId: string,
    @Req() req: ReqType,
  ) {
    const user = req['user']
    return this.resultsService.getQuizScore(
      { id: quizId },
      { ...user },
      guestId,
    )
  }
}
