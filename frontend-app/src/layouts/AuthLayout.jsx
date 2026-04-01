// frontend/src/layouts/AuthLayout.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Brain } from "lucide-react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full font-sans bg-white overflow-hidden">
      {/* CỘT TRÁI - BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[var(--color-navy-light)] via-[var(--color-blue-electric)] to-[var(--color-navy-dark)] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-[var(--color-purple-mid)] opacity-30 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[var(--color-pink-light)] opacity-20 blur-[100px]"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
            <Sparkles className="w-6 h-6 text-[var(--color-pink-light)]" />
          </div>
          <Link
            to="/"
            className="text-4xl font-black text-white tracking-tighter hover:scale-105 transition-transform"
          >
            SmartMatch
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-3xl text-white text-sm mb-6">
            <Brain className="w-4 h-4" />
            <span className="font-medium">AI-Powered Matching</span>
          </div>
          <h1 className="text-5xl font-bold leading-none text-white mb-4">
            Kết nối cơ hội bằng trí tuệ nhân tạo
          </h1>
          <p className="text-[var(--color-lavender-light)] text-xl opacity-95">
            Hàng ngàn CV và JD được match thông minh chỉ trong vài giây.
          </p>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 SmartMatch • Secured by AI
        </div>
      </div>

      {/* CỘT PHẢI - FORM */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;