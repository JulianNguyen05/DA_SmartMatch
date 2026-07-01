import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // 1. Lớp phủ (Backdrop): Nền xám trong suốt (bg-slate-900/40) kết hợp làm mờ (backdrop-blur-sm)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      
      {/* 2. Khung Modal: Bỏ max-w-md, dùng w-auto và max-w-[95vw] để CV có thể bung rộng. Thêm bg-white/95 để tạo độ trong suốt nhẹ nhàng */}
      <div className="bg-white/95 backdrop-blur-md border border-white/60 rounded-xl shadow-2xl w-auto min-w-[400px] max-w-[95vw] max-h-[95vh] mx-4 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200/60">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          
          <button 
            onClick={onClose} 
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Body */}
        {/* Thêm flex-1 và overflow-y-auto để nội dung bên trong (như CV) tự động có thanh cuộn nếu quá dài */}
        <div className="p-0 flex-1 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}