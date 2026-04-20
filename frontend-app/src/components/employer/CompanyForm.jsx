import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Info,
  Save,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { uploadCompanyLogo } from "../../services/companyService";

const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `http://localhost:8080${path}`;
};

const CompanyForm = ({ initialData, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      address: "",
      location: "",
      website: "",
      logoUrl: "",
      industry: "",
      companySize: "",
    },
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // XỬ LÝ UPLOAD ẢNH
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const url = await uploadCompanyLogo(file);
      setFormData((prev) => ({ ...prev, logoUrl: url }));
    } catch (error) {
      alert("Lỗi tải ảnh: " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Cập nhật Công ty" : "Tạo Hồ sơ Công ty"}
          </h2>
          <p className="text-gray-500 mt-1">
            Bạn cần hoàn thiện thông tin này để ứng viên có thể xem.
          </p>
        </div>
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* KHOẢNG TẢI ẢNH LOGO */}
        <div className="flex items-center gap-6 p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
          <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
            {uploadingLogo ? (
              <Loader2 className="animate-spin text-blue-500" size={32} />
            ) : formData.logoUrl ? (
              <img
                src={getFullImageUrl(formData.logoUrl)} // ← THÊM DÒNG NÀY
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="text-gray-300" size={32} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Logo Công ty
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Định dạng JPG, PNG. Tối đa 2MB.
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition">
              <UploadCloud size={16} /> Tải ảnh lên
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">
              Tên công ty *
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              placeholder="VD: Công ty TNHH SmartMatch"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Quy mô nhân sự
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
            >
              <option value="">Chọn quy mô...</option>
              <option value="1-10">1 - 10 nhân viên</option>
              <option value="10-50">10 - 50 nhân viên</option>
              <option value="50-200">50 - 200 nhân viên</option>
              <option value="200+">Hơn 200 nhân viên</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Lĩnh vực hoạt động
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              placeholder="VD: Công nghệ thông tin..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Tỉnh/Thành phố
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              placeholder="VD: Hồ Chí Minh"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              placeholder="Số nhà, tên đường..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">
              Giới thiệu công ty
            </label>
            <textarea
              rows="5"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
              placeholder="Mô tả văn hóa, môi trường làm việc..."
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          {initialData && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={loading || uploadingLogo}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}{" "}
            Lưu thông tin
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
