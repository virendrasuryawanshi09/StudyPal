import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Shield,
  Camera,
  Edit2,
  LogOut,
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
    <div className="min-h-[80vh] w-full max-w-5xl mx-auto space-y-8">
      {/* Header Profile Section */}
      <div className="relative">
        <div className="h-48 w-full bg-slate-800 dark:bg-[#181b22] rounded-3xl overflow-hidden border border-slate-700">
        </div>

        <div className="absolute -bottom-16 left-12 flex items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0f1115] bg-[#181b22] shadow-xl overflow-hidden flex items-center justify-center">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'default'}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formData.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" />
              Pro Student Plan
            </p>
          </div>
        </div>

        <div className="absolute -bottom-12 right-12">
          <button
            onClick={logout}
            className="px-6 py-2 bg-slate-100 dark:bg-[#181b22] text-rose-500 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-8 relative overflow-hidden">

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <User className="text-slate-500" />
                Personal Information
              </h2>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isEditing
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-[#232734] hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  }`}
              >
                {isEditing ? 'Save Changes' : <><Edit2 size={16} /> Edit Profile</>}
              </button>
            </div>

            <div className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 disabled:opacity-70 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 disabled:opacity-70 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-[#181b22] border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <BookOpen className="text-slate-500" size={18} />
              Study Goals
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2 w-full">
                  <span className="text-slate-600 dark:text-slate-400">Weekly Target</span>
                  <span className="text-emerald-500">80%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-[#232734] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Keep up the momentum! You're successfully hitting your weekly targets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;