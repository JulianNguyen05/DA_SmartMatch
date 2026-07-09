const fs = require('fs');
const path = require('path');

// Đường dẫn tới thư mục cv-builder của bạn
const rootDir = 'd:\\2025_2026_II\\DuAn\\da_Worklify\\frontend-app\\src\\components\\cv-builder';
// File kết quả xuất ra
const outputFile = path.join(__dirname, 'cv_builder_all_code.md');

// Hàm đệ quy để quét toàn bộ file trong các thư mục con
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

try {
  const files = getAllFiles(rootDir);
  let outputContent = '# Toàn bộ code thư mục cv-builder\n\n';

  files.forEach(file => {
    // Chỉ lấy các file .js và .jsx
    if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(file, 'utf8');
      // Lấy đường dẫn tương đối để nhìn cho gọn
      const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
      
      outputContent += `## File: \`${relativePath}\`\n\n\`\`\`javascript\n${content}\n\`\`\`\n\n`;
    }
  });

  fs.writeFileSync(outputFile, outputContent);
  console.log(`✅ Thành công! Toàn bộ code đã được xuất ra file: ${outputFile}`);
} catch (error) {
  console.error('❌ Có lỗi xảy ra:', error.message);
}