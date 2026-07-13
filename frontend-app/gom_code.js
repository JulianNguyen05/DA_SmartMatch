import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Do ES Module không hỗ trợ sẵn __dirname, ta cần tạo lại nó
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Danh sách các file cần gộp
const filesToExtract = [
  'src/components/shared/cvProfileShared.jsx',
  'src/services/axiosClient.js',
  'src/features/auth/authService.js',
  'src/components/cv-builder/sidebar/DraggableItem.jsx',
  'src/components/cv-builder/sidebar/LayoutSidebar.jsx',
  'src/components/common/Button/index.jsx',
  'src/components/common/Modal/index.jsx',
  'src/components/common/Input/index.jsx'
];

const outputFile = path.join(__dirname, 'exported_cv_context.md');

let combinedContent = '# Ngữ cảnh Code Hiện Tại cho CV Builder\n\n';

filesToExtract.forEach(filePath => {
  const absolutePath = path.join(__dirname, filePath);
  
  if (fs.existsSync(absolutePath)) {
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    const ext = path.extname(filePath).replace('.', '') || 'javascript';
    const lang = ext === 'jsx' ? 'jsx' : 'javascript';

    combinedContent += `## File: \`${filePath}\`\n`;
    combinedContent += `\`\`\`${lang}\n`;
    combinedContent += fileContent;
    combinedContent += `\n\`\`\`\n\n`;
    
    console.log(`✅ Đã gộp thành công: ${filePath}`);
  } else {
    combinedContent += `## File: \`${filePath}\`\n`;
    combinedContent += `> ❌ KHÔNG TÌM THẤY FILE NÀY TRONG HỆ THỐNG.\n\n`;
    
    console.log(`❌ Lỗi - Không tìm thấy: ${filePath}`);
  }
});

try {
  fs.writeFileSync(outputFile, combinedContent, 'utf8');
  console.log(`\n🎉 HOÀN TẤT! Toàn bộ code đã được lưu vào file: ${outputFile}`);
} catch (error) {
  console.error('\n❌ Có lỗi xảy ra khi ghi file đầu ra:', error);
}