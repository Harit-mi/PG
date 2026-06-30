"use client";

import { useState } from "react";
import { Eye, Edit, Trash2, Building, Receipt, UserX } from "lucide-react";
import ActionDropdown from "./ActionDropdown";
import { useRouter } from "next/navigation";
import EditEmployeeModal from "./EditEmployeeModal";
import { deleteEmployee } from "@/app/actions";

export default function EmployeeActionMenu({ employee }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      const result = await deleteEmployee(employee.id);
      if (!result.success) {
        alert(result.error || "Failed to delete employee");
      }
    }
  };

  const actions = [
    {
      label: "View Profile",
      icon: <Eye size={14} />,
      onClick: () => router.push(`/dashboard/employees/${employee.id}`)
    },
    {
      label: "Edit Details",
      icon: <Edit size={14} />,
      onClick: () => setShowEdit(true)
    },
    {
      label: "Assign PG",
      icon: <Building size={14} />,
      onClick: () => alert(`Assign PG for ${employee.name} (Coming soon)`)
    },
    {
      label: "Salary History",
      icon: <Receipt size={14} />,
      onClick: () => alert(`View salary history for ${employee.name} (Coming soon)`)
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: handleDelete
    }
  ];

  return (
    <>
      <ActionDropdown actions={actions} />
      {showEdit && (
        <EditEmployeeModal employee={employee} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
