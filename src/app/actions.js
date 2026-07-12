"use server";

import { supabase } from "@/utils/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function checkSubscription(property_id) {
  if (!property_id || property_id === 'all') return { success: false, error: "Please select a specific property from the sidebar to perform this action." };
  const { data: property } = await supabase
    .from("properties")
    .select("subscription_status, expiry_date")
    .eq("id", property_id)
    .single();
  if (property && (property.subscription_status === 'expired' || new Date(property.expiry_date) < new Date())) {
    return { success: false, error: "Subscription expired. Read-only mode." };
  }
  return { success: true };
}

export async function switchProperty(id) {
  (await cookies()).set('activePropertyId', id, { path: '/' });
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function addProperty(formData) {
  const name = formData.get("name");
  const address = formData.get("address");

  const { error } = await supabase.from("properties").insert([{
    name,
    address
  }]);

  if (error) {
    console.error("Error adding property:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function addRoom(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const room_number = formData.get("room_number")?.trim();
  const type = formData.get("type");
  const rent_raw = formData.get("rent_per_bed");
  const capacity_raw = formData.get("capacity");

  if (!room_number) {
    return { success: false, error: "Room number is required." };
  }

  const rent_per_bed = Number(rent_raw);
  if (rent_raw === "" || Number.isNaN(rent_per_bed) || rent_per_bed < 0) {
    return { success: false, error: "Rent per bed must be a valid non-negative number." };
  }

  const capacity = Number(capacity_raw);
  if (capacity_raw === "" || Number.isNaN(capacity) || capacity <= 0) {
    return { success: false, error: "Capacity must be a valid positive integer." };
  }

  // Check for duplicate room number
  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("id")
    .eq("property_id", property_id)
    .eq("room_number", room_number)
    .single();

  if (existingRoom) {
    return { success: false, error: `Room ${room_number} already exists in this property.` };
  }
  
  const { error } = await supabase.from("rooms").insert([{
    room_number,
    type,
    rent_amount: rent_per_bed,
    rent_per_bed,
    capacity,
    status: "Vacant",
    property_id
  }]);

  if (error) {
    console.error("Error adding room:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function addTenant(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const name = formData.get("name");
  const phone = formData.get("phone");
  const room_number = formData.get("room_number");
  const permanent_address = formData.get("permanent_address");
  const father_mother_name = formData.get("father_mother_name");
  const parent_contact_number = formData.get("parent_contact_number");
  const blood_group = formData.get("blood_group");
  const workplace_details = formData.get("workplace_details");
  
  const { error } = await supabase.from("tenants").insert([{
    name,
    phone,
    room_number,
    permanent_address,
    father_mother_name,
    parent_contact_number,
    blood_group,
    workplace_details,
    status: "Active",
    property_id
  }]);

  if (error) {
    console.error("Error adding tenant:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true };
}

export async function updateTenant(id, formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const name = formData.get("name")?.trim();
  const phone = formData.get("phone")?.trim();
  const room_number = formData.get("room_number") || null;
  const status = formData.get("status");
  const move_in_date = formData.get("move_in_date") || null;
  const permanent_address = formData.get("permanent_address")?.trim() || null;
  const father_mother_name = formData.get("father_mother_name")?.trim() || null;
  const parent_contact_number = formData.get("parent_contact_number")?.trim() || null;
  const blood_group = formData.get("blood_group")?.trim() || null;
  const workplace_details = formData.get("workplace_details")?.trim() || null;

  if (!name || !phone) {
    return { success: false, error: "Name and phone number are required." };
  }

  const updateData = {
    name,
    phone,
    room_number,
    status,
    move_in_date,
    permanent_address,
    father_mother_name,
    parent_contact_number,
    blood_group,
    workplace_details
  };

  const { error } = await supabase
    .from("tenants")
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error("Error updating tenant:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true };
}

export async function addTransaction(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const type = formData.get("type"); // Income or Expense
  const category = formData.get("category"); // Rent, Electricity, etc.
  const amount = parseInt(formData.get("amount"));
  const tenant_id = formData.get("tenant_id") || null;
  const employee_id = formData.get("employee_id") || null;
  const date = formData.get("date");

  const { error } = await supabase.from("transactions").insert([{
    type,
    category,
    amount,
    tenant_id,
    employee_id,
    date,
    status: "Completed",
    property_id
  }]);

  if (error) {
    console.error("Error adding transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/finances");
  return { success: true };
}

export async function addComplaint(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const tenant_id = formData.get("tenant_id");
  const issue = formData.get("issue");
  const category = formData.get("category");
  const priority = formData.get("priority");

  const { error } = await supabase.from("complaints").insert([{
    tenant_id,
    issue,
    category,
    priority,
    status: "Open",
    property_id
  }]);

  if (error) {
    console.error("Error adding complaint:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/complaints");
  return { success: true };
}

export async function updateComplaintStatus(id, newStatus) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("complaints")
    .update({ status: newStatus })
    .eq('id', id);

  if (error) {
    console.error("Error updating complaint:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/complaints");
  return { success: true };
}

export async function addNotice(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const title = formData.get("title");
  const content = formData.get("content");

  const { error } = await supabase.from("notices").insert([{
    title,
    content,
    property_id
  }]);

  if (error) {
    console.error("Error adding notice:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTransactionStatus(id, newStatus, proofUrl = null, paymentMethod = null, paymentDate = null) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const updateData = { status: newStatus };
  if (proofUrl) {
    updateData.proof_url = proofUrl;
  }
  if (paymentMethod) {
    updateData.payment_method = paymentMethod;
  }
  if (paymentDate) {
    updateData.payment_date = paymentDate;
  }

  const { error } = await supabase.from("transactions")
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/dues");
  revalidatePath("/dashboard/finances");
  return { success: true };
}

export async function saveMenu(menus) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  // Menus is an array of objects
  const menusToUpsert = menus.map(m => {
    // Exclude id so Supabase uniquely constraints on (property_id, week_start_date, day_of_week)
    const { id, ...rest } = m;
    return {
      ...rest,
      property_id
    };
  });

  const { error } = await supabase.from('food_menus').upsert(menusToUpsert, {
    onConflict: 'property_id,week_start_date,day_of_week'
  });

  if (error) {
    console.error("Error saving menu:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/menu");
  return { success: true };
}

export async function copyPreviousWeekMenu(currentWeekStartDate) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  // Calculate previous week start date
  const currentStart = new Date(currentWeekStartDate);
  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - 7);
  const prevStartStr = prevStart.toISOString().split('T')[0];

  const { data: prevMenu, error: fetchError } = await supabase
    .from('food_menus')
    .select('*')
    .eq('property_id', property_id)
    .eq('week_start_date', prevStartStr);

  if (fetchError || !prevMenu || prevMenu.length === 0) {
    return { success: false, error: "No menu found for the previous week" };
  }

  const menusToInsert = prevMenu.map(m => ({
    property_id,
    week_start_date: currentWeekStartDate,
    day_of_week: m.day_of_week,
    breakfast: m.breakfast,
    lunch: m.lunch,
    evening_snack: m.evening_snack,
    dinner: m.dinner
  }));

  const { error } = await supabase.from('food_menus').upsert(menusToInsert, {
    onConflict: 'property_id,week_start_date,day_of_week'
  });

  if (error) {
    console.error("Error copying menu:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/menu");
  return { success: true };
}

export async function addEmployee(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const name = formData.get("name");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const role = formData.get("role");
  const salary = parseInt(formData.get("salary"));
  
  const { error } = await supabase.from("employees").insert([{
    name,
    phone,
    address,
    role,
    salary,
    status: "Active",
    property_id
  }]);

  if (error) {
    console.error("Error adding employee:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}

export async function getPaymentMethods() {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  if (!property_id || property_id === 'all') return { success: true, data: [] };

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching payment methods:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function addPaymentMethod(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const type = formData.get("type");
  const details = formData.get("details")?.trim();
  const is_default = formData.get("is_default") === "on";

  if (!type || !details) {
    return { success: false, error: "Payment method type and details are required." };
  }

  const { error } = await supabase.from("payment_methods").insert([{
    property_id,
    type,
    details,
    is_default,
    is_active: true
  }]);

  if (error) {
    console.error("Error adding payment method:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deletePaymentMethod(id) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("payment_methods").delete().eq('id', id);

  if (error) {
    console.error("Error deleting payment method:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function getRoomTypes() {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  if (!property_id || property_id === 'all') return { success: true, data: [] };

  const { data, error } = await supabase
    .from('room_types')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching room types:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function addRoomType(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const name = formData.get("name");
  const default_capacity = parseInt(formData.get("default_capacity"));
  const default_rent = parseInt(formData.get("default_rent"));

  const { error } = await supabase.from("room_types").insert([{
    property_id,
    name,
    default_capacity,
    default_rent
  }]);

  if (error) {
    console.error("Error adding room type:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteRoomType(id) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("room_types").delete().eq('id', id);

  if (error) {
    console.error("Error deleting room type:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateEmployee(id, formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const updateData = {};
  
  if (formData.get("name")) updateData.name = formData.get("name");
  if (formData.get("phone")) updateData.phone = formData.get("phone");
  if (formData.get("address")) updateData.address = formData.get("address");
  if (formData.get("role")) updateData.role = formData.get("role");
  if (formData.get("salary")) updateData.salary = parseInt(formData.get("salary"));
  if (formData.get("status")) updateData.status = formData.get("status");

  const { error } = await supabase.from("employees").update(updateData).eq('id', id);

  if (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}

export async function deleteEmployee(id) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("employees").delete().eq('id', id);

  if (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}

export async function updateTransaction(id, formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const updateData = {
    amount: parseFloat(formData.get("amount")),
    category: formData.get("category"),
    type: formData.get("type"),
    status: formData.get("status"),
    payment_method: formData.get("payment_method"),
    description: formData.get("description"),
  };

  if (formData.get("payment_date")) {
    updateData.payment_date = formData.get("payment_date");
  } else if (updateData.status === "Paid") {
    updateData.payment_date = new Date().toISOString();
  }

  const { error } = await supabase.from("transactions").update(updateData).eq('id', id);

  if (error) {
    console.error("Error updating transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard"); // Refresh dashboard totals
  return { success: true };
}

export async function deleteTransaction(id) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("transactions").delete().eq('id', id);

  if (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard"); // Refresh dashboard totals
  return { success: true };
}

export async function updateComplaint(id, formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const updateData = {
    issue: formData.get("issue"),
    category: formData.get("category"),
    priority: formData.get("priority"),
    status: formData.get("status")
  };

  const { error } = await supabase.from("complaints").update(updateData).eq('id', id);

  if (error) {
    console.error("Error updating complaint:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/complaints");
  return { success: true };
}

export async function deleteComplaint(id) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("complaints").delete().eq('id', id);

  if (error) {
    console.error("Error deleting complaint:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/complaints");
  return { success: true };
}

export async function submitLeaveRequest(propertyId, tenantId, startDate, endDate, breakfast, lunch, dinner, reason) {
  const subCheck = await checkSubscription(propertyId);
  if (!subCheck.success) return subCheck;

  if (!tenantId || !startDate || !endDate || !reason) {
    return { success: false, error: "Please fill in all required fields." };
  }
  if (startDate > endDate) {
    return { success: false, error: "Start date cannot be after end date." };
  }

  const { error } = await supabase.from("leaves").insert([{
    property_id: propertyId,
    tenant_id: tenantId,
    start_date: startDate,
    end_date: endDate,
    breakfast: !!breakfast,
    lunch: !!lunch,
    dinner: !!dinner,
    reason: reason.trim(),
    status: 'Pending'
  }]);

  if (error) {
    console.error("Error submitting leave:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/leaves");
  revalidatePath("/dashboard/kitchen");
  revalidatePath(`/pg/${propertyId}/tenant-portal`);
  return { success: true };
}

export async function updateLeaveRequestStatus(leaveId, status) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("leaves")
    .update({ status })
    .eq('id', leaveId);

  if (error) {
    console.error("Error updating leave:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/leaves");
  revalidatePath("/dashboard/kitchen");
  revalidatePath("/dashboard");
  if (property_id) {
    revalidatePath(`/pg/${property_id}/tenant-portal`);
  }
  return { success: true };
}

export async function deleteLeaveRequest(leaveId) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase.from("leaves").delete().eq('id', leaveId);

  if (error) {
    console.error("Error deleting leave:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/leaves");
  revalidatePath("/dashboard/kitchen");
  revalidatePath("/dashboard");
  if (property_id) {
    revalidatePath(`/pg/${property_id}/tenant-portal`);
  }
  return { success: true };
}

export async function verifyTenantByPhone(propertyId, phone) {
  if (!propertyId || !phone) {
    return { success: false, error: "Missing property or phone number." };
  }

  const cleanPhone = phone.trim().replace(/[\s-()]/g, '');

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("id, name, phone, room_number")
    .eq("property_id", propertyId)
    .eq("status", "Active");

  if (error) {
    console.error("Error verifying tenant:", error);
    return { success: false, error: error.message };
  }

  const tenant = tenants.find(t => {
    const tPhone = (t.phone || "").replace(/[\s-()]/g, '');
    return tPhone === cleanPhone || tPhone.endsWith(cleanPhone) || cleanPhone.endsWith(tPhone);
  });

  if (!tenant) {
    return { success: false, error: "This mobile number is not registered for this PG property." };
  }

  return { success: true, tenant };
}

export async function submitVerifiedComplaint(propertyId, tenantId, tenantName, roomNumber, category, issue) {
  if (!propertyId || !tenantId || !category || !issue) {
    return { success: false, error: "Missing required fields." };
  }

  const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  const formattedIssue = `[${roomNumber}] ${tenantName}: ${issue}`;

  const { error } = await supabase.from("complaints").insert([{
    property_id: propertyId,
    tenant_id: tenantId,
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

  revalidatePath("/dashboard/complaints");
  revalidatePath("/dashboard");
  return { success: true, ticketId };
}
