import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { QuizzesModule } from './quizzes/quizzes.module'
import { AuthModule } from './auth/auth.module'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './auth/auth.guard'
import { ResultsModule } from './results/results.module'
import { CategoriesModule } from './categories/categories.module'
import { ExceptionFieldsFilter } from './filters/exceptionFields.filter'

@Module({
  imports: [
    UsersModule,
    QuizzesModule,
    AuthModule,
    ResultsModule,
    CategoriesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFieldsFilter,
    },
  ],
})
export class AppModule {}
