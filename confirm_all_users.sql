-- SQL Migration to Auto-Confirm Customer Emails in Supabase Auth
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor)

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
