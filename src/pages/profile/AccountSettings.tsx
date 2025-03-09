import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Lock, Bell, Globe, Facebook, Twitter, Instagram, 
  CreditCard, Shield, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Sidebar from '../../components/Sidebar';

const AccountSettings: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    teamMessages: true,
    marketingEmails: false
  });

  // Language and region settings
  const [language, setLanguage] = useState('en');
  const [region, setRegion] = useState('us');

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook: false,
    twitter: false,
    instagram: false
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showActivity: true,
    allowTagging: true
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Show success message
    }, 1500);
  };

  const handleToggle = (setting: string) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handlePrivacyToggle = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleConnectAccount = (account: string) => {
    // In a real app, this would open OAuth flow
    setConnectedAccounts(prev => ({
      ...prev,
      [account]: !prev[account as keyof typeof prev]
    }));
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar activeItem="profile" />

      <div className="flex-1 overflow-auto bg-[#F5F5F2] dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate('/profile')}
              className="mr-4 p-2 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <ArrowLeft size={20} className="text-[#1E4D3A] dark:text-white" />
            </button>
            <h1 className="text-2xl font-semibold text-[#1E4D3A] dark:text-white">Account Settings</h1>
          </div>

          <div className="space-y-8">
            {/* Password Management */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <h2 className="text-lg font-medium text-[#1E4D3A] dark:text-white mb-4 flex items-center">
                <Lock size={18} className="mr-2" />
                Password Management
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#577B92] dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-[#E86F2C]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#577B92] dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-[#E86F2C]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#577B92] dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-[#E86F2C]"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-[#1E4D3A] dark:bg-[#E86F2C] text-white font-medium hover:opacity-90 transition-opacity flex items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Email & Notifications */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <h2 className="text-lg font-medium text-[#1E4D3A] dark:text-white mb-4 flex items-center">
                <Bell size={18} className="mr-2" />
                Email & Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-[#1E4D3A] dark:text-white font-medium">Email Notifications</h3>
                    <p className="text-[#577B92] dark:text-gray-400 text-sm">Receive notifications via email</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('emailNotifications')}
                    className="text-[#E86F2C]"
                  >
                    {notifications.emailNotifications ? (
                      <ToggleRight size={24} />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-[#1E4D3A] dark:text-white font-medium">Project Updates</h3>
                    <p className="text-[#577B92] dark:text-gray-400 text-sm">Get notified about changes to your projects</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('projectUpdates')}
                    className="text-[#E86F2C]"
                  >
                    {notifications.projectUpdates ? (
                      <ToggleRight size={24} />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-[#1E4D3A] dark:text-white font-medium">Team Messages</h3>
                    <p className="text-[#577B92] dark:text-gray-400 text-sm">Receive notifications for team messages</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('teamMessages')}
                    className="text-[#E86F2C]"
                  >
                    {notifications.teamMessages ? (
                      <ToggleRight size={24} />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-[#1E4D3A] dark:text-white font-medium">Marketing Emails</h3>
                    <p className="text-[#577B92] dark:text-gray-400 text-sm">Receive updates about new features and offers</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('marketingEmails')}
                    className="text-[#E86F2C]"
                  >
                    {notifications.marketingEmails ? (
                      <ToggleRight size={24} />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Language & Region */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <h2 className="text-lg font-medium text-[#1E4D3A] dark:text-white mb-4 flex items-center">
                <Globe size={18} className="mr-2" />
                Language & Region
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#577B92] dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-[#E86F2C]"
                  >
                    <option value="en">English</option>
                    <option value="th">Thai</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#577B92] dark:text-gray-300 mb-1">
                    Region
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-[#E86F2C]"
                  >
                    <option value="us">United States</option>
                    <option value="th">Thailand</option>
                    <option value="cn">China</option>
                    <option value="uk">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <h2 className="text-lg font-medium text-[#1E4D3A] dark:text-white mb-4">Connected Accounts</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Facebook className="text-[#1877F2] mr-3" size={24} />
                    <div>
                      <h3 className="text-[#1E4D3A] dark:text-white font-medium">Facebook</h3>
                      <p className="text-[#577B92] dark:text-gray-400 text-sm">
                        {connectedAccounts.facebook ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConnectAccount('facebook')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      connectedAccounts.facebook 
                        ? 'bg-gray-100 dark:bg-gray-700 text-[#577B92] dark:text-gray-300' 
                        : 'bg-[#1E4D3A] dark:bg-[#E86F2C] text-white'
                    }`}
                  >
                    {connectedAccounts.facebook ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Twitter className="text-[#1DA1F2] mr-3" size={24} />
                    <div>
                      <h3 className="text-[#1E4D3A] dark:text-white font-medium">Twitter</h3>
                      <p className="text-[#577B92] dark:text-gray-400 text-sm">
                        {connectedAccounts.twitter ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConnectAccount('twitter')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      connectedAccounts.twitter 
                        ? 'bg-gray-100 dark:bg-gray-700 text-[#577B92] dark:text-gray-300' 
                        : 'bg-[#1E4D3A] dark:bg-[#E86F2C] text-white'
                    }`}
                  >
                    {connectedAccounts.twitter ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Instagram className="text-[#E1306C] mr-3" size={24} />
                    <div>
                      <h3 className="text-[#1E4D3A] dark:text-white font-medium">Instagram</h3>
                      <p className="text-[#577B92] dark:text-gray-400 text-sm">
                        {connectedAccounts.instagram ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleConnectAccount('instagram')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                      connectedAccounts.instagram 
                        ? 'bg-gray-100 dark:bg-gray-700 text-[#577B92] dark:text-gray-300' 
                        : 'bg-[#1E4D3A] dark:bg-[#E86F2C] text-white'
                    }`}
                  >
                    {connectedAccounts.instagram ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <h2 className="text-lg font-medium text-[#1E4D3A] dark:text-white mb-4 flex items-center">
                <CreditCard size={18} className="mr-2" />
                Subscription
              </h2>
              <div className="bg-[#F5F5F2] dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#1E4D3A] dark:text-white font-medium">Premium Plan</h3>
                    <p className="text-[#577B92] dark:text-gray-400 text-sm">Billed annually</p>
                  </div>
                  <span className="px-3 py-1 bg-[#E86F2C]/20 text-[#E86F2C] rounded-full text-sm">Active</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#577B92] dark:text-gray-400">Next billing date</span>
                    <span className="text-[#1E4D3A] dark:text-white">January 15, 2026</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-[#577B92] dark:text-gray-400">Amount</span>
                    <span className="text-[#1E4D3A] dark:text-white">$199.99/year</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="text-[#E86F2C] text-sm font-medium hover:underline">
                    Manage Subscription
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Controls */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#577B92]/10 dark:border-gray-700">
              <h2 className="text-lg font-medium text-[#1E4D3A] dark:text-white mb-4 flex items-center">
                <Shield size={18} className="mr-2" />
                Privacy Controls
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#577B92] dark:text-gray-300 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-[#E86F2C]"
                  >
                    <option value="public">Public - Anyone can view your profile</option>
                    <option value="connections">Connections Only - Only people you're connected with</option>
                    <option value="private">Private - Only you can view your profile</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-[#1E4D3A] dark:text-white font-medium">Show Activity</h3>
                    <p className="text-[#577B92] dark:text-gray-400 text-sm">Allow others to see your recent activity</p>
                  </div>
                  <button 
                    onClick={() => handlePrivacyToggle('showActivity')}
                    className="text-[#E86F2C]"
                  >
                    {privacySettings.showActivity ? (
                      <ToggleRight size={24} />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;