const fs = require('fs');

const files = [
  'src/components/AddComplaintModal.js',
  'src/components/AddEmployeeModal.js',
  'src/components/AddLeaveModal.js',
  'src/components/AddNoticeModal.js',
  'src/components/AddTenantModal.js',
  'src/components/AddTransactionModal.js'
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
      /const \[isOpen, setIsOpen\] = useState\(false\);/,
      `const [isOpen, setIsOpen] = useState(false);\n  const router = useRouter();`
    );
  }

  content = content.replace(
    /if \(res\.success\) \{\n\s*setIsOpen\(false\);\n\s*\}/g,
    `if (res.success) {\n      setIsOpen(false);\n      router.refresh();\n    }`
  );
  
  content = content.replace(
    /if \(res\.success\) \{\n\s*e\.target\.reset\(\);\n\s*setIsOpen\(false\);\n\s*\}/g,
    `if (res.success) {\n      e.target.reset();\n      setIsOpen(false);\n      router.refresh();\n    }`
  );

  fs.writeFileSync(file, content);
}
