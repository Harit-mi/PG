"use server";

import { supabase } from "@/utils/supabase";

export async function submitPublicComplaint(property_id, formData) {
  const tenant_name = formData.get("tenant_name");
  const room_number = formData.get("room_number");
  const issue = formData.get("issue");
  const category = formData.get("category");

  // Format issue string to include name and room since we don't require login
  const formattedIssue = `[${room_number}] ${tenant_name}: ${issue}`;
  
  // Generate a random ticket ID
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

  if (error || !data) {
    return { success: false, error: "Ticket not found" };
  }

  return { success: true, data };
}
