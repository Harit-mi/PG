const fs = require('fs');
const path = 'src/app/api/cron/generate-dues/route.js';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('sendTenantNotification')) {
  code = code.replace(
    'import { verifyCronAuth } from "@/utils/cronAuth";',
    'import { verifyCronAuth } from "@/utils/cronAuth";\nimport { sendTenantNotification } from "@/utils/notifications";'
  );

  const insertBlock = `
    if (invoicesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(invoicesToCreate);

      if (insertError) throw insertError;
`;

  const updatedInsertBlock = `
    if (invoicesToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(invoicesToCreate);

      if (insertError) throw insertError;

      // Send Rent Due notifications to all affected tenants
      for (const invoice of invoicesToCreate) {
        await sendTenantNotification({
          tenantId: invoice.tenant_id,
          title: "Rent Payment Due",
          message: \`Dear Tenant, your rent of ₹\${invoice.amount} for the current month has been generated and is now due. Please pay via the Tenant Portal.\`,
          type: "RENT_DUE"
        });
      }
`;

  code = code.replace(insertBlock, updatedInsertBlock);
  fs.writeFileSync(path, code);
}
