import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

const allowedOrigins = process.env.DOMAINS?.split(',').map((o) => o.trim())

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  // console.log("DOMAINS RAW =", process.env.DOMAINS);
  // console.log("DOMAINS SPLIT =", process.env.DOMAINS?.split(','));
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permite requisições sem origin (ex.: Postman)
      if (!origin) return callback(null, true)

      if (allowedOrigins?.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`), false)
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  })
  await app.listen(process.env.PORT ?? 8080)
}
bootstrap()
