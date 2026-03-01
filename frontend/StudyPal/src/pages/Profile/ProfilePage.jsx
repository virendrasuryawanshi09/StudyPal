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
  Edit2,
  LogOut,
  Settings,
  Lock,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  ChevronRight,
  Save
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
    { id: 'overview', label: 'Overview', icon: Zap },
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">

      {/* Premium Hero Header */}
      <div className="relative group">
        <div className="h-64 w-full bg-slate-900 rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl relative">
          {/* Animated Mesh Gradient Effect */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80"></div>

          {/* Header Content */}
          <div className="absolute bottom-8 left-12 right-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white/10 backdrop-blur-md bg-white/5 shadow-2xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-4 border-slate-900">
                  <Award size={20} />
                </div>
              </div>

              <div className="text-center md:text-left space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    {user?.username}
                  </h1>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">
                    Pro Member
                  </span>
                </div>
                <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} className="text-slate-500" />
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-2xl transition-all border border-rose-500/20 flex items-center gap-2 backdrop-blur-md"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#181b22] border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-4 shadow-sm sticky top-8">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-bold transition-all ${activeTab === tab.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? "" : "opacity-50"} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-9">

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#181b22] border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6">
                    <Flame size={24} fill="currentColor" strokeWidth={0} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Consistency</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.studyStreak || 0} Day Streak</p>
                </div>

                <div className="bg-white dark:bg-[#181b22] border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                    <Zap size={24} fill="currentColor" strokeWidth={0} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Experience</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.points || 0} XP</p>
                </div>

                <div className="bg-white dark:bg-[#181b22] border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-6">
                    <Award size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Learning Rank</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">Level {stats?.pointsLevel || 1}</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <h2 className="text-2xl font-black italic tracking-tight">KEEP THE MOMENTUM!</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                      You are doing an amazing job. Continue your daily streaks to unlock premium badges and AI-enhanced study tools.
                    </p>
                    <div className="pt-4">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                        <span>Progress to Level {(stats?.pointsLevel || 1) + 1}</span>
                        <span>{stats?.points % 100}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000"
                          style={{ width: `${stats?.points % 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="w-40 h-40 shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center justify-center">
                    <Shield size={80} className="text-emerald-500 opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: IDENTITY */}
          {activeTab === 'identity' && (
            <div className="bg-white dark:bg-[#181b22] border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Account Details</h2>
                  <p className="text-sm text-slate-500">Update your personal identification information</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Professional Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {loading ? <Spinner /> : <><Save size={20} /> Update Profile</>}
                  </button>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Changes will sync across all your devices
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-[#181b22] border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Security & Password</h2>
                  <p className="text-sm text-slate-500">Protect your account with a strong password</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-8 max-w-lg">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Current Password</label>
                  <input
                    required
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">New Secret Password</label>
                  <input
                    required
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    placeholder="New password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Confirm New Password</label>
                  <input
                    required
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-6 py-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                    placeholder="Confirm password"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    disabled={loading}
                    type="submit"
                    className="px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
                  >
                    {loading ? <Spinner /> : <><Shield size={20} /> Change Password</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
