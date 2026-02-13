const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting databse reset...');

    // 1. Delete Events (created by Users)
    // We need to delete these first to avoid foreign key constraints on 'createdByUserId'
    const deletedEvents = await prisma.event.deleteMany({});
    console.log(`Deleted ${deletedEvents.count} events.`);

    // 2. Delete ChatMessages (created by Users)
    // Although set to Cascade, it's safer to be explicit or if we want to log it
    const deletedMessages = await prisma.chatMessage.deleteMany({});
    console.log(`Deleted ${deletedMessages.count} chat messages.`);

    // 3. Delete Users
    // This will implicitly remove them from Teams and Services (many-to-many relations)
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users.`);

    console.log('Database reset complete. All users have been removed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
