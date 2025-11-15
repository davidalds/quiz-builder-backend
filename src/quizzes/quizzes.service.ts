import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Quiz, Result } from 'generated/prisma'
import { PrismaService } from 'src/prisma.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { CreateQuizScoreDto } from './dto/create-quiz-score.dto'

@Injectable()
export class QuizzesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    cursor: number,
    limit: number,
  ): Promise<{ total: number; data: Quiz[]; nextCursor: number | undefined }> {
    const quizzes = await this.prismaService.quiz.findMany({
      skip: cursor ? 1 : 0,
      take: limit,
      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const totalQuizzes = await this.prismaService.quiz.count()

    const olderQuizId = await this.prismaService.quiz
      .findMany({
        take: 1,
        orderBy: {
          createdAt: 'asc',
        },
      })
      .then((oq) => oq[0].id)

    const lastQuizId = quizzes[quizzes.length - 1].id

    // set undefined for front-end logic hide the "load more" button
    const nextCursor = lastQuizId === olderQuizId ? undefined : lastQuizId

    return {
      total: totalQuizzes,
      data: quizzes,
      nextCursor,
    }
  }

  async findByUser(offset: number, limit: number) {
    const res = await this.prismaService.quiz.findMany({
      skip: offset,
      take: limit,
    })

    const total = await this.prismaService.quiz.count()

    return {
      total,
      data: res,
    }
  }

  async findOne(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
  ): Promise<Quiz | null> {
    return await this.prismaService.quiz.findUnique({
      where: quizWhereUniqueInput,
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            answers: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    })
  }

  async create(data: CreateQuizDto): Promise<Quiz> {
    return await this.prismaService.quiz.create({
      data: {
        ...data,
        questions: {
          create: data.questions.map((q) => ({
            text: q.text,
            answers: { create: q.answers },
          })),
        },
      },
    })
  }

  async update(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
    data: UpdateQuizDto,
  ): Promise<Quiz> {
    const quiz = await this.findOne(quizWhereUniqueInput)

    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado!')
    }

    const quizQuestionsIds = await this.prismaService.question
      .findMany({
        where: { quizId: quizWhereUniqueInput.id },
        select: {
          id: true,
        },
      })
      .then((res) => res.map(({ id }) => id))

    const questionsToBeDeleted = quizQuestionsIds
      .filter((qId) => data.questions.find((q) => q.id === qId) === undefined)
      .map((qId) => ({ id: qId }))

    const questionsWithId = data.questions.filter(
      (qwi) => qwi.id && quizQuestionsIds.indexOf(qwi.id) >= 0,
    )

    const questionsWithoutId = data.questions.filter(
      (qwoi) => !qwoi.id || quizQuestionsIds.indexOf(qwoi.id) === -1,
    )

    return await this.prismaService.quiz.update({
      where: quizWhereUniqueInput,
      data: {
        ...data,
        questions: {
          deleteMany: questionsToBeDeleted,
          create: questionsWithoutId.map((qwoi) => ({
            text: qwoi.text,
            answers: {
              create: qwoi.answers.map((qwoia) => ({
                text: qwoia.text,
                isCorrect: qwoia.isCorrect,
              })),
            },
          })),
          update: questionsWithId.map((qwi) => ({
            where: { id: qwi.id },
            data: {
              text: qwi.text,
              answers: {
                update: qwi.answers.map((qwia) => ({
                  where: { id: qwia.id },
                  data: {
                    text: qwia.text,
                    isCorrect: qwia.isCorrect,
                  },
                })),
              },
            },
          })),
        },
      },
    })
  }

  async delete(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
  ): Promise<Quiz> {
    const quiz = await this.findOne(quizWhereUniqueInput)

    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado!')
    }

    return await this.prismaService.quiz.delete({ where: quizWhereUniqueInput })
  }

  async getQuizScore(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
  ): Promise<Result> {
    const quiz = await this.findOne(quizWhereUniqueInput)

    if (!quiz) {
      throw new NotFoundException('Quiz não encontrado!')
    }

    const result = await this.prismaService.result.findFirst({
      where: { quizId: quiz.id },
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
    data: CreateQuizScoreDto,
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
      userId: number
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
    data: CreateQuizScoreDto,
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
        userId: 4,
      },
    })

    if (result) {
      return this.updateQuizScore(
        { id: result.id },
        {
          score: quizScore,
          quizId: quiz.id,
          userId: 4,
        },
      )
    }

    return await this.prismaService.result.create({
      data: {
        score: quizScore,
        quizId: quiz.id,
        userId: 4,
      },
    })
  }
}
