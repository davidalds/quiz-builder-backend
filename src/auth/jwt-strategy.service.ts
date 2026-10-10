import { Injectable, NotFoundException } from '@nestjs/common'
import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookies = req.cookies

        const { access_token } = cookies

        if (!access_token) {
          throw new NotFoundException('Token de acesso não encontrado!')
        }

        return access_token as string
      },
      secretOrKey: configService.getOrThrow<string>('JWTSECRET', {
        infer: true,
      }),
    })
  }

  validate({
    id,
    publicId,
    email,
    name,
  }: {
    id: number
    publicId: string
    email: string
    name: string
  }) {
    return { id, publicId, email, name }
  }
}
