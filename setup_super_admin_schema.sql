-- SQL migration to set up PG Management SaaS multi-tenant tables and Super Admin structures
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor)

-- 1. CREATE ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Suspended, Billing Hold, Pending Verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read organizations" ON public.organizations;
CREATE POLICY "Allow public read organizations" ON public.organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert organizations" ON public.organizations;
CREATE POLICY "Allow public insert organizations" ON public.organizations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update organizations" ON public.organizations;
CREATE POLICY "Allow public update organizations" ON public.organizations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete organizations" ON public.organizations;
CREATE POLICY "Allow public delete organizations" ON public.organizations FOR DELETE USING (true);


-- 2. CREATE SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL, -- Starter, Pro, Enterprise
    status VARCHAR(50) DEFAULT 'Active', -- Active, Grace Period, Past Due, Cancelled
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public read subscriptions" ON public.subscriptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public update subscriptions" ON public.subscriptions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public delete subscriptions" ON public.subscriptions FOR DELETE USING (true);


-- 3. LINK EXISTING PROPERTIES TO DEFAULT ORGANIZATION
-- Add default organization
INSERT INTO public.organizations (id, name, status)
VALUES ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Default PG Organization', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Add default subscription
INSERT INTO public.subscriptions (organization_id, plan_name, status, expiry_date)
VALUES ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Professional', 'Active', '2030-12-31')
ON CONFLICT DO NOTHING;

-- Alter properties table to reference organization
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) DEFAULT 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';


-- 4. CREATE SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- Technical, Billing, General, Onboarding
    priority VARCHAR(50) DEFAULT 'Normal', -- Low, Normal, High, Critical
    status VARCHAR(50) DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read support_tickets" ON public.support_tickets;
CREATE POLICY "Allow public read support_tickets" ON public.support_tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert support_tickets" ON public.support_tickets;
CREATE POLICY "Allow public insert support_tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update support_tickets" ON public.support_tickets;
CREATE POLICY "Allow public update support_tickets" ON public.support_tickets FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete support_tickets" ON public.support_tickets;
CREATE POLICY "Allow public delete support_tickets" ON public.support_tickets FOR DELETE USING (true);


-- 5. CREATE TICKET MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- Customer, Admin
    sender_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE, -- Internal notes (Support Agent only)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for ticket_messages
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read ticket_messages" ON public.ticket_messages;
CREATE POLICY "Allow public read ticket_messages" ON public.ticket_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert ticket_messages" ON public.ticket_messages;
CREATE POLICY "Allow public insert ticket_messages" ON public.ticket_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update ticket_messages" ON public.ticket_messages;
CREATE POLICY "Allow public update ticket_messages" ON public.ticket_messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete ticket_messages" ON public.ticket_messages;
CREATE POLICY "Allow public delete ticket_messages" ON public.ticket_messages FOR DELETE USING (true);


-- 6. CREATE ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL, -- Change Status, Change Plan, Delete Asset, Impersonation
    details TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Allow public read admin_audit_logs" ON public.admin_audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert admin_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "Allow public insert admin_audit_logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (true);
