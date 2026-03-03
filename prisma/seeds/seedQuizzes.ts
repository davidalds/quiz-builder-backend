import { Prisma, PrismaClient } from "generated/prisma";
import quizzesData from './jsons/quizzes.json'

interface QuizData {
    title: string
    description: string
    questions: {
        text: string
        answers: {
            text: string
            isCorrect: boolean
        }[]
    }[]
}

export async function seedQuizzes(prisma: PrismaClient | Prisma.TransactionClient) {

    const users = await prisma.user.findMany()

    if (!users.length) return Promise.reject(new Error("É necessário ter usuários para criação de quizzes"))

    await prisma.quiz.deleteMany()

    const quizzes: QuizData[] = quizzesData

    if (!quizzes.length) return Promise.resolve()

    for (const quiz of quizzes) {
        const randInd = Math.floor(Math.random() * users.length)
        const user = users[randInd]
        await prisma.quiz.create({
            data: {
                ...quiz,
                userId: user.id,
                questions: {
                    create: quiz.questions.map((q) => ({
                        text: q.text,
                        answers: { create: q.answers }
                    }))
                }
            }
        })
    }
}
