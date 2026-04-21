import React, { useState, useEffect } from "react";
import { candidateService } from "../../services/candidateService";
import ViewProfile from "../../components/candidate/ViewProfile";
import EditProfileForm from "../../components/candidate/EditProfileForm";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    summary: "",
    skills: "",
    education: "",
    experience: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await candidateService.getMyProfile();
      if (data && data.fullName) {
        setProfile(data);
        setForm(data);
        setIsEditing(false);
      } else {
        setIsEditing(true); // Chưa có profile
      }
    } catch {
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updatedData = await candidateService.saveProfile(form);
      setProfile(updatedData);
      setMessage("Lưu hồ sơ thành công! 🎉");
      setIsEditing(false);
    } catch {
      setMessage("Lỗi khi lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 font-medium">Đang tải hồ sơ...</span>
      </div>
    );
  }

  // Tách biệt logic: Đang edit thì gọi Form, không thì gọi View
  return isEditing ? (
    <EditProfileForm
      form={form}
      isNewProfile={!profile}
      saving={saving}
      message={message}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={() => {
        setIsEditing(false);
        setForm(profile); // Reset form
      }}
    />
  ) : (
    <ViewProfile
      profile={profile}
      message={message}
      onClearMessage={() => setMessage("")}
      onEdit={() => setIsEditing(true)}
    />
  );
};

export default ProfilePage;