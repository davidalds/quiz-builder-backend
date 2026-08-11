import { Controller, Get, Param } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Public } from '@/auth/metadatas'
import { Category } from '../../generated/prisma'

@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll()
  }

  @Get(':slug')
  findOne(@Param('slug') id: string) {
    return this.categoriesService.findOne(id)
  }
}
