"use client";

import { useState } from "react";
import { Eye, Edit, Trash2, CalendarClock, ArrowRightLeft, LogOut, Receipt, FileText } from "lucide-react";
import ActionDropdown from "./ActionDropdown";
import { useRouter } from "next/navigation";
import EditTenantModal from "./EditTenantModal";

export default function TenantActionMenu({ tenant }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const actions = [
    {
      label: "Edit Details",
      icon: <Edit size={14} />,
      onClick: () => setShowEdit(true)
    },
    {
      label: "Notice Period",
      icon: <CalendarClock size={14} />,
      onClick: () => alert(`Mark ${tenant.name} on Notice Period`)
    },
    {
      label: "Shift Room",
      icon: <ArrowRightLeft size={14} />,
      onClick: () => alert(`Shift room for ${tenant.name}`)
    },
    {
      label: "Move Out",
      icon: <LogOut size={14} />,
      onClick: () => alert(`Move out ${tenant.name}`)
    },
    {
      label: "Payment History",
      icon: <Receipt size={14} />,
      onClick: () => alert(`View payments for ${tenant.name}`)
    },
    {
      label: "Documents",
      icon: <FileText size={14} />,
      onClick: () => alert(`View documents for ${tenant.name}`)
    },
    {
      label: "Delete",
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: () => alert(`Delete ${tenant.name}`)
    }
  ];

  return (
    <>
      <ActionDropdown actions={actions} />
      {showEdit && (
        <EditTenantModal tenant={tenant} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
