import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getMyCompany, saveCompany } from '../../services/companyService';
import CompanyDetail from '../../components/employer/CompanyDetail';
import CompanyForm from '../../components/employer/CompanyForm';

const CompanyProfilePage = () => {
  const [companyData, setCompanyData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setInitialLoad(true);
    try {
      const data = await getMyCompany();
      if (data) {
        setCompanyData(data);
        setIsEditing(false); // Có data thì mặc định xem
      } else {
        setIsEditing(true); // Không có data thì ép vô form thêm mới
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setInitialLoad(false);
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const savedData = await saveCompany(formData);
      setCompanyData(savedData);
      setIsEditing(false); // Lưu xong thì tắt form, quay về trang Xem
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (initialLoad) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {isEditing ? (
        <CompanyForm 
          initialData={companyData} 
          onSave={handleSave} 
          onCancel={() => setIsEditing(false)} 
          loading={saving} 
        />
      ) : (
        <CompanyDetail 
          company={companyData} 
          onEdit={() => setIsEditing(true)} 
        />
      )}
    </div>
  );
};

export default CompanyProfilePage;