CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'rent_due', 'leave_approved', 'complaint_updated', 'general'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can read their own notifications"
    ON public.notifications FOR SELECT
    USING (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Tenants can update their own notifications (mark read)"
    ON public.notifications FOR UPDATE
    USING (tenant_id = public.get_auth_tenant_id());

CREATE POLICY "Owners can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (property_id IN (SELECT id FROM properties WHERE organization_id = public.get_auth_org_id()));

CREATE POLICY "Owners can read notifications"
    ON public.notifications FOR SELECT
    USING (property_id IN (SELECT id FROM properties WHERE organization_id = public.get_auth_org_id()));
