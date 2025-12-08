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

    if (totalQuizzes) {
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

    return {
      total: totalQuizzes,
      data: quizzes,
      nextCursor: undefined,
    }
  }

  async findByUser(offset: number, limit: number, userId: number) {
    const res = await this.prismaService.quiz.findMany({
      skip: offset,
      take: limit,
      where: {
        userId,
      },
    })

    const total = await this.prismaService.quiz.count({
      where: {
        userId,
      },
    })

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
        User: {
          select: {
            id: true,
            name: true,
          },
        },
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

  async findOneByUser(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
  ): Promise<Quiz | null> {
    return await this.prismaService.quiz.findUnique({
      where: quizWhereUniqueInput,
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            answers: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  }

  async create(data: CreateQuizDto, userId: number): Promise<Quiz> {
    return await this.prismaService.quiz.create({
      data: {
        ...data,
        userId,
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
      .then((res) => res.map((q) => q.id))

    const existingIds = new Set(quizQuestionsIds)

    const questionsWithId: {
      where: { id: number }
      data: {
        text: string
        answers: {
          deleteMany: any
          createMany: {
            data: {
              text: string
              isCorrect: boolean
            }[]
          }
        }
      }
    }[] = []
    const questionsWithoutId: {
      text: string
      answers: {
        create: {
          text: string
          isCorrect: boolean
        }[]
      }
    }[] = []

    for (const question of data.questions) {
      if (question.id && existingIds.has(question.id)) {
        questionsWithId.push({
          where: { id: question.id },
          data: {
            text: question.text,
            answers: {
              deleteMany: {},
              createMany: { data: question.answers },
            },
          },
        })
        existingIds.delete(question.id)
      } else {
        questionsWithoutId.push({
          text: question.text,
          answers: {
            create: question.answers.map((ans) => ({
              text: ans.text,
              isCorrect: ans.isCorrect,
            })),
          },
        })
      }
    }

    const questionToDelete: { id: number }[] = []

    for (const id of existingIds) {
      questionToDelete.push({ id })
    }

    if (questionToDelete.length || questionsWithoutId.length) {
      return this.prismaService.$transaction(async (tx) => {
        const updateQuiz = await tx.quiz.update({
          where: quizWhereUniqueInput,
          data: {
            title: data.title,
            description: data.description,
            questions: {
              deleteMany: questionToDelete,
              create: questionsWithoutId,
              update: questionsWithId,
            },
          },
        })

        await tx.result.deleteMany({
          where: {
            quizId: quizWhereUniqueInput.id,
          },
        })

        return updateQuiz
      })
    }

    return await this.prismaService.quiz.update({
      where: quizWhereUniqueInput,
      data: {
        ...data,
        questions: {
          deleteMany: questionToDelete,
          create: questionsWithoutId,
          update: questionsWithId,
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
    guestId: string,
  ): Promise<Result> {
    const quiz = await this.findOne(quizWhereUniqueInput)

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
