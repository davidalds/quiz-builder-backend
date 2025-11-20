import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { jwtConstant } from './constants'
import { Request } from 'express'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from './metadatas'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request: Request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (token) {
      try {
        const payload: { id: number; email: string; name: string } =
          await this.jwtService.verifyAsync(token, {
            secret: jwtConstant.secret,
          })

        request['user'] = payload
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new UnauthorizedException('Token inválido')
      }
      return true
    }

    return false
  }

  private extractTokenFromHeader(req: Request) {
    const authToken = req.headers.authorization

    if (authToken) {
      const token = authToken.split(' ')

      if (token.length === 2) {
        if (token[0].toLowerCase() === 'bearer') {
          return token[1]
        }
      }

      throw new UnauthorizedException('Token mal-formatado')
    } else {
      throw new UnauthorizedException('Token de acesso não informado')
    }
  }
}
