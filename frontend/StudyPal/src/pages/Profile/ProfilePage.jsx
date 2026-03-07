import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import progressService from '../../services/progressSevice';
import Spinner from '../../components/common/spinner';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  ChevronRight,
  Save,
  Activity,
  Key
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'identity', 'security'
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await progressService.getDashboardData();
        setStats(res.data?.overview);
      } catch (error) {
        console.error("Failed to fetch profile stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile(profileData);
      updateUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">

      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">

          {/* Avatar container */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-lg flex items-center justify-center overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username || 'user'}&backgroundColor=f8fafc`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 md:bottom-2 -right-2 md:-right-4 bg-blue-600 text-white border-2 border-white dark:border-slate-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-md flex items-center gap-1.5 z-10">
              <Award size={14} />
              LVL {stats?.pointsLevel || 1}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {user?.username}
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest leading-none">
                Pro
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2 text-sm md:text-base">
              <Mail size={16} />
              {user?.email}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4 relative z-10">
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Elegant Sidebar Nav */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-sm sticky top-8 flex flex-row lg:flex-col gap-2 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 text-sm md:text-base whitespace-nowrap lg:whitespace-normal ${isActive
                        ? "bg-slate-900 dark:bg-blue-600 text-white shadow-md shadow-slate-200/50 dark:shadow-blue-900/20"
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    <tab.icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400'} shrink-0`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Streak Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4 group-hover:scale-110 transition-transform duration-500">
                      <Flame size={24} fill="currentColor" strokeWidth={1} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Study Streak</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats?.studyStreak || 0}</p>
                      <span className="text-sm font-medium text-slate-500 mb-1">Days</span>
                    </div>
                  </div>

                  {/* XP Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-500">
                      <Zap size={24} fill="currentColor" strokeWidth={1} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Total Experience</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats?.points || 0}</p>
                      <span className="text-sm font-medium text-slate-500 mb-1">XP</span>
                    </div>
                  </div>

                  {/* Level Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-500">
                      <Award size={24} />
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Current Rank</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Level {stats?.pointsLevel || 1}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Banner */}
                <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Activity size={200} className="translate-x-1/4 translate-y-1/4" />
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex-1 space-y-5 w-full">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Learning Trajectory</h2>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                          Maintain consistent study habits to evolve your proficiency and earn advanced learning badges.
                        </p>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                          <span className="text-xs font-bold text-white">
                            <span className="text-slate-400 mr-1">LVL {(stats?.pointsLevel || 1) + 1}</span>
                            {stats?.points % 100}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 dark:bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                          <div
                            className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                            style={{ width: `${stats?.points % 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* IDENTITY TAB */}
            {activeTab === 'identity' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Data</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your profile identification details</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Enter your new name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="account@domain.com"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {loading ? <Spinner /> : <><Save size={18} /> Save Changes</>}
                    </button>
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 mt-4 sm:mt-0">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Changes propagate instantly
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <Key size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Credentials</h2>
                    <p className="text-sm text-slate-500 mt-1">Update your password to secure your account</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                      <input
                        required
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••••••"
                      />
                    </div>

                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                      <input
                        required
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Required 8+ characters"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                      <input
                        required
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {loading ? <Spinner /> : <><Shield size={18} /> Update Password</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
