const fs = require('fs');
const path = require('path');

// --- Cấu hình ---
const targetDir = './frontend-app'; // Thư mục cần lấy code
const outputFile = 'frontend_full_code.txt'; // Tên file xuất ra

// Bỏ qua các thư mục và đuôi file không cần thiết
const ignoreDirs = ['node_modules', 'dist', '.git', 'public', 'assets'];
const ignoreExts = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.css', '.html'];
const ignoreFiles = ['package-lock.json', outputFile, 'extractCode.js'];

let outputContent = '';

function readDirRecursive(currentPath) {
    if (!fs.existsSync(currentPath)) {
        console.error(`Không tìm thấy thư mục: ${currentPath}`);
        return;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
            if (!ignoreDirs.includes(entry.name)) {
                readDirRecursive(fullPath);
            }
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (!ignoreExts.includes(ext) && !ignoreFiles.includes(entry.name)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const relativePath = path.relative('.', fullPath).replace(/\\/g, '/'); // Chuẩn hóa đường dẫn
                    
                    outputContent += `\n/* ${'='.repeat(60)} */\n`;
                    outputContent += `/* File: ${relativePath} */\n`;
                    outputContent += `/* ${'='.repeat(60)} */\n\n`;
                    outputContent += content + '\n';
                } catch (err) {
                    console.error(`Lỗi đọc file ${fullPath}:`, err.message);
                }
            }
        }
    }
}

console.log('Đang gom code từ frontend-app...');
readDirRecursive(targetDir);

if (outputContent) {
    fs.writeFileSync(outputFile, outputContent, 'utf8');
    console.log(`✅ Hoàn tất! Toàn bộ code đã được lưu vào file: ${outputFile}`);
} else {
    console.log('⚠️ Không tìm thấy file code nào hợp lệ.');
}