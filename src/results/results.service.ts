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
    { id: userId }: Prisma.UserWhereUniqueInput,
    guestId: string,
  ) {
    const quiz = await this.quizzesService.findOne(quizWhereUniqueInput)

    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado!')
    }

    const guestOrUser = userId ? { userId } : { guestId }

    const result = await this.prismaService.result.findFirst({
      where: { quizId: quiz.id, ...guestOrUser },
      select: {
        id: true,
        userId: true,
        quizId: true,
        score: true,
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

    const { id, quizId, score, Quiz } = result

    return {
      id,
      userId,
      quizId,
      score,
      questions: Quiz.questions,
    }
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
      guestId?: string
      userId?: number
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
    { id: userId }: Prisma.UserWhereUniqueInput,
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

    const guestOrUser = userId ? { userId } : { guestId: data.guestId }

    const result = await this.prismaService.result.findFirst({
      where: {
        quizId: quiz.id,
        ...guestOrUser,
      },
    })

    if (result) {
      return this.updateQuizScore(
        { id: result.id },
        {
          score: quizScore,
          quizId: quiz.id,
          ...guestOrUser,
        },
      )
    }

    return await this.prismaService.result.create({
      data: {
        score: quizScore,
        quizId: quiz.id,
        ...guestOrUser,
      },
    })
  }

  async getQuizzesByResult(
    offset: number,
    limit: number,
    { id: userId }: Prisma.UserWhereUniqueInput,
  ) {
    const [total, res] = await this.prismaService.$transaction([
      this.prismaService.result.count({
        where: { userId },
      }),
      this.prismaService.result.findMany({
        where: { userId },
        select: {
          Quiz: {
            select: {
              id: true,
              title: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        skip: offset,
        take: limit,
      }),
    ])

    const quizzes = res.map(({ Quiz, createdAt, updatedAt }) => ({
      ...Quiz,
      done: createdAt,
      redone: updatedAt,
    }))

    return {
      total,
      quizzes,
    }
  }
}
