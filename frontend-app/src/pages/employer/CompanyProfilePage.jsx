import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Globe, Users, Info, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { getMyCompany, saveCompany } from '../../services/companyService';

const CompanyProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [message, setMessage] = useState(null);
  
  // Các key này khớp chính xác 100% với CreateCompanyRequest.java
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    location: '',
    website: '',
    logoUrl: '',
    industry: '',
    companySize: ''
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await getMyCompany();
        if (data) {
          setFormData(data); // Đổ dữ liệu cũ vào form nếu đã có
        }
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
      } finally {
        setInitialLoad(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await saveCompany(formData);
      setMessage({ type: 'success', text: 'Đã lưu thông tin công ty thành công!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
      <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Hồ sơ Công ty</h2>
          <p className="text-gray-500 mt-1">Cập nhật thông tin doanh nghiệp. Bạn bắt buộc phải điền thông tin này trước khi đăng tin tuyển dụng.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Tên công ty *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Building2 size={20} /></div>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="VD: Công ty TNHH SmartMatch" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Quy mô nhân sự</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Users size={20} /></div>
                <select name="companySize" value={formData.companySize} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 appearance-none">
                  <option value="">Chọn quy mô...</option>
                  <option value="1-10">1 - 10 nhân viên</option>
                  <option value="10-50">10 - 50 nhân viên</option>
                  <option value="50-200">50 - 200 nhân viên</option>
                  <option value="200+">Hơn 200 nhân viên</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Lĩnh vực hoạt động</label>
              <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="VD: Công nghệ thông tin..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Website</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Globe size={20} /></div>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Logo URL (Link ảnh)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><ImageIcon size={20} /></div>
                <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="https://domain.com/logo.png" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tỉnh/Thành phố</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><MapPin size={20} /></div>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="VD: Hồ Chí Minh" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Địa chỉ chi tiết</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="Số nhà, tên đường..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Giới thiệu công ty</label>
              <div className="relative">
                <div className="absolute left-4 top-4 text-gray-400"><Info size={20} /></div>
                <textarea rows="5" name="description" value={formData.description} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500" placeholder="Mô tả về môi trường làm việc..." />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Lưu hồ sơ công ty
            </button>
          </div>
        </form>
      </div>
  );
};

export default CompanyProfilePage;