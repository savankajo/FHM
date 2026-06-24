import { PrismaClient } from '@prisma/client'
import { getConnectionString } from '@netlify/database'

function getDatabaseUrl() {
    if (process.env.NETLIFY_DB_URL) {
        return getConnectionString()
    }

    return process.env.DATABASE_URL
}

const prismaClientSingleton = () => {
    const url = getDatabaseUrl()

    return new PrismaClient({
        datasources: url
            ? {
                db: { url },
            }
            : undefined,
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
