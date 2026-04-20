const fs = require('fs');
const path = require('path');

// Cấu hình đường dẫn
const sourceDir = './frontend-app'; 
const outputFile = 'frontend_full_code.txt';

// Các định dạng file code muốn lấy
const allowedExtensions = ['.js', '.jsx', '.css', '.html'];

// Các thư mục và file muốn bỏ qua để file kết quả không bị rác
const ignoreDirs = ['node_modules', '.git', 'dist', 'assets', 'public'];
const ignoreFiles = ['package-lock.json']; // Bỏ qua file lock vì nội dung rất dài

function extractCode(currentPath, outStream) {
    // Đọc tất cả file và thư mục trong đường dẫn hiện tại
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Nếu là thư mục và không nằm trong danh sách bỏ qua thì tiếp tục quét (đệ quy)
            if (!ignoreDirs.includes(item)) {
                extractCode(fullPath, outStream);
            }
        } else {
            // Bỏ qua các file cụ thể trong ignoreFiles
            if (ignoreFiles.includes(item)) continue;

            const ext = path.extname(item);
            
            // Lấy các file có đuôi hợp lệ hoặc các file cấu hình quan trọng (package.json, vite.config.js)
            if (allowedExtensions.includes(ext) || item === 'package.json' || item === 'vite.config.js') {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    
                    // Ghi Header phân cách giữa các file
                    outStream.write(`\n// ==========================================================================\n`);
                    outStream.write(`// File: ${fullPath.replace(/\\/g, '/')}\n`);
                    outStream.write(`// ==========================================================================\n\n`);
                    
                    // Ghi nội dung file
                    outStream.write(content);
                    outStream.write(`\n\n`);
                } catch (err) {
                    console.error(`Lỗi khi đọc file ${fullPath}:`, err.message);
                }
            }
        }
    }
}

// Khởi tạo luồng ghi file
console.log('Đang tiến hành trích xuất code Frontend...');
const stream = fs.createWriteStream(outputFile, { flags: 'w' });

try {
    extractCode(sourceDir, stream);
    console.log(`✅ Hoàn tất! Toàn bộ code frontend đã được gộp vào file: ${outputFile}`);
} catch (error) {
    console.error('Đã xảy ra lỗi trong quá trình quét:', error);
} finally {
    stream.end();
}