"use server";

import { supabase } from "@/utils/supabase";
import { revalidatePath } from "next/cache";

export async function addRoom(formData) {
  const room_number = formData.get("room_number");
  const type = formData.get("type");
  const rent_amount = parseInt(formData.get("rent_amount"));
  const capacity = parseInt(formData.get("capacity"));
  
  const { error } = await supabase.from("rooms").insert([{
    room_number,
    type,
    rent_amount,
    capacity,
    status: "Vacant"
  }]);

  if (error) {
    console.error("Error adding room:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/rooms");
  return { success: true };
}

export async function addTenant(formData) {
  const name = formData.get("name");
  const phone = formData.get("phone");
  const room_number = formData.get("room_number");
  
  const { error } = await supabase.from("tenants").insert([{
    name,
    phone,
    room_number,
    status: "Active"
  }]);

  if (error) {
    console.error("Error adding tenant:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true };
}

export async function addTransaction(formData) {
  const type = formData.get("type"); // Income or Expense
  const category = formData.get("category"); // Rent, Electricity, etc.
  const amount = parseInt(formData.get("amount"));
  const tenant_id = formData.get("tenant_id") || null;
  const date = formData.get("date");

  const { error } = await supabase.from("transactions").insert([{
    type,
    category,
    amount,
    tenant_id,
    date,
    status: "Completed"
  }]);

  if (error) {
    console.error("Error adding transaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/finances");
  return { success: true };
}

export async function addComplaint(formData) {
  const tenant_id = formData.get("tenant_id");
  const issue = formData.get("issue");
  const category = formData.get("category");
  const priority = formData.get("priority");

  const { error } = await supabase.from("complaints").insert([{
    tenant_id,
    issue,
    category,
    priority,
    status: "Open"
  }]);

  if (error) {
    console.error("Error adding complaint:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/complaints");
  return { success: true };
}

export async function updateComplaintStatus(id, newStatus) {
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
  const title = formData.get("title");
  const content = formData.get("content");

  const { error } = await supabase.from("notices").insert([{
    title,
    content
  }]);

  if (error) {
    console.error("Error adding notice:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
