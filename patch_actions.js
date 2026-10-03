const fs = require('fs');
const path = 'src/app/actions.js';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('sendTenantNotification')) {
  // Add import at the top
  code = code.replace(
    'import { revalidatePath } from "next/cache";',
    'import { revalidatePath } from "next/cache";\nimport { sendTenantNotification } from "@/utils/notifications";'
  );

  // 1. Patch updateComplaintStatus
  const compOld = `
    const { error } = await supabase
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
`;
  const compNew = `
    const { data: complaintData, error: fetchErr } = await supabase.from('complaints').select('tenant_id, issue').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const { error } = await supabase
      .from('complaints')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;

    if (complaintData?.tenant_id) {
      await sendTenantNotification({
        tenantId: complaintData.tenant_id,
        title: "Complaint Status Updated",
        message: \`Your complaint regarding "\${complaintData.issue}" has been marked as \${newStatus}.\`,
        type: "COMPLAINT_UPDATE"
      });
    }
`;
  code = code.replace(compOld, compNew);

  // 2. Patch updateLeaveRequestStatus
  const leaveOld = `
    const { error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', leaveId);

    if (error) throw error;
`;
  const leaveNew = `
    const { data: leaveData, error: fetchErr } = await supabase.from('leave_requests').select('tenant_id, start_date').eq('id', leaveId).single();
    if (fetchErr) throw fetchErr;

    const { error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', leaveId);

    if (error) throw error;

    if (leaveData?.tenant_id) {
      await sendTenantNotification({
        tenantId: leaveData.tenant_id,
        title: \`Leave Request \${status}\`,
        message: \`Your leave request starting on \${new Date(leaveData.start_date).toLocaleDateString()} has been \${status.toLowerCase()}.\`,
        type: "LEAVE_UPDATE"
      });
    }
`;
  code = code.replace(leaveOld, leaveNew);

  // 3. Patch updateTransactionStatus (Rent Paid)
  const transOld = `
    const { error } = await supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;
`;
  const transNew = `
    const { data: txData, error: fetchErr } = await supabase.from('transactions').select('tenant_id, amount, category').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const { error } = await supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;

    if (txData?.tenant_id && newStatus === 'Completed' && txData.category === 'Rent') {
      await sendTenantNotification({
        tenantId: txData.tenant_id,
        title: "Payment Received",
        message: \`We have successfully received your rent payment of ₹\${txData.amount}. Thank you!\`,
        type: "PAYMENT_CONFIRMED"
      });
    }
`;
  code = code.replace(transOld, transNew);

  fs.writeFileSync(path, code);
}
