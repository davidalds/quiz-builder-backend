import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Result } from 'generated/prisma'
import { PrismaService } from 'src/prisma.service'
import { QuizzesService } from 'src/quizzes/quizzes.service'
import { CreateResultDto } from './dto/create-result.dto'

@Injectable()
export class ResultsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly quizzesService: QuizzesService,
  ) {}

  async getQuizScore(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
    guestId: string,
  ): Promise<Result> {
    const quiz = await this.quizzesService.findOne(quizWhereUniqueInput)

    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado!')
    }

    const result = await this.prismaService.result.findFirst({
      where: { quizId: quiz.id, guestId: guestId },
      include: {
        Quiz: {
          select: {
            questions: {
              select: {
                id: true,
                text: true,
                answers: {
                  where: { isCorrect: true },
                },
              },
            },
          },
        },
      },
    })

    if (!result) {
      throw new NotFoundException('Resultado não encontrado!')
    }

    return result
  }

  calcQuizScore(
    questions: {
      id: number
      answers: {
        id: number
      }[]
    }[],
    data: CreateResultDto,
  ) {
    const totalScore = questions.filter((question) => {
      const userAnswer = data.userAnswers.find(
        (ua) => ua.questionId === question.id,
      )

      return question.answers[0].id === userAnswer?.answerId
    }).length

    return totalScore
  }

  async updateQuizScore(
    resultUniqueInput: Prisma.ResultWhereUniqueInput,
    data: {
      score: number
      quizId: number
      guestId: string
    },
  ): Promise<Result> {
    return await this.prismaService.result.update({
      where: resultUniqueInput,
      data: {
        ...data,
      },
    })
  }

  async recordQuizScore(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
    data: CreateResultDto,
  ) {
    const quiz = await this.prismaService.quiz.findUnique({
      where: quizWhereUniqueInput,
      include: {
        questions: {
          select: {
            id: true,
            answers: {
              where: { isCorrect: true },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado!')
    }

    const quizScore = this.calcQuizScore(quiz.questions, data)

    const result = await this.prismaService.result.findFirst({
      where: {
        quizId: quiz.id,
        guestId: data.guestId,
      },
    })

    if (result) {
      return this.updateQuizScore(
        { id: result.id },
        {
          score: quizScore,
          quizId: quiz.id,
          guestId: data.guestId,
        },
      )
    }

    return await this.prismaService.result.create({
      data: {
        score: quizScore,
        quizId: quiz.id,
        guestId: data.guestId,
      },
    })
  }
}
