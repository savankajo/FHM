import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- USERS ---');
    users.forEach(u => {
        console.log(`Email: ${u.email}, Name: ${u.name}, Role: ${u.role}, ID: ${u.id}`);
    });
    console.log('--- END ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
