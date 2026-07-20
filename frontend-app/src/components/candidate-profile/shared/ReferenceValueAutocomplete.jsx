// src/components/candidate-profile/shared/ReferenceValueAutocomplete.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Send } from 'lucide-react';
import candidateService from '../../../features/candidate/candidateService';

/**
 * Ô tìm kiếm + chọn 1 giá trị từ danh mục dùng chung (SKILL/LANGUAGE).
 * Nếu không tìm thấy, cho phép gửi đề xuất thêm mới cho admin duyệt.
 *
 * @param {string}   type      - 'SKILL' | 'LANGUAGE'
 * @param {number}   userId
 * @param {object}   value     - { id, name } đang được chọn, hoặc null
 * @param {Function} onSelect  - ({ id, name }) => void
 * @param {Function} onToast   - ({ type, message }) => void — bắn toast lên component cha
 * @param {boolean}  [compact] - true = thu gọn padding/font để nhúng trực tiếp trong card sandbox
 */
const ReferenceValueAutocomplete = ({ type, userId, value, onSelect, onToast, placeholder, compact = false }) => {
  const [keyword, setKeyword] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => setKeyword(value?.name || ''), [value]);

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
    onSelect(null);

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
    <div ref={wrapperRef} className="relative font-body">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-graphite/55" />
        <input
          value={keyword}
          onChange={handleChange}
          onFocus={() => { setIsOpen(true); if (results.length === 0) search(keyword); }}
          placeholder={placeholder || 'Gõ để tìm kiếm...'}
          className={`w-full rounded-md text-graphite outline-none transition-colors
            bg-ink-light/60 focus:bg-white border border-transparent focus:border-ink/30
            ${compact ? 'pl-7 pr-7 py-1.5 text-[15px]' : 'pl-9 pr-8 py-2.5 text-[17px]'}`}
        />
        {isSearching && (
          <Loader2 size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-graphite/55 animate-spin" />
        )}
      </div>

      {isOpen && keyword.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-graphite/10 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className="w-full text-left px-3 py-2 text-[15px] font-medium text-graphite hover:bg-ink-light hover:text-ink"
              >
                {item.name}
              </button>
            ))
          ) : !isSearching ? (
            <div className="px-3 py-2.5">
              <p className="text-[14px] text-graphite/60 mb-1.5">Không tìm thấy "{keyword.trim()}".</p>
              <button
                type="button"
                onClick={handleSuggest}
                disabled={isSuggesting}
                className="flex items-center gap-1.5 text-[14px] font-semibold text-ink hover:text-ink-dark disabled:opacity-50"
              >
                <Send size={11} />
                {isSuggesting ? 'Đang gửi...' : `Gửi đề xuất thêm "${keyword.trim()}"`}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ReferenceValueAutocomplete;
