import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

// This endpoint should be protected, e.g., by checking an Authorization header 
// if triggered by an external cron service (like Vercel Cron).
export async function POST(request) {
  try {
    // 1. Fetch all active tenants and their room details
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, name, property_id, room_number, rooms(rent_per_bed)")
      .eq("status", "Active");

    if (tenantsError) throw tenantsError;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const invoicesToCreate = [];

    // 2. Iterate and check for existing rent transactions for this month
    for (const tenant of tenants) {
      if (!tenant.rooms || !tenant.rooms.rent_per_bed) continue;

      // Check if rent transaction already exists for this month
      const { data: existingDues, error: duesError } = await supabase
        .from("transactions")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("category", "Rent")
        .gte("date", startOfMonth.toISOString().split("T")[0]);

      if (duesError) console.error("Error checking existing dues:", duesError);

      if (!existingDues || existingDues.length === 0) {
        // No due generated yet this month, so we queue it
        invoicesToCreate.push({
          tenant_id: tenant.id,
          property_id: tenant.property_id,
          type: "Income",
          category: "Rent",
          amount: tenant.rooms.rent_per_bed,
          status: "Pending", // Important: Set to Pending
          date: startOfMonth.toISOString().split("T")[0] // 1st of the month
        });
      }
    }

    // 3. Bulk insert the pending invoices
    if (invoicesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(invoicesToCreate);
      
      if (insertError) throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Generated ${invoicesToCreate.length} pending rent invoices.` 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
