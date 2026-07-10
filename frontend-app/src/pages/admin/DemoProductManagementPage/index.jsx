import React, { useState, useEffect, useMemo, useRef } from 'react';
import demoProductService from '../../../features/admin/demoProductService';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatVND = (n) =>
  (Number(n) || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' đ';

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();

const AVATAR_HUES = [
  'bg-blue-50 text-blue-700 ring-blue-100',
  'bg-violet-50 text-violet-700 ring-violet-100',
  'bg-amber-50 text-amber-700 ring-amber-100',
  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'bg-rose-50 text-rose-700 ring-rose-100',
  'bg-cyan-50 text-cyan-700 ring-cyan-100',
];
const hueFor = (id) => AVATAR_HUES[id % AVATAR_HUES.length];

// ---------------------------------------------------------------------------
// Tiny local toast system (no extra dependency needed)
// ---------------------------------------------------------------------------
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  return { toasts, push };
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg ${
            t.type === 'success'
              ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
              : 'border-red-100 bg-red-50 text-red-800'
          }`}
        >
          <span className="text-sm font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function DemoProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  // State cho Modal (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', price: '' });

  // State lưu lại dữ liệu gốc để so sánh khi Sửa
  const [originalData, setOriginalData] = useState(null);

  // State cho xác nhận xóa (thay cho window.confirm)
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toasts, push } = useToasts();
  const nameInputRef = useRef(null);

  // 1. READ - Tải danh sách sản phẩm
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await demoProductService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
      push('error', 'Không thể tải danh sách sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isModalOpen) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [isModalOpen]);

  // Danh sách đã lọc + sắp xếp
  const visibleProducts = useMemo(() => {
    let list = products.filter((p) =>
      p.name.toLowerCase().includes(query.trim().toLowerCase())
    );
    list = [...list].sort((a, b) => (sortDesc ? b.price - a.price : a.price - b.price));
    return list;
  }, [products, query, sortDesc]);

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + (p.price || 0), 0),
    [products]
  );

  // Mở modal Thêm mới
  const handleOpenCreateModal = () => {
    setFormData({ id: null, name: '', price: '' });
    setOriginalData(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Mở modal Sửa
  const handleOpenEditModal = (product) => {
    const currentPrice = product.price ? product.price / 1000 : 0;
    const initialData = { id: product.id, name: product.name, price: currentPrice };

    setFormData(initialData);
    setOriginalData(initialData);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // 2. CREATE & UPDATE - Lưu dữ liệu
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        price: (Number(formData.price) || 0) * 1000,
      };

      if (isEditMode) {
        await demoProductService.updateProduct(formData.id, payload);
        push('success', `Đã cập nhật "${payload.name}".`);
      } else {
        await demoProductService.createProduct(payload);
        push('success', `Đã thêm "${payload.name}".`);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      push('error', 'Có lỗi xảy ra khi lưu dữ liệu!');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. DELETE - Xóa sản phẩm (xác nhận qua modal thay vì window.confirm)
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await demoProductService.deleteProduct(pendingDelete.id);
      push('success', `Đã xóa "${pendingDelete.name}".`);
      setPendingDelete(null);
      fetchProducts();
    } catch (error) {
      push('error', 'Lỗi khi xóa!');
    } finally {
      setIsDeleting(false);
    }
  };

  // Logic kiểm tra xem form có bị thay đổi hay không
  let isFormChanged = false;
  if (isEditMode && originalData) {
    isFormChanged =
      formData.name !== originalData.name ||
      String(formData.price) !== String(originalData.price);
  } else {
    isFormChanged = formData.name.trim() !== '' && String(formData.price).trim() !== '';
  }

  const previewPrice = (Number(formData.price) || 0) * 1000;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <ToastStack toasts={toasts} />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Demo
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản lý sản phẩm
            </h1>
            <p className="mt-1 text-sm text-slate-500">Thêm, sửa và theo dõi kho hàng của bạn.</p>
          </div>
          <Button onClick={handleOpenCreateModal}>
            + Thêm sản phẩm
          </Button>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              #
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Tổng sản phẩm</p>
              <p className="text-xl font-bold text-slate-900">{products.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              đ
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Tổng giá trị kho</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">{formatVND(totalValue)}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
            />
          </div>
          <button
            onClick={() => setSortDesc((s) => !s)}
            className="self-start text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Sắp xếp theo giá: {sortDesc ? 'giảm dần' : 'tăng dần'}
          </button>
        </div>

        {/* Bảng dữ liệu */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Sản phẩm</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Giá bán</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-3.5 w-40 animate-pulse rounded bg-slate-100" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-3.5 w-24 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-3.5 w-16 animate-pulse rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      {query ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có dữ liệu. Hãy thêm mới!'}
                    </p>
                    {query && <p className="mt-0.5 text-sm text-slate-400">Thử một từ khóa khác.</p>}
                  </td>
                </tr>
              ) : (
                visibleProducts.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-blue-50/40">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${hueFor(item.id)}`}>
                          {initials(item.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400">#{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold tabular-nums text-slate-700">
                      {formatVND(item.price)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => setPendingDelete(item)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        icon={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
            {isEditMode ? '✎' : '+'}
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 px-6 py-5">
          <div>
            <Input
              ref={nameInputRef}
              label="Tên sản phẩm"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Bàn phím cơ"
            />
          </div>
          <div>
            <Input
              label="Giá bán"
              hint="Đơn vị: nghìn VNĐ"
              type="number"
              required
              min="0"
              step="any"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Nhập 1 cho 1.000 đ"
            />
            {formData.price !== '' && (
              <p className="mt-1.5 text-xs font-medium text-blue-600">
                ≈ {formatVND(previewPrice)}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={!isFormChanged} isLoading={isSaving}>
              Lưu dữ liệu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Xóa sản phẩm"
        icon={
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 font-bold">
            !
          </div>
        }
      >
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600">
            Bạn có chắc muốn xóa <span className="font-semibold text-slate-900">"{pendingDelete?.name}"</span>?
            Hành động này không thể hoàn tác.
          </p>
          <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>Hủy</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={confirmDelete}>
              Xóa sản phẩm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
