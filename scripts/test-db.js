const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    console.log('Attempting to query database...');
    const count = await prisma.user.count();
    console.log(`✅ Database query successful! Found ${count} users.`);
    
  } catch (e) {
    console.error('❌ Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
