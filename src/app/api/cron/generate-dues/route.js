import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request) {
  try {
    // 0. Verify Authorization Header against CRON_SECRET if configured
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: "Unauthorized cron execution." }, { status: 401 });
    }

    const supabase = createAdminClient();
    
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

    // 2. Iterate and check for existing rent transactions for this month (Idempotent Check)
    for (const tenant of tenants) {
      if (!tenant.rooms || !tenant.rooms.rent_per_bed) continue;

      const { data: existingDues } = await supabase
        .from("transactions")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("type", "Income")
        .eq("category", "Rent")
        .gte("date", startOfMonth.toISOString());

      if (!existingDues || existingDues.length === 0) {
        invoicesToCreate.push({
          property_id: tenant.property_id,
          tenant_id: tenant.id,
          type: "Income",
          category: "Rent",
          amount: tenant.rooms.rent_per_bed,
          status: "Pending",
          date: new Date().toISOString().split('T')[0]
        });
      }
    }

    if (invoicesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(invoicesToCreate);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${invoicesToCreate.length} due invoices.`
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
