import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateAuthDto } from './dto/create-auth.dto'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(createAuthDto: CreateAuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    })

    if (user) {
      const userPassword = user.password

      const result = await bcrypt.compare(createAuthDto.password, userPassword)

      if (result) {
        const payload = { id: user.id, email: user.email, name: user.name }
        return {
          access_token: await this.jwtService.signAsync(payload, {
            expiresIn: '1d',
          }),
        }
      }
    }

    throw new UnauthorizedException('E-mail ou senha incorretos!')
  }
}
