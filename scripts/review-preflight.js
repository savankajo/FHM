/* Run with REVIEW_EMAIL, REVIEW_PASSWORD, ADMIN_EMAIL and ADMIN_PASSWORD environment variables. */
const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');
const prisma = new PrismaClient();
async function check(label, email, password) {
  if (!email || !password) throw new Error(`${label} credentials were not supplied in environment variables.`);
  const user = await prisma.user.findUnique({ where: { email }, select: { password: true, role: true, teams: { select: { id: true } } } });
  const login = Boolean(user && await compare(password, user.password));
  console.log(`${label}: login=${login ? 'PASS' : 'FAIL'} role=${user?.role || 'missing'} teams=${user?.teams.length || 0}`);
  if (!login) process.exitCode = 1;
}
async function main() { await prisma.$queryRaw`SELECT 1`; console.log('database: PASS'); await check('review', process.env.REVIEW_EMAIL, process.env.REVIEW_PASSWORD); await check('admin', process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD); }
main().catch(error => { console.error(`preflight: FAIL (${error.message})`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
