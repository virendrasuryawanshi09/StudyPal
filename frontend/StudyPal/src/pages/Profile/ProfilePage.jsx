import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import Spinner from '../../components/common/spinner';
import Button from '../../components/common/Button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  User, UserCircle, Flame, BookOpen, Layers, Target, Clock, Activity, Edit2, Check, X,
  Mail, Settings, Shield
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const fetchProfileData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await profileService.getProfileAnalytics();
      setAnalytics(res.data);
      if (!silent && res.data?.profile?.name) {
        setNewName(res.data.profile.name);
      }
    } catch (error) {
      if (!silent) toast.error(error.message || "Failed to load profile data");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    fetchProfileData(false);
    intervalId = setInterval(() => {
      fetchProfileData(true);
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName.trim() === profile?.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsSavingName(true);
      await authService.updateProfile({ username: newName.trim() });
      updateUser({ username: newName.trim() });
      setAnalytics(prev => ({
        ...prev,
        profile: { ...prev.profile, name: newName.trim() }
      }));
      toast.success("Name updated successfully!");
      setIsEditingName(false);
    } catch (error) {
      toast.error(error.message || "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-6 text-slate-400">
          <Spinner />
          <p className="font-medium text-sm text-slate-500">Loading your profile data...</p>
        </div>
      </div>
    );
  }

  const {
    profile, studyStats, dailyActivity, weeklyActivity, knowledgeMastery, recentActivity
  } = analytics || {};

  const getScaleColor = (count) => {
    if (!count || count === 0) return 'color-empty';
    if (count === 1) return 'color-scale-1'; // #C7D2FE
    if (count <= 3) return 'color-scale-2';  // #818CF8
    if (count <= 5) return 'color-scale-3';  // #4F46E5
    return 'color-scale-4';                  // #4338CA
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-[12px] p-3 text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{`${payload[0].value} events`}</p>
        </div>
      );
    }
    return null;
  };

  // --- Premium Styling Constants (Matching Dashboard) ---
  const CARD_STYLE = "premium-card bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-[16px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-none transition-all duration-300";

  const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 shadow-sm">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans overflow-x-hidden">
      <style>
        {`
          :root {
            --chart-primary: #1e293b;
          }
          .dark, html.dark {
            --chart-primary: #4f46e5;
          }
          .react-calendar-heatmap .color-empty { fill: #E5E7EB; }
          .dark .react-calendar-heatmap .color-empty { fill: rgba(148, 163, 184, 0.1); }
          
          .react-calendar-heatmap .color-scale-1 { fill: #C7D2FE; }
          .react-calendar-heatmap .color-scale-2 { fill: #818CF8; }
          .react-calendar-heatmap .color-scale-3 { fill: #4F46E5; }
          .react-calendar-heatmap .color-scale-4 { fill: #3730A3; }
          
          .dark .react-calendar-heatmap .color-scale-1 { fill: #a5b4fc; }
          .dark .react-calendar-heatmap .color-scale-2 { fill: #818cf8; }
          .dark .react-calendar-heatmap .color-scale-3 { fill: #6366f1; }
          .dark .react-calendar-heatmap .color-scale-4 { fill: #4f46e5; }
          
          .react-calendar-heatmap rect { rx: 2; ry: 2; }
          .react-calendar-heatmap text { fill: #64748b; font-size: 8px; font-weight: 600; }
        `}
      </style>

      <div className="max-w-[1500px] mx-auto space-y-8 pb-12">
        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4 border-b border-transparent lg:border-none pb-4 lg:pb-0 w-full lg:w-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20 shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isSavingName}
                    className="bg-white dark:bg-[#181b22] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-xl font-bold w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                  />
                  <Button
                    onClick={handleNameUpdate}
                    disabled={isSavingName}
                    variant="primary"
                    className="px-3 min-w-[40px] shrink-0 h-10"
                    title="Save Name"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setIsEditingName(false)}
                    disabled={isSavingName}
                    variant="outline"
                    className="px-3 min-w-[40px] shrink-0 h-10"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    {profile?.name || 'Student'}
                  </h1>
                  <button
                    onClick={() => { setNewName(profile?.name || 'Student'); setIsEditingName(true); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors tooltip-target shrink-0"
                    title="Edit Name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold tracking-wide">
                  Level {profile?.level || 1} Scholar
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> {user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* IDENTY CARD (Col 4) */}
          <div className={`lg:col-span-4 flex flex-col justify-center space-y-6 ${CARD_STYLE}`}>
            <CardHeader icon={User} title="Account Details" subtitle="Manage your identity and subscription" />
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-white dark:bg-indigo-600 flex items-center justify-center shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Account Type</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">StudyPal Beta</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-white dark:bg-indigo-600 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Joined</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{moment(user?.createdAt || new Date()).format("MMMM YYYY")}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/settings')}>
              <Settings size={16} /> Manage Settings
            </Button>
          </div>

          {/* LEETCODE HEATMAP (Col 8) */}
          <div className={`lg:col-span-8 flex flex-col justify-between overflow-x-auto ${CARD_STYLE}`}>
            <CardHeader icon={Activity} title="Study Streak Heatmap" subtitle="Your learning consistency over the past year" />
            <div
              className="w-full mt-4 overflow-x-auto overflow-y-hidden pb-4 hide-scrollbar heatmap-container"
              ref={(node) => {
                if (node && !node.dataset.scrolled) {
                  node.scrollLeft = node.scrollWidth;
                  node.dataset.scrolled = "true";
                }
              }}
            >
              <div className="min-w-[700px] sm:min-w-full pl-1">
                <CalendarHeatmap
                  startDate={moment().subtract(365, 'days').toDate()}
                  endDate={new Date()}
                  values={dailyActivity || []}
                  classForValue={(value) => getScaleColor(value?.count)}
                  tooltipDataAttrs={(value) => {
                    const dateRaw = value?.date ? moment(value.date).format('MMM Do, YYYY') : 'Unknown Date';
                    const tooltipText = value?.count
                      ? `${value.count} activity events on ${dateRaw}`
                      : 'No study activity recorded for this day.';
                    return {
                      'data-tooltip-id': 'heatmap-tooltip',
                      'data-tooltip-content': tooltipText,
                    };
                  }}
                  showWeekdayLabels={window.innerWidth > 768}
                  gutterSize={3}
                />
              </div>
              <Tooltip id="heatmap-tooltip" className="!bg-slate-900 !text-white !rounded-lg !text-sm !font-medium !z-50" />
            </div>
            {(!dailyActivity || dailyActivity.length === 0) && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Start studying to light up your heatmap!</p>
              </div>
            )}
          </div>
        </div>

        {/* --- ROW 2 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* WEEKLY ACTIVITY CHART (Col 8) */}
          <div className={`lg:col-span-8 flex flex-col ${CARD_STYLE}`}>
            <CardHeader icon={BarChart} title="Weekly Study Activity" subtitle="Your activity volume over the last 7 days" />
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="activity" fill="var(--chart-primary)" radius={[4, 4, 4, 4]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* STATS CARDS (Col 4) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4">
            {[
              { label: "Documents", value: studyStats?.documentsUploaded || 0, icon: BookOpen },
              { label: "Flashcards", value: studyStats?.flashcardsCreated || 0, icon: Layers },
              { label: "Quizzes", value: studyStats?.quizzesCompleted || 0, icon: Target },
              { label: "Hours", value: studyStats?.totalStudyTime || 0, icon: Clock }
            ].map((stat, i) => (
              <div key={i} className={`flex flex-col justify-center ${CARD_STYLE} !p-5 group`}>
                <div className="p-2.5 rounded-[12px] w-max mb-4 bg-slate-800 text-white dark:bg-indigo-600 border-transparent group-hover:scale-110 transition-transform duration-300">
                  <stat.icon size={20} className="stroke-current" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- ROW 3 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* KNOWLEDGE MASTERY (Col 8) */}
          <div className={`lg:col-span-8 ${CARD_STYLE}`}>
            <CardHeader icon={Target} title="Knowledge Mastery" subtitle="Subject matter expertise based on quiz performance" />
            {(!knowledgeMastery || knowledgeMastery.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center opacity-70">
                <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Take quizzes to unlock subject mastery insights.</p>
              </div>
            ) : (
              <div className="space-y-5 mt-4">
                {knowledgeMastery.map((topic, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{topic.subject}</span>
                      <span className={`text-sm font-bold ${topic.mastery >= 80 ? 'text-emerald-600 dark:text-emerald-400' : topic.mastery >= 50 ? 'text-slate-800 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>{topic.mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${topic.mastery >= 80 ? 'bg-emerald-500' : topic.mastery >= 50 ? 'bg-slate-800 dark:bg-indigo-500' : 'bg-rose-500'}`}
                        style={{ width: `${topic.mastery}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY TIMELINE (Col 4) */}
          <div className={`lg:col-span-4 max-h-[400px] overflow-y-auto hide-scrollbar ${CARD_STYLE}`}>
            <div className="sticky top-0 bg-white dark:bg-[#0a0a0c] z-10 pb-4">
              <CardHeader icon={Clock} title="Recent Activity" subtitle="Your latest study milestones" />
            </div>
            {(!recentActivity || recentActivity.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center opacity-70">
                <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No recent learning activity.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((event, idx) => {
                  let Icon = BookOpen;
                  let colorClass = "bg-slate-800 text-white dark:bg-indigo-600 border-transparent";

                  if (event.type === 'quiz') {
                    Icon = Target;
                  } else if (event.type === 'flashcard') {
                    Icon = Layers;
                  }

                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="relative shrink-0 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass} shadow-sm z-10`}>
                          <Icon size={16} strokeWidth={2.5} />
                        </div>
                        {idx !== recentActivity.length - 1 && (
                          <div className="w-px h-full bg-slate-200 dark:bg-slate-700/50 absolute top-10"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize">{event.type}</span>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{moment(event.timestamp).fromNow()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2" title={event.title}>{event.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
