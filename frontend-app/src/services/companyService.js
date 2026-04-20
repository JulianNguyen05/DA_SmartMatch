import api from './api';

export const getMyCompany = async () => {
  try {
    const response = await api.get('/employer/company');
    return response.data;
  } catch {
    // ÉP BUỘC TRẢ VỀ NULL NẾU CÓ LỖI (Bao gồm cả lỗi 500 từ Backend)
    // Để hệ thống hiểu là "Chưa có công ty" và cho phép hiển thị Form nhập liệu
    console.warn("Tài khoản chưa có công ty hoặc đang chờ khởi tạo.");
    return null;
  }
};

export const saveCompany = async (companyData) => {
  try {
    // Gọi chung 1 API POST cho cả tạo mới và cập nhật (Backend đã lo logic này)
    const response = await api.post('/employer/company', companyData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Lỗi khi lưu thông tin công ty');
  }
};