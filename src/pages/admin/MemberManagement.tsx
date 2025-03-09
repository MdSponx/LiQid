import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, UserPlus, MoreHorizontal, ChevronDown, 
  Check, X, Shield, Edit, Trash, Download, Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Sidebar from '../../components/Sidebar';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'active' | 'inactive';
  lastActive: string;
  projects: number;
}

const MemberManagement: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  // Mock data
  const members: Member[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      role: 'Admin',
      avatar: 'https://i.pravatar.cc/150?img=1',
      status: 'active',
      lastActive: '2 hours ago',
      projects: 8
    },
    {
      id: '2',
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      role: 'Editor',
      avatar: 'https://i.pravatar.cc/150?img=2',
      status: 'active',
      lastActive: '1 day ago',
      projects: 5
    },
    {
      id: '3',
      name: 'Emma Williams',
      email: 'emma.williams@example.com',
      role: 'Viewer',
      avatar: 'https://i.pravatar.cc/150?img=3',
      status: 'inactive',
      lastActive: '2 weeks ago',
      projects: 2
    },
    {
      id: '4',
      name: 'Robert Davis',
      email: 'robert.davis@example.com',
      role: 'Script Supervisor',
      avatar: 'https://i.pravatar.cc/150?img=4',
      status: 'active',
      lastActive: '3 days ago',
      projects: 4
    },
    {
      id: '5',
      name: 'Jennifer Miller',
      email: 'jennifer.miller@example.com',
      role: 'Editor',
      avatar: 'https://i.pravatar.cc/150?img=5',
      status: 'active',
      lastActive: '5 hours ago',
      projects: 6
    },
    {
      id: '6',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      role: 'Viewer',
      avatar: 'https://i.pravatar.cc/150?img=6',
      status: 'inactive',
      lastActive: '1 month ago',
      projects: 1
    }
  ];

  const roles = ['Admin', 'Editor', 'Viewer', 'Script Supervisor'];
  const statuses = ['active', 'inactive'];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !selectedRole || member.role === selectedRole;
    const matchesStatus = !selectedStatus || member.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      // If all are selected, deselect all
      setSelectedMembers(new Set());
      setShowBulkActions(false);
    } else {
      // Otherwise, select all
      setSelectedMembers(new Set(filteredMembers.map(member => member.id)));
      setShowBulkActions(true);
    }
  };

  const handleSelectMember = (id: string) => {
    const newSelectedMembers = new Set(selectedMembers);
    
    if (newSelectedMembers.has(id)) {
      newSelectedMembers.delete(id);
    } else {
      newSelectedMembers.add(id);
    }
    
    setSelectedMembers(newSelectedMembers);
    setShowBulkActions(newSelectedMembers.size > 0);
  };

  const handleRemoveMember = (member: Member) => {
    setMemberToRemove(member);
    setShowConfirmDialog(true);
  };

  const confirmRemoveMember = () => {
    // In a real app, you would call an API to remove the member
    console.log(`Removing member: ${memberToRemove?.name}`);
    setShowConfirmDialog(false);
    setMemberToRemove(null);
    // Then update the UI accordingly
  };

  const handleBulkAction = (action: string) => {
    // In a real app, you would call an API to perform the bulk action
    console.log(`Performing ${action} on ${selectedMembers.size} members`);
    // Then update the UI accordingly
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar activeItem="company" />

      <div className="flex-1 overflow-auto bg-[#F5F5F2] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-[#1E4D3A] dark:text-white">{t('member_management')}</h1>
              <p className="text-[#577B92] dark:text-gray-400 mt-1">
                {t('manage_team_members')}
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/members/invite')}
              className="bg-gradient-to-r from-[#2563eb] via-[#9333ea] to-[#db2777] text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center"
            >
              <UserPlus size={18} className="mr-2" />
              {t('add_member')}
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-[#577B92]/10 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#577B92] dark:text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t('search_members')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-[#E86F2C]"
                />
              </div>
              <div className="flex space-x-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowRoleFilter(!showRoleFilter)}
                    className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
                  >
                    <Filter size={18} className="mr-2 text-[#577B92] dark:text-gray-400" />
                    <span>{selectedRole || t('role')}</span>
                    <ChevronDown size={16} className="ml-2 text-[#577B92] dark:text-gray-400" />
                  </button>
                  {showRoleFilter && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedRole(null);
                            setShowRoleFilter(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          All Roles
                        </button>
                        {roles.map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              setSelectedRole(role);
                              setShowRoleFilter(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
                          >
                            {selectedRole === role && <Check size={16} className="mr-2 text-[#E86F2C]" />}
                            <span>{role}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowStatusFilter(!showStatusFilter)}
                    className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg"
                  >
                    <Filter size={18} className="mr-2 text-[#577B92] dark:text-gray-400" />
                    <span>{selectedStatus ? (selectedStatus === 'active' ? t('active') : 'Inactive') : t('status')}</span>
                    <ChevronDown size={16} className="ml-2 text-[#577B92] dark:text-gray-400" />
                  </button>
                  {showStatusFilter && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setSelectedStatus(null);
                            setShowStatusFilter(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          All Statuses
                        </button>
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setSelectedStatus(status);
                              setShowStatusFilter(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
                          >
                            {selectedStatus === status && <Check size={16} className="mr-2 text-[#E86F2C]" />}
                            <span>{status === 'active' ? t('active') : 'Inactive'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar (conditionally rendered) */}
          {showBulkActions && (
            <div className="bg-[#1E4D3A]/10 dark:bg-[#1E4D3A]/20 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-[#1E4D3A] dark:text-white font-medium">
                  {selectedMembers.size} members selected
                </span>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleBulkAction('change-role')}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-[#1E4D3A] dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('change_role')}
                </button>
                <button 
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-[#1E4D3A] dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('deactivate')}
                </button>
                <button 
                  onClick={() => handleBulkAction('remove')}
                  className="px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#577B92]/10 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-[#E86F2C] focus:ring-[#E86F2C] border-gray-300 rounded"
                        />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#577B92] dark:text-gray-400 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#577B92] dark:text-gray-400 uppercase tracking-wider">
                      {t('role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#577B92] dark:text-gray-400 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#577B92] dark:text-gray-400 uppercase tracking-wider">
                      {t('last_active')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#577B92] dark:text-gray-400 uppercase tracking-wider">
                      {t('projects')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#577B92] dark:text-gray-400 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedMembers.has(member.id)}
                          onChange={() => handleSelectMember(member.id)}
                          className="h-4 w-4 text-[#E86F2C] focus:ring-[#E86F2C] border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1E4D3A] dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-sm text-[#577B92] dark:text-gray-400">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield size={16} className="mr-2 text-[#577B92] dark:text-gray-400" />
                          <span className="text-sm text-[#1E4D3A] dark:text-white">{member.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {member.status === 'active' ? t('active') : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#577B92] dark:text-gray-400">
                        {member.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1E4D3A] dark:text-white">
                        {member.projects}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => navigate(`/admin/members/edit/${member.id}`)}
                            className="text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleRemoveMember(member)}
                            className="text-[#577B92] dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash size={16} />
                          </button>
                          <div className="relative group">
                            <button className="text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white">
                              <MoreHorizontal size={16} />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                              <div className="py-1">
                                <button className="block w-full text-left px-4 py-2 text-sm text-[#1E4D3A] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                                  View Details
                                </button>
                                <button className="block w-full text-left px-4 py-2 text-sm text-[#1E4D3A] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                                  Assign to Project
                                </button>
                                <button className="block w-full text-left px-4 py-2 text-sm text-[#1E4D3A] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                                  Reset Password
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Mail size={48} className="mx-auto text-[#577B92] dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-[#1E4D3A] dark:text-white mb-1">No members found</h3>
                <p className="text-[#577B92] dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="mt-6 flex justify-end">
            <button className="flex items-center text-[#577B92] dark:text-gray-400 hover:text-[#1E4D3A] dark:hover:text-white">
              <Download size={16} className="mr-2" />
              {t('export_member_list')}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && memberToRemove && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4 text-red-500">
                <Trash size={24} className="mr-2" />
                <h3 className="text-xl font-semibold">{t('remove_member')}</h3>
              </div>
              <p className="text-[#1E4D3A] dark:text-white mb-2">
                Are you sure you want to remove <span className="font-semibold">{memberToRemove.name}</span>?
              </p>
              <p className="text-[#577B92] dark:text-gray-400 text-sm">
                {t('remove_confirm')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 rounded-b-xl flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setMemberToRemove(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[#577B92] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={confirmRemoveMember}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                {t('remove')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;