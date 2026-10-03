require('dotenv').config({ path: '.env.local' });
const { sendTenantNotification } = require('./src/utils/notifications.js');

async function run() {
  console.log("--- RUNNING MOCK NOTIFICATION TEST ---");
  await sendTenantNotification({
    tenantId: "12345",
    title: "Test Alert",
    message: "This is a test notification",
    type: "TEST"
  });
}
run();
