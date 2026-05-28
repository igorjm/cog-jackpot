require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;

(async () => {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  try {
    const users = await prisma.user.findMany({
      where: { status: 'APPROVED', role: { not: 'ADMIN' } },
      include: { bets: { where: { points: { not: null } } } },
    });
    console.log('users:', users.length);
    const matches = await prisma.match.findMany({ take: 2 });
    console.log('matches:', matches.length);
  } catch (e) {
    console.error('FULL ERROR:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
