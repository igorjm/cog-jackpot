require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

Promise.all([p.user.count(), p.match.count()])
  .then(([u, m]) => console.log('Users:', u, 'Matches:', m))
  .catch(e => console.error('Error:', e.message))
  .finally(() => p.$disconnect());
