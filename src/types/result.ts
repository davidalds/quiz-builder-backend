import { Quiz } from 'generated/prisma'
import { QuizQuestion } from './quiz'

export interface ResultResponse {
  id: number
  quizId: number
  score: number
  questions: QuizQuestion[]
}

export interface QuizzesResultResponse {
  total: number
  quizzes: ({
    done: Date
    redone: Date
  } & Pick<Quiz, 'publicId' | 'title'>)[]
}
