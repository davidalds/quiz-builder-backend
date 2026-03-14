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

function handleRandomNum(limit: number){
    return Math.floor(Math.random() * limit)
}

export async function seedQuizzes(prisma: PrismaClient | Prisma.TransactionClient) {

    const users = await prisma.user.findMany()

    if (!users.length) return Promise.reject(new Error("Sem usuários cadastrados"))

    await prisma.quiz.deleteMany()

    const quizzes: QuizData[] = quizzesData

    if (!quizzes.length) return Promise.reject(new Error("Informe um arquivo com quizzes"))
    
    const categories = await prisma.category.findMany()

    if(!categories.length) return Promise.reject(new Error("Sem categorias cadastradas"))

    for (const quiz of quizzes) {
        const user = users[handleRandomNum(users.length)]
        await prisma.quiz.create({
            data: {
                ...quiz,
                categories: {
                    connect:[{
                        id: categories[handleRandomNum(categories.length)].id
                    }]
                },
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
