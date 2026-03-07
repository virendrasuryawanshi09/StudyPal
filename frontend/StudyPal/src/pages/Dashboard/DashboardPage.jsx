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
  FileText, BookOpen, BrainCircuit, Clock, Target, Activity, RefreshCw,
  ChevronRight, Layers, Sparkles, TrendingUp, TrendingDown, CheckCircle2,
  ListTodo, Lightbulb, Upload, BarChart3, CalendarDays, CalendarRange,
  Calendar, Play, Pause, RotateCcw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import ReactMarkdown from "react-markdown";

// --- INLINE POMODORO COMPONENT ---
// Rebuilt specifically for the Dashboard Header to fit the Premium Minimalist aesthetic
const DashboardPomodoro = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) setSeconds(seconds - 1);
        else if (minutes > 0) { setMinutes(minutes - 1); setSeconds(59); }
        else { setIsActive(false); clearInterval(interval); toast.success("Focus Session Complete!"); }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setMinutes(25); setSeconds(0); };

  return (
    <div className="bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-[12px] p-2 flex items-center gap-3 shadow-sm hover:shadow-md transition-all h-full">
      <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 tracking-tight text-sm">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="flex items-center gap-1 pr-1">
        <button onClick={toggle} className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
          {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
        <button onClick={reset} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Local state for checkboxes
  const [checkedTasks, setCheckedTasks] = useState(new Set());

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
      // We use the new Interactive UI fallback now, so we don't need a massive string here.
      setAiAnalysis("");
    } finally {
      setGeneratingAi(false);
    }
  };

  const toggleTask = (index) => {
    const newSet = new Set(checkedTasks);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setCheckedTasks(newSet);
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

  const { overview, analytics } = dashboardData || {};

  // --- Premium Styling Constants ---
  const CARD_STYLE = "bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-[16px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)] dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1";

  // --- Mapped Data ---
  const stats = [
    { label: "Documents", value: overview?.totalDocuments || 0, icon: FileText, trend: `${overview?.topicsCompleted || 0} topics`, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" },
    { label: "Flashcards", value: overview?.totalFlashcardsSets || 0, icon: Layers, trend: "Ready to review", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" },
    { label: "Quizzes Taken", value: overview?.totalQuizzes || 0, icon: BrainCircuit, trend: `${overview?.completedQuizzes || 0} completed`, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" },
    { label: "Accuracy", value: `${overview?.averageScore || 0}%`, icon: Target, trend: "Overall avg", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" }
  ];

  const chartData = (analytics?.recentPerformanceData || []).length > 0
    ? analytics.recentPerformanceData.map((q, i) => ({
      name: `Q${i + 1}`, fullName: q.title, date: new Date(q.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), score: q.score
    }))
    : [{ name: "No Data", score: 0 }];

  // Circular Progress Data
  const dailyProg = Math.min(100, Math.max(10, (overview?.pointsLevel || 1) * 15 + (overview?.studyStreak || 0) * 5));
  const weeklyProg = Math.min(100, Math.max(20, (overview?.completedQuizzes || 0) * 10));
  const monthlyProg = Math.min(100, overview?.averageScore || 50);

  // Components
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#050505] text-slate-800 dark:text-slate-200 p-4 md:p-6 lg:p-8 font-sans overflow-x-hidden">
      <div className="max-w-[1500px] mx-auto space-y-8 pb-12">

        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Dashboard
              <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] py-1 px-2.5 rounded-lg font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/30">Premium</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Welcome back. Manage your study materials and track your progress.</p>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full lg:w-auto hide-scrollbar self-stretch">
            <DashboardPomodoro />
            <button onClick={() => navigate('/documents')} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm hover:shadow-md transition-all rounded-[12px] text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap h-full">
              <Upload size={16} /> Upload Notes
            </button>
            <button onClick={() => navigate('/documents')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 border border-indigo-700 dark:border-indigo-400 hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-sm hover:shadow-md transition-all rounded-[12px] text-sm font-bold text-white whitespace-nowrap h-full">
              <BrainCircuit size={16} /> Create Quiz
            </button>
          </div>
        </div>

        {/* --- STATS ROW --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={CARD_STYLE + " group !p-5"}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-[12px] ${stat.bg} ${stat.color} border group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- ROW 1: Progress & Focus --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Progress Overview (Col 8) */}
          <div className={`lg:col-span-8 flex flex-col justify-between ${CARD_STYLE}`}>
            <CardHeader icon={BarChart3} title="Progress Overview" subtitle="Your learning trajectory and time invested" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-4">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 mb-4 circular-dark-fix relative">
                  <CircularProgressbar value={dailyProg} text={`${dailyProg}%`} styles={buildStyles({ pathColor: '#6366f1', textColor: 'currentColor', trailColor: 'rgba(148, 163, 184, 0.2)', textSize: '22px', pathTransitionDuration: 1.5 })} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><CalendarDays size={14} className="text-slate-400 dark:text-slate-500" /> Daily Goal</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 mb-4 circular-dark-fix relative">
                  <CircularProgressbar value={weeklyProg} text={`${weeklyProg}%`} styles={buildStyles({ pathColor: '#10b981', textColor: 'currentColor', trailColor: 'rgba(148, 163, 184, 0.2)', textSize: '22px', pathTransitionDuration: 1.5 })} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><CalendarRange size={14} className="text-slate-400 dark:text-slate-500" /> Weekly Progress</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 mb-4 circular-dark-fix relative">
                  <CircularProgressbar value={monthlyProg} text={`${monthlyProg}%`} styles={buildStyles({ pathColor: '#f59e0b', textColor: 'currentColor', trailColor: 'rgba(148, 163, 184, 0.2)', textSize: '22px', pathTransitionDuration: 1.5 })} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"><Calendar size={14} className="text-slate-400 dark:text-slate-500" /> Monthly Mastery</p>
              </div>
            </div>
          </div>

          {/* Today's Focus (Col 4) */}
          <div className={`lg:col-span-4 ${CARD_STYLE}`}>
            <CardHeader icon={ListTodo} title="Today's Focus" subtitle="Actionable tasks generated for you" />
            <div className="space-y-3">
              {(analytics?.todaysFocus || []).map((task, i) => (
                <Link key={i} to={task.actionUrl} className="group flex items-start gap-3 p-3.5 rounded-[12px] bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-sm">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-[2px] flex items-center justify-center shrink-0 ${task.priority === 'High' ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/30' : 'border-indigo-400 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/30'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-amber-500' : 'bg-indigo-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{task.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{task.type}</p>
                  </div>
                </Link>
              ))}
              {(!analytics?.todaysFocus || analytics.todaysFocus.length === 0) && (
                <div className="text-center py-6 text-slate-400 text-sm font-medium">Upload notes or generate flashcards to create study tasks.</div>
              )}
            </div>
          </div>
        </div>

        {/* --- ROW 2: Analytics & Heatmap --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Performance Analytics */}
          <div className={`lg:col-span-8 ${CARD_STYLE}`}>
            <CardHeader icon={Activity} title="Performance Analytics" subtitle="Quiz accuracy trends over recent sessions" />
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.4} /> // lighter grid for both modes
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-[12px] p-4 text-center">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{data.fullName}</p>
                          <p className="text-[24px] font-black text-indigo-600 dark:text-indigo-400 mt-1">{data.score}%</p>
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

          {/* Weekly Learning Heatmap */}
          <div className={`lg:col-span-4 ${CARD_STYLE}`}>
            <CardHeader icon={Calendar} title="Weekly Activity" subtitle="Study events across the week" />
            <div className="h-[250px] w-full mt-4 bg-slate-50/50 dark:bg-white/5 rounded-xl p-2 border border-slate-100 dark:border-white/5">
              {analytics?.weeklyActivity?.reduce((sum, item) => sum + item.activity, 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.weeklyActivity} layout="vertical" margin={{ top: 0, right: 10, left: -15, bottom: 0 }} barSize={16}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="day" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return <div className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded-md">{payload[0].value} events</div>;
                      } return null;
                    }}
                    />
                    <Bar dataKey="activity" radius={[0, 4, 4, 0]}>
                      {(analytics?.weeklyActivity || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.activity > 0 ? '#6366f1' : 'rgba(148, 163, 184, 0.2)'} className="hover:opacity-80 cursor-pointer" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium text-center px-4">
                  Start studying to populate your learning heatmap.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- ROW 3: Knowledge Mastery Score --- */}
        <div className={CARD_STYLE}>
          <CardHeader icon={Target} title="Knowledge Mastery" subtitle="Your average accuracy per subject area" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {(analytics?.knowledgeMastery || []).length > 0 ? (
              analytics.knowledgeMastery.map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate pr-4">{item.subject}</p>
                    <p className={`text-sm font-black ${item.accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : item.accuracy >= 50 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>{item.accuracy}%</p>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${item.accuracy >= 80 ? 'bg-emerald-500' : item.accuracy >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                      style={{ width: `${item.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400 text-sm font-medium">
                Take quizzes to see your subject mastery.
              </div>
            )}
          </div>
        </div>

        {/* --- ROW 4: AI Study Plan & Copilot --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* AI Study Plan */}
          <div className={`${CARD_STYLE} flex flex-col`}>
            <CardHeader icon={ListTodo} title="AI Study Plan" subtitle="Personalized daily roadmap" />

            <div className="flex-1 space-y-3 mt-2">
              {/* Map existing todaysFocus into a checklist format */}
              {(analytics?.todaysFocus || []).map((task, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-[12px] hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors group">
                  <button
                    onClick={() => toggleTask(i)}
                    className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors ${checkedTasks.has(i) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400 bg-white dark:bg-transparent'}`}
                  >
                    {checkedTasks.has(i) && <CheckCircle2 size={12} strokeWidth={4} />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-bold transition-colors ${checkedTasks.has(i) ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</p>
                  </div>
                  <Link to={task.actionUrl} className="px-3 py-1.5 bg-white dark:bg-indigo-600 border border-slate-200 dark:border-indigo-500 text-xs font-bold text-indigo-600 dark:text-white rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-500 transition-all opacity-0 group-hover:opacity-100">Go</Link>
                </div>
              ))}
              {(!analytics?.todaysFocus || analytics.todaysFocus.length === 0) && (
                <div className="py-10 text-center text-slate-400 text-sm font-medium">Upload notes to generate a study plan.</div>
              )}
            </div>
          </div>

          {/* Interactive AI Copilot */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-800 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col h-[400px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.2)]">
            <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-sm">
              <div className="flex items-center gap-3 text-indigo-300">
                <div className="p-2 bg-white/10 rounded-lg border border-white/5">
                  <Sparkles size={16} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-white">AI Copilot</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-0.5">Interactive Guide</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col">
              {/* Interactive UI based on analytics fallback instead of pure string */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-[12px] backdrop-blur-sm mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">Recommendation</p>
                <p className="text-white font-bold text-lg leading-tight">
                  {analytics?.learningInsights?.weakestSubject && analytics.learningInsights.weakestSubject !== "N/A"
                    ? `Your weakest subject is ${analytics.learningInsights.weakestSubject}.`
                    : "Keep taking quizzes to unlock specific recommendations."
                  }
                </p>
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex gap-3">
                  <TrendingDown size={18} className="text-rose-400 shrink-0" />
                  <p className="text-sm text-indigo-100/80">
                    {analytics?.learningInsights?.recommendation || "Complete more tasks to build your learning profile."}
                  </p>
                </div>
              </div>

              <div className="mt-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-3">Suggested Actions</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => navigate('/documents')} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-lg border border-indigo-400 transition-colors">Create Quiz</button>
                  <button onClick={() => navigate('/flashcards')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors">Review Flashcards</button>
                  <button onClick={() => navigate('/documents')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/10 transition-colors">Study Notes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
