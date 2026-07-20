// src/utils/fileUrl.js
// Backend trả về đường dẫn TƯƠNG ĐỐI cho file tĩnh (avatar, logo công ty, cv...).
// Thực tế đã quan sát: giá trị có thể tới ở 1 trong 2 dạng tuỳ chỗ gọi:
//   - "avatars/1_xxx.jpg"          (không có tiền tố "uploads/")
//   - "uploads/avatars/1_xxx.jpg"  (đã có sẵn tiền tố "uploads/")
// Cả 2 đều được WebConfig map ra cùng 1 nơi vật lý qua "/uploads/**", nên hàm
// này CHUẨN HÓA: luôn bỏ tiền tố "uploads/" nếu có sẵn, rồi mới thêm lại đúng
// 1 lần — tránh bị lặp đôi thành "/uploads/uploads/...".
//
// axiosClient.baseURL lại có hậu tố "/api/v1" (dùng cho gọi API), nên KHÔNG thể
// dùng thẳng cho file tĩnh — cần bỏ "/api/v1" để lấy đúng origin của backend.

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const BACKEND_ORIGIN = RAW_API_BASE.replace(/\/api\/v1\/?$/, '');

/**
 * Ghép đường dẫn tương đối (backend trả về) thành URL đầy đủ để dùng trong
 * <img src>, <a href>... Trả về null nếu không có path.
 *
 * @param {string} relativePath - vd "avatars/1_x.jpg" hoặc "uploads/avatars/1_x.jpg"
 * @returns {string|null}
 */
export const getFileUrl = (relativePath) => {
  if (!relativePath) return null;

  // Nếu backend đổi ý trả URL tuyệt đối trong tương lai thì vẫn chạy đúng.
  // "data:" và "blob:" là URI ảnh preview tạo trực tiếp trên trình duyệt (vd
  // FileReader.readAsDataURL khi người dùng vừa chọn ảnh mới trong CV editor,
  // chưa kịp upload lên server) — PHẢI trả nguyên, không được ghép thêm tiền
  // tố BACKEND_ORIGIN/uploads/ vào, nếu không sẽ tạo ra 1 URL rác không tồn tại.
  if (/^(https?|data|blob):/i.test(relativePath)) return relativePath;

  const cleanPath = relativePath
    .replace(/^\/+/, '')       // bỏ dấu "/" ở đầu nếu có
    .replace(/^uploads\/+/i, ''); // bỏ tiền tố "uploads/" nếu backend đã trả sẵn

  return `${BACKEND_ORIGIN}/uploads/${cleanPath}`;
};

export default getFileUrl;
