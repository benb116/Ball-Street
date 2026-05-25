-- Migration: convert cash columns from integer cents to decimal dollars
--
-- Users.cash and LedgerEntries.value are currently stored as INTEGER cents
-- (e.g. 1234 = $12.34). This migration converts both columns to
-- DECIMAL(12,2) dollars to match the balance_dollars string format
-- returned by GET /api/portfolio/balance.
--
-- Run this migration before deploying the application code that stores
-- dollar amounts directly in these columns.

BEGIN;

-- Convert Users.cash from cents (INTEGER) to dollars (DECIMAL)
ALTER TABLE "Users"
  ALTER COLUMN "cash" TYPE DECIMAL(12,2) USING ("cash" / 100.0),
  ALTER COLUMN "cash" SET DEFAULT 0.00;

-- Convert LedgerEntries.value from cents (INTEGER) to dollars (DECIMAL)
ALTER TABLE "LedgerEntries"
  ALTER COLUMN "value" TYPE DECIMAL(12,2) USING ("value" / 100.0);

COMMIT;
