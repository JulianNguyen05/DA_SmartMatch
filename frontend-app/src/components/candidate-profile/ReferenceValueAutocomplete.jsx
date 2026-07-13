// src/components/candidate-profile/ReferenceValueAutocomplete.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Send } from 'lucide-react';
import candidateService from '../../features/candidate/candidateService';

/**
 * Ô tìm kiếm + chọn 1 giá trị từ danh mục dùng chung (SKILL/LANGUAGE).
 * Nếu không tìm thấy, cho phép gửi đề xuất thêm mới cho admin duyệt.
 *
 * @param {string}   type      - 'SKILL' | 'LANGUAGE'
 * @param {number}   userId
 * @param {object}   value     - { id, name } đang được chọn, hoặc null
 * @param {Function} onSelect  - ({ id, name }) => void
 * @param {Function} onToast   - ({ type, message }) => void — bắn toast lên component cha
 */
const ReferenceValueAutocomplete = ({ type, userId, value, onSelect, onToast, placeholder }) => {
  const [keyword, setKeyword] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => setKeyword(value?.name || ''), [value]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const search = useCallback((kw) => {
    setIsSearching(true);
    candidateService.searchReferenceValues(type, kw)
      .then((res) => setResults(res?.data || []))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, [type]);

  const handleChange = (e) => {
    const kw = e.target.value;
    setKeyword(kw);
    setIsOpen(true);
    onSelect(null); // bỏ chọn giá trị cũ khi người dùng gõ lại

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(kw), 350);
  };

  const handlePick = (item) => {
    onSelect({ id: item.id, name: item.name });
    setKeyword(item.name);
    setIsOpen(false);
  };

  const handleSuggest = async () => {
    if (!keyword.trim()) return;
    setIsSuggesting(true);
    try {
      await candidateService.suggestReferenceValue(userId, {
        type,
        name: keyword.trim(),
        requestType: 'CREATE',
      });
      onToast?.({ type: 'success', message: `Đã gửi đề xuất "${keyword.trim()}", chờ admin duyệt.` });
      setIsOpen(false);
    } catch (error) {
      onToast?.({ type: 'error', message: error.response?.data?.message || 'Gửi đề xuất thất bại.' });
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={keyword}
          onChange={handleChange}
          onFocus={() => { setIsOpen(true); if (results.length === 0) search(keyword); }}
          placeholder={placeholder || 'Gõ để tìm kiếm...'}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50/60 text-sm
            focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        />
        {isSearching && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
      </div>

      {isOpen && keyword.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {item.name}
              </button>
            ))
          ) : !isSearching ? (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-400 mb-2">Không tìm thấy "{keyword.trim()}" trong hệ thống.</p>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={isSuggesting}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                <Send size={12} />
                {isSuggesting ? 'Đang gửi...' : `Gửi đề xuất thêm "${keyword.trim()}"`}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {value?.id && (
        <p className="text-xs text-emerald-600 mt-1">Đã chọn: {value.name}</p>
      )}
    </div>
  );
};

export default ReferenceValueAutocomplete;
