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

  const room_number = formData.get("room_number");
  const type = formData.get("type");
  const rent_per_bed = parseInt(formData.get("rent_per_bed"));
  const capacity = parseInt(formData.get("capacity"));

  if (rent_per_bed <= 0 || capacity <= 0) {
    return { success: false, error: "Rent and capacity must be greater than zero." };
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
  const details = formData.get("details");
  const is_default = formData.get("is_default") === "on";

  const { error } = await supabase.from("payment_methods").insert([{
    property_id,
    type,
    details,
    is_default
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
