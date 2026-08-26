import styles from "./page.module.css";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import AddTransactionModal from "@/components/AddTransactionModal";
import ExportPdfButton from "@/components/ExportPdfButton";
import ExportExcelButton from "@/components/ExportExcelButton";
import FinancesClient from "./FinancesClient";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

export default async function FinancesPage() {
  const supabase = await createClient();
  const propertyId = (await cookies()).get("activePropertyId")?.value;

  let txQuery = supabase
    .from('transactions')
    .select('*, tenants(name, room_number), employees(name, role)')
    .order('date', { ascending: false });

  let tenantsQuery = supabase.from('tenants').select('id, name, room_number').order('name');
  let employeesQuery = supabase.from('employees').select('id, name, role').order('name');

  if (propertyId && propertyId !== 'all') {
    txQuery = txQuery.eq('property_id', propertyId);
    tenantsQuery = tenantsQuery.eq('property_id', propertyId);
    employeesQuery = employeesQuery.eq('property_id', propertyId);
  }

  const [{ data: transactions }, { data: tenants }, { data: employees }] = await Promise.all([
    txQuery,
    tenantsQuery,
    employeesQuery
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
