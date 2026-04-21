import React from 'react';
import { MapPin, DollarSign, Briefcase, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobCardPublic = ({ job }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
          {job.title}
        </h3>
        
        <div className="space-y-2 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-gray-400" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" />
            <span className="font-medium text-gray-900">
              {job.minSalary} - {job.maxSalary} {job.currency}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-gray-400" />
            <span>{job.experienceLevel}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={14} />
          <span>{new Date(job.postedAt).toLocaleDateString('vi-VN')}</span>
        </div>
        <Link 
          to={`/candidate/jobs/${job.id}`}
          className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default JobCardPublic;