import styles from "./page.module.css";
import { supabase } from "@/utils/supabase";
import { cookies } from "next/headers";
import DuesClient from "./DuesClient";

export const revalidate = 0;

export default async function DuesPage() {
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  
  // Fetch all income transactions for filtering
  let query = supabase
    .from('transactions')
    .select('*, tenants(name, phone, room_number)')
    .eq('type', 'Income')
    .order('date', { ascending: false });

  if (propertyId && propertyId !== 'all') {
    query = query.eq('property_id', propertyId);
  }
  
  const { data: allDues, error } = await query;
  if (error) console.error("Error fetching dues:", error);

  let paymentMethods = [];
  if (propertyId && propertyId !== 'all') {
    const { data: pmData } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('property_id', propertyId);
    if (pmData) paymentMethods = pmData;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pending Dues & Payments</h1>
          <p className={styles.subtitle}>Collect outstanding payments and track rent history.</p>
        </div>
      </div>
      
      <DuesClient initialDues={allDues || []} propertyId={propertyId} paymentMethods={paymentMethods} />
    </div>
  );
}
