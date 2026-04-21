import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { jobService } from '../../services/jobService';
import JobCardPublic from '../../components/candidate/JobCardPublic';

const JobSearchPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', location: '', page: 0 });
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, [filters.page]); // Gọi lại khi đổi trang

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // API của bạn trả về đối tượng PageResponse chứa mảng content
      const response = await jobService.searchPublicJobs(filters);
      setJobs(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách việc làm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 0 }); // Reset về trang đầu khi search mới
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Search Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Tìm kiếm việc làm mơ ước 🚀</h1>
        <p className="text-blue-100 mb-8 text-lg">Hàng ngàn cơ hội đang chờ đón bạn.</p>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 bg-white p-2 rounded-2xl sm:rounded-full shadow-lg">
          <div className="flex-1 flex items-center px-4">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Vị trí, từ khóa, công ty..." 
              className="w-full bg-transparent border-none outline-none text-gray-800 px-3 py-3"
              value={filters.keyword}
              onChange={(e) => setFilters({...filters, keyword: e.target.value})}
            />
          </div>
          <div className="hidden sm:block w-px bg-gray-200 my-2"></div>
          <div className="flex-1 flex items-center px-4">
            <MapPin className="text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Địa điểm..." 
              className="w-full bg-transparent border-none outline-none text-gray-800 px-3 py-3"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white font-semibold rounded-xl sm:rounded-full px-8 py-3 hover:bg-blue-700 transition">
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Danh sách việc làm */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100">
          <p className="text-xl font-medium">Không tìm thấy việc làm nào phù hợp.</p>
          <p className="mt-2">Thử thay đổi từ khóa hoặc địa điểm xem sao.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCardPublic key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Pagination (Đơn giản) */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button 
            disabled={filters.page === 0}
            onClick={() => setFilters({...filters, page: Math.max(0, filters.page - 1)})}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg">
            Trang {filters.page + 1} / {totalPages}
          </span>
          <button 
            disabled={filters.page >= totalPages - 1}
            onClick={() => setFilters({...filters, page: filters.page + 1})}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default JobSearchPage;