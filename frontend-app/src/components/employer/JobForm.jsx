// frontend-app/src/components/employer/JobForm.jsx
import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Thực tập" },
  { value: "REMOTE", label: "Remote" },
];

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Mới ra trường" },
  { value: "MID", label: "Có kinh nghiệm" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Team Lead" },
  { value: "MANAGER", label: "Giám đốc" },
];

// Định nghĩa các trường động cho phép Nhà tuyển dụng chọn
const AVAILABLE_FIELDS = [
  {
    id: "fullName",
    label: "Họ và tên",
    required: true,
    autoFillKey: "fullName",
  },
  { id: "email", label: "Email liên hệ", required: true, autoFillKey: "email" },
  {
    id: "phoneNumber",
    label: "Số điện thoại",
    required: true,
    autoFillKey: "phoneNumber",
  },
  {
    id: "skills",
    label: "Kỹ năng chuyên môn",
    required: false,
    autoFillKey: "skills",
  },
  {
    id: "portfolio",
    label: "Link Portfolio / Dự án",
    required: false,
    autoFillKey: "",
  },
  {
    id: "expectedSalary",
    label: "Mức lương mong muốn",
    required: true,
    autoFillKey: "",
  },
];

const JobForm = ({ form, setForm, onSubmit, loading, isEdit }) => {
  const [selectedFields, setSelectedFields] = useState(() => {
    // 1. Nếu đang có sẵn data (trường hợp Edit Job)
    if (form.customFormTemplate) {
      try {
        return JSON.parse(form.customFormTemplate);
      } catch (e) {
        console.error("Lỗi khi parse customFormTemplate", e);
        return [];
      }
    }

    // 2. Nếu là tạo mới (Create Job), chọn mặc định Họ tên và Email
    if (!isEdit) {
      return [AVAILABLE_FIELDS[0], AVAILABLE_FIELDS[1]];
    }

    return [];
  });

  // Chỉ dùng useEffect để đồng bộ ngược mảng mặc định lên Component cha (1 lần duy nhất)
  useEffect(() => {
    if (!isEdit && !form.customFormTemplate) {
      setForm((prev) => ({
        ...prev,
        customFormTemplate: JSON.stringify([
          AVAILABLE_FIELDS[0],
          AVAILABLE_FIELDS[1],
        ]),
      }));
    }
    // Dùng cờ này để tắt cảnh báo missing dependency của ESLint cho dòng dưới đây
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Hàm xử lý khi tick/bỏ tick các field động
  const toggleField = (field) => {
    let newSelected;
    const isExists = selectedFields.find((f) => f.id === field.id);
    if (isExists) {
      newSelected = selectedFields.filter((f) => f.id !== field.id);
    } else {
      newSelected = [...selectedFields, field];
    }

    setSelectedFields(newSelected);
    // Cập nhật ngay vào state form của component cha dưới dạng chuỗi JSON
    setForm((prev) => ({
      ...prev,
      customFormTemplate: JSON.stringify(newSelected),
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Tiêu đề */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tiêu đề tin tuyển dụng *
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
          placeholder="Senior Backend Developer (Node.js)"
        />
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mô tả công việc *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
        />
      </div>

      {/* Địa điểm + Lương */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Địa điểm *
          </label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lương min
            </label>
            <input
              name="minSalary"
              type="number"
              value={form.minSalary}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Lương max
            </label>
            <input
              name="maxSalary"
              type="number"
              value={form.maxSalary}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
            />
          </div>
        </div>
      </div>

      {/* Loại hình & Kinh nghiệm */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Loại hình *
          </label>
          <select
            name="jobType"
            value={form.jobType}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mức kinh nghiệm *
          </label>
          <select
            name="experienceLevel"
            value={form.experienceLevel}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Kinh nghiệm tối thiểu (năm)
          </label>
          <input
            name="minExperienceYears"
            type="number"
            value={form.minExperienceYears}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
          />
        </div>
      </div>

      {/* Yêu cầu & Lợi ích */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Yêu cầu (mỗi dòng một)
          </label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={5}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quyền lợi (mỗi dòng một)
          </label>
          <textarea
            name="benefits"
            value={form.benefits}
            onChange={handleChange}
            rows={5}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
          />
        </div>
      </div>

      {/* ================= PHẦN THÊM MỚI: Cấu hình Form Động ================= */}
      <div className="p-6 border border-blue-100 bg-blue-50/40 rounded-2xl">
        <div className="mb-4">
          <h3 className="text-base font-bold text-gray-800">
            Thiết kế Form Ứng Tuyển
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Chọn các thông tin bạn muốn thu thập từ ứng viên. Hệ thống sẽ tự
            động điền sẵn (auto-fill) nếu ứng viên đã cập nhật Profile.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {AVAILABLE_FIELDS.map((field) => (
            <label
              key={field.id}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedFields.some((f) => f.id === field.id)}
                  onChange={() => toggleField(field)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer transition-colors"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                {field.label}
              </span>
            </label>
          ))}
        </div>
      </div>
      {/* =================================================================== */}

      {/* Hạn nộp */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Hạn nộp hồ sơ
        </label>
        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={handleChange}
          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-2xl outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-3 disabled:opacity-70 transition-colors"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <Save size={24} />
        )}
        {isEdit ? "Cập nhật tin tuyển dụng" : "Đăng tin ngay"}
      </button>
    </form>
  );
};

export default JobForm;
