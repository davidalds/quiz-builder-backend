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
  Req,
} from '@nestjs/common'
import { QuizzesService } from './quizzes.service'
import { Quiz, Result } from 'generated/prisma'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { CreateQuizScoreDto } from './dto/create-quiz-score.dto'
import { Public } from 'src/auth/metadatas'

interface AuthUser {
  user: {
    id: number
  }
}

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Public()
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
    @Req() req: Request & AuthUser,
  ): Promise<{ total: number; data: Quiz[] }> {
    const user = req['user']
    return this.quizzesService.findByUser(offset, limit, user.id)
  }

  @Post()
  async create(
    @Body() data: CreateQuizDto,
    @Req() req: Request & AuthUser,
  ): Promise<Quiz> {
    const user = req['user']
    return this.quizzesService.create(data, user.id)
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Quiz | null> {
    return this.quizzesService.findOne({ id })
  }

  @Get('user-quizzes/:id')
  async findOneByUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & AuthUser,
  ): Promise<Quiz | null> {
    const user = req['user']
    return this.quizzesService.findOneByUser({ id, userId: user.id })
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateQuizDto,
    @Req() req: Request & AuthUser,
  ): Promise<Quiz> {
    const user = req['user']
    return this.quizzesService.update({ id, userId: user.id }, data)
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & AuthUser,
  ): Promise<Quiz> {
    const user = req['user']
    return this.quizzesService.delete({ id, userId: user.id })
  }

  @Public()
  @Post(':id/answers')
  async recordQuizScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateQuizScoreDto,
  ) {
    return this.quizzesService.recordQuizScore({ id }, data)
  }

  @Public()
  @Get(':id/answers')
  async getQuizScore(
    @Param('id', ParseIntPipe) id: number,
    @Query('guestId') guestId: string,
  ): Promise<Result> {
    return this.quizzesService.getQuizScore({ id }, guestId)
  }
}
