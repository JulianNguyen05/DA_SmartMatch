// frontend/src/services/authService.js

/**
 * MOCK API Đăng nhập
 */
export const login = async ({ usernameOrEmail, password }) => {
  // Dòng log này để ESLint ghi nhận biến đã được sử dụng
  console.log(`[Mock API] Đang xử lý đăng nhập cho: ${usernameOrEmail}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === "123") {
        reject(new Error("Mật khẩu không đúng! (Đây là lỗi giả lập)"));
      } else {
        resolve({
          token: "mock-jwt-token-smartmatch-12345",
        });
      }
    }, 1500); 
  });
};

/**
 * MOCK API Đăng ký
 */
export const register = async (userData) => {
  // Thêm log để ESLint không báo lỗi unused biến userData
  console.log(`[Mock API] Đang xử lý đăng ký cho email: ${userData.email}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Giả lập case lỗi: Nếu nhập email là "test@gmail.com" thì báo lỗi
      if (userData.email === "test@gmail.com") {
        reject(new Error("Email này đã được sử dụng! (Đây là lỗi giả lập)"));
      } else {
        // Giả lập case thành công
        resolve({
          message: "Đăng ký thành công",
          user: userData,
        });
      }
    }, 1500);
  });
};