import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'media@fathersheartminstry.ca';
    const newPassword = 'admin123';
    const hashedPassword = await hash(newPassword, 12);

    const updatedUser = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
    });

    console.log(`Password for ${updatedUser.email} has been reset to: ${newPassword}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
