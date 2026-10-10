import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { CreateAuthDto } from './dto/create-auth.dto'
import * as bcrypt from 'bcrypt'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { PrismaService } from '@/prisma.service'
import { JwtToken } from '@/types/user'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import { Env } from '@/types/envTypes'

@Injectable()
export class AuthService {
  private ACCESS_TOKEN_EXPIRES: JwtSignOptions['expiresIn']
  private REFRESH_TOKEN_EXPIRES: JwtSignOptions['expiresIn']

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService<Env>,
  ) {
    this.ACCESS_TOKEN_EXPIRES = this.configService.getOrThrow(
      'ACCESS_TOKEN_EXPIRES',
      {
        infer: true,
      },
    )
    this.REFRESH_TOKEN_EXPIRES = this.configService.getOrThrow(
      'REFRESH_TOKEN_EXPIRES',
      {
        infer: true,
      },
    )
  }

  async generateJwtToken<T extends object>(
    payload: T,
    jwtSignOptions: JwtSignOptions,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { ...payload, jti: uuidv4() },
      { ...jwtSignOptions },
    )
  }

  async signIn(createAuthDto: CreateAuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: createAuthDto.email,
      },
      select: {
        id: true,
        publicId: true,
        name: true,
        email: true,
        password: true,
      },
    })

    if (user) {
      const userPassword = user.password

      const result = await bcrypt.compare(createAuthDto.password, userPassword)

      if (result) {
        const payload = {
          id: user.id,
          publicId: user.publicId,
          email: user.email,
          name: user.name,
        }
        return {
          access_token: await this.generateJwtToken(payload, {
            expiresIn: this.ACCESS_TOKEN_EXPIRES,
          }),
          refresh_token: await this.generateJwtToken(payload, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES,
          }),
        }
      }
    }

    throw new UnauthorizedException('E-mail ou senha incorretos!')
  }

  async getRevokedToken({ jti }: { jti: string }): Promise<string | undefined> {
    return await this.cacheManager.get(`revoked_tokens:${jti}`)
  }

  async setRevokedToken({
    jti,
    data,
    ttl,
  }: {
    jti: string
    data: string
    ttl: number
  }) {
    await this.cacheManager.set(`revoked_tokens:${jti}`, data, ttl)
  }

  async refreshToken(refreshToken: string) {
    const { id, publicId, email, name, jti, iat, exp } = await this.jwtService
      .verifyAsync<JwtToken>(refreshToken)
      .catch(() => {
        throw new UnauthorizedException('Token inválido!')
      })

    if (await this.getRevokedToken({ jti })) {
      throw new ForbiddenException('Token informado ja foi utilizado.')
    }

    const ttl = (exp - iat) * 1000 // refreshToken expiration time
    await this.setRevokedToken({ jti, data: refreshToken, ttl })

    return {
      access_token: await this.generateJwtToken(
        { id, publicId, email, name },
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRES,
        },
      ),
      refresh_token: await this.generateJwtToken(
        { id, publicId, email, name },
        {
          expiresIn: this.REFRESH_TOKEN_EXPIRES,
        },
      ),
    }
  }
}
