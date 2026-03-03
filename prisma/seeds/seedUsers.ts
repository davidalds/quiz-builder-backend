import { Prisma, PrismaClient, User } from "generated/prisma"
import dataUsers from './jsons/users.json'
import * as bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient | Prisma.TransactionClient) {
    for (const dataUser of dataUsers) {
        const user = dataUser as User
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(user.password, salt)
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                name: user.name,
                email: user.email,
                password: hash
            }
        })
    }

}

