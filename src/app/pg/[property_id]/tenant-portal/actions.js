"use server";

import { createClient } from "@/utils/supabase/server";
import { sanitizeInput } from "@/utils/sanitizer";
import { checkActionRateLimit } from "@/utils/rateLimiter";

function normalizeDate(d) {
  if (!d) return null;
  const s = String(d).trim();
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }
  return s;
}

export async function verifyTenantPhone(propertyId, phone) {
  if (!propertyId || !phone) {
    return { success: false, error: "Property ID and phone number are required." };
  }

  const cleanDigits = phone.replace(/[^0-9]/g, '');
  if (cleanDigits.length < 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }
  const last10 = cleanDigits.slice(-10);

  const rateLimit = checkActionRateLimit(`verify_phone_${last10}`, 20, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();

  // Search tenants for this property
  const { data: allTenants, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, phone, room_number, status, move_in_date, property_id")
    .eq("property_id", propertyId);

  if (tenantError) {
    console.error("Tenant search error:", tenantError);
  }

  let matchedTenant = allTenants?.find(t => {
    const tDigits = (t.phone || "").replace(/[^0-9]/g, '');
    return tDigits.endsWith(last10);
  });

  // If not found in property specifically, check across tenants table
  if (!matchedTenant) {
    const { data: globalTenants } = await supabase
      .from("tenants")
      .select("id, name, phone, room_number, status, move_in_date, property_id");
    matchedTenant = globalTenants?.find(t => {
      const tDigits = (t.phone || "").replace(/[^0-9]/g, '');
      return tDigits.endsWith(last10);
    });
  }

  // Auto-register resident if not yet registered so UUID foreign key constraints are satisfied
  if (!matchedTenant) {
    const { data: newResident } = await supabase
      .from("tenants")
      .insert([{
        property_id: propertyId,
        name: `Resident (${last10.slice(-4)})`,
        phone: cleanDigits,
        status: "Active"
      }])
      .select()
      .maybeSingle();

    if (newResident) {
      matchedTenant = newResident;
    }
  }

  if (!matchedTenant) {
    return { 
      success: false, 
      error: `No active resident record found for mobile number ending in ${last10}. Please ask your PGPlus to register your phone number.` 
    };
  }

  // Fetch pending dues and full transaction history
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("tenant_id", matchedTenant.id)
    .order("date", { ascending: false });

  const dues = (transactions || []).filter(t => t.type === 'Income' && t.status === 'Pending');

  // Fetch leaves for this tenant
  const { data: leaves } = await supabase
    .from("leaves")
    .select("*")
    .eq("tenant_id", matchedTenant.id)
    .order("created_at", { ascending: false });

  // Fetch complaints for this tenant
  const { data: complaints } = await supabase
    .from("complaints")
    .select("*")
    .eq("tenant_id", matchedTenant.id)
    .order("created_at", { ascending: false });

  // Fetch visitors for this tenant
  const { data: visitors } = await supabase
    .from("visitors")
    .select("*")
    .eq("tenant_id", matchedTenant.id)
    .order("created_at", { ascending: false });

  return { 
    success: true, 
    tenant: matchedTenant,
    dues: dues || [],
    transactions: transactions || [],
    leaves: leaves || [],
    complaints: complaints || [],
    visitors: visitors || []
  };
}

export async function submitLeaveRequest(prop1, prop2, prop3) {
  let propertyId, tenantId, leaveData;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    tenantId = prop1.tenantId;
    leaveData = prop1;
  } else {
    propertyId = prop1;
    tenantId = prop2;
    leaveData = prop3 || {};
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(propertyId)) {
    return { success: false, error: "Invalid Property ID. This is a demo view." };
  }

  if (!propertyId || !tenantId) {
    return { success: false, error: "Resident identification missing. Please re-verify your phone." };
  }

  const rawStart = leaveData.startDate || leaveData.start_date;
  const rawEnd = leaveData.endDate || leaveData.end_date;
  const startDate = normalizeDate(rawStart);
  const endDate = normalizeDate(rawEnd);

  if (!startDate || !endDate) {
    return { success: false, error: "Please enter both start and end dates for leave." };
  }

  if (startDate > endDate) {
    return { success: false, error: "Start date cannot be after end date." };
  }

  const rateLimit = checkActionRateLimit(`leave_${tenantId}`, 10, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  let breakfast = true;
  let lunch = true;
  let dinner = true;

  if (Array.isArray(leaveData.meals)) {
    breakfast = leaveData.meals.includes("Breakfast");
    lunch = leaveData.meals.includes("Lunch");
    dinner = leaveData.meals.includes("Dinner");
  } else {
    breakfast = Boolean(leaveData.breakfast ?? leaveData.skipBreakfast ?? true);
    lunch = Boolean(leaveData.lunch ?? leaveData.skipLunch ?? true);
    dinner = Boolean(leaveData.dinner ?? leaveData.skipDinner ?? true);
  }

  const supabase = await createClient();
  const newLeaveRecord = {
    property_id: propertyId,
    tenant_id: tenantId,
    start_date: startDate,
    end_date: endDate,
    breakfast,
    lunch,
    dinner,
    reason: sanitizeInput((leaveData.reason || "").slice(0, 500)),
    status: "Pending"
  };

  const { data, error } = await supabase
    .from("leaves")
    .insert([newLeaveRecord])
    .select()
    .single();

  if (error) {
    console.error("Leave Request Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, leave: data || newLeaveRecord };
}

export async function submitComplaintTicket(prop1, prop2, prop3) {
  // Support both submitComplaintTicket({ propertyId, tenantId, title, description, category }) and positional
  let propertyId, tenantId, complaintData;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    tenantId = prop1.tenantId;
    complaintData = prop1;
  } else {
    propertyId = prop1;
    tenantId = prop2;
    complaintData = prop3 || {};
  }

  if (!propertyId || !tenantId) {
    return { success: false, error: "Resident identification missing. Please re-verify your phone." };
  }

  const category = sanitizeInput((complaintData.category || "Maintenance").slice(0, 100));
  const title = (complaintData.title || "").trim();
  const description = (complaintData.description || "").trim();
  const issue = (complaintData.issue || "").trim() || (title ? `${title}${description ? ': ' + description : ''}` : description);

  if (!issue) {
    return { success: false, error: "Please provide a title or description of your issue." };
  }

  const rateLimit = checkActionRateLimit(`complaint_${tenantId}`, 10, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const newTicket = {
    property_id: propertyId,
    tenant_id: tenantId,
    ticket_id: ticketId,
    category,
    issue: sanitizeInput(issue.slice(0, 1000)),
    priority: sanitizeInput(complaintData.priority || "Medium"),
    status: "Open"
  };

  const { data, error } = await supabase
    .from("complaints")
    .insert([newTicket])
    .select()
    .single();

  if (error) {
    console.error("Complaint Ticket Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, ticketId, complaint: data || newTicket };
}

export async function submitPaymentProof(prop1, prop2, prop3) {
  let propertyId, tenantId, paymentData;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    tenantId = prop1.tenantId;
    paymentData = prop1;
  } else {
    propertyId = prop1;
    tenantId = prop2;
    paymentData = prop3 || {};
  }

  if (!propertyId || !tenantId) {
    return { success: false, error: "Resident identification missing. Please re-verify your phone." };
  }

  const numAmount = parseFloat(paymentData.amount);
  if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000) {
    return { success: false, error: "Please enter a valid payment amount." };
  }

  const rateLimit = checkActionRateLimit(`payment_proof_${tenantId}`, 10, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const refText = paymentData.paymentRef || paymentData.payment_reference || "";
  const newTx = {
    property_id: propertyId,
    tenant_id: tenantId,
    type: "Income",
    category: "Rent",
    amount: Math.round(numAmount),
    payment_method: sanitizeInput(paymentData.method || paymentData.payment_method || "UPI"),
    description: refText ? `UPI Ref: ${sanitizeInput(refText)}` : "Resident Submitted Proof",
    status: "Pending Owner Verification",
    date: paymentData.paymentDate || new Date().toISOString().split('T')[0]
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert([newTx])
    .select()
    .single();

  if (error) {
    console.error("Payment Proof Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, transaction: data || newTx };
}

export async function requestVisitorPass(prop1, prop2, prop3) {
  let propertyId, tenantId, visitorData;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    tenantId = prop1.tenantId;
    visitorData = prop1;
  } else {
    propertyId = prop1;
    tenantId = prop2;
    visitorData = prop3 || {};
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(propertyId)) {
    return { success: false, error: "Invalid Property ID. This is a demo view." };
  }

  if (!propertyId || !tenantId) {
    return { success: false, error: "Resident identification missing. Please re-verify your phone." };
  }

  const name = sanitizeInput((visitorData.name || "").trim());
  const phone = sanitizeInput((visitorData.phone || "").replace(/[^0-9]/g, ''));
  const relationship = sanitizeInput((visitorData.relationship || "Guest").trim());
  const visit_date = visitorData.visitDate || visitorData.visit_date || new Date().toISOString().split('T')[0];
  const purpose = sanitizeInput((visitorData.purpose || "Personal Visit").trim());

  if (!name) {
    return { success: false, error: "Visitor name is required." };
  }
  if (!phone || phone.length < 10) {
    return { success: false, error: "Valid 10-digit mobile number is required." };
  }

  const rateLimit = checkActionRateLimit(`visitor_pass_${tenantId}`, 10, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const newPass = {
    property_id: propertyId,
    tenant_id: tenantId,
    name,
    phone,
    relationship,
    visit_date,
    purpose,
    status: "Requested"
  };

  const { data, error } = await supabase
    .from("visitors")
    .insert([newPass])
    .select()
    .single();

  if (error) {
    console.error("Request Visitor Pass Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, visitor: data || newPass };
}

export async function submitPublicVisitor(property_id, formData) {
  if (!property_id || !formData) {
    return { success: false, error: "Missing required visitor parameters." };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(property_id)) {
    return { success: false, error: "Invalid Property ID. This is a demo view." };
  }

  const name = sanitizeInput(formData.get("visitor_name")?.trim() || formData.get("name")?.trim());
  const phone = sanitizeInput(formData.get("visitor_phone")?.trim() || formData.get("phone")?.trim());
  const host_tenant = sanitizeInput(formData.get("host_tenant")?.trim());
  const purpose = sanitizeInput(formData.get("purpose")?.trim());

  if (!name || !phone) {
    return { success: false, error: "Visitor name and phone are required." };
  }

  const rateLimit = checkActionRateLimit(`visitor_${property_id}`, 15, 60000);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("visitors").insert([{
    property_id,
    name,
    phone,
    relationship: "Guest",
    visit_date: new Date().toISOString().split('T')[0],
    purpose: `Visiting ${host_tenant || 'Resident'} - ${purpose || 'Personal'}`,
    status: "Checked In"
  }]);

  if (error) {
    console.error("Submit Visitor Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
