import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { QuizzesService } from './quizzes.service'
import { Quiz } from 'generated/prisma'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { Public } from 'src/auth/metadatas'
import { UserDecorator } from 'src/decorators/user.decorator'
import type { UserReq } from 'src/types/user'
import { QuizInfinityResponse, QuizResponse } from 'src/types/quiz'

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Public()
  @Get()
  async findInfinityQuizzes(
    @Query('cursor', new DefaultValuePipe('')) cursor: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') category: string,
    @Query('search') search: string,
  ): Promise<QuizInfinityResponse> {
    return this.quizzesService.findInfinityQuizzes(
      cursor,
      limit,
      category,
      search,
    )
  }

  @Public()
  @Get('popular')
  async findPopular(
    @Query('cursor', new DefaultValuePipe('')) cursor: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<QuizInfinityResponse> {
    return this.quizzesService.findInfinityPopularQuizzes(cursor, limit)
  }

  @Public()
  @Get('categories/:slug')
  async findByCategory(@Param('slug') slug: string): Promise<QuizResponse> {
    return this.quizzesService.findByCategory({ slug })
  }

  @Get('dashboard')
  async getDashboardInfo(@UserDecorator() user: UserReq): Promise<{
    totalQuizzes: number
    totalAnsweredQuizzes: number
    mostAnsweredQuiz: (Quiz & { _count: { results: number } }) | undefined
  }> {
    return await this.quizzesService.getDashboardInfo(user.id)
  }

  @Get('user-quizzes')
  async findByUser(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') category: string,
    @Query('search') search: string,
    @UserDecorator() user: UserReq,
  ): Promise<QuizResponse> {
    return this.quizzesService.findByUser(
      offset,
      limit,
      user.id,
      category,
      search,
    )
  }

  @Post()
  async create(
    @Body() data: CreateQuizDto,
    @UserDecorator() user: UserReq,
  ): Promise<Quiz> {
    return this.quizzesService.create(data, user.id)
  }

  @Public()
  @Get(':publicId')
  async findOne(
    @Param('publicId') publicId: string,
  ): Promise<Omit<Quiz, 'id' | 'userId'> | null> {
    return this.quizzesService.findOne({ publicId })
  }

  @Get('user-quizzes/:id')
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: UserReq,
  ): Promise<Quiz | null> {
    return this.quizzesService.findOneByUser({ id, userId: user.id })
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateQuizDto,
    @UserDecorator() user: UserReq,
  ): Promise<Quiz> {
    return this.quizzesService.update({ id, userId: user.id }, data)
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @UserDecorator() user: UserReq,
  ): Promise<Quiz> {
    return this.quizzesService.delete({ id, userId: user.id })
  }
}
