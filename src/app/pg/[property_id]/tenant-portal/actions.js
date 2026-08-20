"use server";

import { supabase } from "@/utils/supabase";

export async function submitPublicComplaint(property_id, formData) {
  const tenant_name = formData.get("tenant_name");
  const room_number = formData.get("room_number");
  const issue = formData.get("issue");
  const category = formData.get("category");

  const formattedIssue = `[${room_number}] ${tenant_name}: ${issue}`;
  const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const { error } = await supabase.from("complaints").insert([{
    property_id,
    ticket_id: ticketId,
    issue: formattedIssue,
    category,
    priority: "Medium",
    status: "Open"
  }]);

  if (error) {
    console.error("Submit Complaint Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, ticketId };
}

export async function checkComplaintStatus(property_id, ticket_id) {
  const { data, error } = await supabase
    .from("complaints")
    .select("status, category, issue")
    .eq("property_id", property_id)
    .eq("ticket_id", ticket_id.toUpperCase())
    .single();

  if (error) {
    return { success: false, error: "Ticket not found." };
  }

  return { success: true, complaint: data };
}

export async function submitComplaintTicket({ propertyId, tenantId, title, description, category }) {
  const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  const { error } = await supabase.from("complaints").insert([{
    property_id: propertyId,
    tenant_id: tenantId,
    ticket_id: ticketId,
    title,
    issue: `${title}: ${description}`,
    category: category || "Maintenance",
    priority: "Medium",
    status: "Open"
  }]);

  if (error) {
    console.error("Submit Complaint Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, ticketId };
}

export async function submitLeaveRequest({ propertyId, tenantId, startDate, endDate, reason, meals }) {
  const { error } = await supabase.from("leaves").insert([{
    property_id: propertyId,
    tenant_id: tenantId,
    start_date: startDate,
    end_date: endDate,
    reason: reason || "Personal",
    meals_skipped: meals ? meals.join(", ") : "All Meals",
    status: "Pending"
  }]);

  if (error) {
    console.error("Submit Leave Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function submitPaymentProof({ propertyId, tenantId, transactionId, paymentRef, proofUrl }) {
  const { error } = await supabase.from("transactions").update({
    payment_reference: paymentRef,
    proof_url: proofUrl,
    status: "Pending"
  }).eq("id", transactionId);

  if (error) {
    console.error("Submit Payment Proof Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
