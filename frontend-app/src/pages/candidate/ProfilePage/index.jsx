// src/pages/candidate/ProfilePage/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Toast from '../../../components/common/Toast';
import candidateService from '../../../features/candidate/candidateService';
import authService from '../../../features/auth/authService';
import { LoadingSpinner } from '../../../components/shared/cvProfileShared';
import ProfileLayoutSandbox from '../../../components/candidate-profile/sandbox/ProfileLayoutSandbox';
import { getBlockItems } from '../../../components/candidate-profile/shared/blockConfig';
import { BLOCK_FORM_CONFIGS } from '../../../components/candidate-profile/shared/blockFormConfig';
import BlockListEditorModal from '../../../components/candidate-profile/modals/BlockListEditorModal';
import ProfilePersonalInfoModal from '../../../components/candidate-profile/modals/ProfilePersonalInfoModal';
import ProfileSocialLinksModal from '../../../components/candidate-profile/modals/ProfileSocialLinksModal';
import AvatarModal from '../../../components/candidate-profile/modals/AvatarModal';
import { LayoutGrid, Pencil, Check } from 'lucide-react';

const ProfilePage = () => {
  const userId = authService.getCurrentUser()?.userId;

  const [profileData, setProfileData] = useState(null);
  const [layout, setLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [editingBlockType, setEditingBlockType] = useState(null); // block đang mở modal, null = đóng hết
  const [isEditMode, setIsEditMode] = useState(false); // false = chỉ xem portfolio, true = kéo-thả/resize được

  const showToast = useCallback(({ type, message }) => setToast({ show: true, type, message }), []);

  // ─── Tải dữ liệu (dùng lại cho cả lần đầu và mỗi khi modal/InlineEntryList lưu thành công) ─
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

  // Xác định loại modal cần mở dựa trên blockType — CHỈ còn áp dụng cho 5 block
  // chưa chuyển sang inline (SKILL/LANGUAGE/PERSONAL_INFO/SOCIAL_LINKS/AVATAR).
  // 7 block danh sách đơn giản giờ nhập trực tiếp qua InlineEntryList trong card,
  // nhưng vẫn giữ BlockListEditorModal ở đây phòng khi editingBlockType bị set
  // nhầm từ nơi khác — sẽ dọn hẳn ở Bước 4.
  const isGenericBlock = editingBlockType && BLOCK_FORM_CONFIGS[editingBlockType];
  const isPersonalInfoBlock = editingBlockType === 'PERSONAL_INFO';
  const isSocialLinksBlock = editingBlockType === 'SOCIAL_LINKS';
  const isAvatarBlock = editingBlockType === 'AVATAR';

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
            <><Pencil size={16} strokeWidth={2} /> Chỉnh sửa bố cục</>
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
          onEdit={setEditingBlockType}
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

      {/* ─── 7 block danh sách đơn giản — DỰ PHÒNG, sẽ xóa hẳn ở Bước 4 ─── */}
      {isGenericBlock && (
        <BlockListEditorModal
          blockType={editingBlockType}
          userId={userId}
          items={getBlockItems(editingBlockType, profileData)}
          isOpen={true}
          onClose={() => setEditingBlockType(null)}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      )}

      {/* ─── PERSONAL_INFO — sẽ chuyển inline ở Bước 3 ─── */}
      {isPersonalInfoBlock && (
        <ProfilePersonalInfoModal
          userId={userId}
          profile={profileData?.profile}
          isOpen={true}
          onClose={() => setEditingBlockType(null)}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      )}

      {/* ─── SOCIAL_LINKS — sẽ chuyển inline ở Bước 3 ─── */}
      {isSocialLinksBlock && (
        <ProfileSocialLinksModal
          userId={userId}
          profile={profileData?.profile}
          isOpen={true}
          onClose={() => setEditingBlockType(null)}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      )}

      {/* ─── Avatar — sẽ chuyển inline ở Bước 3 ─── */}
      {isAvatarBlock && (
        <AvatarModal
          userId={userId}
          currentAvatarUrl={profileData?.profile?.avatarUrl}
          isOpen={true}
          onClose={() => setEditingBlockType(null)}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      )}
    </div>
  );
};

export default ProfilePage;
