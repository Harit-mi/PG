import styles from "../tenants/page.module.css";
import { Search, Phone, MoreVertical, Briefcase } from "lucide-react";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import EmployeeActionMenu from "@/components/EmployeeActionMenu";
import Link from "next/link";
import { cookies } from "next/headers";
import { supabase } from "@/utils/supabase";
import EmployeesClient from "./EmployeesClient";

export const revalidate = 0;

export default async function EmployeesPage() {
  const propertyId = (await cookies()).get("activePropertyId")?.value;
  
  let employeeQuery = supabase.from('employees').select('*, properties(name)').order('name');
  
  if (propertyId && propertyId !== 'all') {
    employeeQuery = employeeQuery.eq('property_id', propertyId);
  }
  
  const { data: employees, error } = await employeeQuery;

  if (error) {
    console.error("Error fetching employees:", error);
  }

  const displayEmployees = employees?.length > 0 ? employees : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Employee Management</h1>
          <p className={styles.subtitle}>Manage staff, salaries, and assignments.</p>
        </div>
        <AddEmployeeModal buttonClass={styles.addButton} />
      </div>

      <EmployeesClient initialEmployees={displayEmployees} />
    </div>
  );
}
