import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { QuizzesModule } from './quizzes/quizzes.module'
import { ResultsModule } from './results/results.module'

@Module({
  imports: [UsersModule, QuizzesModule, ResultsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
