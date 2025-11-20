import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { Public } from './metadatas'

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signIn(createAuthDto)
  }
}
