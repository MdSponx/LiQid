import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Edit2, FileText, Folder, BarChart2, Settings, 
  Building, Users, Mail, Phone, MapPin, Calendar, Award
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Sidebar from '../../components/Sidebar';

const ProfileOverview: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const stats = [
    { title: 'Active Projects', value: 12, icon: <Folder size={18} className="text-[#E86F2C]" /> },
    { title: 'Scripts', value: 24, icon: <FileText size={18} className="text-[#E86F2C]" /> },
    { title: 'Collaborators', value: 47, icon: <Users size={18} className="text-[#E86F2C]" /> }
  ];

  const companies = [
    { 
      id: '1', 
      name: 'Screenplay Productions', 
      role: 'Director of Development', 
      initials: 'SP', 
      isPrimary: true 
    },
    { 
      id: '2', 
      name: 'Writers Guild', 
      role: 'Member', 
      initials: 'WG', 
      isPrimary: false 
    }
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar activeItem="profile" />

      <div className="flex-1 overflow-auto bg-[#F5F5F2] dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center">
              <img 
                src={user?.profileImage || "https://i.pravatar.cc/150?img=32"} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-4 border-[#577B92]"
              />
              <div className="ml-6">
                <h2 className="text-[#1E4D3A] dark:text-white text-2xl font-semibold">
                  {user?.firstName} {user?.lastName || 'Anderson'}
                </h2>
                <p className="text-[#577B92] dark:text-gray-300">
                  {user?.occupation || 'Screenwriter & Director'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/profile/edit')}
              className="bg-gradient-to-r from-[#2563eb] via-[#9333ea] to-[#db2777] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 shadow-sm p-6 rounded-xl border border-[#577B92]/10 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[#1E4D3A] dark:text-gray-200">{stat.title}</h3>
                  {stat.icon}
                </div>
                <p className="text-3xl text-[#1E4D3A] dark:text-white font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Account Details */}
          <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl p-8 mb-8 border border-[#577B92]/10 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-[#1E4D3A] dark:text-white font-semibold">Account Details</h3>
              <button 
                onClick={() => navigate('/profile/account')}
                className="px-4 py-1.5 rounded-lg bg-[#E86F2C]/10 text-[#E86F2C] hover:bg-[#E86F2C]/20 transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <Mail className="mt-0.5 mr-3 text-[#577B92] dark:text-gray-400" size={18} />
                <div>
                  <p className="text-[#577B92] dark:text-gray-400 mb-1">Email</p>
                  <p className="text-[#1E4D3A] dark:text-white">{user?.email || 'sarah.anderson@example.com'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="mt-0.5 mr-3 text-[#577B92] dark:text-gray-400" size={18} />
                <div>
                  <p className="text-[#577B92] dark:text-gray-400 mb-1">Phone</p>
                  <p className="text-[#1E4D3A] dark:text-white">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="mt-0.5 mr-3 text-[#577B92] dark:text-gray-400" size={18} />
                <div>
                  <p className="text-[#577B92] dark:text-gray-400 mb-1">Location</p>
                  <p className="text-[#1E4D3A] dark:text-white">Los Angeles, CA</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="mt-0.5 mr-3 text-[#577B92] dark:text-gray-400" size={18} />
                <div>
                  <p className="text-[#577B92] dark:text-gray-400 mb-1">Member Since</p>
                  <p className="text-[#1E4D3A] dark:text-white">January 2025</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Affiliations */}
          <div className="bg-white dark:bg-gray-900 shadow-sm rounded-xl p-8 border border-[#577B92]/10 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-[#1E4D3A] dark:text-white font-semibold">Company Affiliations</h3>
              <button 
                onClick={() => navigate('/profile/companies')}
                className="px-4 py-1.5 rounded-lg bg-[#E86F2C]/10 text-[#E86F2C] hover:bg-[#E86F2C]/20 transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="space-y-4">
              {companies.map(company => (
                <div 
                  key={company.id}
                  className="flex items-center justify-between p-4 bg-[#F5F5F2] dark:bg-gray-800 rounded-lg border border-[#577B92]/10 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#577B92] rounded-lg flex items-center justify-center text-[#F5F5F2]">
                      {company.initials}
                    </div>
                    <div className="ml-4">
                      <p className="text-[#1E4D3A] dark:text-white">{company.name}</p>
                      <p className="text-[#577B92] dark:text-gray-400 text-sm">{company.role}</p>
                    </div>
                  </div>
                  {company.isPrimary ? (
                    <span className="px-3 py-1 bg-[#E86F2C]/20 text-[#E86F2C] rounded-full text-sm">Primary</span>
                  ) : (
                    <span className="px-3 py-1 bg-[#577B92]/10 text-[#577B92] dark:text-gray-300 rounded-full text-sm">Active</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;