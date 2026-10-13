import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { QuizzesModule } from './quizzes/quizzes.module'
import { AuthModule } from './auth/auth.module'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/auth.guard'
import { ResultsModule } from './results/results.module'
import { CategoriesModule } from './categories/categories.module'
import { ExceptionFieldsFilter } from './users/filters/exceptionFields.filter'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis'
import { Env } from './types/envTypes'

@Module({
  imports: [
    UsersModule,
    QuizzesModule,
    AuthModule,
    ResultsModule,
    CategoriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) => ({
        stores: [
          createKeyv(configService.getOrThrow('REDIS_URL', { infer: true })),
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFieldsFilter,
    },
  ],
})
export class AppModule {}
