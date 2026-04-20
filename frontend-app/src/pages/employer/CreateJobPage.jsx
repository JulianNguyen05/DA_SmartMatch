// frontend-app/src/pages/employer/CreateJobPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import JobForm from "../../components/employer/JobForm";
import { jobService } from "../../services/jobService";

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "", description: "", location: "", minSalary: 0, maxSalary: 0,
    currency: "VND", jobType: "FULL_TIME", experienceLevel: "MID_LEVEL",
    minExperienceYears: 0, requirements: "", benefits: "", deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      jobService.getJobById(id).then((job) => {
        setForm({
          ...job,
          requirements: (job.requirements || []).join("\n"),
          benefits: (job.benefits || []).join("\n"),
          deadline: job.deadline ? job.deadline.split("T")[0] : "",
        });
        setPageLoading(false);
      }).catch(() => navigate("/employer/jobs"));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      minSalary: Number(form.minSalary),
      maxSalary: Number(form.maxSalary),
      minExperienceYears: Number(form.minExperienceYears),
      requirements: form.requirements.split("\n").map(s => s.trim()).filter(Boolean),
      benefits: form.benefits.split("\n").map(s => s.trim()).filter(Boolean),
      deadline: form.deadline || null,
    };

    try {
      if (isEdit) await jobService.updateJob(id, payload);
      else await jobService.createJob(payload);
      
      alert(isEdit ? "Cập nhật thành công!" : "Đăng tin thành công!");
      navigate("/employer/jobs");
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="text-center py-20">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate("/employer/jobs")} className="flex items-center gap-2 text-gray-600 mb-6">
        <ArrowLeft size={20} /> Quay lại
      </button>
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới"}
      </h1>
      <JobForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={loading} isEdit={isEdit} />
    </div>
  );
};

export default CreateJobPage;