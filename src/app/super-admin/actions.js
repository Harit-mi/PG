"use server";

import { supabase } from "@/utils/supabase";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export async function fetchSuperAdminMetrics() {
  try {
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
    const tempSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // We generate a temp org UUID first so we can map the auth user to it
    const tempOrgUuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          organization_id: tempOrgUuid,
          name,
          phone: mobile
        }
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

