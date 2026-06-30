"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import TransactionActionMenu from "@/components/TransactionActionMenu";

export default function FinancesClient({ initialTransactions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All"); // All, Income, Expense
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and Search
  const filteredTxns = initialTransactions.filter((txn) => {
    const searchMatch = 
      txn.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.tenants?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.employees?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const typeMatch = filterType === "All" || txn.type === filterType;
    
    return searchMatch && typeMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTxns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTxns = filteredTxns.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={`${styles.ledgerContainer} glass`}>
      <div className={styles.ledgerHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3>Recent Transactions</h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className={styles.searchBar} style={{ margin: 0, padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', marginLeft: '0.5rem', width: '150px' }}
            />
          </div>
          
          <select 
            value={filterType} 
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            style={{ padding: '0.4rem', background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none' }}
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
      </div>
      
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paginatedTxns.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }} className={styles.textMuted}>
                No transactions found.
              </td>
            </tr>
          ) : (
            paginatedTxns.map((txn) => (
              <tr key={txn.id}>
                <td className={styles.textMuted}>{txn.id.substring(0, 8)}</td>
                <td>{new Date(txn.date).toLocaleDateString()}</td>
                <td className={styles.fw600}>
                  {txn.tenants ? `${txn.tenants.name} (${txn.tenants.room_number || ''})` : 
                   txn.employees ? `Salary: ${txn.employees.name}` : 
                   txn.category}
                </td>
                <td>{txn.category}</td>
                <td className={txn.type === "Income" ? styles.textSuccess : styles.textDanger}>
                  {txn.type === "Income" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${txn.status === "Paid" ? styles.Completed : styles.Pending}`}>
                    {txn.status}
                  </span>
                </td>
                <td style={{ width: '40px' }}>
                  <TransactionActionMenu transaction={txn} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTxns.length)} of {filteredTxns.length} entries
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
