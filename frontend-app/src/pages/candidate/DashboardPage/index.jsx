import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../features/auth/authService';
import candidateService from '../../../features/candidate/candidateService';
import jobService from '../../../features/job/jobService';
import employerService from '../../../features/employer/employerService';
import { Globe, Heart } from 'lucide-react';

const DashboardPage = () => {
  const [uiState, setUiState] = useState({ isLoading: true, error: null });
  const [data, setData] = useState({
    user: null,
    stats: { cvCount: 0, appCount: 0, jobCount: 0, companyCount: 0 },
    latestJobs: [],
    topCompanies: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser?.userId) {
        setUiState({ isLoading: false, error: 'Không tìm thấy phiên đăng nhập.' });
        return;
      }

      try {
        // Tối ưu hoá thời gian tải bằng cách gọi API song song
        const [cvRes, appsRes, jobsRes, companiesRes] = await Promise.allSettled([
          candidateService.getCvs(currentUser.userId),
          candidateService.getMyApplications(currentUser.userId),
          jobService.searchJobs('', '', 0, 5), 
          employerService.getAllCompanies(0, 5)
        ]);

        // Trích xuất dữ liệu an toàn
        const cvs = cvRes.status === 'fulfilled' ? cvRes.value?.data : [];
        const apps = appsRes.status === 'fulfilled' ? appsRes.value?.data : { content: [], totalElements: 0 };
        const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value?.data : { content: [], totalElements: 0 };
        const companies = companiesRes.status === 'fulfilled' ? companiesRes.value?.data : { content: [], totalElements: 0 };

        const sortedCompanies = (companies?.content || []).sort((a, b) => 
            (b.likeCount || 0) - (a.likeCount || 0)
        );

        setData({
          user: currentUser,
          stats: {
            cvCount: cvs?.length || 0,
            appCount: apps?.totalElements || apps?.content?.length || 0,
            jobCount: jobs?.totalElements || 0,
            companyCount: companies?.totalElements || 0,
          },
          latestJobs: jobs?.content || [],
          topCompanies: sortedCompanies // Sử dụng mảng đã được sắp xếp
        });

      } catch (err) {
        setUiState(prev => ({ ...prev, error: 'Đã xảy ra lỗi khi đồng bộ dữ liệu hệ thống.' }));
      } finally {
        setUiState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  const displayName = useMemo(() => {
    if (data.user?.fullName) return data.user.fullName;
    return data.user?.email ? data.user.email.split('@')[0] : "Ứng viên";
  }, [data.user]);

  if (uiState.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center space-x-2">
        <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 font-medium">Đang đồng bộ dữ liệu...</span>
      </div>
    );
  }

  if (uiState.error) {
    return (
      <div className="p-6 max-w-6xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {uiState.error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* 1. Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Xin chào trở lại, <span className="text-indigo-600">{displayName}</span> 👋
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Theo dõi tiến độ ứng tuyển và khám phá cơ hội nghề nghiệp mới nhất.
          </p>
        </div>
      </header>

      {/* 2. Tổng quan số liệu (Quick Stats Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="CV Hiện Có" 
          value={data.stats.cvCount} 
          link="/candidate/cv-manager" 
          linkText="Quản lý CV"
          icon={<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
          colorClass="bg-indigo-50 border-indigo-100"
        />
        <StatCard 
          title="Đơn Đã Nộp" 
          value={data.stats.appCount} 
          link="/candidate/applications" 
          linkText="Xem lịch sử"
          icon={<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>}
          colorClass="bg-emerald-50 border-emerald-100"
        />
        <StatCard 
          title="Công Việc Hệ Thống" 
          value={data.stats.jobCount} 
          link="/jobs" 
          linkText="Khám phá ngay"
          icon={<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
          colorClass="bg-amber-50 border-amber-100"
        />
        <StatCard 
          title="Công Ty Đang Tuyển" 
          value={data.stats.companyCount} 
          link="/companies" 
          linkText="Xem danh sách"
          icon={<svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
          colorClass="bg-rose-50 border-rose-100"
        />
      </section>

      {/* 3. Danh sách phân bổ (Layout 2 cột) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Cột trái: Việc làm mới nhất */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Công việc mới nhất</h2>
            <Link to="/jobs" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.latestJobs.length > 0 ? (
              data.latestJobs.map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{job.companyName || 'Công ty bảo mật thông tin'}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs font-medium">
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md">{job.salaryRange || 'Thỏa thuận'}</span>
                    <span className="text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">{job.location || 'Toàn quốc'}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-gray-500">Chưa có công việc nào được cập nhật.</div>
            )}
          </div>
        </div>

        {/* Cột phải: Công ty nổi bật */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Công ty hàng đầu</h2>
            <Link to="/companies" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Khám phá</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data.topCompanies.length > 0 ? (
              data.topCompanies.map(company => (
                <Link key={company.id} to={`/companies/${company.userId}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {company.logoUrl ? (
                      <img src={`http://localhost:8080${company.logoUrl}`} alt={company.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 font-bold">{company.companyName?.charAt(0) || 'C'}</span>
                    )}
                  </div>
                  
                  {/* Chuyển flex-1 thành flex container để dàn đều nội dung và nút Like sang 2 bên */}
                  <div className="flex-1 min-w-0 flex justify-between items-center gap-3">
                    
                    {/* Phần thông tin công ty */}
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {company.companyName || 'Công ty chưa cập nhật tên'}
                      </h3>
                      
                      {company.website ? (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600 font-medium bg-slate-100 w-fit px-2.5 py-1 rounded-md group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                          <Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{company.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1.5 truncate italic">Chưa cập nhật website</p>
                      )}
                    </div>

                    {/* Phần hiển thị lượt Like */}
                    <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 flex-shrink-0 transition-transform group-hover:scale-105">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span className="text-xs font-bold text-rose-700">{company.likeCount || 0}</span>
                    </div>

                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-gray-500">Chưa có thông tin công ty.</div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
};

// Sub-component để render Card thống kê (giúp code chính gọn gàng hơn)
const StatCard = ({ title, value, link, linkText, icon, colorClass }) => (
  <div className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-lg ${colorClass}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className="p-3 bg-white bg-opacity-60 rounded-xl shadow-sm">
        {icon}
      </div>
    </div>
    <div className="mt-6">
      <Link to={link} className="inline-flex items-center text-sm font-semibold text-gray-700 hover:text-black bg-white/50 hover:bg-white px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-gray-200">
        {linkText} <span className="ml-1 text-lg leading-none">&rarr;</span>
      </Link>
    </div>
  </div>
);

export default DashboardPage;