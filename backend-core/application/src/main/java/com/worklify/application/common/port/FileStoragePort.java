package com.worklify.application.common.port;

import org.springframework.web.multipart.MultipartFile;

public interface FileStoragePort {
    /**
     * Lưu trữ file và trả về đường dẫn tương đối.
     * @param file       File tải lên từ client
     * @param subDirectory Thư mục con (vd: "cv", "companies/logos")
     * @param prefix     Tiền tố tên file (vd: userId)
     * @return Đường dẫn tương đối để truy cập file
     */
    String storeFile(MultipartFile file, String subDirectory, String prefix);

    /**
     * TẠO MỚI: Lưu trữ file với cấu trúc phân cấp và tên file tùy chỉnh.
     * VD: category = "cv_thumbnails", subFolder = "11", customFileName = "38.jpg"
     * Kết quả: uploads/cv_thumbnails/11/38.jpg
     */
    String storeFile(MultipartFile file, String category, String subFolder, String customFileName);

    /** Lấy dữ liệu file dưới dạng mảng byte */
    byte[] readFile(String filePath);

    /** Xóa file khỏi hệ thống */
    void deleteFile(String filePath);

    /** * TẠO MỚI: Xóa toàn bộ thư mục và nội dung bên trong.
     * Dùng khi xóa User. VD: category = "cv_thumbnails", subFolder = "11"
     */
    void deleteUserFolder(String category, String subFolder);
}