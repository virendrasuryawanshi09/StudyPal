import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/spinner";
import progressService from "../../services/progressSevice.js";
import aiService from "../../services/aiService.js";
import documentService from "../../services/documentService.js";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  Sparkles,
  Target,
  Award,
  Calendar,
  Zap,
  ChevronRight
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

  const [activeChart, setActiveChart] = useState("recent");
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
      const docsRes = await documentService.getDocuments();
      const docs = docsRes.data || [];

      if (docs.length === 0) {
        setAiAnalysis("No documents found to analyze. Please upload documents first.");
        setGeneratingAi(false);
        return;
      }

      // Use the first document to ask a general question about a study plan
      const docId = docs[0]._id;
      const prompt = `Based on the content of this document, please generate: 1) Suggestions on how I can improve my study productivity for this material to get full marks. 2) A detailed weekly timetable to master this subject. Format the response nicely using markdown.`;

      const aiRes = await aiService.chat(docId, prompt);
      setAiAnalysis(aiRes.data?.answer || "AI could not generate a plan at this time.");

    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("I experienced a small glitch while trying to generate your study plan. Please try again later.");
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Spinner />
        <p className="text-slate-500 font-medium animate-pulse">Loading your learning hub...</p>
      </div>
    );
  }

  const { overview, recentActivity } = dashboardData || {};
  const stats = [
    { label: "Mastered Topics", value: overview?.totalDocuments || 0, icon: FileText, color: "orange" },
    { label: "Flashcard Decks", value: overview?.totalFlashcardsSets || 0, icon: BookOpen, color: "emerald" },
    { label: "Quizzes Taken", value: overview?.completedQuizzes || 0, icon: BrainCircuit, color: "amber" },
    { label: "Avg. Quiz Score", value: `${overview?.averageScore || 0}%`, icon: Target, color: "rose" }
  ];

  const activities = [
    ...(recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      title: doc.title,
      time: doc.lastAccessed,
      link: `/documents/${doc._id}`,
      type: "Document",
      icon: FileText,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10"
    })),
    ...(recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      time: quiz.completedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}`,
      type: "Quiz",
      icon: BrainCircuit,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10"
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  // REAL Chart Data mapped from recent quizzes
  const recentQuizData = (recentActivity?.quizzes || [])
    .filter(q => q.completedAt)
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt)) // oldest to newest for chart progression
    .map(q => ({
      name: new Date(q.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: q.score
    }));

  // If not enough data, pad it or fallback
  const chartData = recentQuizData.length > 2 ? recentQuizData : [
    { name: "Start", score: 0 },
    ...recentQuizData,
    { name: "Current", score: overview?.averageScore || 0 }
  ];

  return (
    <div className="min-h-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 rounded-[2rem] text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            Welcome back, Scholar! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-orange-100 font-medium text-lg max-w-xl">
            You are on a <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{overview?.studyStreak || 1} day</span> streak. Keep pushing forward!
          </p>
        </div>

        <div className="relative z-10 flex gap-4 mt-4 md:mt-0">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col items-center justify-center min-w-[100px]">
            <FlameIcon className="text-yellow-300 mb-1" size={24} />
            <span className="font-black text-2xl">{overview?.studyStreak || 1}</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Days</span>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col items-center justify-center min-w-[100px]">
            <Award className="text-white mb-1" size={24} />
            <span className="font-black text-2xl">{overview?.averageScore || 0}%</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Score</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colors = {
            orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
            emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
            amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
            rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
          };
          return (
            <div
              key={index}
              className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${colors[stat.color]}`}>
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-4xl font-black text-slate-800 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Charts and AI) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Charts Section */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <TrendingUp className="text-orange-500" /> Performance History
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Track your quiz scores and study progress.</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} /> {/* orange-500 */}
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#f97316' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, fill: '#f97316', strokeWidth: 4, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Study Enhancer Section */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-[22px] p-6 md:p-8 relative shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">StudyPal AI Advisor</h2>
                  <p className="text-slate-500 text-sm font-medium">Personalized strategies to score 100%</p>
                </div>
              </div>

              <button
                onClick={handleAiAnalysis}
                disabled={generatingAi}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 border border-orange-100 dark:border-orange-500/10 rounded-xl text-sm font-bold transition-all"
              >
                {generatingAi ? <><Spinner /> Analyzing...</> : <><Zap size={16} /> Re-Analyze</>}
              </button>
            </div>

            <div className="prose prose-orange max-w-none text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-[#232734] p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 h-64 overflow-y-auto custom-scrollbar">
              {generatingAi ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
                  <Sparkles className="animate-pulse text-orange-400" size={32} />
                  <p className="animate-pulse">AI is reading your documents and creating a master plan...</p>
                </div>
              ) : (
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Activity & Reminders) */}
        <div className="space-y-8">

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="text-orange-500" size={24} /> Activity
              </h2>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:top-0 before:bottom-0 before:left-6 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                {activities.map((activity, i) => (
                  <Link
                    key={activity.id + i}
                    to={activity.link}
                    className="relative flex items-start gap-4 group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 ${activity.bg} ${activity.color} ring-4 ring-white dark:ring-[#181b22]`}>
                      <activity.icon size={20} />
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
                        {new Date(activity.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase ${activity.bg} ${activity.color}`}>
                        {activity.type}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50 dark:bg-[#0f1115] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <Calendar className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">No recent activity yet.</p>
                <p className="text-xs font-medium text-slate-400 max-w-[180px] mx-auto mt-1">Start studying a document to see your history here.</p>
              </div>
            )}

            <button className="w-full mt-8 py-4 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 dark:text-slate-400 dark:bg-[#0f1115] dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              View All Activity <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const FlameIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>
);

export default DashboardPage;
