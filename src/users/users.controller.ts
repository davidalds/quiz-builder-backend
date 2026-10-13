import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from '../../generated/prisma'
import { Public } from '@/auth/metadatas'
import { UserDecorator } from '@/decorators/user.decorator'
import type { JwtToken } from '@/types/user'
import type { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.UsersService.findAll()
  }

  @Get('user')
  async findOne(@UserDecorator() user: JwtToken): Promise<User | null> {
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

  @Public()
  @Get('guest')
  getGuest(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { guestId } = req.cookies
    if (!guestId) {
      res.cookie('guestId', uuidv4(), {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
    }
  }
}
