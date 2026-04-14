import {
  Controller,
  Get,
  Post,
  Body,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from '@nestjs/common'
import { ResultsService } from './results.service'
import { CreateResultDto } from './dto/create-result.dto'
import { Public } from 'src/auth/metadatas'
import { UserDecorator } from 'src/decorators/user.decorator'
import type { UserReq } from 'src/types/user'
import { QuizzesResultResponse, ResultResponse } from 'src/types/result'
import { Result } from 'generated/prisma'

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Public()
  @Post()
  async recordQuizScore(
    @Query('quizId') publicId: string,
    @Body() data: CreateResultDto,
    @UserDecorator() user: UserReq,
  ): Promise<Result> {
    return this.resultsService.recordQuizScore(
      { publicId },
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
    @UserDecorator() user: UserReq,
  ): Promise<QuizzesResultResponse> {
    return this.resultsService.getQuizzesByResult(offset, limit, { ...user })
  }

  @Public()
  @Get()
  async getQuizScore(
    @Query('quizId') publicId: string,
    @Query('guestId') guestId: string,
    @UserDecorator() user: UserReq,
  ): Promise<ResultResponse> {
    return this.resultsService.getQuizScore({ publicId }, { ...user }, guestId)
  }
}
