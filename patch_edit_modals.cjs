const fs = require('fs');

const files = [
  'src/components/EditComplaintModal.js',
  'src/components/EditEmployeeModal.js',
  'src/components/EditTenantModal.js',
  'src/components/EditTransactionModal.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import { useRouter } from "next/navigation";')) {
    content = content.replace(
      /import \{ useState \}.*?;/,
      match => `${match}\nimport { useRouter } from "next/navigation";`
    );
  }

  if (!content.includes('const router = useRouter();')) {
    content = content.replace(
      /const \[loading, setLoading\] = useState\(false\);/,
      `const [loading, setLoading] = useState(false);\n  const router = useRouter();`
    );
  }

  content = content.replace(
    /if \(result\.success\) \{\n\s*onClose\(\);\n\s*\}/g,
    `if (result.success) {\n      onClose();\n      router.refresh();\n    }`
  );
  
  content = content.replace(
    /if \(res\.success\) \{\n\s*onClose\(\);\n\s*\}/g,
    `if (res.success) {\n      onClose();\n      router.refresh();\n    }`
  );

  fs.writeFileSync(file, content);
}
