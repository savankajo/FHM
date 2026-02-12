const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'media@fathersheartministry.ca';
    console.log(`Upgrading ${email} to ADMIN...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log('✅ User updated:', user);
    } catch (e) {
        if (e.code === 'P2025') {
            console.error('❌ User not found! Register first.');
        } else {
            console.error('❌ Error:', e);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
