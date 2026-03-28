import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Sparkles, ArrowRight, User } from "lucide-react";

const LoginPage = () => {
  // 1. Khai báo state để lưu dữ liệu người dùng nhập
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  // 2. Xử lý sự kiện khi bấm nút Đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Gọi API sang Spring Boot (Endpoint đăng nhập)
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail,
          password: password,
        }),
      });

      // Đọc dữ liệu JSON từ Backend DTO trả về
      let data;
      try {
        data = await response.json();
      } catch {
        // Xóa bỏ (parseError) ở đây
        // Dự phòng trường hợp Backend bị sập và không trả về JSON
        data = { message: "Lỗi định dạng phản hồi từ máy chủ!" };
      }

      if (response.ok) {
        setMessage({
          type: "success",
          // Lấy thuộc tính message từ DTO (ví dụ: AuthResponse/ApiResponse)
          text: data.message || "Đăng nhập thành công! Đang chuyển hướng...",
        });

        // TODO: Lưu Token (data.token) vào LocalStorage hoặc Zustand
        if (data.token) {
          localStorage.setItem("accessToken", data.token);
        }
      } else {
        setMessage({
          type: "error",
          // Lấy thông báo lỗi cụ thể từ DTO mà Backend gửi về
          text: data.message || "Sai tài khoản hoặc mật khẩu!",
        });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setMessage({
        type: "error",
        text: "Không thể kết nối đến máy chủ Backend!",
      });
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white">
      {/* CỘT TRÁI: Branding */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-700 via-blue-600 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-100 h-100 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>

        <div className="relative z-10">
          <Link
            to="/"
            className="text-3xl font-extrabold text-white flex items-center gap-2 w-max"
          >
            <Sparkles className="text-blue-300" /> SmartMatch
          </Link>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Chào mừng bạn quay trở lại!
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Đăng nhập để tiếp tục hành trình tìm kiếm cơ hội và nhân tài của
            bạn.
          </p>
        </div>
        <div className="relative z-10 text-blue-200 text-sm">
          © 2026 SmartMatch. Đã đăng ký bản quyền.
        </div>
      </div>

      {/* CỘT PHẢI: Form Đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
            <p className="text-gray-500">
              Vui lòng điền thông tin để truy cập hệ thống
            </p>
          </div>

          {/* HIỂN THỊ THÔNG BÁO LỖI/THÀNH CÔNG */}
          {message && (
            <div
              className={`p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {message.text}
            </div>
          )}

          {/* BỌC FORM VÀ GẮN SỰ KIỆN onSubmit */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email hoặc Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm"
                  placeholder="Nhập email hoặc tên đăng nhập..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Đăng nhập <ArrowRight size={18} />
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
