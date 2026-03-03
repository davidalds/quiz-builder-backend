import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { QuizzesModule } from './quizzes/quizzes.module'
import { AuthModule } from './auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './auth/auth.guard'
import { ResultsModule } from './results/results.module'

@Module({
  imports: [UsersModule, QuizzesModule, AuthModule, ResultsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
