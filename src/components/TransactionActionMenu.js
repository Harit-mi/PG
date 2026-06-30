"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import ActionDropdown from "./ActionDropdown";
import EditTransactionModal from "./EditTransactionModal";
import { deleteTransaction } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function TransactionActionMenu({ transaction, onRefresh }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete this ${transaction.type} transaction of ₹${transaction.amount}?`)) {
      const result = await deleteTransaction(transaction.id);
      if (!result.success) {
        alert(result.error || "Failed to delete transaction");
      } else {
        if (onRefresh) onRefresh();
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
        <EditTransactionModal 
          transaction={transaction} 
          onClose={() => setShowEdit(false)} 
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}
