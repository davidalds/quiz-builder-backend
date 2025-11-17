import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { QuizzesService } from './quizzes.service'
import { Quiz, Result } from 'generated/prisma'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { CreateQuizScoreDto } from './dto/create-quiz-score.dto'

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  async findAll(
    @Query('cursor') cursor: number,
    @Query('limit') limit: number,
  ): Promise<{ total: number; data: Quiz[]; nextCursor: number | undefined }> {
    return this.quizzesService.findAll(cursor, limit)
  }

  @Get('user-quizzes')
  async findByUser(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ): Promise<{ total: number; data: Quiz[] }> {
    return this.quizzesService.findByUser(offset, limit)
  }

  @Post()
  async create(@Body() data: CreateQuizDto): Promise<Quiz> {
    return this.quizzesService.create(data)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Quiz | null> {
    return this.quizzesService.findOne({ id })
  }

  @Get('user-quizzes/:id')
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Quiz | null> {
    return this.quizzesService.findOneByUser({ id })
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateQuizDto,
  ): Promise<Quiz> {
    return this.quizzesService.update({ id }, data)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Quiz> {
    return this.quizzesService.delete({ id })
  }

  @Post(':id/answers')
  async recordQuizScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateQuizScoreDto,
  ) {
    return this.quizzesService.recordQuizScore({ id }, data)
  }

  @Get(':id/answers')
  async getQuizScore(@Param('id', ParseIntPipe) id: number): Promise<Result> {
    return this.quizzesService.getQuizScore({ id })
  }
}
