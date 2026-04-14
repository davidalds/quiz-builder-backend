import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Quiz } from 'generated/prisma'
import { PrismaService } from 'src/prisma.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { QuizInfinityResponse, QuizResponse } from 'src/types/quiz'

@Injectable()
export class QuizzesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findQuizzes(quizArgs?: Prisma.QuizFindManyArgs): Promise<QuizResponse> {
    const [quizzes, total] = await this.prismaService.$transaction([
      this.prismaService.quiz.findMany(quizArgs),
      this.prismaService.quiz.count({
        where: quizArgs ? quizArgs.where : undefined,
      }),
    ])

    return {
      total,
      data: quizzes,
    }
  }

  async handleNextCursor(
    quizzes: Quiz[],
    quizArgs?: Prisma.QuizFindManyArgs,
  ): Promise<string | undefined> {
    if (!quizzes.length) return undefined

    const currentCursor = quizzes[quizzes.length - 1].publicId

    const { data: nextQuizzes } = await this.findQuizzes({
      ...quizArgs,
      take: 1,
      skip: currentCursor ? 1 : 0,
      cursor: {
        publicId: currentCursor,
      },
    })

    const nextCursor = nextQuizzes.length ? currentCursor : undefined

    return nextCursor
  }

  async findInfinityQuizzes(
    cursor: string,
    limit: number,
    category: string,
    search: string,
  ): Promise<QuizInfinityResponse> {
    const quizWhereParams: Prisma.QuizWhereInput = {
      categories: {
        some: {
          slug: category ? category : undefined,
        },
      },
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          User: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ],
    }

    const { data: quizzes, total } = await this.findQuizzes({
      skip: cursor ? 1 : 0,
      take: limit,
      where: quizWhereParams,
      select: {
        publicId: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            name: true,
          },
        },
      },
      cursor: cursor
        ? {
            publicId: cursor,
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const nextCursor = await this.handleNextCursor(quizzes, {
      where: quizWhereParams,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      total,
      data: quizzes,
      nextCursor,
    }
  }

  async findInfinityPopularQuizzes(
    cursor: string,
    limit: number,
  ): Promise<QuizInfinityResponse> {
    const { data: quizzes, total } = await this.findQuizzes({
      skip: cursor ? 1 : 0,
      take: limit,
      select: {
        publicId: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            name: true,
          },
        },
      },
      where: {
        results: {
          some: {
            score: {
              gte: 0,
            },
          },
        },
      },
      cursor: cursor
        ? {
            publicId: cursor,
          }
        : undefined,
      orderBy: {
        results: {
          _count: 'desc',
        },
      },
    })

    const nextCursor = await this.handleNextCursor(quizzes, {
      where: {
        results: {
          some: {
            score: {
              gte: 0,
            },
          },
        },
      },
      orderBy: {
        results: {
          _count: 'desc',
        },
      },
    })

    return {
      total,
      data: quizzes,
      nextCursor,
    }
  }

  async findByUser(
    offset: number,
    limit: number,
    userId: number,
    category: string,
    search: string,
  ): Promise<QuizResponse> {
    const { data: quizzes, total } = await this.findQuizzes({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        userId,
        categories: {
          some: {
            slug: category ? category : undefined,
          },
        },
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        categories: true,
        _count: {
          select: {
            results: true,
          },
        },
      },
    })

    return {
      total,
      data: quizzes,
    }
  }

  async findByCategory({
    slug,
  }: Prisma.CategoryWhereUniqueInput): Promise<QuizResponse> {
    const { data: quizzes, total } = await this.findQuizzes({
      where: {
        categories: {
          some: {
            slug,
          },
        },
      },
    })

    return {
      total,
      data: quizzes,
    }
  }

  async findOne(
    quizWhereUniqueInput: Prisma.QuizWhereUniqueInput,
  ): Promise<Omit<Quiz, 'id' | 'userId'> | null> {
    return await this.prismaService.quiz.findUnique({
      where: quizWhereUniqueInput,
      select: {
        publicId: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            name: true,
          },
        },
        categories: true,
        questions: {
          select: {
            id: true,
            text: true,
            answers: {
              select: {
                id: true,
                text: true,
                isCorrect: quizWhereUniqueInput.userId ? true : false,
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
        User: {
          select: {
            name: true,
          },
        },
        categories: true,
        questions: {
          select: {
            id: true,
            text: true,
            answers: {
              select: {
                id: true,
                text: true,
                isCorrect: quizWhereUniqueInput.userId ? true : false,
              },
            },
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
        categories: {
          connect: data.categories,
        },
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

    return this.prismaService.$transaction(async (tx) => {
      const updateQuiz = await tx.quiz.update({
        where: quizWhereUniqueInput,
        data: {
          title: data.title,
          description: data.description,
          categories: {
            set: [],
            connect: data.categories,
          },
          questions: {
            deleteMany: questionToDelete,
            create: questionsWithoutId,
            update: questionsWithId,
          },
        },
      })

      if (questionToDelete.length || questionsWithoutId.length) {
        await tx.result.deleteMany({
          where: {
            quizId: quizWhereUniqueInput.id,
          },
        })
      }
      return updateQuiz
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

  async getDashboardInfo(userId: number): Promise<{
    totalQuizzes: number
    totalAnsweredQuizzes: number
    mostAnsweredQuiz: (Quiz & { _count: { results: number } }) | undefined
  }> {
    const [totalQuizzes, totalAnsweredQuizzes, mostAnsweredQuiz] =
      await this.prismaService.$transaction([
        this.prismaService.quiz.count({ where: { userId } }),
        this.prismaService.result.count({
          where: {
            Quiz: {
              userId,
            },
          },
        }),
        this.prismaService.quiz.findMany({
          take: 1,
          where: {
            userId,
          },
          include: {
            _count: {
              select: {
                results: true,
              },
            },
          },
          orderBy: {
            results: {
              _count: 'desc',
            },
          },
        }),
      ])

    return {
      totalQuizzes,
      totalAnsweredQuizzes,
      mostAnsweredQuiz: mostAnsweredQuiz[0],
    }
  }
}
