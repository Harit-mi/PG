-- =================================================================
-- MASTER DATA RESET SCRIPT FOR OUR-PG SAAS PLATFORM
-- Purpose: Wipes all tenant, room, financial, complaint, leave, and
-- organization records while preserving table schemas, triggers, RLS policies,
-- and authentication security structures.
-- =================================================================

TRUNCATE TABLE 
  public.ticket_messages,
  public.support_tickets,
  public.admin_audit_logs,
  public.room_assets,
  public.visitors,
  public.leaves,
  public.complaints,
  public.transactions,
  public.tenants,
  public.rooms,
  public.food_menus,
  public.payment_methods,
  public.room_types,
  public.employees,
  public.outlet_slots,
  public.properties,
  public.subscriptions,
  public.organizations
CASCADE;

-- Optional: Re-insert default master organization for initial setup
INSERT INTO public.organizations (id, name, status)
VALUES ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Master PG Organization', 'Active')
ON CONFLICT (id) DO UPDATE SET status = 'Active';

-- Re-insert 3 default unassigned slots for immediate outlet setup
INSERT INTO public.outlet_slots (organization_id, plan_name, status, expiry_date)
VALUES 
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Professional', 'Unassigned', '2030-12-31'),
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Professional', 'Unassigned', '2030-12-31'),
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Professional', 'Unassigned', '2030-12-31');
