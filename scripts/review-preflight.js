/* Run with REVIEW_EMAIL, REVIEW_PASSWORD, ADMIN_EMAIL and ADMIN_PASSWORD environment variables. */
const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');
const prisma = new PrismaClient();
const CURRENT_TERMS_VERSION = '2026-08-31';
async function check(label, email, password) {
  if (!email || !password) throw new Error(`${label} credentials were not supplied in environment variables.`);
  const user = await prisma.user.findUnique({ where: { email }, select: { password: true, role: true, accountStatus: true, termsAcceptedVersion: true, teams: { select: { id: true } } } });
  const login = Boolean(user && await compare(password, user.password));
  const active = user?.accountStatus === 'ACTIVE';
  const termsCurrent = user?.termsAcceptedVersion === CURRENT_TERMS_VERSION;
  const hasTeam = label !== 'review' || Boolean(user?.teams.length);
  console.log(`${label}: login=${login ? 'PASS' : 'FAIL'} active=${active ? 'PASS' : 'FAIL'} terms=${termsCurrent ? 'PASS' : 'FAIL'} role=${user?.role || 'missing'} teams=${user?.teams.length || 0}`);
  if (!login || !active || !termsCurrent || !hasTeam) process.exitCode = 1;
}
async function main() {
  await prisma.$queryRaw`SELECT 1`;
  const openReports = await prisma.chatReport.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } });
  const overdueReports = await prisma.chatReport.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] }, deadlineAt: { lt: new Date() } } });
  console.log(`database: PASS open_reports=${openReports} overdue_reports=${overdueReports}`);
  if (overdueReports > 0) process.exitCode = 1;
  await check('review', process.env.REVIEW_EMAIL, process.env.REVIEW_PASSWORD);
  await check('admin', process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
}
main().catch(error => { console.error(`preflight: FAIL (${error.message})`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
