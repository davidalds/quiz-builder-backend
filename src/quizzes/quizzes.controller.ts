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
import { Quiz } from 'generated/prisma'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { Public } from 'src/auth/metadatas'
import type { ReqType } from 'src/types'

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Public()
  @Get()
  async findInfinityQuizzes(
    @Query('cursor') cursor: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ): Promise<{ total: number; data: Quiz[]; nextCursor: number | undefined }> {
    return this.quizzesService.findInfinityQuizzes(
      cursor,
      limit,
      search,
      'news',
    )
  }

  @Public()
  @Get('popular')
  async findPopular(
    @Query('cursor') cursor: number,
    @Query('limit') limit: number,
  ): Promise<{ total: number; data: Quiz[]; nextCursor: number | undefined }> {
    return this.quizzesService.findInfinityQuizzes(cursor, limit, '', 'popular')
  }

  @Get('dashboard')
  async getDashboardInfo(@Req() req: ReqType) {
    const user = req['user']
    return await this.quizzesService.getDashboardInfo(user.id)
  }

  @Get('user-quizzes')
  async findByUser(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Req() req: ReqType,
  ): Promise<{ total: number; data: Quiz[] }> {
    const user = req['user']
    return this.quizzesService.findByUser(offset, limit, user.id, search)
  }

  @Post()
  async create(
    @Body() data: CreateQuizDto,
    @Req() req: ReqType,
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
    @Req() req: ReqType,
  ): Promise<Quiz | null> {
    const user = req['user']
    return this.quizzesService.findOne({ id, userId: user.id })
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateQuizDto,
    @Req() req: ReqType,
  ): Promise<Quiz> {
    const user = req['user']
    return this.quizzesService.update({ id, userId: user.id }, data)
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ReqType,
  ): Promise<Quiz> {
    const user = req['user']
    return this.quizzesService.delete({ id, userId: user.id })
  }
}
