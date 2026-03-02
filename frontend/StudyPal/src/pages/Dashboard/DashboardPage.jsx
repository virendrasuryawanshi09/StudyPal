import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/spinner";
import progressService from "../../services/progressSevice.js";
import aiService from "../../services/aiService.js";
import documentService from "../../services/documentService.js";
import PomodoroTimer from "../../components/common/PomodoroTimer";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Sparkles,
  Target,
  ChevronRight,
  Activity,
  Flame,
  Award,
  Zap,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ReactMarkdown from "react-markdown";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [aiAnalysis, setAiAnalysis] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await progressService.getDashboardData();
        setDashboardData(res.data);

        if (res.data?.overview?.totalDocuments > 0) {
          handleAiAnalysis();
        } else {
          setAiAnalysis("Upload some documents first so StudyPal AI can analyze your materials and generate a personalized study timetable.");
        }

      } catch (error) {
        toast.error("Failed to fetch dashboard data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAiAnalysis = async () => {
    try {
      setGeneratingAi(true);
      const docs = await documentService.getDocuments() || [];

      if (!Array.isArray(docs) || docs.length === 0) {
        setAiAnalysis("No documents found to analyze. Please upload documents first.");
        setGeneratingAi(false);
        return;
      }

      const docId = docs[0]._id;
      const prompt = `Based on the content of this document, please generate: 1) Suggestions on how I can improve my study productivity for this material to get full marks. 2) A detailed weekly timetable to master this subject. Format the response nicely using markdown.`;

      const aiRes = await aiService.chat(docId, prompt);

      // aiService.chat returns response.data from axios, which has { success, data: { answer } }
      setAiAnalysis(aiRes?.data?.answer || aiRes?.answer || "AI could not generate a plan at this time.");

    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("I experienced a small glitch while trying to generate your study plan. Please try again later.");
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-slate-400">
        <Spinner />
        <p className="animate-pulse">Loading your learning dashboard...</p>
      </div>
    );
  }

  const { overview, recentActivity } = dashboardData || {};
  const stats = [
    { label: "Documents", value: overview?.totalDocuments || 0, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Flashcards", value: overview?.totalFlashcardsSets || 0, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Quizzes", value: overview?.totalQuizzes || 0, icon: BrainCircuit, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Avg Score", value: `${overview?.averageScore || 0}%`, icon: Target, color: "text-rose-500", bg: "bg-rose-500/10" }
  ];

  const activities = [
    ...(recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      title: doc.title,
      time: doc.lastAccessed || doc.createdAt,
      link: `/documents/${doc._id}`,
      type: "Document",
      icon: FileText
    })),
    ...(recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      time: quiz.completedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}`,
      type: "Quiz",
      icon: BrainCircuit
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const recentQuizData = (recentActivity?.quizzes || [])
    .filter(q => q.completedAt)
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
    .map(q => ({
      name: new Date(q.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: q.score
    }));

  const chartData = recentQuizData.length > 2 ? recentQuizData : [
    { name: "Start", score: 0 },
    ...recentQuizData,
    { name: "Target", score: 100 }
  ];

  return (
    <div className="min-h-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16 px-4">

      {/* Hero Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-900 dark:bg-[#181b22] p-8 md:p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">
              StudyPal AI Assistant
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
            Hello, Student!
          </h1>
          <p className="text-slate-400 text-lg max-w-lg">
            Ready to master your documents today? Your current learning status is looking great.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 mt-4 md:mt-0">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center gap-4 transition-transform hover:scale-105 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame size={28} fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Day Streak</p>
              <p className="text-3xl font-black text-white">{overview?.studyStreak || 0}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center gap-4 transition-transform hover:scale-105 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Award size={28} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Level {overview?.pointsLevel || 1}</p>
              <p className="text-2xl font-black text-white">{overview?.points || 0} <span className="text-sm font-medium text-slate-500 ml-1">XP</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} mb-6 transition-transform group-hover:rotate-6`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-50">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* --- LEFT COLUMN: Charts & AI (Col 1-8) --- */}
        <div className="lg:col-span-8 space-y-10">

          {/* Performance Charts */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-8 lg:p-10 shadow-sm relative group overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    Learning Progress
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">Your quiz performance over time</p>
                </div>
              </div>
            </div>

            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#181b22',
                      borderRadius: '16px',
                      border: '1px solid #334155',
                      padding: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    activeDot={{ r: 8, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Advisor Section */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Zap size={24} fill="currentColor" className="opacity-80" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">StudyPal AI Advisor</h2>
                  <p className="text-slate-500 font-medium">AI-generated study plans & productivity hacks</p>
                </div>
              </div>

              <button
                onClick={handleAiAnalysis}
                disabled={generatingAi}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700 shadow-sm disabled:opacity-50"
              >
                {generatingAi ? <Spinner /> : <><RefreshCw size={16} /> Update Plan</>}
              </button>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1f2430] p-8 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 h-80 overflow-y-auto custom-scrollbar">
              {generatingAi ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-slate-400">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" />
                  </div>
                  <p className="font-semibold tracking-wide">Synthesizing document insights...</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Activity & Timer (Col 9-12) --- */}
        <div className="lg:col-span-4 space-y-10">

          {/* POMODORO TIMER GOES HERE */}
          <PomodoroTimer />

          {/* Recent Activity List */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <Clock className="text-blue-500" size={24} /> Recent
              </h2>
              <Link to="/documents" className="text-xs font-bold text-blue-500 uppercase tracking-widest hover:underline">View All</Link>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <Link
                    key={activity.id + i}
                    to={activity.link}
                    className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-[#1f2430] hover:bg-slate-100 dark:hover:bg-[#232734] transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 group/item"
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white dark:bg-[#181b22] shadow-sm border border-slate-100 dark:border-slate-800 text-slate-500 group-hover/item:text-blue-500 transition-colors">
                      <activity.icon size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {activity.title}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                        {activity.type} • {new Date(activity.time).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-50 dark:bg-[#1f2430] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Clock className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-sm font-semibold text-slate-500">No activity yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
