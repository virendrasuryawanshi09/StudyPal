import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Camera,
  Edit2,
  LogOut,
  Sparkles,
  BookOpen
} from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Student',
    email: user?.email || 'student@studypal.com',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Add real update logic here
  };

  return (
    <div className="min-h-[80vh] w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile Section */}
      <div className="relative">
        <div className="h-48 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl overflow-hidden shadow-lg shadow-orange-500/20">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          {/* Decorative circles */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
        </div>

        <div className="absolute -bottom-16 left-12 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0f1115] bg-white shadow-xl overflow-hidden flex items-center justify-center">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'default'}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 hover:scale-105 transition-all">
              <Camera size={16} />
            </button>
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white drop-shadow-sm">
              {formData.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" />
              Pro Student Plan
            </p>
          </div>
        </div>

        <div className="absolute -bottom-12 right-12">
          <button
            onClick={logout}
            className="px-6 py-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-rose-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-rose-50 transition-all flex items-center gap-2 border border-rose-100"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-8 shadow-sm relative overflow-hidden">

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <User className="text-orange-500" />
                Personal Information
              </h2>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all ${isEditing
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  }`}
              >
                {isEditing ? 'Save Changes' : <><Edit2 size={16} /> Edit Profile</>}
              </button>
            </div>

            <div className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#232734]/50 text-slate-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#232734]/50 text-slate-800 dark:text-white disabled:opacity-70 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Mini Stats or Extra Cards */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>

            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles size={24} className="text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-xl">StudyPal Pro</h3>
                <p className="text-orange-100 text-sm">Active Subscription</p>
              </div>
            </div>
            <p className="text-orange-50 mt-4 font-medium mb-6 relative z-10">
              You have full AI access to unlimited documents, daily summaries, and flashcards.
            </p>
            <button className="w-full py-3 bg-white text-orange-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg relative z-10">
              Manage Plan
            </button>
          </div>

          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 rounded-3xl p-8 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
              <BookOpen className="text-orange-500" size={20} />
              Study Goals
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Weekly Target</span>
                  <span className="text-orange-600">80%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#232734] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 w-[80%] rounded-full"></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Keep up the momentum! You're extremely close to completing your weekly targets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;