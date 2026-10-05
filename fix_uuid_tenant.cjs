const fs = require('fs');

// Fix page.js
let pageContent = fs.readFileSync('src/app/pg/[property_id]/tenant-portal/page.js', 'utf8');
const uuidRegexStr = 'const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;\n  if (!uuidRegex.test(property_id)) {\n    return <TenantPortalClient propertyId={property_id} propertyName="Demo PG" todayMenu={null} weeklyMenu={[]} paymentMethods={[]} notices={[]} />;\n  }\n\n  // 1. Fetch property info';
pageContent = pageContent.replace('// 1. Fetch property info', uuidRegexStr);
fs.writeFileSync('src/app/pg/[property_id]/tenant-portal/page.js', pageContent);

// Fix actions.js
let actionsContent = fs.readFileSync('src/app/pg/[property_id]/tenant-portal/actions.js', 'utf8');
const validateUuidStr = `
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(propertyId)) {
    return { success: false, error: "Invalid Property ID. This is a demo view." };
  }
`;

actionsContent = actionsContent.replace('export async function verifyTenantPhone(prop1, prop2) {\n  let propertyId, phone;\n  if (typeof prop1 === \'object\' && prop1 !== null) {\n    propertyId = prop1.propertyId;\n    phone = prop1.phone;\n  } else {\n    propertyId = prop1;\n    phone = prop2;\n  }\n', 
`export async function verifyTenantPhone(prop1, prop2) {
  let propertyId, phone;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    phone = prop1.phone;
  } else {
    propertyId = prop1;
    phone = prop2;
  }
${validateUuidStr}`);

actionsContent = actionsContent.replace('export async function submitLeaveRequest(prop1, prop2, prop3) {\n  // Support both submitLeaveRequest({ propertyId, tenantId, ... }) and submitLeaveRequest(propertyId, tenantId, leaveData)\n  let propertyId, tenantId, leaveData;\n  if (typeof prop1 === \'object\' && prop1 !== null) {\n    propertyId = prop1.propertyId;\n    tenantId = prop1.tenantId;\n    leaveData = prop1;\n  } else {\n    propertyId = prop1;\n    tenantId = prop2;\n    leaveData = prop3 || {};\n  }\n',
`export async function submitLeaveRequest(prop1, prop2, prop3) {
  let propertyId, tenantId, leaveData;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    tenantId = prop1.tenantId;
    leaveData = prop1;
  } else {
    propertyId = prop1;
    tenantId = prop2;
    leaveData = prop3 || {};
  }
${validateUuidStr}`);

actionsContent = actionsContent.replace('export async function submitComplaint(prop1, prop2, prop3) {\n  let propertyId, tenantId, complaintData;\n  if (typeof prop1 === \'object\' && prop1 !== null) {\n    propertyId = prop1.propertyId;\n    tenantId = prop1.tenantId;\n    complaintData = prop1;\n  } else {\n    propertyId = prop1;\n    tenantId = prop2;\n    complaintData = prop3 || {};\n  }\n',
`export async function submitComplaint(prop1, prop2, prop3) {
  let propertyId, tenantId, complaintData;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    tenantId = prop1.tenantId;
    complaintData = prop1;
  } else {
    propertyId = prop1;
    tenantId = prop2;
    complaintData = prop3 || {};
  }
${validateUuidStr}`);

actionsContent = actionsContent.replace('export async function requestVisitorPass(prop1, prop2, prop3) {\n  let propertyId, tenantId, visitorData;\n  if (typeof prop1 === \'object\' && prop1 !== null) {\n    propertyId = prop1.propertyId;\n    tenantId = prop1.tenantId;\n    visitorData = prop1;\n  } else {\n    propertyId = prop1;\n    tenantId = prop2;\n    visitorData = prop3 || {};\n  }\n',
`export async function requestVisitorPass(prop1, prop2, prop3) {
  let propertyId, tenantId, visitorData;
  if (typeof prop1 === 'object' && prop1 !== null) {
    propertyId = prop1.propertyId;
    tenantId = prop1.tenantId;
    visitorData = prop1;
  } else {
    propertyId = prop1;
    tenantId = prop2;
    visitorData = prop3 || {};
  }
${validateUuidStr}`);

actionsContent = actionsContent.replace('export async function submitPublicVisitor(property_id, formData) {\n  if (!property_id || !formData) {\n    return { success: false, error: "Missing required visitor parameters." };\n  }\n',
`export async function submitPublicVisitor(property_id, formData) {
  if (!property_id || !formData) {
    return { success: false, error: "Missing required visitor parameters." };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(property_id)) {
    return { success: false, error: "Invalid Property ID. This is a demo view." };
  }
`);

fs.writeFileSync('src/app/pg/[property_id]/tenant-portal/actions.js', actionsContent);
console.log("Fixed UUID validation.");
