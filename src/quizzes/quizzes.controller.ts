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
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') category: string,
    @Query('search') search: string,
  ) {
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
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ total: number; data: Quiz[]; nextCursor: number | undefined }> {
    return this.quizzesService.findInfinityPopularQuizzes(cursor, limit)
  }

  @Public()
  @Get('categories/:slug')
  async findByCategory(@Param('slug') slug: string) {
    return this.quizzesService.findByCategory({ slug })
  }

  @Get('dashboard')
  async getDashboardInfo(@Req() req: ReqType) {
    const user = req['user']
    return await this.quizzesService.getDashboardInfo(user.id)
  }

  @Get('user-quizzes')
  async findByUser(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('category') category: string,
    @Query('search') search: string,
    @Req() req: ReqType,
  ) {
    const user = req['user']
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
  ) {
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
