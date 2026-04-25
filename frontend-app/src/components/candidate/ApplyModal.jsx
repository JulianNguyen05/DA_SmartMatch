import React, { useState, useEffect } from "react";
import { X, Loader2, UserCircle, FileText } from "lucide-react";
import { applicationService } from "../../services/applicationService";
import { candidateService } from "../../services/candidateService";
import { matchProfileToJob } from "../../utils/profileMatcher"; // <-- Import hàm xử lý logic

const ApplyModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // States quản lý danh sách Profile và Form động
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [formTemplate, setFormTemplate] = useState([]);
  const [dynamicAnswers, setDynamicAnswers] = useState({});

  useEffect(() => {
    if (isOpen && job) {
      // 1. Parse Template từ tin tuyển dụng
      const template = job.customFormTemplate
        ? JSON.parse(job.customFormTemplate)
        : [];
      setFormTemplate(template);

      // 2. Lấy danh sách CV trực tuyến của ứng viên
      candidateService
        .getMyProfiles()
        .then((data) => {
          const profileList = Array.isArray(data) ? data : data.content || [];
          setProfiles(profileList);

          // Nếu ứng viên có CV, mặc định chọn CV đầu tiên và tự động điền form
          if (profileList.length > 0) {
            const defaultProfile = profileList[0];
            setSelectedProfileId(defaultProfile.id);

            // Dùng hàm utils tách riêng để map dữ liệu
            const filledData = matchProfileToJob(defaultProfile, template);
            setDynamicAnswers(filledData);
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tải hồ sơ:", err);
          setError("Không thể tải danh sách hồ sơ. Vui lòng thử lại.");
        });
    }
  }, [isOpen, job]);

  // Khi ứng viên đổi CV khác trong lúc Apply
  const handleProfileChange = (e) => {
    const profileId = e.target.value;
    setSelectedProfileId(profileId);

    const selectedProfile = profiles.find((p) => p.id === parseInt(profileId));
    if (selectedProfile) {
      // Gọi lại hàm map dữ liệu để cập nhật form tương ứng với CV mới
      const filledData = matchProfileToJob(selectedProfile, formTemplate);
      setDynamicAnswers(filledData);
    }
  };

  const handleDynamicAnswerChange = (fieldId, value) => {
    setDynamicAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProfileId) {
      setError("Vui lòng chọn một hồ sơ để ứng tuyển.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Chuẩn bị payload ứng tuyển
      const payload = {
        jobId: job.id,
        candidateProfileId: selectedProfileId,
        coverLetter: coverLetter,
        // Gửi các câu trả lời động dưới dạng chuỗi JSON lên Backend
        customAnswers: JSON.stringify(dynamicAnswers),
      };

      await applicationService.applyJob(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setError("Có lỗi xảy ra khi gửi hồ sơ. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Ứng tuyển vị trí
            </h3>
            <p className="text-blue-600 font-medium mt-1">{job?.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nội dung form ứng tuyển */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form id="applyForm" onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Chọn Hồ sơ (CV) */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <UserCircle size={18} className="text-blue-600" /> Chọn hồ sơ
                ứng tuyển *
              </label>
              {profiles.length > 0 ? (
                <select
                  value={selectedProfileId}
                  onChange={handleProfileChange}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-800"
                  required
                >
                  <option value="" disabled>
                    -- Chọn hồ sơ của bạn --
                  </option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.profileName} - Cập nhật:{" "}
                      {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl text-sm">
                  Bạn chưa có hồ sơ nào. Vui lòng vào phần quản lý CV để tạo
                  mới.
                </div>
              )}
            </div>

            {/* 2. DYNAMIC FORM: Hiển thị các trường NTD yêu cầu */}
            {formTemplate.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FileText size={18} className="text-purple-600" /> Yêu cầu bổ
                  sung từ Nhà tuyển dụng
                </h4>
                <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-4">
                  {formTemplate.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={dynamicAnswers[field.id] || ""}
                          onChange={(e) =>
                            handleDynamicAnswerChange(field.id, e.target.value)
                          }
                          required={field.required}
                          rows="3"
                          placeholder={`Nhập ${field.label.toLowerCase()}...`}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          value={dynamicAnswers[field.id] || ""}
                          onChange={(e) =>
                            handleDynamicAnswerChange(field.id, e.target.value)
                          }
                          required={field.required}
                          placeholder={`Nhập ${field.label.toLowerCase()}...`}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Thư giới thiệu (Cover Letter) */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Thư giới thiệu (Cover Letter)
              </label>
              <textarea
                rows="3"
                placeholder="Chia sẻ lý do bạn phù hợp với vị trí này..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              />
            </div>
          </form>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="applyForm"
            disabled={submitting || profiles.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-70 transition-all active:scale-95 shadow-md shadow-blue-200"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : null}
            {submitting ? "Đang gửi..." : "Nộp Hồ Sơ Ngay"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
