import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Sparkles, ArrowRight, User } from "lucide-react";

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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

      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: "Lỗi định dạng phản hồi từ máy chủ!" };
      }

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message || "Đăng nhập thành công! Đang chuyển hướng...",
        });

        // TODO: Lưu Token
        if (data.token) {
          localStorage.setItem("accessToken", data.token);
        }
      } else {
        setMessage({
          type: "error",
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
      {/* CỘT TRÁI: Branding áp dụng màu từ index.css */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[var(--color-navy-light)] via-[var(--color-blue-electric)] to-[var(--color-navy-dark)] p-12 flex-col justify-between relative overflow-hidden">
        {/* Các mảng màu trang trí */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--color-purple-mid)] opacity-20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[var(--color-periwinkle)] opacity-30 blur-3xl"></div>

        <div className="relative z-10">
          <Link
            to="/"
            className="text-3xl font-extrabold text-white flex items-center gap-2 w-max hover:scale-105 transition-transform"
          >
            <Sparkles className="text-[var(--color-pink-light)]" /> SmartMatch
          </Link>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Chào mừng bạn quay trở lại!
          </h1>
          <p className="text-[var(--color-lavender-light)] text-lg mb-8 opacity-90">
            Đăng nhập để tiếp tục hành trình tìm kiếm cơ hội và nhân tài của
            bạn.
          </p>
        </div>
        <div className="relative z-10 text-[var(--color-lavender-dark)] text-sm">
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

          {/* HIỂN THỊ THÔNG BÁO VỚI HIỆU ỨNG ANIMATION */}
          {message && (
            <div
              className={`animate-message p-4 rounded-xl text-sm font-medium border ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === "error" ? (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                )}
                {message.text}
              </div>
            </div>
          )}

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
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-blue-pure)] focus:border-transparent outline-none shadow-sm transition-all"
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
                  className="text-sm font-semibold text-[var(--color-blue-pure)] hover:text-[var(--color-blue-ultra)] transition-colors"
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
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-blue-pure)] focus:border-transparent outline-none shadow-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-blue-pure)] hover:bg-[var(--color-blue-ultra)] text-white font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Đăng nhập <ArrowRight size={18} />
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-semibold text-[var(--color-blue-pure)] hover:text-[var(--color-blue-ultra)] transition-colors"
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
