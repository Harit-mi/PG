"use server";

import { createClient } from "@/utils/supabase/server";

export async function verifyTenantPhone(propertyId, phone) {
  const supabase = await createClient();
  const cleanPhone = phone.trim();

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
  const supabase = await createClient();
  const { error } = await supabase
    .from("leaves")
    .insert([{
      property_id: propertyId,
      tenant_id: tenantId,
      start_date: leaveData.startDate,
      end_date: leaveData.endDate,
      breakfast: leaveData.breakfast,
      lunch: leaveData.lunch,
      dinner: leaveData.dinner,
      reason: leaveData.reason,
      status: "Pending"
    }]);

  if (error) {
    console.error("Leave Request Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitComplaintTicket(propertyId, tenantId, complaintData) {
  const supabase = await createClient();
  const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const { error } = await supabase
    .from("complaints")
    .insert([{
      property_id: propertyId,
      tenant_id: tenantId,
      ticket_id: ticketId,
      category: complaintData.category,
      issue: complaintData.issue,
      priority: complaintData.priority || "Medium",
      status: "Open"
    }]);

  if (error) {
    console.error("Complaint Ticket Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitPaymentProof(propertyId, tenantId, paymentData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .insert([{
      property_id: propertyId,
      tenant_id: tenantId,
      type: "Income",
      category: "Rent",
      amount: parseFloat(paymentData.amount),
      payment_method: paymentData.method,
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
  const supabase = await createClient();
  const visitor_name = formData.get("visitor_name");
  const visitor_phone = formData.get("visitor_phone");
  const host_tenant = formData.get("host_tenant");
  const purpose = formData.get("purpose");

  const { error } = await supabase.from("visitors").insert([{
    property_id,
    visitor_name,
    visitor_phone,
    purpose: `Visiting ${host_tenant} - ${purpose}`,
    status: "Checked In",
    check_in_time: new Date().toISOString()
  }]);

  if (error) {
    console.error("Submit Visitor Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
