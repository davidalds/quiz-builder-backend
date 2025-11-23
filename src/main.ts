import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  console.log("DOMAINS RAW =", process.env.DOMAINS);
  console.log("DOMAINS SPLIT =", process.env.DOMAINS?.split(','));
  app.enableCors({
    origin: process.env.DOMAINS?.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
  await app.listen(process.env.PORT ?? 8080)
}
bootstrap()

