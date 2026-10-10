import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import { ConfigService } from '@nestjs/config'
import { Env } from './types/envTypes'
import cookie from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService<Env>)

  const allowedOrigins = configService
    .getOrThrow('DOMAINS', {
      infer: true,
    })
    .split(',')
    .filter((origin) => origin.trim() !== '')

  const port = configService.getOrThrow('PORT', { infer: true })

  app.use(helmet())

  app.use(cookie(configService.getOrThrow('COOKIE_SECRET', { infer: true })))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
  await app.listen(port, '0.0.0.0')
}
bootstrap()
