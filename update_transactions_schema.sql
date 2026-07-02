-- Add missing columns to transactions table for description and payment_date
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
