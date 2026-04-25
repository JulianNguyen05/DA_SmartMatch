// src/components/candidate/resume/ResumeBuilder.jsx
import React, { useState } from "react"; // Đã bỏ useEffect vì không còn cần thiết
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  X,
  Save,
  ArrowLeft,
  Loader2,
  FileText,
} from "lucide-react";

const AVAILABLE_BLOCKS = [
  { type: "summary", label: "Giới thiệu bản thân", icon: <User size={18} /> },
  {
    type: "experience",
    label: "Kinh nghiệm làm việc",
    icon: <Briefcase size={18} />,
  },
  {
    type: "education",
    label: "Học vấn & Bằng cấp",
    icon: <GraduationCap size={18} />,
  },
  { type: "skills", label: "Kỹ năng chuyên môn", icon: <Wrench size={18} /> },
];

// Hàm tạo ID ra ngoài Component để tránh lỗi Purity
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const ResumeBuilder = ({ initialData, onSave, onCancel, isSaving }) => {
  // 1. Thông tin cơ bản
  const [basicInfo, setBasicInfo] = useState({
    id: initialData?.id || null,
    profileName: initialData?.profileName || "Hồ sơ mới",
    fullName: initialData?.fullName || "",
    headline: initialData?.headline || "",
  });

  // 2. Khối nội dung động (Sections) - Tính toán và parse JSON ngay lúc khởi tạo state (Lazy initialization)
  const [activeSections, setActiveSections] = useState(() => {
    if (initialData?.sections) {
      try {
        const parsed = JSON.parse(initialData.sections);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Lỗi parse sections JSON:", e);
        return [];
      }
    }
    return [];
  });

  const handleBasicChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
  };

  const addSection = (block) => {
    setActiveSections([
      ...activeSections,
      { ...block, id: generateId(), content: "" },
    ]);
  };

  const handleSave = () => {
    // Chuyển mảng activeSections thành chuỗi JSON trước khi gửi cho Backend
    const payload = {
      ...basicInfo,
      sections: JSON.stringify(activeSections),
    };
    onSave(payload);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      {/* Header Builder */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 transition-all"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          Lưu CV
        </button>
      </div>

      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tên CV (VD: Fontend) *
          </label>
          <input
            name="profileName"
            value={basicInfo.profileName}
            onChange={handleBasicChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Họ và tên *
          </label>
          <input
            name="fullName"
            value={basicInfo.fullName}
            onChange={handleBasicChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chức danh / Headline
          </label>
          <input
            name="headline"
            value={basicInfo.headline}
            onChange={handleBasicChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl outline-none"
          />
        </div>
      </div>

      {/* Vùng Builder (Kéo thả / Chọn khối) */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR: Các khối có sẵn */}
        <div className="lg:w-1/4 space-y-4">
          <h4 className="font-bold text-gray-700 mb-4">Thêm khối nội dung</h4>
          {AVAILABLE_BLOCKS.map((block) => (
            <div
              key={block.type}
              onClick={() => addSection(block)}
              className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-3"
            >
              <div className="p-2 bg-gray-100 rounded-lg">{block.icon}</div>
              <span className="font-medium text-gray-700">{block.label}</span>
            </div>
          ))}
        </div>

        {/* WORKSPACE: Nơi cấu trúc CV */}
        <div className="lg:w-3/4 bg-gray-50 p-6 md:p-8 rounded-3xl min-h-[400px] border border-gray-200">
          {activeSections.length === 0 ? (
            <div className="text-center flex flex-col items-center text-gray-400 mt-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} />
              </div>
              <p>Bấm chọn các khối bên trái để bắt đầu xây dựng CV</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeSections.map((section, index) => (
                <div
                  key={section.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group"
                >
                  <label className="block font-bold text-blue-600 mb-3 uppercase text-xs tracking-widest">
                    {section.label}
                  </label>
                  <textarea
                    className="w-full p-0 border-none focus:ring-0 text-gray-700 placeholder-gray-400 resize-none outline-none"
                    placeholder={`Nhập thông tin ${section.label.toLowerCase()} của bạn...`}
                    rows={4}
                    value={section.content || ""}
                    onChange={(e) => {
                      const newSections = [...activeSections];
                      newSections[index].content = e.target.value;
                      setActiveSections(newSections);
                    }}
                  />
                  <button
                    onClick={() =>
                      setActiveSections(
                        activeSections.filter((s) => s.id !== section.id),
                      )
                    }
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa khối này"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;