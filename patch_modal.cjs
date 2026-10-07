const fs = require('fs');

let content = fs.readFileSync('src/components/AddRoomModal.js', 'utf8');

// Import useRouter
content = content.replace(
  /import \{ addRoom \} from "@\/app\/actions";/,
  `import { addRoom } from "@/app/actions";\nimport { useRouter } from "next/navigation";`
);

// Add router instance
content = content.replace(
  /const \[error, setError\] = useState\(null\);/,
  `const [error, setError] = useState(null);\n  const router = useRouter();`
);

// Add router.refresh()
content = content.replace(
  /if \(res\.success\) \{\n      form\.reset\(\);\n      setIsOpen\(false\);\n    \}/,
  `if (res.success) {\n      form.reset();\n      setIsOpen(false);\n      router.refresh();\n    }`
);

fs.writeFileSync('src/components/AddRoomModal.js', content);
