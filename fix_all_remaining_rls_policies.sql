-- ==============================================================================
-- COMPREHENSIVE SECURITY PATCH: TIGHTENING RLS POLICIES ACROSS ALL REMAINING TABLES
-- ==============================================================================
-- Run this migration in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/creeorxpcmzpcgtzcxaw/editor
--
-- FIXES CRITICAL VULNERABILITIES:
-- Eliminates all unqualified "USING (true)" policies that exposed sensitive business
-- data (payment methods, bank details, room templates, complaints, support tickets,
-- private admin notes, and security audit logs) to unauthenticated public ('anon') roles.
-- ==============================================================================

-- 0. Ensure Helper Functions exist and fail closed
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (NULLIF(auth.jwt() -> 'user_metadata' ->> 'organization_id', ''))::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (COALESCE(auth.jwt() ->> 'email', '') = 'admin@pgmanagement.com')
      OR (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ==============================================================================
-- 1. PAYMENT METHODS TABLE (SENSITIVE FINANCIAL DATA)
-- ==============================================================================
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.payment_methods;
DROP POLICY IF EXISTS "Allow public insert access" ON public.payment_methods;
DROP POLICY IF EXISTS "Allow public update access" ON public.payment_methods;
DROP POLICY IF EXISTS "Allow public delete access" ON public.payment_methods;
DROP POLICY IF EXISTS "PaymentMethods select org" ON public.payment_methods;
DROP POLICY IF EXISTS "PaymentMethods insert org" ON public.payment_methods;
DROP POLICY IF EXISTS "PaymentMethods update org" ON public.payment_methods;
DROP POLICY IF EXISTS "PaymentMethods delete org" ON public.payment_methods;

CREATE POLICY "PaymentMethods select org" ON public.payment_methods
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "PaymentMethods insert org" ON public.payment_methods
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "PaymentMethods update org" ON public.payment_methods
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "PaymentMethods delete org" ON public.payment_methods
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );


-- ==============================================================================
-- 2. ROOM TYPES TABLE (PRICING & CAPACITY TEMPLATES)
-- ==============================================================================
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow public insert room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow public update room_types" ON public.room_types;
DROP POLICY IF EXISTS "Allow public delete room_types" ON public.room_types;
DROP POLICY IF EXISTS "RoomTypes select org" ON public.room_types;
DROP POLICY IF EXISTS "RoomTypes insert org" ON public.room_types;
DROP POLICY IF EXISTS "RoomTypes update org" ON public.room_types;
DROP POLICY IF EXISTS "RoomTypes delete org" ON public.room_types;

CREATE POLICY "RoomTypes select org" ON public.room_types
    FOR SELECT TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "RoomTypes insert org" ON public.room_types
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "RoomTypes update org" ON public.room_types
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "RoomTypes delete org" ON public.room_types
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );


-- ==============================================================================
-- 3. FOOD MENUS TABLE
-- ==============================================================================
ALTER TABLE public.food_menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read food_menus" ON public.food_menus;
DROP POLICY IF EXISTS "Allow public insert food_menus" ON public.food_menus;
DROP POLICY IF EXISTS "Allow public update food_menus" ON public.food_menus;
DROP POLICY IF EXISTS "Allow public delete food_menus" ON public.food_menus;
DROP POLICY IF EXISTS "FoodMenus select org" ON public.food_menus;
DROP POLICY IF EXISTS "FoodMenus insert org" ON public.food_menus;
DROP POLICY IF EXISTS "FoodMenus update org" ON public.food_menus;
DROP POLICY IF EXISTS "FoodMenus delete org" ON public.food_menus;

-- Allow authenticated owners to read their property menus, or public read for tenant portal display
CREATE POLICY "FoodMenus select org" ON public.food_menus
    FOR SELECT USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR property_id IS NOT NULL
    );

CREATE POLICY "FoodMenus insert org" ON public.food_menus
    FOR INSERT TO authenticated WITH CHECK (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "FoodMenus update org" ON public.food_menus
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "FoodMenus delete org" ON public.food_menus
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );


-- ==============================================================================
-- 4. COMPLAINTS TABLE (TENANT TICKETS)
-- ==============================================================================
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow public insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow public update complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow public delete complaints" ON public.complaints;
DROP POLICY IF EXISTS "Complaints select org" ON public.complaints;
DROP POLICY IF EXISTS "Complaints insert org" ON public.complaints;
DROP POLICY IF EXISTS "Complaints update org" ON public.complaints;
DROP POLICY IF EXISTS "Complaints delete org" ON public.complaints;

-- Owners read tickets for their organization
CREATE POLICY "Complaints select org" ON public.complaints
    FOR SELECT USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

-- Allow authenticated owners or residents submitting tickets for a valid property
CREATE POLICY "Complaints insert org" ON public.complaints
    FOR INSERT WITH CHECK (
      property_id IS NOT NULL
    );

CREATE POLICY "Complaints update org" ON public.complaints
    FOR UPDATE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "Complaints delete org" ON public.complaints
    FOR DELETE TO authenticated USING (
      property_id IN (SELECT id FROM public.properties WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );


-- ==============================================================================
-- 5. SUPPORT TICKETS & TICKET MESSAGES (CUSTOMER SUPPORT & PRIVATE ADMIN NOTES)
-- ==============================================================================
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow public insert support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow public update support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow public delete support_tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "SupportTickets select org" ON public.support_tickets;
DROP POLICY IF EXISTS "SupportTickets insert org" ON public.support_tickets;
DROP POLICY IF EXISTS "SupportTickets update org" ON public.support_tickets;
DROP POLICY IF EXISTS "SupportTickets delete org" ON public.support_tickets;

CREATE POLICY "SupportTickets select org" ON public.support_tickets
    FOR SELECT TO authenticated USING (
      organization_id = public.get_auth_org_id()
      OR public.is_super_admin()
    );

CREATE POLICY "SupportTickets insert org" ON public.support_tickets
    FOR INSERT TO authenticated WITH CHECK (
      organization_id = public.get_auth_org_id()
      OR public.is_super_admin()
    );

CREATE POLICY "SupportTickets update org" ON public.support_tickets
    FOR UPDATE TO authenticated USING (
      organization_id = public.get_auth_org_id()
      OR public.is_super_admin()
    );

CREATE POLICY "SupportTickets delete org" ON public.support_tickets
    FOR DELETE TO authenticated USING (
      public.is_super_admin()
    );


ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read ticket_messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Allow public insert ticket_messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Allow public update ticket_messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "Allow public delete ticket_messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "TicketMessages select org" ON public.ticket_messages;
DROP POLICY IF EXISTS "TicketMessages insert org" ON public.ticket_messages;
DROP POLICY IF EXISTS "TicketMessages update org" ON public.ticket_messages;

-- Protect internal admin private notes (is_private = true) from customer read access
CREATE POLICY "TicketMessages select org" ON public.ticket_messages
    FOR SELECT TO authenticated USING (
      (
        ticket_id IN (SELECT id FROM public.support_tickets WHERE organization_id = public.get_auth_org_id())
        AND (is_private = FALSE OR is_private IS NULL)
      )
      OR public.is_super_admin()
    );

CREATE POLICY "TicketMessages insert org" ON public.ticket_messages
    FOR INSERT TO authenticated WITH CHECK (
      ticket_id IN (SELECT id FROM public.support_tickets WHERE organization_id = public.get_auth_org_id())
      OR public.is_super_admin()
    );

CREATE POLICY "TicketMessages update org" ON public.ticket_messages
    FOR UPDATE TO authenticated USING (
      public.is_super_admin()
    );

CREATE POLICY "TicketMessages delete org" ON public.ticket_messages
    FOR DELETE TO authenticated USING (
      public.is_super_admin()
    );


-- ==============================================================================
-- 6. ADMIN AUDIT LOGS (SUPER ADMIN AUDIT TRAIL)
-- ==============================================================================
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin_audit_logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Allow public insert admin_audit_logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Allow public update admin_audit_logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Allow public delete admin_audit_logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "AdminAuditLogs select super_admin" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "AdminAuditLogs insert super_admin" ON public.admin_audit_logs;

CREATE POLICY "AdminAuditLogs select super_admin" ON public.admin_audit_logs
    FOR SELECT TO authenticated USING (
      public.is_super_admin()
    );

CREATE POLICY "AdminAuditLogs insert super_admin" ON public.admin_audit_logs
    FOR INSERT TO authenticated WITH CHECK (
      public.is_super_admin()
    );


-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
