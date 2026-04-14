// frontend-app/src/services/authService.js

/**
 * Helper tạo mock JWT hợp lệ (có payload role, name, email)
 */
const generateMockJWT = (role, name = "Demo User", email = "demo@smartmatch.vn") => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    role: role.toUpperCase(),
    name,
    email,
    sub: "12345",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // hết hạn sau 1 giờ
  };

  const encodeBase64Url = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `${encodeBase64Url(header)}.${encodeBase64Url(payload)}.fakesignature`;
};

/**
 * MOCK API Đăng nhập
 */
export const login = async ({ usernameOrEmail, password }) => {
  console.log(`[Mock API] Đang xử lý đăng nhập cho: ${usernameOrEmail}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === "123") {
        reject(new Error("Mật khẩu không đúng! (Đây là lỗi giả lập)"));
        return;
      }

      // Demo: Dựa vào email/username để quyết định role
      let role = "CANDIDATE";
      if (usernameOrEmail.toLowerCase().includes("admin")) role = "ADMIN";
      else if (
        usernameOrEmail.toLowerCase().includes("employer") ||
        usernameOrEmail.toLowerCase().includes("hr") ||
        usernameOrEmail.toLowerCase().includes("company")
      ) {
        role = "EMPLOYER";
      }

      const token = generateMockJWT(role, "Demo User", usernameOrEmail);

      resolve({ token });
    }, 1500);
  });
};

/**
 * MOCK API Đăng ký (giữ nguyên)
 */
export const register = async (userData) => {
  console.log(`[Mock API] Đang xử lý đăng ký cho email: ${userData.email}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userData.email === "test@gmail.com") {
        reject(new Error("Email này đã được sử dụng! (Đây là lỗi giả lập)"));
      } else {
        resolve({ message: "Đăng ký thành công", user: userData });
      }
    }, 1500);
  });
};