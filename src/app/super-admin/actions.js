"use server";

import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_SECRET = process.env.SUPER_ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'pg-platform-master-secret';

export async function superAdminLogin(email, password) {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@pgmanagement.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'adminpassword';

  if (!email || !password || email.trim().toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return { success: false, error: "Invalid administrative credentials." };
  }

  const timestamp = Date.now();
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(`${adminEmail}:${timestamp}`).digest('hex');
  const token = `${adminEmail}:${timestamp}:${signature}`;

  const cookieStore = await cookies();
  cookieStore.set('super_admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  });

  return { success: true };
}

export async function superAdminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('super_admin_token');
  return { success: true };
}

export async function verifySuperAdminAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('super_admin_token')?.value;
    if (!token) return false;

    const parts = token.split(':');
    if (parts.length !== 3) return false;

    const [email, timestamp, signature] = parts;
    const time = parseInt(timestamp, 10);
    if (isNaN(time) || Date.now() - time > 24 * 60 * 60 * 1000) return false;

    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(`${email}:${timestamp}`).digest('hex');
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }

    return true;
  } catch (err) {
    console.error("verifySuperAdminAuth error:", err);
    return false;
  }
}

export async function fetchSuperAdminMetrics() {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  try {
    const supabase = createAdminClient();
    // 1. Fetch organization counts
    const { data: orgs } = await supabase.from('organizations').select('id, status');
    const totalCustomers = orgs?.length || 0;
    const activeCustomers = orgs?.filter(o => o.status === 'Active').length || 0;

    // 2. Fetch properties count
    const { count: totalOutlets } = await supabase.from('properties').select('*', { count: 'exact', head: true });

    // 3. Fetch tickets health
    const { data: tickets } = await supabase.from('support_tickets').select('id, status');
    const openTickets = tickets?.filter(t => t.status === 'Open' || t.status === 'In Progress').length || 0;

    // 4. Fetch subscription revenues
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'Income')
      .eq('status', 'Completed');

    const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      success: true,
      metrics: {
        totalCustomers,
        activeCustomers,
        totalOutlets: totalOutlets || 0,
        openTickets,
        totalRevenue
      }
    };
  } catch (err) {
    console.error("fetchSuperAdminMetrics error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchSuperAdminCustomers() {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    // Fetch organizations
    const { data: orgs, error: orgsErr } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });

    if (orgsErr) throw orgsErr;

    // Fetch subscription information and properties count for each org
    const customers = await Promise.all((orgs || []).map(async (org) => {
      // Get subscription
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('plan_name, status, expiry_date')
        .eq('organization_id', org.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const sub = subs?.[0] || { plan_name: 'Trial', status: 'Inactive', expiry_date: 'N/A' };

      // Get properties count
      const { count: propertyCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id);

      return {
        ...org,
        plan_name: sub.plan_name,
        subscription_status: sub.status,
        expiry_date: sub.expiry_date,
        property_count: propertyCount || 0
      };
    }));

    return { success: true, customers };
  } catch (err) {
    console.error("fetchSuperAdminCustomers error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateCustomerStatus(organizationId, status, reason, adminEmail = 'admin@pgmanagement.com') {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    const { error: updateErr } = await supabase
      .from('organizations')
      .update({ status })
      .eq('id', organizationId);

    if (updateErr) throw updateErr;

    // Log admin action
    const details = `Updated organization status to ${status}`;
    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'Update Customer Status',
      details,
      reason
    }]);

    revalidatePath("/super-admin/customers");
    revalidatePath("/super-admin");
    return { success: true };
  } catch (err) {
    console.error("updateCustomerStatus error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateCustomerSubscription(organizationId, planName, expiryDate, reason, adminEmail = 'admin@pgmanagement.com') {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    // Check if subscription exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('organization_id', organizationId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update
      const { error: updateErr } = await supabase
        .from('subscriptions')
        .update({
          plan_name: planName,
          expiry_date: expiryDate,
          status: 'Active'
        })
        .eq('organization_id', organizationId);

      if (updateErr) throw updateErr;
    } else {
      // Insert
      const { error: insertErr } = await supabase
        .from('subscriptions')
        .insert([{
          organization_id: organizationId,
          plan_name: planName,
          expiry_date: expiryDate,
          status: 'Active'
        }]);

      if (insertErr) throw insertErr;
    }

    // Log admin action
    const details = `Changed plan to ${planName}, set expiry date to ${expiryDate}`;
    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'Update Subscription Override',
      details,
      reason
    }]);

    revalidatePath("/super-admin/customers");
    revalidatePath("/super-admin");
    return { success: true };
  } catch (err) {
    console.error("updateCustomerSubscription error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchSuperAdminTickets() {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    const { data: tickets, error: ticketsErr } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketsErr) throw ticketsErr;

    const populatedTickets = await Promise.all((tickets || []).map(async (t) => {
      // Fetch organization name
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', t.organization_id)
        .single();

      // Fetch messages list
      const { data: messages } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', t.id)
        .order('created_at', { ascending: true });

      return {
        ...t,
        organization_name: org?.name || 'Default PG Organization',
        messages: messages || []
      };
    }));

    return { success: true, tickets: populatedTickets };
  } catch (err) {
    console.error("fetchSuperAdminTickets error:", err);
    return { success: false, error: err.message };
  }
}

export async function addTicketReply(ticketId, message, isPrivate = false, senderName = 'Platform Admin', senderType = 'Admin') {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    const { error: insertErr } = await supabase
      .from('ticket_messages')
      .insert([{
        ticket_id: ticketId,
        sender_type: senderType,
        sender_name: senderName,
        message: message.trim(),
        is_private: isPrivate
      }]);

    if (insertErr) throw insertErr;

    // Update ticket status to Resolved if the admin completes it
    if (senderType === 'Admin' && message.toLowerCase().includes('resolved')) {
      await supabase.from('support_tickets').update({ status: 'Resolved' }).eq('id', ticketId);
    } else if (senderType === 'Admin') {
      await supabase.from('support_tickets').update({ status: 'In Progress' }).eq('id', ticketId);
    }

    revalidatePath("/super-admin/tickets");
    return { success: true };
  } catch (err) {
    console.error("addTicketReply error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateTicketStatus(ticketId, status) {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId);

    if (error) throw error;

    revalidatePath("/super-admin/tickets");
    return { success: true };
  } catch (err) {
    console.error("updateTicketStatus error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchSuperAdminAuditLogs() {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    const { data: logs, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, logs };
  } catch (err) {
    console.error("fetchSuperAdminAuditLogs error:", err);
    return { success: false, error: err.message };
  }
}

export async function grantComplimentarySlot(orgId, planName, expiryDate, reason, adminEmail = 'admin@pgmanagement.com') {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    // 1. Insert unassigned slot
    const { error: slotErr } = await supabase
      .from("outlet_slots")
      .insert([{
        organization_id: orgId,
        plan_name: planName,
        status: 'Unassigned',
        expiry_date: expiryDate
      }]);

    if (slotErr) throw slotErr;

    // 2. Log admin action
    const details = `Granted complimentary slot for plan ${planName} expiring on ${expiryDate}`;
    await supabase.from('admin_audit_logs').insert([{
      admin_email: adminEmail,
      action: 'Grant Slot',
      details,
      reason
    }]);

    revalidatePath("/super-admin/customers");
    return { success: true };
  } catch (err) {
    console.error("grantComplimentarySlot error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchBusinessDetails(orgId) {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  try {
    // 1. Fetch properties
    const { data: properties } = await supabase
      .from("properties")
      .select("*")
      .eq("organization_id", orgId);

    // 2. Fetch slots
    const { data: slots } = await supabase
      .from("outlet_slots")
      .select("*")
      .eq("organization_id", orgId);

    return { success: true, properties: properties || [], slots: slots || [] };
  } catch (err) {
    console.error("fetchBusinessDetails error:", err);
    return { success: false, error: err.message };
  }
}

export async function registerNewCustomer(data) {
  if (!(await verifySuperAdminAuth())) {
    return { success: false, error: "Unauthorized access: Super Admin credentials required." };
  }
  const supabase = createAdminClient();
  const { name, mobile, email, startDate, planType, password, confirmPassword } = data;

  if (!name || !mobile || !email || !startDate || !planType || !password) {
    return { success: false, error: "All fields are required." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  // Calculate expiry date
  const start = new Date(startDate);
  const expiry = new Date(start);
  if (planType === 'Yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }
  const expiryStr = expiry.toISOString().split('T')[0];

  let orgId = null;

  try {
    // 1. Create Supabase Auth User first (to ensure email/password check and prevent orphan orgs)
    // We generate a temp org UUID first so we can map the auth user to it
    const tempOrgUuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    // Use admin client to create user to bypass rate limits and auto-confirm email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        organization_id: tempOrgUuid,
        name,
        phone: mobile
      }
    });

    if (authError) {
      throw new Error(`Auth Error: ${authError.message}`);
    }

    const authUser = authData.user;
    if (!authUser) {
      throw new Error("Failed to register user in Auth provider.");
    }

    // 2. Create organization with the same UUID
    const { data: orgData, error: orgErr } = await supabase
      .from('organizations')
      .insert([{
        id: tempOrgUuid,
        name: name,
        status: 'Active'
      }])
      .select()
      .single();

    if (orgErr) {
      throw orgErr;
    }

    orgId = orgData.id;

    // 3. Create Subscription
    const { error: subErr } = await supabase
      .from('subscriptions')
      .insert([{
        organization_id: orgId,
        plan_name: planType === 'Yearly' ? 'Pro Yearly' : 'Pro Monthly',
        status: 'Active',
        expiry_date: expiryStr
      }]);

    if (subErr) throw subErr;

    // 4. Create 3 default unassigned slots so they can assign up to 3 outlets right away!
    const { error: slotErr } = await supabase
      .from('outlet_slots')
      .insert([
        { organization_id: orgId, plan_name: 'Professional', status: 'Unassigned', expiry_date: expiryStr },
        { organization_id: orgId, plan_name: 'Professional', status: 'Unassigned', expiry_date: expiryStr },
        { organization_id: orgId, plan_name: 'Professional', status: 'Unassigned', expiry_date: expiryStr }
      ]);

    if (slotErr) throw slotErr;

    // 5. Log admin action
    const details = `Registered new customer: ${name} (${email}), Plan: ${planType}, Expiry: ${expiryStr}`;
    await supabase.from('admin_audit_logs').insert([{
      admin_email: 'admin@pgmanagement.com',
      action: 'Register Customer',
      details,
      reason: 'New customer onboarded via Super Admin panel'
    }]);

    revalidatePath("/super-admin/customers");
    return { success: true };

  } catch (err) {
    console.error("registerNewCustomer error:", err);
    // clean up created organization if it was inserted before error
    if (orgId) {
      await supabase.from('organizations').delete().eq('id', orgId);
    }
    return { success: false, error: err.message };
  }
}

