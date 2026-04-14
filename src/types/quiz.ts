import { Quiz } from 'generated/prisma'

export interface QuizResponse {
  total: number
  data: Quiz[]
}

export interface QuizInfinityResponse extends QuizResponse {
  nextCursor: string | undefined
}

export interface QuizQuestion {
  id: number
  text: string
  answers: QuizQuestionAnswer[]
}

export interface QuizQuestionAnswer {
  id: number
  createdAt: Date
  updatedAt: Date
  text: string
  isCorrect: boolean
  questionId: number
}
