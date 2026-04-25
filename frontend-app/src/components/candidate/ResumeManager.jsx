// src/components/candidate/ResumeManager.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle, Plus, LayoutGrid, Loader2 } from "lucide-react";
import { candidateService } from "../../services/candidateService";
import ResumeCard from "./resume/ResumeCard";
import ResumeBuilder from "./resume/ResumeBuilder";

const ResumeManager = () => {
  const [view, setView] = useState("grid"); // 'grid' | 'builder'
  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getMyProfiles();
      setProfiles(Array.isArray(data) ? data : data.content || data.data || []);
    } catch {
      showMsg("error", "Lỗi tải danh sách hồ sơ trực tuyến.");
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Các actions chuyển đổi view
  const handleCreateNew = () => {
    setEditingProfile(null);
    setView("builder");
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setView("builder");
  };

  const handleDeleteProfile = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hồ sơ này?")) return;
    try {
      // Giả định backend có API xóa. Nếu chưa có, bạn cần thêm api deleteProfile
      await candidateService.deleteProfile(id);
      showMsg("success", "Đã xóa hồ sơ thành công!");
      fetchProfiles();
    } catch {
      showMsg("error", "Lỗi khi xóa hồ sơ.");
    }
  };

  const handleSaveProfile = async (payload) => {
    setIsSaving(true);
    try {
      await candidateService.saveProfile(payload);
      showMsg("success", "Lưu hồ sơ trực tuyến thành công!");
      await fetchProfiles();
      setView("grid"); // Quay về màn hình grid
    } catch {
      showMsg("error", "Lỗi khi lưu hồ sơ.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="space-y-6 mt-6 max-w-6xl mx-auto">
      {/* THÔNG BÁO CHUNG */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}
        >
          {message.type === "success" && <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* ================= PHẦN 1: HỒ SƠ TRỰC TUYẾN ================= */}
      {view === "grid" ? (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutGrid className="text-blue-600" size={24} /> Hồ sơ trực
              tuyến (SmartMatch)
            </h3>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-100 transition"
            >
              <Plus size={18} /> Tạo Mới (Builder)
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-500 mb-4">
                Bạn chưa tạo hồ sơ trực tuyến nào.
              </p>
              <button
                onClick={handleCreateNew}
                className="text-blue-600 font-semibold underline"
              >
                Bấm vào đây để tạo CV đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((p) => (
                <ResumeCard
                  key={p.id}
                  profile={p}
                  onEdit={handleEditProfile}
                  onDelete={handleDeleteProfile}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <ResumeBuilder
          initialData={editingProfile}
          onSave={handleSaveProfile}
          onCancel={() => setView("grid")}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default ResumeManager;