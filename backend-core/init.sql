-- Tự động tạo database và user khi container MySQL start lần đầu
CREATE DATABASE IF NOT EXISTS smartmatch_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smartmatch_db;

-- Grant quyền cho user application
GRANT ALL PRIVILEGES ON smartmatch_db.* TO 'smartmatch'@'%';
FLUSH PRIVILEGES;