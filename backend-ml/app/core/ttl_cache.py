# app/core/ttl_cache.py
"""
Cache TTL đơn giản, thread-safe.

Dùng threading.Lock (không phải asyncio.Lock) vì FastAPI chạy các endpoint
sync (như extract_cv hiện tại) trong threadpool riêng — nhiều request có thể
gọi vào cùng lúc trên nhiều thread thật, không chỉ 1 event loop.

Không dùng thư viện ngoài (cachetools) vì nhu cầu hiện tại chỉ là 1 giá trị
duy nhất (skill catalog) với TTL cố định — tự viết ~30 dòng đỡ phải thêm
dependency cho một việc đơn giản.
"""
from __future__ import annotations

import threading
import time
from typing import Callable, Generic, TypeVar

T = TypeVar("T")


class TTLCache(Generic[T]):
    def __init__(self, loader: Callable[[], T], ttl_seconds: float):
        """
        loader: hàm không tham số, gọi lại để lấy giá trị mới khi cache hết hạn
                hoặc chưa từng load lần nào.
        ttl_seconds: thời gian sống của cache, sau đó lần get() tiếp theo sẽ
                     gọi lại loader().
        """
        self._loader = loader
        self._ttl_seconds = ttl_seconds
        self._value: T | None = None
        self._loaded_at: float = 0.0
        self._lock = threading.Lock()

    def get(self) -> T:
        now = time.monotonic()
        if self._value is not None and (now - self._loaded_at) < self._ttl_seconds:
            return self._value

        with self._lock:
            # Double-check sau khi có lock: tránh nhiều thread cùng gọi loader()
            # một lúc khi cache vừa hết hạn (thundering herd).
            now = time.monotonic()
            if self._value is not None and (now - self._loaded_at) < self._ttl_seconds:
                return self._value

            self._value = self._loader()
            self._loaded_at = now
            return self._value

    def invalidate(self) -> None:
        """Xóa cache thủ công, ép lần get() tiếp theo phải gọi lại loader()."""
        with self._lock:
            self._value = None
            self._loaded_at = 0.0