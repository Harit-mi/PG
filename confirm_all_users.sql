-- SQL Migration to Auto-Confirm Customer Emails in Supabase Auth
-- Run this in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor

-- Note: "confirmed_at" is a generated column in Supabase Auth, so only "email_confirmed_at" should be updated.

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
