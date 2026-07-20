// src/components/candidate-profile/shared/InlineEntryList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import candidateService from '../../../features/candidate/candidateService';
import { BLOCK_FORM_CONFIGS } from './blockFormConfig';

let tempIdCounter = 0;
const nextTempId = () => `temp-${Date.now()}-${tempIdCounter++}`;

/**
 * Nhập trực tiếp danh sách item của 1 block ngay trong card — KHÔNG qua modal.
 * Auto-save khi rời khỏi field (blur): item mới (id tạm "temp-...") sẽ POST
 * khi field bắt buộc đầu tiên có giá trị; item đã có id thật sẽ PUT ở mọi blur.
 *
 * @param {string}   blockType   - 1 trong 7 key của BLOCK_FORM_CONFIGS
 * @param {number}   userId
 * @param {Array}    items       - danh sách item hiện tại (từ profileData)
 * @param {Function} onSaved     - () => void, gọi sau mỗi create/update/delete để cha refetch
 * @param {Function} onToast     - ({ type, message }) => void
 * @param {boolean}  [readOnly]  - true = chỉ hiển thị text tĩnh (chế độ xem portfolio)
 */
const InlineEntryList = ({ blockType, userId, items, onSaved, onToast, readOnly = false }) => {
  const config = BLOCK_FORM_CONFIGS[blockType];
  const [localItems, setLocalItems] = useState(() => (items || []).map((it) => ({ ...it })));

  // Đồng bộ lại khi cha refetch xong (id thật đã có, dữ liệu chuẩn từ server)
  useEffect(() => {
    setLocalItems((items || []).map((it) => ({ ...it })));
  }, [items]);

  if (!config) return null;

  const titleField = config.fields.find((f) => f.name === config.titleField);
  const dateFields = config.fields.filter((f) => f.type === 'date');
  const checkboxField = config.fields.find((f) => f.type === 'checkbox');
  const textareaField = config.fields.find((f) => f.type === 'textarea');
  const metaFields = config.fields.filter(
    (f) => f !== titleField && !dateFields.includes(f) && f !== checkboxField && f !== textareaField
  );

  const updateLocalField = (index, name, value) => {
    setLocalItems((prev) => prev.map((it, i) => (i === index ? { ...it, [name]: value } : it)));
  };

  const buildPayload = (item) => {
    const payload = {};
    config.fields.forEach((f) => {
      let v = item[f.name];
      if ((f.type === 'date' || f.type === 'number') && v === '') v = null;
      payload[f.name] = v ?? (f.type === 'checkbox' ? false : '');
    });
    return payload;
  };

  const handleFieldBlur = useCallback(async (index) => {
    const item = localItems[index];
    if (!item) return;
    const isDraft = String(item.id).startsWith('temp-');

    if (isDraft) {
      // Chỉ tạo mới khi field bắt buộc đã có nội dung — tránh spam POST rỗng
      // mỗi lần người dùng click ra rồi vào lại 1 dòng chưa nhập gì.
      const requiredOk = config.fields
        .filter((f) => f.required)
        .every((f) => String(item[f.name] || '').trim());
      if (!requiredOk) return;

      try {
        const res = await candidateService[`create${config.service}`](userId, buildPayload(item));
        const newId = res?.data?.id;
        if (newId) setLocalItems((prev) => prev.map((it, i) => (i === index ? { ...it, id: newId } : it)));
        onSaved?.();
      } catch (error) {
        onToast?.({ type: 'error', message: error.response?.data?.message || 'Không lưu được, thử lại.' });
      }
    } else {
      try {
        await candidateService[`update${config.service}`](userId, item.id, buildPayload(item));
        onSaved?.();
      } catch (error) {
        onToast?.({ type: 'error', message: error.response?.data?.message || 'Không lưu được, thử lại.' });
      }
    }
  }, [localItems, config, userId, onSaved, onToast]);

  const handleAdd = () => {
    setLocalItems((prev) => [...prev, { ...config.emptyItem, id: nextTempId() }]);
  };

  const handleDelete = async (index) => {
    const item = localItems[index];
    const isDraft = String(item.id).startsWith('temp-');
    if (isDraft) {
      setLocalItems((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm(`Xóa mục "${item[config.titleField] || 'này'}"?`)) return;
    try {
      await candidateService[`delete${config.service}`](userId, item.id);
      setLocalItems((prev) => prev.filter((_, i) => i !== index));
      onToast?.({ type: 'success', message: 'Đã xóa.' });
      onSaved?.();
    } catch (error) {
      onToast?.({ type: 'error', message: 'Xóa thất bại.' });
    }
  };

  if (readOnly) {
    return <ReadOnlyView config={config} items={localItems} />;
  }

  return (
    <div className="space-y-4">
      {localItems.map((item, index) => (
        <div key={item.id} className="group/entry relative pl-3 border-l-2 border-ink/25 hover:border-ink transition-colors">
          <button
            type="button"
            onClick={() => handleDelete(index)}
            className="absolute -right-1 top-0 p-1 text-graphite/45 opacity-0 group-hover/entry:opacity-100 hover:text-red-500 transition-all"
            title="Xóa mục này"
          >
            <Trash2 size={13} />
          </button>

          {/* Dòng tiêu đề + khoảng thời gian */}
          <div className="flex items-start justify-between gap-3 pr-6">
            {titleField && (
              <input
                value={item[titleField.name] || ''}
                onChange={(e) => updateLocalField(index, titleField.name, e.target.value)}
                onBlur={() => handleFieldBlur(index)}
                placeholder={titleField.label}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[17px] font-semibold text-graphite
                  font-display placeholder:text-graphite/30 placeholder:font-normal focus:bg-ink-light rounded px-1 -mx-1"
              />
            )}
            {dateFields.length > 0 && (
              <div className="flex items-center gap-1 shrink-0 text-[14px] text-ink font-tag">
                {dateFields.map((f, i) => (
                  <React.Fragment key={f.name}>
                    {i > 0 && <span className="text-graphite/55">–</span>}
                    <input
                      type="date"
                      value={item[f.name] || ''}
                      onChange={(e) => updateLocalField(index, f.name, e.target.value)}
                      onBlur={() => handleFieldBlur(index)}
                      className="bg-transparent border-none outline-none w-[108px] focus:bg-ink-light rounded px-0.5"
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Dòng meta (vị trí, hình thức, địa điểm...) */}
          {metaFields.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 mt-0.5">
              {metaFields.map((f, i) => (
                <React.Fragment key={f.name}>
                  {i > 0 && <span className="text-graphite/40 text-[15px]">·</span>}
                  {f.type === 'select' ? (
                    <select
                      value={item[f.name] || ''}
                      onChange={(e) => { updateLocalField(index, f.name, e.target.value); }}
                      onBlur={() => handleFieldBlur(index)}
                      className="bg-transparent border-none outline-none text-[15px] text-graphite/80 font-body focus:bg-ink-light rounded px-0.5"
                    >
                      {f.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : (
                    <input
                      value={item[f.name] || ''}
                      onChange={(e) => updateLocalField(index, f.name, e.target.value)}
                      onBlur={() => handleFieldBlur(index)}
                      placeholder={f.label}
                      className="bg-transparent border-none outline-none text-[15px] text-graphite/80 font-body
                        placeholder:text-graphite/25 focus:bg-ink-light rounded px-0.5 min-w-[60px]"
                      style={{ width: `${Math.max((item[f.name]?.length || f.label.length) * 6.5, 60)}px` }}
                    />
                  )}
                </React.Fragment>
              ))}
              {checkboxField && (
                <label className="flex items-center gap-1 text-[15px] text-graphite/70 font-body ml-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!item[checkboxField.name]}
                    onChange={(e) => { updateLocalField(index, checkboxField.name, e.target.checked); handleFieldBlur(index); }}
                    className="w-3 h-3 accent-ink"
                  />
                  {checkboxField.label}
                </label>
              )}
            </div>
          )}

          {/* Mô tả */}
          {textareaField && (
            <textarea
              value={item[textareaField.name] || ''}
              onChange={(e) => updateLocalField(index, textareaField.name, e.target.value)}
              onBlur={() => handleFieldBlur(index)}
              placeholder={textareaField.label}
              rows={2}
              className="w-full mt-1.5 bg-transparent border-none outline-none resize-none text-[15px] text-graphite/90 font-body
                leading-relaxed placeholder:text-graphite/25 focus:bg-ink-light rounded px-1 -mx-1"
            />
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-[15px] font-medium text-ink hover:text-ink-dark font-body"
      >
        <Plus size={13} /> Thêm {config.label.toLowerCase()}
      </button>
    </div>
  );
};

/** dd/mm/yyyy từ chuỗi ISO "yyyy-mm-dd" (tránh lệch múi giờ so với new Date().toLocaleDateString) */
const formatDateVN = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

/** Chế độ xem tĩnh (portfolio) — hiện đầy đủ: tiêu đề, khoảng thời gian, meta, mô tả */
const ReadOnlyView = ({ config, items }) => {
  if (items.length === 0) return <p className="text-[17px] text-graphite/55 italic font-body">Chưa có dữ liệu</p>;

  const dateFields = config.fields.filter((f) => f.type === 'date');
  const checkboxField = config.fields.find((f) => f.type === 'checkbox');
  const textareaField = config.fields.find((f) => f.type === 'textarea');
  const metaFields = config.fields.filter(
    (f) => f.name !== config.titleField && f.name !== config.subtitleField
      && f.type !== 'date' && f.type !== 'checkbox' && f.type !== 'textarea'
  );

  const formatRange = (item) => {
    if (dateFields.length === 0) return null;
    const [start, end] = dateFields;
    const startVal = start && item[start.name];
    const endVal = end && item[end.name];
    const isCurrent = checkboxField && item[checkboxField.name];

    if (!startVal && !endVal && !isCurrent) return null;
    if (isCurrent) return `${startVal ? formatDateVN(startVal) : '?'} – ${checkboxField.label}`;
    if (start && end) return `${startVal ? formatDateVN(startVal) : '?'} – ${endVal ? formatDateVN(endVal) : 'Hiện tại'}`;
    return startVal ? formatDateVN(startVal) : formatDateVN(endVal);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const metaText = metaFields
          .map((f) => {
            if (f.type === 'select') {
              const opt = f.options?.find((o) => o.value === item[f.name]);
              return opt && opt.value ? opt.label : null;
            }
            return item[f.name];
          })
          .filter(Boolean);
        const range = formatRange(item);

        return (
          <div key={item.id} className="pl-3 border-l-2 border-ink/25">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[17px] font-semibold text-graphite font-display">{item[config.titleField]}</p>
              {range && <span className="text-[14px] text-ink font-tag shrink-0 whitespace-nowrap">{range}</span>}
            </div>

            {(config.subtitleField && item[config.subtitleField]) || metaText.length > 0 ? (
              <p className="text-[15px] text-graphite/70 font-body">
                {[config.subtitleField && item[config.subtitleField], ...metaText].filter(Boolean).join(' · ')}
              </p>
            ) : null}

            {textareaField && item[textareaField.name] && (
              <p className="text-[15px] text-graphite/80 leading-relaxed mt-1 font-body">
                {item[textareaField.name]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InlineEntryList;
