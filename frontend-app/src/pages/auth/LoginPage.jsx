// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "../../services/authService"; // ✅ Dùng service để clean & consistent
import { parseToken } from "../../utils/parseToken";
import { useUserStore } from "../../store/userStore"; // ✅ Tích hợp Zustand store
import AuthLayout from "../../layouts/AuthLayout"; // ✅ Import AuthLayout

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const { setUser } = useUserStore();

  // Tự động ẩn message sau 4 giây
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = await login({ usernameOrEmail, password });

      // Lưu token
      localStorage.setItem("accessToken", data.token);

      // Parse token để lấy thông tin user + role
      const userInfo = parseToken(data.token);
      setUser(userInfo); // ✅ Cập nhật global store

      setMessage({
        type: "success",
        text: "Đăng nhập thành công! Đang chuyển hướng...",
      });

      // Redirect theo role (Candidate / Employer / Admin)
      setTimeout(() => {
        if (userInfo.role === "CANDIDATE") navigate("/candidate/dashboard");
        else if (userInfo.role === "EMPLOYER") navigate("/employer/dashboard");
        else if (userInfo.role === "ADMIN") navigate("/admin/dashboard");
        else navigate("/");
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setMessage({
        type: "error",
        text: error.message || "Sai thông tin đăng nhập. Vui lòng thử lại!",
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
            Đăng nhập
          </h2>
          <p className="text-gray-500 mt-2">
            Truy cập ngay tài khoản SmartMatch của bạn
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
          {/* Email / Username */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email hoặc tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 focus:border-[var(--color-blue-pure)] focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="you@email.com hoặc username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[var(--color-blue-pure)] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
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
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 accent-[var(--color-blue-pure)]"
              />
              Ghi nhớ đăng nhập
            </label>
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
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập ngay</span>
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

        {/* Social Login */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 py-4 rounded-2xl font-medium text-gray-700 transition-colors"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3004/3004003.png"
            alt="Google"
            className="w-5 h-5"
          />
          Tiếp tục với Google
        </button>

        {/* Register link */}
        <p className="text-center mt-8 text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-semibold text-[var(--color-blue-pure)] hover:text-[var(--color-blue-ultra)] transition-colors"
          >
            Đăng ký miễn phí ngay
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

export default LoginPage;