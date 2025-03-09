import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, Settings, Building, BarChart2, 
  UserPlus, Shield, Calendar, Mail, Phone, MapPin, 
  ChevronRight, ArrowUpRight, Plus, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Sidebar from '../../components/Sidebar';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const companyStats = [
    { title: t('active_projects'), value: 24, icon: <FileText size={18} className="text-[#E86F2C]" />, change: '+12%' },
    { title: t('members'), value: 156, icon: <Users size={18} className="text-[#E86F2C]" />, change: '+8%' },
    { title: 'Storage Used', value: '68%', icon: <Building size={18} className="text-[#E86F2C]" />, progress: 68 }
  ];

  const recentActivity = [
    { 
      id: 1, 
      type: 'member', 
      title: 'New team member added: Sarah Chen',
      time: '2 hours ago',
      icon: <UserPlus className="text-blue-600" size={16} />
    },
    { 
      id: 2, 
      type: 'project', 
      title: 'New project created: Summer Romance',
      time: '5 hours ago',
      icon: <FileText className="text-green-600" size={16} />
    },
    { 
      id: 3, 
      type: 'settings', 
      title: 'Storage capacity upgraded to 2TB',
      time: '1 day ago',
      icon: <Settings className="text-amber-600" size={16} />
    },
    { 
      id: 4, 
      type: 'role', 
      title: 'New role created: Script Supervisor',
      time: '2 days ago',
      icon: <Shield className="text-purple-600" size={16} />
    }
  ];

  const pendingInvites = [
    { id: 1, email: 'michael.johnson@example.com', role: 'Editor', sent: '1 day ago' },
    { id: 2, email: 'emma.williams@example.com', role: 'Viewer', sent: '2 days ago' },
    { id: 3, email: 'robert.davis@example.com', role: 'Admin', sent: '3 days ago' }
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar activeItem="company" />

      <div className="flex-1 overflow-auto bg-[#F5F5F2] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#1E4D3A] dark:text-white">{t('admin_console')}</h1>
            <p className="text-[#577B92] dark:text-gray-400 mt-1">
              {t('manage_settings')}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'text-[#E86F2C] border-b-2 border-[#E86F2C]'
                  : 'text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white'
              }`}
            >
              {t('overview')}
            </button>
            <button
              onClick={() => navigate('/admin/members')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'text-[#E86F2C] border-b-2 border-[#E86F2C]'
                  : 'text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white'
              }`}
            >
              {t('members')}
            </button>
            <button
              onClick={() => navigate('/admin/projects')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'text-[#E86F2C] border-b-2 border-[#E86F2C]'
                  : 'text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white'
              }`}
            >
              {t('projects')}
            </button>
            <button
              onClick={() => navigate('/admin/roles')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'text-[#E86F2C] border-b-2 border-[#E86F2C]'
                  : 'text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white'
              }`}
            >
              {t('roles')}
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {companyStats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#577B92] dark:text-gray-400 font-medium">{stat.title}</h3>
                  <div className="w-10 h-10 bg-[#E86F2C]/10 dark:bg-[#E86F2C]/20 rounded-lg flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#1E4D3A] dark:text-white text-2xl font-semibold">{stat.value}</span>
                  {stat.change && (
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                      <ArrowUpRight size={16} className="mr-1" />
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                {stat.progress && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                    <div 
                      className="bg-[#E86F2C] dark:bg-[#E86F2C] h-2.5 rounded-full" 
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Company Profile Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-[#577B92]/10 dark:border-gray-700 mb-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-[#1E4D3A] dark:bg-[#E86F2C] rounded-xl flex items-center justify-center">
                  <Building size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1E4D3A] dark:text-white mb-2">Acme Productions</h2>
                  <p className="text-[#577B92] dark:text-gray-400">Enterprise Plan · Since January 2025</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/company/edit')}
                className="bg-gradient-to-r from-[#2563eb] via-[#9333ea] to-[#db2777] text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                {t('edit_profile')}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#577B92] dark:text-gray-400 font-medium mb-2">Company ID</h4>
                  <p className="text-[#1E4D3A] dark:text-white">ACM-2025-0123</p>
                </div>
                <div>
                  <h4 className="text-[#577B92] dark:text-gray-400 font-medium mb-2">Primary Contact</h4>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className="text-[#577B92] dark:text-gray-400" />
                    <p className="text-[#1E4D3A] dark:text-white">john.doe@acme.com</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone size={16} className="text-[#577B92] dark:text-gray-400" />
                    <p className="text-[#1E4D3A] dark:text-white">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[#577B92] dark:text-gray-400 font-medium mb-2">{t('address')}</h4>
                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="text-[#577B92] dark:text-gray-400 mt-1" />
                    <div>
                      <p className="text-[#1E4D3A] dark:text-white">123 Business Avenue</p>
                      <p className="text-[#1E4D3A] dark:text-white">Suite 456</p>
                      <p className="text-[#1E4D3A] dark:text-white">Los Angeles, CA 90001</p>
                      <p className="text-[#1E4D3A] dark:text-white">United States</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[#577B92] dark:text-gray-400 font-medium mb-2">Business Information</h4>
                  <p className="text-[#1E4D3A] dark:text-white">Tax ID: 12-3456789</p>
                  <p className="text-[#1E4D3A] dark:text-white">Business Type: Corporation</p>
                  <p className="text-[#1E4D3A] dark:text-white">Industry: Entertainment</p>
                </div>
                <div>
                  <h4 className="text-[#577B92] dark:text-gray-400 font-medium mb-2">Additional Contacts</h4>
                  <p className="text-[#1E4D3A] dark:text-white">Billing: finance@acme.com</p>
                  <p className="text-[#1E4D3A] dark:text-white">Support: support@acme.com</p>
                </div>
                <div>
                  <h4 className="text-[#577B92] dark:text-gray-400 font-medium mb-2">Subscription</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[#1E4D3A] dark:text-white">Enterprise Plan</p>
                    <p className="text-[#E86F2C] font-semibold">$2,499/mo</p>
                  </div>
                  <div className="flex items-center mt-1">
                    <Calendar size={16} className="text-[#577B92] dark:text-gray-400 mr-2" />
                    <p className="text-[#577B92] dark:text-gray-400">Next billing: Feb 1, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Activity and Invites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1E4D3A] dark:text-white">{t('recent_activity')}</h3>
                <button className="text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white text-sm">
                  {t('view_all')}
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                      activity.type === 'member' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.type === 'project' ? 'bg-green-100 dark:bg-green-900/30' :
                      activity.type === 'settings' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1E4D3A] dark:text-white">{activity.title}</p>
                      <p className="text-sm text-[#577B92] dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invites Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1E4D3A] dark:text-white">{t('pending_invites')}</h3>
                <button 
                  onClick={() => navigate('/admin/members/invite')}
                  className="text-[#E86F2C] hover:text-[#E86F2C]/80 text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  {t('invite_members')}
                </button>
              </div>
              {pendingInvites.length > 0 ? (
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3 bg-[#F5F5F2] dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-[#1E4D3A] dark:text-white font-medium">{invite.email}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-[#577B92] dark:text-gray-400">{t('role')}: {invite.role}</span>
                          <span className="text-xs text-[#577B92] dark:text-gray-400">•</span>
                          <span className="text-sm text-[#577B92] dark:text-gray-400">Sent {invite.sent}</span>
                        </div>
                      </div>
                      <button className="text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail size={36} className="mx-auto text-[#577B92] dark:text-gray-500 mb-3" />
                  <p className="text-[#1E4D3A] dark:text-white font-medium">No pending invitations</p>
                  <p className="text-[#577B92] dark:text-gray-400 text-sm mt-1">
                    Invite team members to collaborate
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;