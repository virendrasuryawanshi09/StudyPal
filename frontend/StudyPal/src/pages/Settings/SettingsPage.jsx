import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const CARD_STYLE = "premium-card bg-white dark:bg-[#181b22] border border-slate-200 dark:border-slate-800 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 md:p-8 transition-all";

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    // Profile Edit State
    const [name, setName] = useState(user?.username || "Student");
    const [bio, setBio] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handleSaveProfile = async () => {
        try {
            setIsSavingProfile(true);
            await authService.updateProfile({ username: name.trim() });
            updateUser({ username: name.trim() });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return toast.error("Please fill in all password fields");
        }
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match");
        }
        try {
            setIsUpdatingPassword(true);
            await authService.changePassword({
                currentPassword,
                newPassword
            });
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            toast.error(error.message || "Failed to update password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const SectionTitle = ({ icon: Icon, title, description }) => (
        <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-slate-50 dark:bg-[#232734] border border-slate-100 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400">
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent font-sans">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Manage your personal information and preferences.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/profile')} className="shrink-0 group">
                        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Profile
                    </Button>
                </div>

                {/* Profile Information */}
                <div className={CARD_STYLE}>
                    <SectionTitle icon={User} title="Profile Information" description="Update your public-facing details." />
                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#232734] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio / tagline</label>
                            <input
                                type="text"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="e.g. Computer Science Student"
                                className="w-full bg-slate-50 dark:bg-[#232734] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="pt-4">
                            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                                {isSavingProfile ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Password Update */}
                <div className={CARD_STYLE}>
                    <SectionTitle icon={Key} title="Security & Authentication" description="Update your password to keep your account secure." />
                    <div className="space-y-5 max-w-2xl">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full bg-slate-50 dark:bg-[#232734] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full bg-slate-50 dark:bg-[#232734] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full bg-slate-50 dark:bg-[#232734] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="pt-4">
                            <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
