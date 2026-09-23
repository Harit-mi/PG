"use server";

import { createClient } from "@/utils/supabase/server";
import { sanitizeInput } from "@/utils/sanitizer";
import { checkActionRateLimit } from "@/utils/rateLimiter";

export async function verifyTenantPhone(propertyId, phone) {
  if (!propertyId || !phone) {
    return { success: false, error: "Property ID and phone number are required." };
  }

  const cleanPhone = phone.trim();
  const rateLimit = checkActionRateLimit(`verify_phone_${cleanPhone}`, 10, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*, properties(name)")
    .eq("property_id", propertyId)
    .eq("phone", cleanPhone)
    .single();

  if (error || !tenant) {
    return { success: false, error: "No active resident record found matching this mobile number for this property." };
  }

  // Fetch pending dues
  const { data: dues } = await supabase
    .from("transactions")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("type", "Income")
    .eq("status", "Pending");

  return { 
    success: true, 
    tenant,
    dues: dues || []
  };
}

export async function submitLeaveRequest(propertyId, tenantId, leaveData) {
  if (!propertyId || !tenantId || !leaveData) {
    return { success: false, error: "Missing required leave request parameters." };
  }

  const rateLimit = checkActionRateLimit(`leave_${tenantId}`, 5, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("leaves")
    .insert([{
      property_id: propertyId,
      tenant_id: tenantId,
      start_date: leaveData.startDate,
      end_date: leaveData.endDate,
      breakfast: Boolean(leaveData.breakfast),
      lunch: Boolean(leaveData.lunch),
      dinner: Boolean(leaveData.dinner),
      reason: sanitizeInput(leaveData.reason?.slice(0, 500) || ""),
      status: "Pending"
    }]);

  if (error) {
    console.error("Leave Request Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitComplaintTicket(propertyId, tenantId, complaintData) {
  if (!propertyId || !tenantId || !complaintData?.category || !complaintData?.issue) {
    return { success: false, error: "Category and issue description are required." };
  }

  const rateLimit = checkActionRateLimit(`complaint_${tenantId}`, 5, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const { error } = await supabase
    .from("complaints")
    .insert([{
      property_id: propertyId,
      tenant_id: tenantId,
      ticket_id: ticketId,
      category: sanitizeInput(complaintData.category?.slice(0, 100)),
      issue: sanitizeInput(complaintData.issue?.slice(0, 1000)),
      priority: sanitizeInput(complaintData.priority || "Medium"),
      status: "Open"
    }]);

  if (error) {
    console.error("Complaint Ticket Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitPaymentProof(propertyId, tenantId, paymentData) {
  if (!propertyId || !tenantId || !paymentData?.amount) {
    return { success: false, error: "Amount and payment details are required." };
  }

  const numAmount = parseFloat(paymentData.amount);
  if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000) {
    return { success: false, error: "Invalid payment amount." };
  }

  const rateLimit = checkActionRateLimit(`payment_proof_${tenantId}`, 5, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .insert([{
      property_id: propertyId,
      tenant_id: tenantId,
      type: "Income",
      category: "Rent",
      amount: numAmount,
      payment_method: sanitizeInput(paymentData.method || "UPI"),
      status: "Pending Owner Verification",
      date: new Date().toISOString().split('T')[0]
    }]);

  if (error) {
    console.error("Payment Proof Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitPublicVisitor(property_id, formData) {
  if (!property_id || !formData) {
    return { success: false, error: "Missing required visitor parameters." };
  }

  const visitor_name = sanitizeInput(formData.get("visitor_name")?.trim());
  const visitor_phone = sanitizeInput(formData.get("visitor_phone")?.trim());
  const host_tenant = sanitizeInput(formData.get("host_tenant")?.trim());
  const purpose = sanitizeInput(formData.get("purpose")?.trim());

  if (!visitor_name || !visitor_phone) {
    return { success: false, error: "Visitor name and phone are required." };
  }

  const rateLimit = checkActionRateLimit(`visitor_${property_id}`, 15, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("visitors").insert([{
    property_id,
    visitor_name,
    visitor_phone,
    purpose: `Visiting ${host_tenant || 'Resident'} - ${purpose || 'Personal'}`,
    status: "Checked In",
    check_in_time: new Date().toISOString()
  }]);

  if (error) {
    console.error("Submit Visitor Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
