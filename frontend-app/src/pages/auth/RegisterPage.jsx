// frontend/src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Briefcase,
  ArrowRight,
  Phone,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { register } from "../../services/authService"; // ✅ Dùng service để clean & consistent
import AuthLayout from "../../layouts/AuthLayout"; // ✅ Import AuthLayout

const RegisterPage = () => {
  const [role, setRole] = useState("CANDIDATE");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  // Tự động ẩn message sau 4 giây
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }
    if (!agreeTerms) {
      setMessage({
        type: "error",
        text: "Bạn phải đồng ý với điều khoản dịch vụ.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await register({
        username,
        email,
        phoneNumber,
        password,
        role,
      });

      setMessage({
        type: "success",
        text: "Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...",
      });

      // Reset form
      setUsername("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");

      // Chuyển hướng sau 1.2 giây
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Register error:", error);
      setMessage({
        type: "error",
        text:
          error.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Tạo tài khoản
          </h2>
          <p className="text-gray-500 mt-2">
            Tham gia cộng đồng SmartMatch ngay hôm nay
          </p>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-6 px-5 py-4 rounded-2xl text-sm font-medium flex items-start gap-3 transition-all duration-300 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-xl flex-shrink-0 flex items-center justify-center text-lg ${
                message.type === "success" ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {message.type === "success" ? "✓" : "✕"}
            </div>
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection - Premium toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Bạn là ai?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("CANDIDATE")}
                className={`flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border-2 transition-all hover:shadow-md ${
                  role === "CANDIDATE"
                    ? "border-[var(--color-blue-pure)] bg-blue-50 text-[var(--color-blue-pure)] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <User
                  size={28}
                  className={
                    role === "CANDIDATE"
                      ? "text-[var(--color-blue-pure)]"
                      : "text-gray-400"
                  }
                />
                <span className="font-semibold">Ứng viên</span>
                <span className="text-xs text-gray-500">Tìm việc làm</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("EMPLOYER")}
                className={`flex flex-col items-center justify-center gap-2 p-5 rounded-3xl border-2 transition-all hover:shadow-md ${
                  role === "EMPLOYER"
                    ? "border-[var(--color-blue-pure)] bg-blue-50 text-[var(--color-blue-pure)] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <Briefcase
                  size={28}
                  className={
                    role === "EMPLOYER"
                      ? "text-[var(--color-blue-pure)]"
                      : "text-gray-400"
                  }
                />
                <span className="font-semibold">Nhà tuyển dụng</span>
                <span className="text-xs text-gray-500">
                  Đăng tin tuyển dụng
                </span>
              </button>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 focus:border-[var(--color-blue-pure)] focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="username123"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 focus:border-[var(--color-blue-pure)] focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="you@email.com"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 focus:border-[var(--color-blue-pure)] focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="0912345678"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-200 focus:border-[var(--color-blue-pure)] focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <CheckCircle size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 focus:border-[var(--color-blue-pure)] focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-blue-pure)]"
              required
            />
            <span className="text-gray-600">
              Tôi đồng ý với{" "}
              <Link
                to="#"
                className="text-[var(--color-blue-pure)] hover:underline"
              >
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link
                to="#"
                className="text-[var(--color-blue-pure)] hover:underline"
              >
                Chính sách bảo mật
              </Link>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[var(--color-blue-pure)] to-[var(--color-blue-ultra)] hover:brightness-110 text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.97] shadow-lg shadow-blue-500/30 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <>
                <span>Hoàn tất đăng ký</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            hoặc
          </span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Google Register */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 py-4 rounded-2xl font-medium text-gray-700 transition-colors"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3004/3004003.png"
            alt="Google"
            className="w-5 h-5"
          />
          Đăng ký bằng Google
        </button>

        {/* Login link */}
        <p className="text-center mt-8 text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-semibold text-[var(--color-blue-pure)] hover:text-[var(--color-blue-ultra)] transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      {/* Footer nhỏ */}
      <p className="text-center text-gray-400 text-xs mt-6">
        Bảo mật • GDPR • AI Matching
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
