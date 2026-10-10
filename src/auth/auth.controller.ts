import { Controller, Post, Body, NotFoundException, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { Public } from './metadatas'
import { RequestCookieKeys } from '../types/requestCookieType'
import { Cookies } from '@/decorators/cookie.decorator'
import type { Response } from 'express'

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.signIn(createAuthDto)

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
  }

  @Post('refresh')
  async refreshToken(
    @Cookies() cookies: Record<RequestCookieKeys, string>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refresh_token } = cookies

    if (!refresh_token) {
      throw new NotFoundException('Token de atualização não encontrado!')
    }

    const { access_token, refresh_token: newRefreshToken } =
      await this.authService.refreshToken(refresh_token)

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
  }
}
