const fs = require('fs');
let code = fs.readFileSync('src/app/super-admin/customers/CustomersClient.js', 'utf8');

if (!code.includes('useMemo')) {
    code = code.replace(/import { useState } from "react";/, 'import { useState, useMemo } from "react";');
}

const filterLogic = `const filteredCustomers = customers.filter(cust => {
    const matchesSearch = 
      (cust.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (cust.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (cust.phone || "").toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "All") matchesStatus = cust.status === statusFilter;

    return matchesSearch && matchesStatus;
  });`;

const memoizedLogic = `const filteredCustomers = useMemo(() => {
    return customers.filter(cust => {
      const matchesSearch = 
        (cust.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (cust.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (cust.phone || "").toLowerCase().includes(search.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter !== "All") matchesStatus = cust.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);`;

code = code.replace(filterLogic, memoizedLogic);
fs.writeFileSync('src/app/super-admin/customers/CustomersClient.js', code);
