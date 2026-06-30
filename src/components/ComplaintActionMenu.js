"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import ActionDropdown from "./ActionDropdown";
import EditComplaintModal from "./EditComplaintModal";
import { deleteComplaint } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ComplaintActionMenu({ ticket }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this complaint: "${ticket.issue}"?`)) {
      const result = await deleteComplaint(ticket.id);
      if (!result.success) {
        alert(result.error || "Failed to delete complaint");
      } else {
        router.refresh();
      }
    }
  };

  const actions = [
    {
      label: "Edit",
      icon: <Edit size={14} />,
      onClick: () => setShowEdit(true)
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
        <EditComplaintModal 
          ticket={ticket} 
          onClose={() => setShowEdit(false)} 
        />
      )}
    </>
  );
}
