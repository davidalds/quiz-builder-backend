import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { User, Prisma } from 'generated/prisma'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany()
  }

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: userWhereUniqueInput,
    })
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.findOne({ email: data.email })

    if (user) {
      throw new ForbiddenException(
        'Já existe um usuário cadastrado com esse e-mail',
      )
    }

    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(data.password, salt)

    return await this.prismaService.user.create({
      data: { ...data, password: hash },
    })
  }

  async delete(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.findOne(userWhereUniqueInput)

    if (!user) {
      throw new NotFoundException('Usuário não encontrado!')
    }

    return await this.prismaService.user.delete({ where: userWhereUniqueInput })
  }
}
