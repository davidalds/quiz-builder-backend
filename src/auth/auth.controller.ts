import { Controller, Post, Body, NotFoundException, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { Public } from './metadatas'
import { RequestCookieKeys } from '../types/requestCookieType'
import { Cookies } from '@/decorators/cookie.decorator'
import type { CookieOptions, Response } from 'express'

@Public()
@Controller('auth')
export class AuthController {
  private readonly cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  }

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.signIn(createAuthDto)

    res.cookie('access_token', access_token, this.cookieOptions)

    res.cookie('refresh_token', refresh_token, this.cookieOptions)
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

    res.cookie('access_token', access_token, this.cookieOptions)

    res.cookie('refresh_token', newRefreshToken, this.cookieOptions)
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
  }
}
