import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from 'generated/prisma'
import { Public } from 'src/auth/metadatas'
import { UserDecorator } from 'src/decorators/user.decorator'
import type { UserReq } from 'src/types/user'

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.UsersService.findAll()
  }

  @Get('user')
  async findOne(@UserDecorator() user: UserReq): Promise<User | null> {
    return this.UsersService.findOne({ id: user.id })
  }

  @Public()
  @Post()
  async create(@Body() data: CreateUserDto): Promise<User> {
    return this.UsersService.create(data)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.UsersService.delete({ id })
  }
}
