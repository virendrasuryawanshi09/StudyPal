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
  ChevronRight,
  Activity
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
      </div>
    );
  }

  const { overview, recentActivity } = dashboardData || {};
  const stats = [
    { label: "Documents", value: overview?.totalDocuments || 0, icon: FileText },
    { label: "Flashcards", value: overview?.totalFlashcardsSets || 0, icon: BookOpen },
    { label: "Quizzes", value: overview?.completedQuizzes || 0, icon: BrainCircuit },
    { label: "Avg Score", value: `${overview?.averageScore || 0}%`, icon: Target }
  ];

  const activities = [
    ...(recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      title: doc.title,
      time: doc.lastAccessed,
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

  // If not enough data, pad it or fallback
  const chartData = recentQuizData.length > 2 ? recentQuizData : [
    { name: "Start", score: 0 },
    ...recentQuizData,
    { name: "Current", score: overview?.averageScore || 0 }
  ];

  return (
    <div className="min-h-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your learning overview at a glance.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#232734] flex items-center justify-center text-slate-600 dark:text-slate-300">
                <stat.icon size={18} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Charts and AI) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Charts Section */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Activity className="text-slate-400" size={20} />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Performance History
                </h2>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181b22', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, fill: '#f8fafc', strokeWidth: 3, stroke: '#94a3b8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Study Enhancer Section */}
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 md:p-8 relative">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#232734] flex items-center justify-center text-emerald-500">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">StudyPal AI Advisor</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Personalized insights based on your documents</p>
                </div>
              </div>

              <button
                onClick={handleAiAnalysis}
                disabled={generatingAi}
                className="text-sm bg-slate-100 dark:bg-[#232734] text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                {generatingAi ? <Spinner /> : "Re-Analyze"}
              </button>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#1f2430] p-6 rounded-xl border border-slate-100 dark:border-slate-800 h-64 overflow-y-auto custom-scrollbar">
              {generatingAi ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <Spinner />
                  <p>Analyzing documents...</p>
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
          <div className="bg-white dark:bg-[#181b22] border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="text-slate-400" size={20} /> Recent Activity
              </h2>
            </div>

            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <Link
                    key={activity.id + i}
                    to={activity.link}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1f2430] hover:bg-slate-100 dark:hover:bg-[#232734] transition-colors border border-transparent dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-[#181b22] shadow-sm mt-0.5 text-slate-500">
                      <activity.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {activity.type}: {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-slate-400">View</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#1f2430] rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Clock className="w-8 h-8 text-slate-400 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
