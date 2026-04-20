// frontend-app/src/components/common/StatusBadge.jsx
import React from "react";

const StatusBadge = ({ status }) => {
  const styles = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    DRAFT: "bg-amber-100 text-amber-700",
    CLOSED: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-red-100 text-red-700",
  };

  const labels = {
    PUBLISHED: "Đang tuyển",
    DRAFT: "Bản nháp",
    CLOSED: "Đã đóng",
    EXPIRED: "Hết hạn",
  };

  const badgeClass = styles[status] || "bg-gray-100 text-gray-500";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;