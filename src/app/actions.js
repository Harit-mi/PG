"use server";

import { supabase } from "@/utils/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

function sanitizeInput(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

async function checkSubscription(property_id) {
  if (!property_id || property_id === 'all') return { success: false, error: "Please select a specific property from the sidebar to perform this action." };
  
  const { data: property } = await supabase
    .from("properties")
    .select("subscription_status, expiry_date, organization_id")
    .eq("id", property_id)
    .single();

  if (!property) return { success: true };

  let status = property.subscription_status;
  let expiry = property.expiry_date;

  if (property.organization_id) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, expiry_date")
      .eq("organization_id", property.organization_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (sub && sub.length > 0) {
      status = sub[0].status;
      expiry = sub[0].expiry_date;
    }
  }

  if (status === 'expired' || (expiry && expiry !== 'N/A' && new Date(expiry) < new Date())) {
    return { success: false, error: "Subscription expired. Read-only mode." };
  }
  return { success: true };
}

export async function switchProperty(id) {
  (await cookies()).set('activePropertyId', id, { path: '/' });
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function getAuthenticatedUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error("Unauthorized access.");
      }
      return { id: "d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0", email: "demo@example.com" };
    }
    return user;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error("Unauthorized access.");
    }
    return { id: "d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0", email: "demo@example.com" };
  }
}

export async function addProperty(formData) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const name = sanitizeInput(formData.get("name")?.trim());
  const address = sanitizeInput(formData.get("address")?.trim());

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

  const raw_room_number = formData.get("room_number");
  if (!raw_room_number) {
    return { success: false, error: "Room number is required." };
  }

  // Normalize: Trim spaces, reduce internal spaces to single space, and uppercase
  const room_number = raw_room_number.trim().replace(/\s+/g, " ").toUpperCase();

  // Validate format: letters, numbers, spaces, hyphens (1-20 characters)
  if (!/^[A-Z0-9][A-Z0-9 -]{0,19}$/.test(room_number)) {
    return { success: false, error: "Room number must be 1-20 characters using letters, numbers, spaces, or hyphens only." };
  }

  const type = formData.get("type");
  const rent_raw = formData.get("rent_per_bed");
  const capacity_raw = formData.get("capacity");

  const rent_per_bed = Number(rent_raw);
  if (rent_raw === "" || Number.isNaN(rent_per_bed) || rent_per_bed < 0) {
    return { success: false, error: "Rent per bed must be a valid non-negative number." };
  }

  const capacity = Number(capacity_raw);
  if (capacity_raw === "" || Number.isNaN(capacity) || capacity <= 0) {
    return { success: false, error: "Capacity must be a valid positive integer." };
  }

  // Check for duplicate room number (case-insensitive query is now simple eq since room_number is normalized)
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
    // Catch database unique key constraint violations (SQL code 23505)
    if (error.code === '23505') {
      return { success: false, error: `Room ${room_number} already exists in this property.` };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function addTenant(formData) {
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const name = sanitizeInput(formData.get("name")?.trim());
  const phone = sanitizeInput(formData.get("phone")?.trim());
  const room_number = sanitizeInput(formData.get("room_number")?.trim());
  const permanent_address = sanitizeInput(formData.get("permanent_address")?.trim());
  const father_mother_name = sanitizeInput(formData.get("father_mother_name")?.trim());
  const parent_contact_number = sanitizeInput(formData.get("parent_contact_number")?.trim());
  const blood_group = sanitizeInput(formData.get("blood_group")?.trim());
  const workplace_details = sanitizeInput(formData.get("workplace_details")?.trim());
  
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

  const name = sanitizeInput(formData.get("name")?.trim());
  const phone = sanitizeInput(formData.get("phone")?.trim());
  const room_number = sanitizeInput(formData.get("room_number") || null);
  const status = sanitizeInput(formData.get("status")?.trim());
  const move_in_date = formData.get("move_in_date") || null;
  const permanent_address = sanitizeInput(formData.get("permanent_address")?.trim() || null);
  const father_mother_name = sanitizeInput(formData.get("father_mother_name")?.trim() || null);
  const parent_contact_number = sanitizeInput(formData.get("parent_contact_number")?.trim() || null);
  const blood_group = sanitizeInput(formData.get("blood_group")?.trim() || null);
  const workplace_details = sanitizeInput(formData.get("workplace_details")?.trim() || null);

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

export async function deleteTenant(id) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase
    .from("tenants")
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting tenant:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true };
}

export async function updateTenantStatusAndRoom(id, status, roomNumber) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const { error } = await supabase
    .from("tenants")
    .update({ status, room_number: roomNumber })
    .eq('id', id);

  if (error) {
    console.error("Error updating tenant status/room:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard");
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
  const issue = sanitizeInput(formData.get("issue")?.trim());
  const category = sanitizeInput(formData.get("category")?.trim());
  const priority = sanitizeInput(formData.get("priority")?.trim());

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

  const title = sanitizeInput(formData.get("title")?.trim());
  const content = sanitizeInput(formData.get("content")?.trim());

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
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

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
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

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

export async function submitTenantPayment(transactionId, paymentReference, screenshotUrl) {
  if (!transactionId || !paymentReference) {
    return { success: false, error: "Transaction ID and payment reference are required." };
  }

  const { error } = await supabase.from("transactions")
    .update({
      payment_reference: paymentReference,
      payment_screenshot_url: screenshotUrl || null
    })
    .eq('id', transactionId);

  if (error) {
    console.error("Error submitting tenant payment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/dues");
  return { success: true };
}

export async function requestVisitorPass(propertyId, tenantId, name, phone, relationship, visitDate, purpose) {
  if (!propertyId || !tenantId || !name || !phone || !relationship || !visitDate || !purpose) {
    return { success: false, error: "All fields are required." };
  }

  const { error } = await supabase.from("visitors").insert([{
    property_id: propertyId,
    tenant_id: tenantId,
    name: name.trim(),
    phone: phone.trim(),
    relationship: relationship.trim(),
    visit_date: visitDate,
    purpose: purpose.trim(),
    status: 'Requested'
  }]);

  if (error) {
    console.error("Error requesting visitor pass:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/visitors");
  return { success: true };
}

export async function updateVisitorStatus(visitorId, status) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  if (!visitorId || !status) {
    return { success: false, error: "Visitor ID and status are required." };
  }

  const { error } = await supabase.from("visitors")
    .update({ status })
    .eq('id', visitorId);

  if (error) {
    console.error("Error updating visitor status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/visitors");
  return { success: true };
}

export async function addRoomAsset(propertyId, roomId, name, serialNumber, status) {
  if (!propertyId || !roomId || !name) {
    return { success: false, error: "Property ID, room ID, and asset name are required." };
  }

  const { error } = await supabase.from("room_assets").insert([{
    property_id: propertyId,
    room_id: roomId,
    name: name.trim(),
    serial_number: serialNumber ? serialNumber.trim() : null,
    status: status || 'Working'
  }]);

  if (error) {
    console.error("Error adding room asset:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/assets");
  return { success: true };
}

export async function updateRoomAssetStatus(assetId, status) {
  if (!assetId || !status) {
    return { success: false, error: "Asset ID and status are required." };
  }

  const { error } = await supabase.from("room_assets")
    .update({ status })
    .eq('id', assetId);

  if (error) {
    console.error("Error updating room asset status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/assets");
  return { success: true };
}

export async function deleteRoomAsset(assetId) {
  if (!assetId) {
    return { success: false, error: "Asset ID is required." };
  }

  const { error } = await supabase.from("room_assets").delete().eq('id', assetId);

  if (error) {
    console.error("Error deleting room asset:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/assets");
  return { success: true };
}

// -------------------------------------------------------------
// SAAS MULTI-OUTLET SLOT & SUBSCRIPTION ACTIONS
// -------------------------------------------------------------

export async function fetchUnassignedSlotsCount() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user?.user_metadata?.organization_id || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

    const { count, error } = await supabase
      .from("outlet_slots")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "Unassigned");

    if (error) throw error;
    return { success: true, count: count || 0 };
  } catch (err) {
    console.error("Error fetching slots count:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchUnassignedSlots() {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user?.user_metadata?.organization_id || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

    const { data, error } = await supabase
      .from("outlet_slots")
      .select("*")
      .eq("organization_id", orgId)
      .eq("status", "Unassigned");

    if (error) throw error;
    return { success: true, slots: data || [] };
  } catch (err) {
    console.error("Error fetching unassigned slots:", err);
    return { success: false, error: err.message };
  }
}

export async function assignSlotToOutlet(slotId, name, address) {
  try {
    const user = await getAuthenticatedUser();
    const orgId = user?.user_metadata?.organization_id || 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

    // 1. Fetch the slot to get plan and expiry
    const { data: slot, error: slotErr } = await supabase
      .from("outlet_slots")
      .select("*")
      .eq("id", slotId)
      .single();

    if (slotErr || !slot) throw new Error("Slot not found or invalid.");

    // 2. Create the property
    const { data: prop, error: propErr } = await supabase
      .from("properties")
      .insert([{
        name: name.trim(),
        address: address ? address.trim() : "",
        organization_id: orgId,
        subscription_status: 'Active',
        expiry_date: slot.expiry_date
      }])
      .select()
      .single();

    if (propErr) throw propErr;

    // 3. Mark the slot as assigned
    const { error: updateErr } = await supabase
      .from("outlet_slots")
      .update({
        status: 'Assigned',
        assigned_property_id: prop.id
      })
      .eq("id", slotId);

    if (updateErr) throw updateErr;

    revalidatePath("/dashboard", "layout");
    return { success: true, propertyId: prop.id };
  } catch (err) {
    console.error("Error assigning slot:", err);
    return { success: false, error: err.message };
  }
}

export async function purchaseOutletSlots(planName, quantity, propertyNamesList = [], orgId = 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0') {
  try {
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days trial/paid

    for (let i = 0; i < quantity; i++) {
      const name = propertyNamesList[i];
      if (name && name.trim()) {
        // Create property and assign slot directly
        const { data: prop, error: propErr } = await supabase
          .from("properties")
          .insert([{
            name: name.trim(),
            address: "Address Pending Setup",
            organization_id: orgId,
            subscription_status: 'Active',
            expiry_date: expiry
          }])
          .select()
          .single();

        if (propErr) throw propErr;

        const { error: slotErr } = await supabase
          .from("outlet_slots")
          .insert([{
            organization_id: orgId,
            plan_name: planName,
            status: 'Assigned',
            assigned_property_id: prop.id,
            expiry_date: expiry
          }]);

        if (slotErr) throw slotErr;
      } else {
        // Create as unassigned slot
        const { error: slotErr } = await supabase
          .from("outlet_slots")
          .insert([{
            organization_id: orgId,
            plan_name: planName,
            status: 'Unassigned',
            expiry_date: expiry
          }]);

        if (slotErr) throw slotErr;
      }
    }

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (err) {
    console.error("Error purchasing slots:", err);
    return { success: false, error: err.message };
  }
}

export async function cancelRenewal(propertyId) {
  try {
    // Locate the slot
    const { data: slot } = await supabase
      .from("outlet_slots")
      .select("id")
      .eq("assigned_property_id", propertyId)
      .limit(1);

    if (slot && slot.length > 0) {
      await supabase
        .from("outlet_slots")
        .update({ status: 'Cancelled' })
        .eq("id", slot[0].id);
    }

    revalidatePath("/dashboard/settings/outlets");
    return { success: true };
  } catch (err) {
    console.error("Error cancelling renewal:", err);
    return { success: false, error: err.message };
  }
}

export async function deactivateOutlet(propertyId) {
  try {
    const { error } = await supabase
      .from("properties")
      .update({ subscription_status: 'expired' })
      .eq("id", propertyId);

    if (error) throw error;

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings/outlets");
    return { success: true };
  } catch (err) {
    console.error("Error deactivating property:", err);
    return { success: false, error: err.message };
  }
}

export async function reactivateOutlet(propertyId, slotId) {
  try {
    // 1. Fetch the slot to get expiry
    const { data: slot, error: slotErr } = await supabase
      .from("outlet_slots")
      .select("*")
      .eq("id", slotId)
      .single();

    if (slotErr || !slot) throw new Error("Slot not found.");

    // 2. Link property to slot & make Active
    const { error: propErr } = await supabase
      .from("properties")
      .update({
        subscription_status: 'Active',
        expiry_date: slot.expiry_date
      })
      .eq("id", propertyId);

    if (propErr) throw propErr;

    // 3. Mark slot as assigned
    const { error: slotUpdateErr } = await supabase
      .from("outlet_slots")
      .update({
        status: 'Assigned',
        assigned_property_id: propertyId
      })
      .eq("id", slotId);

    if (slotUpdateErr) throw slotUpdateErr;

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard/settings/outlets");
    return { success: true };
  } catch (err) {
    console.error("Error reactivating property:", err);
    return { success: false, error: err.message };
  }
}

