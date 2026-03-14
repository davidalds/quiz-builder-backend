import { PrismaClient } from 'generated/prisma';
import categories from './jsons/categories.json'

export async function seedCategories(prisma: PrismaClient){
    await prisma.category.createMany({
        data: categories,
        skipDuplicates: true
    })
}