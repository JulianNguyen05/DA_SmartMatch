// src/pages/candidate/ProfilePage/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Toast from '../../../components/common/Toast';
import candidateService from '../../../features/candidate/candidateService';
import authService from '../../../features/auth/authService';
import { LoadingSpinner } from '../../../components/shared/cvProfileShared';
import ProfileLayoutSandbox from '../../../components/candidate-profile/sandbox/ProfileLayoutSandbox';
import { LayoutGrid, Pencil, Check } from 'lucide-react';

const ProfilePage = () => {
  const userId = authService.getCurrentUser()?.userId;

  const [profileData, setProfileData] = useState(null);
  const [layout, setLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isEditMode, setIsEditMode] = useState(false); // false = chỉ xem portfolio, true = kéo-thả/resize + nhập trực tiếp

  const showToast = useCallback(({ type, message }) => setToast({ show: true, type, message }), []);

  // ─── Tải dữ liệu (dùng lại cho lần đầu + mỗi khi 1 field trong card được lưu) ─
  const fetchFullProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await candidateService.getFullProfile(userId);
      const data = res?.data;
      setProfileData(data);
      setLayout([...(data?.layout || [])].sort((a, b) => a.position - b.position));
    } catch (error) {
      showToast({ type: 'error', message: 'Không tải được dữ liệu hồ sơ, vui lòng thử lại.' });
    }
  }, [userId, showToast]);

  useEffect(() => {
    if (!userId) { setIsLoading(false); return; }
    fetchFullProfile().finally(() => setIsLoading(false));
  }, [userId, fetchFullProfile]);

  // ─── Kéo-thả đổi vị trí block ───────────────────────────────────────
  const handleReorder = useCallback(async (newLayout) => {
    const previous = layout;
    setLayout(newLayout);
    try {
      const items = newLayout.map((l) => ({ blockType: l.blockType, position: l.position }));
      await candidateService.reorderProfileLayout(userId, items);
    } catch (error) {
      setLayout(previous);
      showToast({ type: 'error', message: 'Không lưu được thứ tự mới, vui lòng thử lại.' });
    }
  }, [layout, userId, showToast]);

  // ─── Ẩn/hiện 1 block ────────────────────────────────────────────────
  const handleToggleVisibility = useCallback(async (blockType, nextVisible) => {
    const previous = layout;
    setLayout((prev) => prev.map((l) => (l.blockType === blockType ? { ...l, visible: nextVisible } : l)));
    try {
      await candidateService.toggleBlockVisibility(userId, blockType, nextVisible);
    } catch (error) {
      setLayout(previous);
      showToast({ type: 'error', message: 'Không cập nhật được trạng thái hiển thị.' });
    }
  }, [layout, userId, showToast]);

  if (isLoading) return <LoadingSpinner text="Đang tải hồ sơ..." />;

  return (
    <div className="w-full h-full min-h-screen bg-paper">
      {/* ─── Header: Blueprint Dossier — nền trắng, viền mảnh, 1 màu mực ─── */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-graphite/10 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 p-2 bg-ink-light text-ink rounded-lg">
            <LayoutGrid size={18} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-graphite/40 leading-none font-tag">
              Portfolio ứng viên
            </p>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-graphite truncate font-display">
              {profileData?.profile?.fullName || 'Portfolio của bạn'}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditMode((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shrink-0 font-body
            ${isEditMode ? 'bg-ink text-white hover:bg-ink-dark' : 'bg-white text-graphite border border-graphite/15 hover:border-ink hover:text-ink'}`}
        >
          {isEditMode ? (
            <><Check size={16} strokeWidth={2} /> Xong</>
          ) : (
            <><Pencil size={16} strokeWidth={2} /> Chỉnh sửa hồ sơ</>
          )}
        </button>
      </header>

      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast({ show: false })} />
        </div>
      )}

      {layout.length > 0 ? (
        <ProfileLayoutSandbox
          layout={layout}
          profileData={profileData}
          onReorder={handleReorder}
          onToggleVisibility={handleToggleVisibility}
          isEditMode={isEditMode}
          userId={userId}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      ) : (
        <div className="h-full min-h-[60vh] flex items-center justify-center text-graphite/30 font-body">
          Chưa có dữ liệu bố cục.
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
