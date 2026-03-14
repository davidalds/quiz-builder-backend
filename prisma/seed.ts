import { PrismaClient } from "generated/prisma";
import { seedUsers } from "./seeds/seedUsers";
import { seedQuizzes } from "./seeds/seedQuizzes";
import { seedCategories } from "./seeds/seedCategories";

const prisma = new PrismaClient()

async function main() {
    const seed = process.argv[2]
    switch (seed) {
        case "users":
            await seedUsers(prisma)
            break
        case "categories":
            await seedCategories(prisma) 
            break
        case "quizzes":
            await seedQuizzes(prisma)
            break
    }
}

main().then(() => prisma.$disconnect()).catch(async (error) => {
    console.log(error)
    await prisma.$disconnect()
    process.exit(1)
})