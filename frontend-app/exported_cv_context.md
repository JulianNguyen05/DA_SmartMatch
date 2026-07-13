# Ngữ cảnh Code Hiện Tại cho CV Builder

## File: `src/components/shared/cvProfileShared.jsx`
```jsx
// src/components/shared/cvProfileShared.js
// ════════════════════════════════════════════════════════════════════════════
// FILE DÙNG CHUNG: ProfilePage & CVBuilderPage
//
// Export:
//  - Constants  : SKILL_LEVELS, SKILL_CATEGORIES, LEVEL_STYLES
//  - Factories  : makeSkillBlock(), makeProfileBlock()
//  - Hooks      : useDragSort(), useBlockEditor()
//  - Components : LevelBar, ProfileField, SectionLabel, SkillBlockCard,
//                 ProfileBlockCard, SkillEditorPanel, ProfileEditorPanel,
//                 LoadingSpinner
// ════════════════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';
import Input from '../common/Input';

// ────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────────────────────

export const SKILL_LEVELS = ['Cơ bản', 'Trung bình', 'Thành thạo', 'Chuyên gia'];

export const SKILL_CATEGORIES = [
  'Lập trình',
  'Thiết kế',
  'Quản lý',
  'Ngôn ngữ',
  'Phân tích dữ liệu',
  'DevOps',
  'Kinh doanh',
  'Khác',
];

export const LEVEL_STYLES = {
  'Cơ bản':    'bg-gray-100   text-gray-600   border-gray-200',
  'Trung bình':'bg-blue-50    text-blue-600   border-blue-100',
  'Thành thạo':'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Chuyên gia':'bg-amber-50   text-amber-700  border-amber-100',
};

// ────────────────────────────────────────────────────────────────────────────
// FACTORY FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Tạo một block kỹ năng rỗng mới.
 * @param {object} overrides - Ghi đè các trường mặc định nếu cần
 */
export const makeSkillBlock = (overrides = {}) => ({
  id:    `block-skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type:  'SKILLS',
  title: 'Kỹ năng mới',
  color: '#f0f9ff',
  data: {
    skillName:   '',
    level:       'Trung bình',
    category:    'Lập trình',
    description: '',
  },
  ...overrides,
});

/**
 * Tạo block thông tin cá nhân (PROFILE) với dữ liệu tuỳ chọn.
 * @param {object} profileData - Dữ liệu từ API để điền vào
 */
export const makeProfileBlock = (profileData = {}) => ({
  id:    'block-profile',
  type:  'PROFILE',
  title: 'Thông tin cá nhân',
  color: '#ffffff',
  data: {
    fullName: profileData.fullName || '',
    phone:    profileData.phone    || '',
    gender:   profileData.gender   || 'Nam',
    dob:      profileData.dob      || '',
    address:  profileData.address  || '',
    email:    profileData.email    || '',
    summary:  profileData.summary  || '',
  },
});

/**
 * Chuyển đổi mảng skills từ API thành mảng skill blocks.
 * @param {Array} skillsData - Mảng skills từ candidateService.getSkills()
 */
export const mapApiSkillsToBlocks = (skillsData = []) =>
  skillsData.map((s, index) => ({
    id:    `block-skill-${s.id || Date.now()}-${index}`,
    type:  'SKILLS',
    title: s.skillName || 'Kỹ năng',
    color: '#f0f9ff',
    data: {
      skillName:   s.skillName   || '',
      level:       s.level       || 'Trung bình',
      category:    s.category    || 'Lập trình',
      description: s.description || '',
      remoteId:    s.id,
    },
  }));

// ────────────────────────────────────────────────────────────────────────────
// HOOKS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Hook xử lý drag-and-drop để sắp xếp lại danh sách blocks.
 * @param {Function} setBlocks - State setter của blocks
 * @returns {{ dragStart, dragEnter, dragEnd }}
 */
export const useDragSort = (setBlocks) => {
  const dragItem     = useRef(null);
  const dragOverItem = useRef(null);

  const dragStart = (e, position) => {
    dragItem.current = position;
    e.currentTarget.style.opacity = '0.4';
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const dragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    if (dragItem.current == null || dragOverItem.current == null) return;
    setBlocks(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(dragItem.current, 1);
      copy.splice(dragOverItem.current, 0, moved);
      return copy;
    });
    dragItem.current     = null;
    dragOverItem.current = null;
  };

  return { dragStart, dragEnter, dragEnd };
};

/**
 * Hook tập hợp các handler chỉnh sửa block.
 * @param {string}   activeBlockId - ID block đang được chọn
 * @param {Function} setBlocks     - State setter của blocks
 * @returns {{ handleBlockChange, handleDataChange, handleSkillNameChange, handleAddSkill, handleDeleteBlock }}
 */
export const useBlockEditor = (activeBlockId, setBlocks, setActiveBlockId, setToast) => {
  /** Thay đổi field cấp cao nhất của block (vd: color) */
  const handleBlockChange = (field, value) =>
    setBlocks(prev =>
      prev.map(b => b.id === activeBlockId ? { ...b, [field]: value } : b)
    );

  /** Thay đổi field bên trong block.data */
  const handleDataChange = (field, value) =>
    setBlocks(prev =>
      prev.map(b =>
        b.id === activeBlockId ? { ...b, data: { ...b.data, [field]: value } } : b
      )
    );

  /** Đồng bộ title block với skillName */
  const handleSkillNameChange = (value) =>
    setBlocks(prev =>
      prev.map(b =>
        b.id === activeBlockId
          ? { ...b, title: value || 'Kỹ năng mới', data: { ...b.data, skillName: value } }
          : b
      )
    );

  /** Thêm một skill block mới và focus vào nó */
  const handleAddSkill = () => {
    const nb = makeSkillBlock();
    setBlocks(prev => [...prev, nb]);
    setActiveBlockId(nb.id);
  };

  /** Xoá block (không cho xoá block profile hoặc khi chỉ còn 1 skill) */
  const handleDeleteBlock = (idToDelete, blocks) => {
    if (idToDelete === 'block-profile') {
      setToast({ show: true, type: 'error', message: 'Không thể xóa khối Thông tin cá nhân.' });
      return;
    }
    const skillBlocks = blocks.filter(b => b.type === 'SKILLS');
    if (skillBlocks.length <= 1) {
      setToast({ show: true, type: 'error', message: 'Cần ít nhất một kỹ năng trong hồ sơ.' });
      return;
    }
    setBlocks(prev => prev.filter(b => b.id !== idToDelete));
    if (activeBlockId === idToDelete) setActiveBlockId('block-profile');
  };

  return { handleBlockChange, handleDataChange, handleSkillNameChange, handleAddSkill, handleDeleteBlock };
};

// ────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ────────────────────────────────────────────────────────────────────────────

/** Thanh hiển thị mức độ kỹ năng (4 đoạn màu) */
export const LevelBar = ({ level }) => {
  const idx = SKILL_LEVELS.indexOf(level);
  return (
    <div className="flex gap-1 mt-2">
      {SKILL_LEVELS.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all ${
            i <= idx ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

/** Hiển thị một trường thông tin dạng label + value */
export const ProfileField = ({ label, value, highlight }) => (
  <div>
    <span className="text-xs text-gray-400 font-medium block">{label}</span>
    <span
      className={`text-sm mt-0.5 block truncate ${
        highlight ? 'font-semibold text-gray-900' : 'text-gray-700'
      }`}
    >
      {value || <span className="text-gray-300 italic">—</span>}
    </span>
  </div>
);

/** Nhãn phân đoạn trong panel chỉnh sửa */
export const SectionLabel = ({ children }) => (
  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-1 pb-2 border-b border-gray-100">
    {children}
  </p>
);

/** Spinner loading có text tuỳ chỉnh */
export const LoadingSpinner = ({ text = 'Đang tải dữ liệu...' }) => (
  <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// CANVAS BLOCK CARDS (hiển thị trên canvas trái)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Card hiển thị thông tin Profile trên canvas.
 * @param {object}   profileBlock   - Block PROFILE
 * @param {string}   activeBlockId  - ID block đang active
 * @param {Function} onSelect       - Callback khi click để chọn
 */
export const ProfileBlockCard = ({ profileBlock, activeBlockId, onSelect }) => {
  if (!profileBlock) return null;
  const isActive = activeBlockId === profileBlock.id;

  return (
    <div
      onClick={() => onSelect(profileBlock.id)}
      className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden
        ${isActive
          ? 'border-indigo-500 shadow-md shadow-indigo-100'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
        }`}
      style={{ backgroundColor: profileBlock.color }}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl" />

      <div className="pl-5 pr-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {profileBlock.title}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <ProfileField label="Họ và tên"  value={profileBlock.data.fullName} highlight />
          <ProfileField label="Điện thoại" value={profileBlock.data.phone} />
          <ProfileField label="Email"       value={profileBlock.data.email} />
          <ProfileField label="Giới tính"  value={profileBlock.data.gender} />
          <ProfileField label="Ngày sinh"  value={profileBlock.data.dob} />
          <ProfileField label="Địa chỉ"    value={profileBlock.data.address} />
          {profileBlock.data.summary && (
            <div className="col-span-2 md:col-span-3">
              <span className="text-xs text-gray-400 font-medium">Giới thiệu bản thân</span>
              <p className="text-gray-700 mt-0.5 leading-relaxed line-clamp-2">
                {profileBlock.data.summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Card hiển thị một kỹ năng trên canvas, hỗ trợ drag-and-drop.
 * @param {object}   block         - Block SKILLS
 * @param {number}   globalIdx     - Vị trí trong mảng blocks tổng (để drag)
 * @param {string}   activeBlockId - ID block đang active
 * @param {Function} onSelect      - Callback khi click
 * @param {Function} dragStart     - Handler dragStart
 * @param {Function} dragEnter     - Handler dragEnter
 * @param {Function} dragEnd       - Handler dragEnd
 */
export const SkillBlockCard = ({
  block,
  globalIdx,
  activeBlockId,
  onSelect,
  dragStart,
  dragEnter,
  dragEnd,
}) => {
  const isActive = activeBlockId === block.id;

  return (
    <div
      draggable
      onDragStart={(e) => dragStart(e, globalIdx)}
      onDragEnter={(e) => dragEnter(e, globalIdx)}
      onDragEnd={dragEnd}
      onClick={() => onSelect(block.id)}
      className={`relative group cursor-grab rounded-xl border-2 transition-all duration-200 overflow-hidden
        ${isActive
          ? 'border-blue-500 shadow-md shadow-blue-50'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
        }`}
      style={{ backgroundColor: block.color }}
    >
      {/* Drag handle icon */}
      <div className="absolute top-3 right-3 text-gray-300 group-hover:text-gray-400 cursor-grab">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 rounded-l-xl" />

      <div className="pl-5 pr-10 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-800 truncate">
                {block.data.skillName || (
                  <span className="text-gray-400 italic font-normal">Chưa đặt tên...</span>
                )}
              </h3>
              <span className={`text-xs border px-2 py-0.5 rounded-full font-medium
                ${LEVEL_STYLES[block.data.level] || LEVEL_STYLES['Trung bình']}`}>
                {block.data.level}
              </span>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {block.data.category}
              </span>
            </div>
            <LevelBar level={block.data.level} />
            {block.data.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-1 leading-relaxed">
                {block.data.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// EDITOR PANELS (bảng điều khiển bên phải)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Panel chỉnh sửa thông tin Profile.
 * @param {object}   data           - block.data của PROFILE block
 * @param {Function} handleDataChange - (field, value) => void
 */
export const ProfileEditorPanel = ({ data, handleDataChange }) => (
  <>
    <SectionLabel>Thông tin liên hệ</SectionLabel>

    <Input
      label="Họ và tên *"
      value={data.fullName}
      onChange={(e) => handleDataChange('fullName', e.target.value)}
      placeholder="Nguyễn Văn A"
    />
    <Input
      label="Email"
      type="email"
      value={data.email}
      onChange={(e) => handleDataChange('email', e.target.value)}
      placeholder="email@example.com"
    />
    <Input
      label="Số điện thoại"
      value={data.phone}
      onChange={(e) => handleDataChange('phone', e.target.value)}
      placeholder="0912 345 678"
    />

    <div className="flex gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
        <select
          value={data.gender}
          onChange={(e) => handleDataChange('gender', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
            outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white"
        >
          <option>Nam</option>
          <option>Nữ</option>
          <option>Khác</option>
        </select>
      </div>
      <div className="flex-1">
        <Input
          label="Ngày sinh"
          type="date"
          value={data.dob}
          onChange={(e) => handleDataChange('dob', e.target.value)}
        />
      </div>
    </div>

    <Input
      label="Địa chỉ"
      value={data.address}
      onChange={(e) => handleDataChange('address', e.target.value)}
      placeholder="Quận 1, TP. Hồ Chí Minh"
    />

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Giới thiệu bản thân
      </label>
      <textarea
        rows={4}
        value={data.summary}
        onChange={(e) => handleDataChange('summary', e.target.value)}
        placeholder="Tóm tắt ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
          outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
      />
    </div>
  </>
);

/**
 * Panel chỉnh sửa một kỹ năng.
 * @param {object}   data               - block.data của SKILLS block
 * @param {string}   blockColor         - block.color
 * @param {Function} handleDataChange   - (field, value) => void
 * @param {Function} handleSkillNameChange - (value) => void (sync title)
 * @param {Function} handleBlockChange  - (field, value) => void (vd: color)
 * @param {boolean}  showColorPicker    - Hiển thị tuỳ chọn màu nền (ProfilePage cần, CVBuilder không)
 */
export const SkillEditorPanel = ({
  data,
  blockColor,
  handleDataChange,
  handleSkillNameChange,
  handleBlockChange,
  showColorPicker = true,
}) => (
  <>
    <SectionLabel>Thông tin kỹ năng</SectionLabel>

    <Input
      label="Tên kỹ năng *"
      value={data.skillName}
      onChange={(e) => handleSkillNameChange(e.target.value)}
      placeholder="VD: ReactJS, Quản lý dự án, Python..."
    />

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
      <select
        value={data.category}
        onChange={(e) => handleDataChange('category', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
          outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 bg-white"
      >
        {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Trình độ
        <span className={`ml-2 text-xs border px-2 py-0.5 rounded-full font-medium
          ${LEVEL_STYLES[data.level]}`}>
          {data.level}
        </span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {SKILL_LEVELS.map(lv => (
          <button
            key={lv}
            onClick={() => handleDataChange('level', lv)}
            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all
              ${data.level === lv
                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
          >
            {lv}
          </button>
        ))}
      </div>
      <LevelBar level={data.level} />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Mô tả (tùy chọn)
      </label>
      <textarea
        rows={3}
        value={data.description}
        onChange={(e) => handleDataChange('description', e.target.value)}
        placeholder="Mô tả kinh nghiệm, dự án liên quan đến kỹ năng này..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
          outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
      />
    </div>

    {showColorPicker && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Màu nền</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={blockColor}
            onChange={(e) => handleBlockChange('color', e.target.value)}
            className="w-9 h-9 p-0 border-0 rounded-lg cursor-pointer"
          />
          <span className="text-sm text-gray-500 font-mono uppercase">{blockColor}</span>
        </div>
      </div>
    )}
  </>
);

```

## File: `src/services/axiosClient.js`
```javascript
import axios from 'axios';

// Khởi tạo instance của axios
const axiosClient = axios.create({
  // Đã có sẵn /api/v1 ở đây, nên các service bên dưới chỉ cần gọi /auth/...
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Gắn JWT Token vào trước khi gửi đi
// File: axiosClient.js
axiosClient.interceptors.request.use(
  (config) => {
    let token = null;

    // 1. Thử lấy từ Object 'user' trước (Vì dữ liệu thật nằm ở đây)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        token = userObj.accessToken; // Trích xuất token từ nội bộ object user
      } catch (e) {
        console.error("Không thể parse Object user từ localStorage", e);
      }
    }

    // 2. Phương án dự phòng nếu bạn lưu lẻ ở ngoài
    if (!token || token === 'undefined' || token === 'null') {
      token = localStorage.getItem('accessToken');
    }

    // 3. Gắn token hợp lệ vào header
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý dữ liệu trả về và bắt lỗi
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi phổ biến (Token hết hạn, chưa xác thực)
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc chưa xác thực (401). Đang chuyển hướng...");
      // Xóa thông tin phiên làm việc
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');

      // Chuyển hướng về trang Login
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

## File: `src/features/auth/authService.js`
```javascript
import axiosClient from '../../services/axiosClient';

const authService = {
  register: async (userData) => {
    // Gọi API: http://localhost:8080/api/v1/auth/register
    const response = await axiosClient.post('/auth/register', userData);
    return response.data; 
  },

  login: async (credentials) => {
    // Gọi API: http://localhost:8080/api/v1/auth/login
    const response = await axiosClient.post('/auth/login', credentials);
    
    // response.data là cục ApiResponse { code: 200, message: "...", data: { accessToken: "...", role: "..." } }
    const apiResponse = response.data;
    
    // Bóc tách payload thực sự (AuthResponse) nằm bên trong field "data"
    const authData = apiResponse.data; 

    // Kiểm tra và lưu thông tin
    if (authData && authData.accessToken) {
      // Lưu dạng Object cho hàm getCurrentUser
      localStorage.setItem('user', JSON.stringify(authData));
      
      // Lưu 2 biến này để AxiosClient và Navbar hoạt động bình thường
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('userRole', authData.role);
    }
    
    return apiResponse;
  },

  logout: () => {
    // Xóa sạch thông tin phiên đăng nhập
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  forgotPassword: async (email) => {
    // Gọi API: http://localhost:8080/api/v1/auth/forgot-password
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  changePassword: async (userId, passwordData) => {
    // Gọi API: PUT http://localhost:8080/api/v1/auth/{userId}/password
    const response = await axiosClient.put(`/auth/${userId}/password`, passwordData);
    return response.data;
  },

  enableMfa: async (userId) => {
    // Gọi API: http://localhost:8080/api/v1/auth/{userId}/mfa/enable
    const response = await axiosClient.post(`/auth/${userId}/mfa/enable`);
    return response.data;
  }
};

export default authService;
```

## File: `src/components/cv-builder/sidebar/DraggableItem.jsx`
```jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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

const DraggableItem = ({
  id,
  itemId,
  primaryColor,
  variant = "default",
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isOverlay ? 999 : "auto",
  };

  // Tự động nhận diện ID "customSection_123..." thành "Thông tin thêm"
  const displayName = itemId?.startsWith("customSection")
    ? "Thông tin thêm"
    : SECTION_NAMES[itemId] || itemId;

  // === HIỆU ỨNG RĂNG CƯA (PLACEHOLDER) ===
  // Khi item bị nhấc đi, để lại một khoảng trống có viền nét đứt màu của theme
  // === HIỆU ỨNG RĂNG CƯA (PLACEHOLDER) ===
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          backgroundColor: `${primaryColor}15`,
          borderColor: primaryColor,
        }}
        className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed opacity-50"
      >
        {/* Render nội dung ẩn để giữ đúng kích thước của item gốc */}
        <GripVertical size={14} className="opacity-0 flex-shrink-0" />
        <span className="text-sm font-medium flex-1 truncate opacity-0">
          {displayName}
        </span>
      </div>
    );
  }

  // === GIAO DIỆN BÌNH THƯỜNG & KHI BAY LƠ LỬNG (OVERLAY) ===
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-2 p-2.5 rounded-xl cursor-grab active:cursor-grabbing
        border transition-all duration-200 select-none
        ${isOverlay ? "shadow-xl scale-105 rotate-2 text-white" : "hover:shadow-md hover:-translate-y-0.5 text-slate-700"}
        ${variant === "unused" && !isOverlay ? "bg-slate-50 border-slate-200 hover:border-[#2563EB]" : ""}
      `}
      style={{
        ...style,
        // Nếu là Overlay -> Đổ full nền màu xanh. Nếu bình thường -> Nền trắng/xám
        backgroundColor: isOverlay
          ? primaryColor
          : variant === "unused"
            ? "#F8FAFC"
            : "#ffffff",
        borderColor: isOverlay ? primaryColor : "#E2E8F0",
      }}
    >
      <GripVertical
        size={14}
        className={`flex-shrink-0 ${isOverlay ? "text-white" : "text-slate-400"}`}
      />
      <span className="text-sm font-medium flex-1 truncate">{displayName}</span>
    </div>
  );
};

export default DraggableItem;
```

## File: `src/components/cv-builder/sidebar/LayoutSidebar.jsx`
```jsx
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import DraggableItem from './DraggableItem';

const getColumnWidths = (ratio) => {
  switch (ratio) {
    case '1-9':
    case '10-90':
      return { left: '10%', right: '90%' };

    case '2-8':
    case '20-80':
      return { left: '20%', right: '80%' };

    case '3-7':
    case '30-70':
      return { left: '30%', right: '70%' };

    case '4-6':
    case '40-60':
      return { left: '40%', right: '60%' };

    case '5-5':
    case '50-50':
      return { left: '50%', right: '50%' };

    case '6-4':
    case '60-40':
      return { left: '60%', right: '40%' };

    case '7-3':
    case '70-30':
      return { left: '70%', right: '30%' };

    case '8-2':
    case '80-20':
      return { left: '80%', right: '20%' };

    case '9-1':
    case '90-10':
      return { left: '90%', right: '10%' };

    case '10-0':
    case '100-0':
      return { left: '100%', right: '0%' };

    default:
      return { left: '100%', right: '0%' };
  }
};

const LayoutSidebar = ({ layout, onChangeRatio, primaryColor, onAddRow, onDeleteRow, onMoveRow }) => {
  const { activeRows, unusedItems } = layout;

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800">Tùy chỉnh bố cục</h3>
      </div>
      
      <div className="space-y-4 mb-6">
        {activeRows.map((row, index) => (
          <RowBlock 
            key={row.id} 
            row={row} 
            rowIndex={index} 
            isLastRow={index === activeRows.length - 1}
            onChangeRatio={onChangeRatio} 
            primaryColor={primaryColor} 
            onDeleteRow={onDeleteRow}
            onMoveRow={onMoveRow}
          />
        ))}
      </div>

      {/* NÚT THÊM HÀNG MỚI */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={onAddRow}
          className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-xl transition-all hover:shadow-sm"
          style={{ borderColor: primaryColor, color: primaryColor }}
        >
          <Plus size={16} /> 
          <span className="text-sm font-semibold">Thêm hàng mới</span>
        </button>
      </div>

      <UnusedItemsPool items={unusedItems} primaryColor={primaryColor} />
    </div>
  );
};

const RowBlock = ({ row, rowIndex, isLastRow, onChangeRatio, primaryColor, onDeleteRow, onMoveRow }) => {
  const hasRightCol = row.ratio !== '10-0' && row.ratio !== '100-0';
  const widths = getColumnWidths(row.ratio);

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
        
        {/* TÊN HÀNG & THANH CÔNG CỤ (Lên/Xuống/Xóa) */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-slate-700">Hàng {rowIndex + 1}</span>
          <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <button 
              onClick={() => onMoveRow(rowIndex, 'up')} 
              disabled={rowIndex === 0} 
              className="p-1 hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-500 disabled:opacity-30 disabled:hover:bg-white transition-colors border-r border-slate-200"
              title="Di chuyển lên"
            >
              <ArrowUp size={13}/>
            </button>
            <button 
              onClick={() => onMoveRow(rowIndex, 'down')} 
              disabled={isLastRow} 
              className="p-1 hover:bg-[#EFF6FF] hover:text-[#2563EB] text-slate-500 disabled:opacity-30 disabled:hover:bg-white transition-colors border-r border-slate-200"
              title="Di chuyển xuống"
            >
              <ArrowDown size={13}/>
            </button>
            <button 
              onClick={() => onDeleteRow(row.id)} 
              className="p-1 hover:bg-red-50 text-red-500 transition-colors"
              title="Xóa hàng này"
            >
              <Trash2 size={13}/>
            </button>
          </div>
        </div>

        <select 
          value={row.ratio}
          onChange={(e) => onChangeRatio(row.id, e.target.value)}
          className="text-xs border border-slate-300 p-1.5 rounded-md bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] cursor-pointer transition-all"
        >
          <option value="10-90">2 cột (10-90)</option>
          <option value="20-80">2 cột (20-80)</option>
          <option value="30-70">2 cột (30-70)</option>
          <option value="40-60">2 cột (40-60)</option>
          <option value="50-50">2 cột (50-50)</option>
          <option value="60-40">2 cột (60-40)</option>
          <option value="70-30">2 cột (70-30)</option>
          <option value="80-20">2 cột (80-20)</option>
          <option value="90-10">2 cột (90-10)</option>
          <option value="100-0">1 cột (100%)</option>
        </select>
      </div>

      <div className="flex flex-row w-full gap-2 items-start">
        <DroppableColumn rowId={row.id} column="left" items={row.leftItems} primaryColor={primaryColor} label="Cột trái" width={widths.left} />
        {hasRightCol && (
          <DroppableColumn rowId={row.id} column="right" items={row.rightItems} primaryColor={primaryColor} label="Cột phải" width={widths.right} />
        )}
      </div>
    </div>
  );
};

const DroppableColumn = ({ rowId, column, items, primaryColor, label, width }) => {
  const droppableId = `droppable-${rowId}-${column}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const sortableItems = items.map(id => `item-${id}`);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-0 min-h-[120px] p-2 border-2 rounded-xl transition-all duration-300 ${isOver ? 'border-dashed' : 'border-slate-200'} bg-white`}
      style={{ width: width, borderColor: isOver ? primaryColor : '#e5e7eb', backgroundColor: isOver ? `${primaryColor}08` : '#ffffff' }}
    >
      <div className="text-[10px] font-semibold text-slate-400 mb-2 uppercase text-center truncate">{label}</div>
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.length > 0 ? (
            items.map(itemId => <DraggableItem key={itemId} id={`item-${itemId}`} itemId={itemId} primaryColor={primaryColor} />)
          ) : (
            <div className="text-[10px] text-slate-400 italic py-6 text-center">Kéo thả vào đây</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const UnusedItemsPool = ({ items, primaryColor }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'unused-pool' });
  const sortableItems = items.map(id => `unused-${id}`);

  return (
    <div className="mt-4 pt-6 border-t border-dashed border-slate-300">
      <h4 className="font-bold text-sm text-slate-500 mb-3 uppercase">Mục chưa sử dụng</h4>
      <div
        ref={setNodeRef}
        className={`p-3 min-h-[100px] border-2 rounded-xl transition-all ${isOver ? 'border-dashed' : 'border-slate-200'} bg-white`}
        style={{ borderColor: isOver ? primaryColor : '#e5e7eb', backgroundColor: isOver ? `${primaryColor}08` : '#ffffff' }}
      >
        <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {items.length > 0 ? (
              items.map(itemId => <DraggableItem key={itemId} id={`unused-${itemId}`} itemId={itemId} primaryColor={primaryColor} variant="unused" />)
            ) : (
              <div className="text-xs text-slate-400 italic w-full text-center py-4">Tất cả mục đều đang sử dụng</div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default LayoutSidebar;
```

## File: `src/components/common/Button/index.jsx`
```jsx
import React from 'react';

const Button = ({ children, isLoading, className = '', variant = 'primary', ...props }) => {
  const baseStyle =
    "inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm " +
    "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary:
      "bg-blue-600 text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/40 focus-visible:ring-blue-500",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-300",
    outline:
      "border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-300",
    ghost:
      "text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300",
    danger:
      "bg-red-600 text-white shadow-sm shadow-red-600/30 hover:bg-red-700 focus-visible:ring-red-500",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

```

## File: `src/components/common/Modal/index.jsx`
```jsx
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
```

## File: `src/components/common/Input/index.jsx`
```jsx
import React from 'react';

const Input = React.forwardRef(function Input(
  { label, type = "text", name, value, onChange, placeholder, required = false, hint, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={
          "block w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/60 " +
          "text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-150 " +
          "focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 " +
          className
        }
        {...props}
      />
    </div>
  );
});

export default Input;

```

