import styles from "./page.module.css";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import ExportPdfButton from "@/components/ExportPdfButton";
import ExportExcelButton from "@/components/ExportExcelButton";
import FinancesClient from "./FinancesClient";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getUserPropertyIds } from "@/app/actions";

export const revalidate = 0;

export default async function FinancesPage() {
  const supabase = await createClient();
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  const userPropertyIds = await getUserPropertyIds();

  const effectiveIds = (propertyId && propertyId !== 'all')
    ? (userPropertyIds.includes(propertyId) ? [propertyId] : [])
    : userPropertyIds;

  const [
    { data: transactions },
    { data: tenants },
    { data: employees }
  ] = await Promise.all([
    supabase.from('transactions').select('*, tenants(name, room_number), employees(name, role)').in('property_id', effectiveIds).order('date', { ascending: false }),
    supabase.from('tenants').select('id, name, room_number').in('property_id', effectiveIds).order('name'),
    supabase.from('employees').select('id, name, role').in('property_id', effectiveIds).order('name')
  ]);

  const displayTx = transactions || [];
  const displayTenants = tenants || [];
  const displayEmployees = employees || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Financial Ledger</h1>
          <p className={styles.subtitle}>Track incoming rent, operational expenses, and profit/loss.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <ExportExcelButton transactions={displayTx} />
          <ExportPdfButton transactions={displayTx} />
          <AddTransactionModal tenants={displayTenants} employees={displayEmployees} propertyId={propertyId} />
        </div>
      </div>

      <FinancesClient transactions={displayTx} tenants={displayTenants} employees={displayEmployees} propertyId={propertyId} />
    </div>
  );
}
