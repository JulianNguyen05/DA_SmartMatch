import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Briefcase,
  Sparkles,
  ArrowRight,
  Phone,
} from "lucide-react";

const RegisterPage = () => {
  const [role, setRole] = useState("CANDIDATE");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          phoneNumber,
          password,
          role,
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
          text: data.message || "Đăng ký thành công! Vui lòng đăng nhập.",
        });

        setUsername("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
      } else {
        setMessage({
          type: "error",
          text: data.message || "Đăng ký thất bại, vui lòng kiểm tra lại!",
        });
      }
    } catch (error) {
      console.error("Lỗi kết nối API:", error);
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
            Bắt đầu hành trình mới.
          </h1>
          <p className="text-[var(--color-lavender-light)] text-lg mb-8 opacity-90">
            Tạo tài khoản miễn phí và trải nghiệm sức mạnh kết nối của Trí tuệ
            nhân tạo.
          </p>
        </div>
        <div className="relative z-10 text-[var(--color-lavender-dark)] text-sm">
          © 2026 SmartMatch. Đã đăng ký bản quyền.
        </div>
      </div>

      {/* CỘT PHẢI: Form Đăng ký */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-8 bg-gray-50 lg:bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left pt-8 lg:pt-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo tài khoản
            </h2>
            <p className="text-gray-500">
              Tham gia cùng hàng ngàn ứng viên và doanh nghiệp
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

          <form onSubmit={handleSubmit} className="space-y-4 mt-8 pb-8">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bạn là ai?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("CANDIDATE")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    role === "CANDIDATE"
                      ? "border-[var(--color-blue-pure)] bg-[var(--color-lavender-light)] text-[var(--color-blue-pure)]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <User
                    size={20}
                    className={
                      role === "CANDIDATE"
                        ? "text-[var(--color-blue-pure)]"
                        : "text-gray-400"
                    }
                  />
                  <span className="font-medium text-sm">Ứng viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("EMPLOYER")}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    role === "EMPLOYER"
                      ? "border-[var(--color-blue-pure)] bg-[var(--color-lavender-light)] text-[var(--color-blue-pure)]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Briefcase
                    size={20}
                    className={
                      role === "EMPLOYER"
                        ? "text-[var(--color-blue-pure)]"
                        : "text-gray-400"
                    }
                  />
                  <span className="font-medium text-sm">Nhà tuyển dụng</span>
                </button>
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-blue-pure)] focus:border-transparent outline-none shadow-sm transition-all"
                  placeholder="Nhập tên đăng nhập..."
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-blue-pure)] focus:border-transparent outline-none shadow-sm transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-blue-pure)] focus:border-transparent outline-none shadow-sm transition-all"
                  placeholder="0912345678"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[var(--color-blue-pure)] focus:border-transparent outline-none shadow-sm transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-blue-pure)] hover:bg-[var(--color-blue-ultra)] text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4"
            >
              Hoàn tất đăng ký <ArrowRight size={18} />
            </button>
          </form>

          <div className="text-center pb-8">
            <p className="text-gray-600">
              Bạn đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-semibold text-[var(--color-blue-pure)] hover:text-[var(--color-periwinkle)] transition-colors"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;