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
