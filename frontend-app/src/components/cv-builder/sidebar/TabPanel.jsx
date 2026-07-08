import React from "react";
import {
  X,
  Square,
  Circle,
  List,
  Clock,
  LayoutGrid,
  AlignLeft,
} from "lucide-react";
import LayoutSidebar from "./LayoutSidebar";
import TextFormatToolbar from "./TextFormatToolbar";
import { CV_FONT_SIZES } from "../templates/cvTemplateCore";

const FONT_OPTIONS = [
  "Roboto",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Courier New",
];
// Mỗi theme giờ là 1 CỤM MÀU (màu chính + màu phụ thật sự, không còn là màu chính +
// 1 bản nhạt của chính nó) — primary dùng cho tiêu đề/viền/nền đậm, accent dùng cho
// các điểm nhấn phụ (icon danh thiếp, viền ảnh đại diện, đường kẻ nối tiêu đề...).
// Đã bỏ 2 theme "Đỏ" / "Cam" vì trùng ngữ nghĩa màu cảnh báo (warning) và nguy hiểm
// (danger/error) thường dùng cho thông báo lỗi trong hệ thống, dễ gây hiểu lầm khi
// dùng làm màu thương hiệu trên CV.
const COLOR_THEMES = [
  { name: "Xanh dương Worklify", primary: "#2563EB", accent: "#38BDF8" },
  { name: "Xanh ngọc",           primary: "#0F766E", accent: "#5EEAD4" },
  { name: "Tím",                 primary: "#7C3AED", accent: "#C4B5FD" },
];

const SECTION_NAMES = {
  avatar: "Ảnh đại diện",
  contactInfo: "Danh thiếp",
  personalInfo: "Thông tin cá nhân",
  objective: "Mục tiêu nghề nghiệp",
  education: "Học vấn",
  experience: "Kinh nghiệm làm việc",
  activities: "Hoạt động",
  certifications: "Chứng chỉ",
  awards: "Giải thưởng",
  skills: "Kỹ năng",
  references: "Người tham chiếu",
  hobbies: "Sở thích",
  projects: "Dự án",
  customSection: "Thông tin thêm",
};

const TabPanel = ({
  activeTab,
  isPanelOpen,
  setIsPanelOpen,
  cvData,
  setCvData,
  handleFontChange,
  handleColorChange,
  handleTemplateChange,
  handleChangeRatio,
  handleAddRow,
  handleDeleteRow,
  handleMoveRow,
  handleSettingChange,
  selectedSection,
}) => {
  const handleSectionLayoutChange = (layoutType) => {
    const currentLayouts = cvData.settings.sectionLayouts || {};
    handleSettingChange("sectionLayouts", {
      ...currentLayouts,
      [selectedSection]: layoutType,
    });
  };

  const getCurrentLayoutType = (sectionId) => {
    if (cvData.settings.sectionLayouts?.[sectionId]) {
      return cvData.settings.sectionLayouts[sectionId];
    }
    if (["skills", "hobbies"].includes(sectionId)) return "tags";
    if (["experience", "education"].includes(sectionId)) return "timeline";
    return "row";
  };

  const supportsDynamicLayout = [
    "experience",
    "education",
    "activities",
    "projects",
    "certifications",
    "awards",
    "references",
    "skills",
    "hobbies",
    "objective",
  ];

  return (
    <div
      className={`transition-all duration-300 ${isPanelOpen ? "w-[320px] ml-4 my-4 mr-4" : "w-0 overflow-hidden"}`}
    >
      <div className="w-[320px] h-full bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <h3 className="font-bold text-[15px] text-slate-800">
            {activeTab === "design" && "Thiết kế & Bố cục"}
            {activeTab === "layout" && "Tùy chỉnh Bố cục CV"}
            {activeTab === "template" && "Thay Đổi Mẫu CV"}
          </h3>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="p-1.5 hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-full text-slate-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "design" && (
            <div className="animate-fadeIn">
              <TextFormatToolbar />

              {selectedSection &&
                supportsDynamicLayout.includes(selectedSection) && (
                  <div className="mb-6 pt-5 border-t border-gray-100 animate-fadeIn">
                    <label className="block font-semibold text-sm text-gray-700 mb-3">
                      Bố cục:{" "}
                      <span className="text-[#2563EB] uppercase">
                        {SECTION_NAMES[selectedSection] || selectedSection}
                      </span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSectionLayoutChange("timeline")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "timeline" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <Clock size={16} />{" "}
                        <span className="text-[10px] font-medium">Dòng TG</span>
                      </button>

                      <button
                        onClick={() => handleSectionLayoutChange("row")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "row" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <List size={16} />{" "}
                        <span className="text-[10px] font-medium">
                          Danh sách
                        </span>
                      </button>

                      <button
                        onClick={() => handleSectionLayoutChange("tags")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "tags" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <LayoutGrid size={16} />{" "}
                        <span className="text-[10px] font-medium">
                          Dạng Thẻ
                        </span>
                      </button>

                      <button
                        onClick={() => handleSectionLayoutChange("paragraph")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 border rounded-lg transition-all ${getCurrentLayoutType(selectedSection) === "paragraph" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                      >
                        <AlignLeft size={16} />{" "}
                        <span className="text-[10px] font-medium">
                          Đoạn văn
                        </span>
                      </button>
                    </div>
                  </div>
                )}

              {selectedSection === "avatar" && (
                <div className="mb-6 pt-5 border-t border-gray-100 animate-fadeIn">
                  <label className="block font-semibold text-sm text-gray-700 mb-3">
                    Tùy chỉnh Ảnh đại diện
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() =>
                        handleSettingChange("avatarShape", "square")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg transition-all ${cvData.settings.avatarShape === "square" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                    >
                      {" "}
                      <Square size={16} /> Vuông{" "}
                    </button>
                    <button
                      onClick={() =>
                        handleSettingChange("avatarShape", "circle")
                      }
                      className={`flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg transition-all ${cvData.settings.avatarShape === "circle" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"}`}
                    >
                      {" "}
                      <Circle size={16} /> Tròn{" "}
                    </button>
                  </div>
                </div>
              )}

              {/* Phần Font chữ và Kích cỡ toàn CV */}
              <div className="mb-6 pt-5 border-t border-gray-100">
                <label className="block font-semibold text-sm text-gray-700 mb-3">
                  Font chữ toàn CV
                </label>
                <select
                  value={cvData.settings.font}
                  onChange={(e) => handleFontChange(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white text-sm focus:ring-1 focus:ring-[#2563EB] outline-none mb-4"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>

                <label className="block font-semibold text-sm text-gray-700 mb-3">
                  Kích cỡ toàn CV
                </label>
                <div className="flex gap-2">
                  {CV_FONT_SIZES.map((size) => {
                    // Fallback mặc định là 'medium' nếu chưa có dữ liệu lưu
                    const currentSize = cvData.settings.fontSize || "medium";
                    const isActive = currentSize === size.value;

                    return (
                      <button
                        key={size.value}
                        onClick={() =>
                          handleSettingChange("fontSize", size.value)
                        }
                        className={`flex-1 py-1.5 text-[11px] font-medium border rounded transition-all ${
                          isActive
                            ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                            : "border-gray-200 text-gray-600 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-3">
                  Chủ đề màu sắc
                </label>
                <div className="space-y-2">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() =>
                        handleColorChange(theme.primary, theme.accent)
                      }
                      className={`w-full flex items-center gap-3 p-2.5 border rounded-xl transition-all hover:shadow-sm ${cvData.settings.primaryColor === theme.primary ? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-sm overflow-hidden flex"
                        title={`${theme.primary} + ${theme.accent}`}
                      >
                        <div className="w-1/2 h-full" style={{ backgroundColor: theme.primary }} />
                        <div className="w-1/2 h-full" style={{ backgroundColor: theme.accent }} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="animate-fadeIn -m-5">
              <LayoutSidebar
                layout={cvData.layout}
                onChangeRatio={handleChangeRatio}
                primaryColor={cvData.settings.primaryColor}
                onAddRow={handleAddRow}
                onDeleteRow={handleDeleteRow}
                onMoveRow={handleMoveRow}
              />
            </div>
          )}

          {activeTab === "template" && (
            <div className="animate-fadeIn space-y-3">
              {/* Mẫu Tiêu Chuẩn */}
              <button
                onClick={() => handleTemplateChange("simple")}
                className={`block w-full p-4 rounded-xl font-medium border-2 transition-all text-left hover:shadow-sm ${cvData.settings.template === "simple" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-700 hover:border-[#2563EB]"}`}
              >
                <div className="font-bold mb-1 text-sm">Mẫu Tiêu Chuẩn</div>
                <div className="text-[11px] text-gray-500 font-normal">
                  Thiết kế tối giản, chuyên nghiệp.
                </div>
              </button>

              {/* Mẫu Harvard */}
              <button
                onClick={() => handleTemplateChange("harvard")}
                className={`block w-full p-4 rounded-xl font-medium border-2 transition-all text-left hover:shadow-sm ${cvData.settings.template === "harvard" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-700 hover:border-[#2563EB]"}`}
              >
                <div className="font-bold mb-1 text-sm">Mẫu Harvard</div>
                <div className="text-[11px] text-gray-500 font-normal">
                  Phong cách học thuật, thanh lịch và truyền thống.
                </div>
              </button>

              {/* Mẫu Professional */}
              <button
                onClick={() => handleTemplateChange("professional")}
                className={`block w-full p-4 rounded-xl font-medium border-2 transition-all text-left hover:shadow-sm ${cvData.settings.template === "professional" ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-gray-200 text-gray-700 hover:border-[#2563EB]"}`}
              >
                <div className="font-bold mb-1 text-sm">Mẫu Chuyên Nghiệp</div>
                <div className="text-[11px] text-gray-500 font-normal">
                  Thiết kế hiện đại, tinh tế cho môi trường doanh nghiệp.
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPanel;
