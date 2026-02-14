const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const count = await prisma.user.count();
    console.log(`Successfully connected! User count: ${count}`);

    const liveLinkCount = await prisma.liveLink.count();
    console.log(`LiveLink count: ${liveLinkCount}`);
  } catch (e) {
    console.error('Database connection failed:', e);
    console.error('Error name:', e.name);
    console.error('Error message:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
