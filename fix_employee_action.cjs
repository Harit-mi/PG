const fs = require('fs');
let content = fs.readFileSync('src/app/actions.js', 'utf8');

// Update addEmployee to handle aadhar_card upload
const newAddEmployee = `export async function addEmployee(formData) {
  const supabase = await createServerSupabaseClient();
  const property_id = (await cookies()).get('activePropertyId')?.value;
  const subCheck = await checkSubscription(property_id);
  if (!subCheck.success) return subCheck;

  const name = formData.get("name");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const role = formData.get("role");
  const salary = parseInt(formData.get("salary"));
  
  let aadhar_url = null;
  const aadharFile = formData.get("aadhar_card");
  if (aadharFile && aadharFile.size > 0) {
    const fileExt = aadharFile.name.split('.').pop();
    const fileName = \`\${Date.now()}-\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
    // Using receipts bucket for now as a general storage, or try documents if it exists
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(\`aadhars/\${fileName}\`, aadharFile);
      
    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path);
      aadhar_url = publicUrlData.publicUrl;
    }
  }
  
  const { error } = await supabase.from("employees").insert([{
    name,
    phone,
    address,
    role,
    salary,
    status: "Active",
    property_id,
    photo_url: aadhar_url // storing in photo_url for now since it exists in schema
  }]);

  if (error) {
    console.error("Error adding employee:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}`;

content = content.replace(/export async function addEmployee\(formData\) \{[\s\S]*?return \{ success: true \};\n\}/, newAddEmployee);
fs.writeFileSync('src/app/actions.js', content);
