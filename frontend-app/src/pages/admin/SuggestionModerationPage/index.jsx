// src/pages/admin/SuggestionModerationPage/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import Table from '../../../components/common/Table';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Toast from '../../../components/common/Toast';
import adminService from '../../../features/admin/adminService';

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
];

const STATUS_BADGE = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };
const STATUS_LABEL = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Đã từ chối' };

const REQUEST_TYPE_BADGE = { CREATE: 'primary', EDIT: 'warning', DELETE: 'danger' };
const REQUEST_TYPE_LABEL = { CREATE: 'Thêm mới', EDIT: 'Sửa', DELETE: 'Xóa' };

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SuggestionModerationPage = () => {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [processingId, setProcessingId] = useState(null); // suggestionId đang gọi API duyệt/từ chối
  const [rejectTarget, setRejectTarget] = useState(null); // suggestion đang mở modal từ chối
  const [reviewNote, setReviewNote] = useState('');

  const showToast = useCallback((type, message) => setToast({ show: true, type, message }), []);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getSuggestions(statusFilter);
      setSuggestions(res?.data || []);
      setCurrentPage(1);
    } catch (error) {
      showToast('error', 'Không tải được danh sách đề xuất.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return suggestions.slice(start, start + PAGE_SIZE);
  }, [suggestions, currentPage]);

  const totalPages = Math.max(1, Math.ceil(suggestions.length / PAGE_SIZE));

  const handleApprove = async (suggestion) => {
    if (!window.confirm(`Duyệt đề xuất "${suggestion.name}" (${REQUEST_TYPE_LABEL[suggestion.requestType]})?`)) return;
    setProcessingId(suggestion.id);
    try {
      await adminService.approveSuggestion(suggestion.id);
      showToast('success', 'Đã duyệt đề xuất.');
      fetchSuggestions();
    } catch (error) {
      // Quan trọng: DELETE có thể bị chặn nếu skill/language đang được candidate khác dùng
      // (xem AdminServiceImpl.applyDelete) — message trả về từ BE đã đủ rõ ràng, hiển thị thẳng.
      showToast('error', error.response?.data?.message || 'Duyệt đề xuất thất bại.');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (suggestion) => {
    setRejectTarget(suggestion);
    setReviewNote('');
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setProcessingId(rejectTarget.id);
    try {
      await adminService.rejectSuggestion(rejectTarget.id, reviewNote);
      showToast('success', 'Đã từ chối đề xuất.');
      setRejectTarget(null);
      fetchSuggestions();
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Từ chối đề xuất thất bại.');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    {
      header: 'Loại',
      accessor: 'requestType',
      render: (row) => <Badge variant={REQUEST_TYPE_BADGE[row.requestType]}>{REQUEST_TYPE_LABEL[row.requestType]}</Badge>,
    },
    { header: 'Danh mục', accessor: 'type' },
    {
      header: 'Nội dung đề xuất',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">{row.name}</p>
          {row.requestType !== 'CREATE' && (
            <p className="text-xs text-gray-400">Áp dụng cho ReferenceValue #{row.targetReferenceValueId}</p>
          )}
        </div>
      ),
    },
    { header: 'Người đề xuất', render: (row) => `User #${row.requestedByUserId}` },
    { header: 'Ngày gửi', render: (row) => formatDateTime(row.createdAt) },
    {
      header: 'Trạng thái',
      render: (row) => (
        <div>
          <Badge variant={STATUS_BADGE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
          {row.status !== 'PENDING' && row.reviewNote && (
            <p className="text-xs text-gray-400 mt-1 max-w-[180px] truncate" title={row.reviewNote}>
              {row.reviewNote}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Hành động',
      className: 'text-right',
      render: (row) => {
        if (row.status !== 'PENDING') return null;
        const isProcessing = processingId === row.id;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleApprove(row)}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg disabled:opacity-50"
            >
              <Check size={14} /> Duyệt
            </button>
            <button
              onClick={() => openRejectModal(row)}
              disabled={isProcessing}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg disabled:opacity-50"
            >
              <X size={14} /> Từ chối
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Duyệt đề xuất Skill / Language</h1>
        <p className="text-sm text-gray-500 mt-1">
          Candidate gửi đề xuất thêm mới, sửa hoặc xóa giá trị trong danh mục dùng chung (Skill/Language) — admin xét duyệt tại đây.
        </p>
      </div>

      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ show: false })} />}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 inline-flex gap-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === tab.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <Table
          columns={columns}
          data={pagedData}
          isLoading={isLoading}
          emptyMessage="Không có đề xuất nào ở trạng thái này."
        />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Modal nhập lý do từ chối */}
      <Modal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Từ chối đề xuất">
        <div className="p-5 min-w-[380px] max-w-[480px]">
          <p className="text-sm text-gray-600 mb-3">
            Từ chối đề xuất <span className="font-semibold">"{rejectTarget?.name}"</span>. Lý do sẽ hiển thị cho candidate.
          </p>
          <textarea
            rows={3}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="VD: Trùng với kỹ năng đã có, viết sai chính tả..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 resize-none"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Hủy</Button>
            <Button onClick={handleReject} isLoading={processingId === rejectTarget?.id}>Xác nhận từ chối</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuggestionModerationPage;
