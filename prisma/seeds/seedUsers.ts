import { Prisma, PrismaClient } from "generated/prisma"
import dataUsers from './jsons/users.json'
import * as bcrypt from 'bcrypt'

export async function seedUsers(prisma: PrismaClient | Prisma.TransactionClient) {

    const users = dataUsers.map((user) =>{
        const salt =  bcrypt.genSaltSync()
        const hash = bcrypt.hashSync(user.password, salt)
        return {
            ...user,
            password: hash
        }
    })

    await prisma.user.createMany({
        data: users,
        skipDuplicates: true
    })
}

