-- Phase 2 Schema Updates

-- Add proof_url to transactions for screenshot verification
ALTER TABLE transactions ADD COLUMN proof_url TEXT;

