import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaService } from '@/prisma.service'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt-strategy.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Env } from '@/types/envTypes'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) => ({
        secret: configService.getOrThrow('JWTSECRET', {
          infer: true,
        }),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
