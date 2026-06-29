"use client";

import { Eye, Edit, Trash2, Building, Receipt, UserX } from "lucide-react";
import ActionDropdown from "./ActionDropdown";
import { useRouter } from "next/navigation";

export default function EmployeeActionMenu({ employee }) {
  const router = useRouter();

  const actions = [
    {
      label: "View Profile",
      icon: <Eye size={14} />,
      onClick: () => router.push(`/dashboard/employees/${employee.id}`)
    },
    {
      label: "Edit Details",
      icon: <Edit size={14} />,
      onClick: () => alert(`Edit employee ${employee.name}`)
    },
    {
      label: "Assign PG",
      icon: <Building size={14} />,
      onClick: () => alert(`Assign PG for ${employee.name}`)
    },
    {
      label: "Salary History",
      icon: <Receipt size={14} />,
      onClick: () => alert(`View salary history for ${employee.name}`)
    },
    {
      label: "Deactivate",
      icon: <UserX size={14} />,
      onClick: () => alert(`Deactivate ${employee.name}`)
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => alert(`Delete ${employee.name}`)
    }
  ];

  return <ActionDropdown actions={actions} />;
}
