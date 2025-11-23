import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

const allowedOrigins = (process.env.DOMAINS || '')
  .split(',')
  .filter((origin) => origin.trim() !== '')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  console.log('CORS Allowed Origins:', allowedOrigins)
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
  await app.listen(process.env.PORT ?? 8080)
}
bootstrap()
