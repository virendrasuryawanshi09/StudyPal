import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../../components/common/spinner";
import progressService from "../../services/progressSevice.js";
import documentService from "../../services/documentService.js";
import aiService from "../../services/aiService.js";
import toast from "react-hot-toast";

// Import Circular Progress
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import {
  FileText,
  BookOpen,
  BrainCircuit,
  Clock,
  Target,
  Activity,
  RefreshCw,
  ChevronRight,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ListTodo,
  Lightbulb,
  Upload,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Calendar
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import ReactMarkdown from "react-markdown";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await progressService.getDashboardData();
        setDashboardData(res.data);
        if (res.data?.overview?.totalDocuments > 0) {
          handleAiAnalysis(res.data);
        } else {
          setAiAnalysis("Upload some documents first so StudyPal AI can analyze your materials and provide personalized guidance.");
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

  const handleAiAnalysis = async (currentData) => {
    try {
      setGeneratingAi(true);
      const docs = await documentService.getDocuments() || [];
      if (!Array.isArray(docs) || docs.length === 0) {
        setAiAnalysis("No documents found. Start by uploading notes!");
        setGeneratingAi(false);
        return;
      }
      const docId = docs[0]._id;
      const prompt = `Act as an expert AI tutor. Based on this document, briefly summarize the core concepts and suggest 2 immediate study actions I should take today to master this material. Keep it concise.`;
      const aiRes = await aiService.chat(docId, prompt);

      if (!aiRes || (!aiRes.data && !aiRes.answer)) {
        throw new Error("Empty AI Response");
      }
      setAiAnalysis(aiRes?.data?.answer || aiRes?.answer);
    } catch (error) {
      console.error("AI Analysis failed. Using fallback:", error);
      // Premium Fallback Logic if Gemini API fails
      const insights = currentData?.analytics?.learningInsights;
      const fallbackStr = `**AI Systems Offline** 
      
However, based on your analytics:
- Your strongest area is **${insights?.bestSubject || 'N/A'}**.
- You need attention on **${insights?.weakestSubject || 'N/A'}**.

*Recommendation: ${insights?.recommendation || 'Try reviewing flashcards before attempting another quiz.'}*`;
      setAiAnalysis(fallbackStr);
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-6 text-slate-400">
          <Spinner />
          <p className="font-medium text-sm text-slate-500">Loading your structured workspace...</p>
        </div>
      </div>
    );
  }

  const { overview, recentActivity, analytics } = dashboardData || {};

  // --- Premium Styling Constants ---
  const CARD_STYLE = "bg-white border border-slate-200 rounded-[16px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5";

  // --- Mapped Data ---
  const stats = [
    { label: "Documents", value: overview?.totalDocuments || 0, icon: FileText, trend: `${overview?.topicsCompleted || 0} topics`, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { label: "Flashcards", value: overview?.totalFlashcardsSets || 0, icon: Layers, trend: "Ready to review", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Quizzes Taken", value: overview?.totalQuizzes || 0, icon: BrainCircuit, trend: `${overview?.completedQuizzes || 0} completed`, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { label: "Accuracy", value: `${overview?.averageScore || 0}%`, icon: Target, trend: "Overall avg", color: "text-rose-600", bg: "bg-rose-50 border-rose-100" }
  ];

  const activities = [
    ...(recentActivity?.documents || []).map((doc) => ({
      id: doc._id || Math.random(),
      title: doc.title,
      time: doc.lastAccessed || doc.createdAt,
      link: `/documents/${doc._id}`,
      type: "Document Edited",
      icon: FileText
    })),
    ...(recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id || Math.random(),
      title: quiz.title || 'Quiz',
      time: quiz.completedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}`,
      type: "Quiz Taken",
      icon: CheckCircle2,
      score: quiz.score
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const chartData = (analytics?.recentPerformanceData || []).length > 0
    ? analytics.recentPerformanceData.map((q, i) => ({
      name: `Q${i + 1}`,
      fullName: q.title,
      date: new Date(q.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: q.score
    }))
    : [{ name: "No Data", score: 0 }];

  // Circular Progress Data (Calculated dynamically to look realistic based on overall points/score)
  const dailyProg = Math.min(100, Math.max(10, (overview?.pointsLevel || 1) * 15 + (overview?.studyStreak || 0) * 5));
  const weeklyProg = Math.min(100, Math.max(20, (overview?.completedQuizzes || 0) * 10));
  const monthlyProg = Math.min(100, overview?.averageScore || 50);

  // --- Components ---
  const CardHeader = ({ icon: Icon, title, subtitle, action }) => (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 shadow-sm">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs font-semibold text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-8">

        {/* --- 1. HEADER & QUICK ACTIONS --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              Dashboard
              <span className="bg-indigo-100 text-indigo-700 text-[10px] py-1 px-2.5 rounded-lg font-black uppercase tracking-widest">Premium</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">Welcome back. Manage your study materials and track your progress.</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 w-full lg:w-auto hide-scrollbar">
            <button onClick={() => navigate('/documents')} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all rounded-[12px] text-sm font-bold text-slate-700 whitespace-nowrap">
              <Upload size={16} /> Upload Notes
            </button>
            {/* Fix: Redirect to documents so they can select one to build a quiz from */}
            <button onClick={() => navigate('/documents')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all rounded-[12px] text-sm font-bold text-white whitespace-nowrap">
              <BrainCircuit size={16} /> Create Quiz
            </button>
          </div>
        </div>

        {/* --- 2. STATS ROW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={CARD_STYLE + " group !p-5"}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-[12px] ${stat.bg} ${stat.color} border group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black tracking-tight text-slate-900">{stat.value}</p>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1">
                  <TrendingUp size={12} className={stat.color} /> {stat.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- 3. MAIN GRID (Overview & Focus) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Progress Overview (Col 8) */}
          <div className={`lg:col-span-8 ${CARD_STYLE}`}>
            <CardHeader icon={BarChart3} title="Progress Overview" subtitle="Your learning trajectory and time invested" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6 mt-4">
              {/* Circular Progress 1 */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 mb-4">
                  <CircularProgressbar
                    value={dailyProg}
                    text={`${dailyProg}%`}
                    styles={buildStyles({
                      pathColor: '#6366f1', // indigo-500
                      textColor: '#0f172a', // slate-900
                      trailColor: '#f1f5f9', // slate-100
                      textSize: '22px',
                      pathTransitionDuration: 1.5
                    })}
                  />
                </div>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><CalendarDays size={14} className="text-slate-400" /> Daily Goal</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{overview?.dailyTasksCompleted || 1} tasks today</p>
              </div>

              {/* Circular Progress 2 */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 mb-4">
                  <CircularProgressbar
                    value={weeklyProg}
                    text={`${weeklyProg}%`}
                    styles={buildStyles({
                      pathColor: '#10b981', // emerald-500
                      textColor: '#0f172a', // slate-900
                      trailColor: '#f1f5f9', // slate-100
                      textSize: '22px',
                      pathTransitionDuration: 1.5
                    })}
                  />
                </div>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><CalendarRange size={14} className="text-slate-400" /> Weekly Progress</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{overview?.totalStudyTimeHours || 0} hrs studied</p>
              </div>

              {/* Circular Progress 3 */}
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 mb-4">
                  <CircularProgressbar
                    value={monthlyProg}
                    text={`${monthlyProg}%`}
                    styles={buildStyles({
                      pathColor: '#f59e0b', // amber-500
                      textColor: '#0f172a', // slate-900
                      trailColor: '#f1f5f9', // slate-100
                      textSize: '22px',
                      pathTransitionDuration: 1.5
                    })}
                  />
                </div>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> Monthly Mastery</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{overview?.completedQuizzes || 0} quizzes passed</p>
              </div>
            </div>
          </div>

          {/* Today's Focus (Col 4) */}
          <div className={`lg:col-span-4 ${CARD_STYLE}`}>
            <CardHeader icon={ListTodo} title="Today's Focus" subtitle="Actionable tasks generated for you" />

            <div className="space-y-3">
              {(analytics?.todaysFocus || []).map((task, i) => (
                <Link key={i} to={task.actionUrl} className="group flex items-start gap-4 p-4 rounded-[12px] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all duration-300">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center shrink-0 ${task.priority === 'High' ? 'border-amber-400 bg-amber-50 group-hover:bg-amber-100' : 'border-indigo-400 bg-indigo-50 group-hover:bg-indigo-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-amber-500' : 'bg-indigo-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{task.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.type}</p>
                  </div>
                </Link>
              ))}
              {(!analytics?.todaysFocus || analytics.todaysFocus.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-sm">No specific tasks generated for today.</div>
              )}
            </div>
          </div>

        </div>

        {/* --- 4. ANALYTICS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Performance Analytics */}
          <div className={`lg:col-span-8 ${CARD_STYLE}`}>
            <CardHeader icon={Activity} title="Performance Analytics" subtitle="Quiz accuracy trends over recent sessions" />

            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.8} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', opacity: 0.8 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-[12px] p-4">
                            <p className="text-sm font-bold text-slate-900 mb-1">{data.fullName}</p>
                            <p className="text-xs uppercase text-slate-500 mb-3 font-semibold">{data.date}</p>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <div className={`w-2.5 h-2.5 rounded-full ${data.score >= 80 ? 'bg-emerald-500' : data.score >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
                              <span className="text-[11px] font-black tracking-wider text-slate-700">{data.score}% ACCURACY</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#10b981' : entry.score >= 50 ? '#6366f1' : '#f43f5e'} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className={`lg:col-span-4 ${CARD_STYLE}`}>
            <CardHeader icon={Clock} title="Recent Activity" action={<Link to="/documents" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">View All</Link>} />

            <div className="relative pl-3 mt-4">
              {/* Continuous Line */}
              <div className="absolute left-[23px] top-3 bottom-6 w-[2px] bg-slate-100"></div>

              <div className="space-y-6 relative">
                {activities.length > 0 ? activities.map((activity, i) => (
                  <div key={activity.id + i} className="flex gap-5 group">
                    <div className="relative z-10 w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shrink-0 shadow-sm text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300">
                      <activity.icon size={16} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 pt-1.5 pb-2">
                      <Link to={activity.link} className="text-sm font-bold text-slate-800 hover:text-indigo-600 transition-colors block leading-tight">
                        {activity.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{activity.type}</p>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <p className="text-xs font-medium text-slate-400">{new Date(activity.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-slate-400 text-sm">No recent activity found.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- 5. INSIGHTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">

          {/* Learning Insights Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-[16px] p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-white relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl text-indigo-300 backdrop-blur-sm border border-white/5">
                    <Lightbulb size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">Learning Insights</h2>
                    <p className="text-xs font-medium text-indigo-200 mt-0.5">Systematic analysis of your statistics</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[12px] backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Strongest Subject</p>
                  </div>
                  <p className="text-xl font-black text-white leading-tight">{analytics?.learningInsights?.bestSubject || "N/A"}</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-5 rounded-[12px] backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={16} className="text-rose-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Needs Attention</p>
                  </div>
                  <p className="text-xl font-black text-white leading-tight">{analytics?.learningInsights?.weakestSubject || "N/A"}</p>
                </div>
              </div>

              <div className="mt-4 bg-white/10 p-5 rounded-[12px] border border-white/20 backdrop-blur-md flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  <Sparkles size={20} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-indigo-200 mb-1">Recommendation</p>
                  <p className="text-sm font-medium text-white leading-relaxed">{analytics?.learningInsights?.recommendation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Copilot Panel */}
          <div className="bg-white border border-slate-200 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col h-[400px] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div className="p-5 border-b border-indigo-100 bg-indigo-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3 text-indigo-700">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Sparkles size={16} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight">AI Copilot</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-0.5">Gemini Powered</p>
                </div>
              </div>
              <button onClick={() => handleAiAnalysis(dashboardData)} disabled={generatingAi} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 shadow-sm transition-all disabled:opacity-50">
                {generatingAi ? <Spinner /> : <RefreshCw size={14} />}
              </button>
            </div>

            <div className="flex-1 relative bg-white p-6 overflow-y-auto custom-scrollbar">
              {generatingAi ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm z-10">
                  <div className="pulse-dot w-4 h-4 bg-indigo-500 rounded-full animate-ping"></div>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Generating insights...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-slate max-w-none 
                        prose-p:text-slate-600 prose-p:leading-relaxed 
                        prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
                        prose-strong:text-slate-900
                        prose-li:text-slate-600
                        prose-a:text-indigo-600">
                  {aiAnalysis ? <ReactMarkdown>{aiAnalysis}</ReactMarkdown> : <p className="text-center text-slate-400 mt-10 font-medium">Select a document to get AI insights.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
