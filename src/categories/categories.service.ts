import { Injectable } from '@nestjs/common'
import { Category } from 'generated/prisma'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    return await this.prisma.category.findMany()
  }

  async findOne(slug: string) {
    return await this.prisma.category.findFirst({
      where: {
        slug,
      },
      include: {
        _count: {
          select: {
            quizzes: true,
          },
        },
      },
    })
  }
}
