import { Controller, Get, Param } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { Category } from 'generated/prisma'
import { Public } from 'src/auth/metadatas'

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
