import {
  Controller,
  Get,
  Post,
  Body,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common'
import { ResultsService } from './results.service'
import { CreateResultDto } from './dto/create-result.dto'
import { Public } from '@/auth/metadatas'
import { UserDecorator } from '@/decorators/user.decorator'
import type { JwtToken } from '@/types/user'
import { QuizzesResultResponse, ResultResponse } from '@/types/result'
import { Result } from '../../generated/prisma'
import { RequestCookieKeys } from '@/types/requestCookieType'
import { Cookies } from '@/decorators/cookie.decorator'

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Public()
  @Post()
  async recordQuizScore(
    @Query('quizId') publicId: string,
    @Body() data: CreateResultDto,
    @UserDecorator() user: JwtToken,
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
    @UserDecorator() user: JwtToken,
  ): Promise<QuizzesResultResponse> {
    return this.resultsService.getQuizzesByResult(offset, limit, { ...user })
  }

  @Public()
  @Get()
  async getQuizScore(
    @Query('quizId') publicId: string,
    @Cookies() cookies: Record<RequestCookieKeys, string>,
    @UserDecorator() user: JwtToken,
  ): Promise<ResultResponse> {
    const { guestId } = cookies

    if (!guestId) {
      throw new NotFoundException('Id de visitante não encontrado!')
    }

    return this.resultsService.getQuizScore({ publicId }, { ...user }, guestId)
  }
}
