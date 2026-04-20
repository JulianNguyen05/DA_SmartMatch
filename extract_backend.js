const fs = require('fs');
const path = require('path');

// Cấu hình đường dẫn
const sourceDir = './backend-core'; 
const outputFile = 'backend_full_code.txt';

// Các định dạng file muốn lấy code (bỏ qua file ảnh, file build, .jar, .iml...)
const allowedExtensions = ['.java', '.xml', '.yml', '.yaml', '.properties'];

// Các thư mục muốn bỏ qua để tránh rác
const ignoreDirs = ['.git', '.mvn', 'target', 'test'];

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
            // Nếu là file, kiểm tra đuôi file
            const ext = path.extname(item);
            if (allowedExtensions.includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    
                    // Ghi Header phân cách giữa các file cho dễ đọc
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
console.log('Đang tiến hành trích xuất code...');
const stream = fs.createWriteStream(outputFile, { flags: 'w' });

try {
    extractCode(sourceDir, stream);
    console.log(`✅ Hoàn tất! Toàn bộ code đã được gộp vào file: ${outputFile}`);
} catch (error) {
    console.error('Đã xảy ra lỗi trong quá trình quét:', error);
} finally {
    stream.end();
}