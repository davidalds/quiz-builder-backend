import { PrismaClient } from "generated/prisma";
import { seedUsers } from "./seeds/seedUsers";
import { seedQuizzes } from "./seeds/seedQuizzes";

const prisma = new PrismaClient()

async function main() {
    const seed = process.argv[2]
    switch (seed) {
        case "users":
            await seedUsers(prisma)
            break
        case "quizzes":
            await seedQuizzes(prisma)
            break
        default:
            await seedUsers(prisma)
            await seedQuizzes(prisma)
    }
}

main().then(() => prisma.$disconnect()).catch(async (error) => {
    console.log(error)
    await prisma.$disconnect()
    process.exit(1)
})