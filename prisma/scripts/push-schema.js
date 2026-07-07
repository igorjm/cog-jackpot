require('dotenv').config();
const { Client } = require('pg');

const sql = `
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
DO $$ BEGIN CREATE TYPE "UserStatus" AS ENUM ('PENDING_PAYMENT', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE "Phase" AS ENUM ('FRIENDLY', 'GROUP', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add FRIENDLY to existing Phase enum if not present
DO $$ BEGIN
  ALTER TYPE "Phase" ADD VALUE IF NOT EXISTS 'FRIENDLY' BEFORE 'GROUP';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add ROUND_OF_32 to existing Phase enum if not present
DO $$ BEGIN
  ALTER TYPE "Phase" ADD VALUE IF NOT EXISTS 'ROUND_OF_32' BEFORE 'ROUND_OF_16';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Match" (
    "id" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeFlag" TEXT NOT NULL,
    "awayFlag" TEXT NOT NULL,
    "phase" "Phase" NOT NULL,
    "group" TEXT,
    "matchNumber" INTEGER NOT NULL,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Bet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "points" DOUBLE PRECISION,
    "rawPoints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "BonusBet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phase" "Phase" NOT NULL,
    "selectedTeam" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "points" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BonusBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- Add avatar column to User table (nullable)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- Add previousPosition column to User table (nullable)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "previousPosition" INTEGER;

-- Bet.points: store exact decimal multipliers (e.g. 12.5 for 10 × 1.25)
ALTER TABLE "Bet" ALTER COLUMN "points" TYPE DOUBLE PRECISION USING "points"::double precision;

-- Knockout draw winner (penalties / extra time)
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "winnerSide" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_nickname_key" ON "User"("nickname");
CREATE UNIQUE INDEX IF NOT EXISTS "Match_matchNumber_key" ON "Match"("matchNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Bet_userId_matchId_key" ON "Bet"("userId", "matchId");
CREATE UNIQUE INDEX IF NOT EXISTS "BonusBet_userId_phase_selectedTeam_key" ON "BonusBet"("userId", "phase", "selectedTeam");
CREATE UNIQUE INDEX IF NOT EXISTS "Config_key_key" ON "Config"("key");

-- PredictionType enum
DO $$ BEGIN CREATE TYPE "PredictionType" AS ENUM ('CHAMPION', 'TOP_SCORER'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Prediction table
CREATE TABLE IF NOT EXISTS "Prediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PredictionType" NOT NULL,
    "value" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "points" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Prediction_userId_type_key" ON "Prediction"("userId", "type");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BonusBet" ADD CONSTRAINT "BonusBet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Prisma migrations tracking table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
`;

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database.');

  // Split into individual statements, respecting $$ blocks
  const statements = [];
  let current = '';
  let inDollarBlock = false;
  for (const line of sql.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--')) {
      if (current) current += '\n' + line;
      continue;
    }
    current += (current ? '\n' : '') + line;
    // Track $$ blocks to avoid splitting on ; inside them
    const dollarMatches = line.match(/\$\$/g);
    if (dollarMatches) {
      for (const _ of dollarMatches) inDollarBlock = !inDollarBlock;
    }
    if (!inDollarBlock && trimmed.endsWith(';')) {
      statements.push(current.trim());
      current = '';
    }
  }
  if (current.trim()) statements.push(current.trim());

  for (const stmt of statements) {
    try {
      await client.query(stmt);
    } catch (e) {
      if (e.message.includes('already exists')) {
        // Ignore "already exists" errors (idempotent)
      } else {
        console.error('Statement failed:', stmt.substring(0, 80));
        throw e;
      }
    }
  }

  console.log('Schema pushed successfully!');
  await client.end();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
