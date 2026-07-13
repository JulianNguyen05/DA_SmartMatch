// src/pages/candidate/ProfilePage/index.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Toast from '../../../components/common/Toast';
import candidateService from '../../../features/candidate/candidateService';
import authService from '../../../features/auth/authService';
import { LoadingSpinner } from '../../../components/shared/cvProfileShared';
import ProfileLayoutSandbox from '../../../components/candidate-profile/ProfileLayoutSandbox';
import { getBlockItems } from '../../../components/candidate-profile/blockConfig';
import { BLOCK_FORM_CONFIGS } from '../../../components/candidate-profile/blockFormConfig';
import BlockListEditorModal from '../../../components/candidate-profile/BlockListEditorModal';
import SkillEditorModal from '../../../components/candidate-profile/SkillEditorModal';
import LanguageEditorModal from '../../../components/candidate-profile/LanguageEditorModal';
import ProfileInfoModal from '../../../components/candidate-profile/ProfileInfoModal';
import AvatarModal from '../../../components/candidate-profile/AvatarModal';

const ProfilePage = () => {
  const userId = authService.getCurrentUser()?.userId;

  const [profileData, setProfileData] = useState(null);
  const [layout, setLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [editingBlockType, setEditingBlockType] = useState(null); // block đang mở modal, null = đóng hết

  const showToast = useCallback(({ type, message }) => setToast({ show: true, type, message }), []);

  // ─── Tải dữ liệu (dùng lại cho cả lần đầu và mỗi khi modal lưu thành công) ─
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

  // Xác định loại modal cần mở dựa trên blockType
  const isGenericBlock = editingBlockType && BLOCK_FORM_CONFIGS[editingBlockType];
  const isSkillBlock = editingBlockType === 'SKILL';
  const isLanguageBlock = editingBlockType === 'LANGUAGE';
  const isProfileInfoBlock = editingBlockType === 'PERSONAL_INFO' || editingBlockType === 'SOCIAL_LINKS';
  const isAvatarBlock = editingBlockType === 'AVATAR';

  return (
    <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto">
      <header className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Hồ Sơ Năng Lực</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kéo-thả để sắp xếp thứ tự hiển thị, bấm biểu tượng bút chì để chỉnh sửa từng mục
        </p>
      </header>

      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ show: false })} />}

      {layout.length > 0 ? (
        <ProfileLayoutSandbox
          layout={layout}
          profileData={profileData}
          onReorder={handleReorder}
          onToggleVisibility={handleToggleVisibility}
          onEdit={setEditingBlockType}
        />
      ) : (
        <div className="text-center py-20 text-gray-400">Chưa có dữ liệu bố cục.</div>
      )}

      {/* ─── 7 block danh sách đơn giản (config-driven) ─── */}
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

      {/* ─── Skill (dropdown danh mục + đề xuất) ─── */}
      {isSkillBlock && (
        <SkillEditorModal
          userId={userId}
          items={profileData?.skills || []}
          isOpen={true}
          onClose={() => setEditingBlockType(null)}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      )}

      {/* ─── Language (dropdown danh mục + đề xuất) ─── */}
      {isLanguageBlock && (
        <LanguageEditorModal
          userId={userId}
          items={profileData?.languages || []}
          isOpen={true}
          onClose={() => setEditingBlockType(null)}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      )}

      {/* ─── PERSONAL_INFO + SOCIAL_LINKS (gộp chung 1 form) ─── */}
      {isProfileInfoBlock && (
        <ProfileInfoModal
          userId={userId}
          profile={profileData?.profile}
          isOpen={true}
          onClose={() => setEditingBlockType(null)}
          onSaved={fetchFullProfile}
          onToast={showToast}
        />
      )}

      {/* ─── Avatar ─── */}
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
