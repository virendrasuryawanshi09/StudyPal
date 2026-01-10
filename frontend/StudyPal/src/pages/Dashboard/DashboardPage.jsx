import React, { useState, useEffect } from 'react';
import Spinner from '../../components/common/spinner';
import progressService from '../../services/progressSevice.js';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
} from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await progressService.getDashboardData();
        setDashboardData(res.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* Loading */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  /* Empty state */
  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <TrendingUp className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No data yet. Start learning to see progress here.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
    },
    {
      label: 'Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
    },
    {
      label: 'Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
    },
  ];

  const activities = [
    ...(dashboardData.recentActivity?.documents || []).map(doc => ({
      id: doc._id,
      title: doc.title,
      time: doc.lastAccessed,
      link: `/documents/${doc._id}`,
      type: 'Document',
    })),
    ...(dashboardData.recentActivity?.quizzes || []).map(quiz => ({
      id: quiz._id,
      title: quiz.title,
      time: quiz.lastAccessed,
      link: `/quizzes/${quiz._id}`,
      type: 'Quiz',
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div
      className="
        min-h-full max-w-7xl mx-auto
        space-y-8
        bg-slate-100 dark:bg-[#0f1115]
        transition-colors duration-300
      "
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your learning overview at a glance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="
              bg-white dark:bg-[#181b22]
              border border-slate-200/60 dark:border-slate-700/60
              rounded-2xl p-6
              transition-all duration-300
              hover:shadow-md hover:-translate-y-0.5
            "
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <div
                className="
                  w-10 h-10 rounded-xl
                  bg-slate-800 dark:bg-indigo-600
                  flex items-center justify-center
                  text-white
                "
              >
                <stat.icon size={18} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div
        className="
          bg-white dark:bg-[#181b22]
          border border-slate-200/60 dark:border-slate-700/60
          rounded-2xl p-6
        "
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="
              w-10 h-10 rounded-xl
              bg-slate-200 dark:bg-[#1f2430]
              flex items-center justify-center
            "
          >
            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent Activity
          </h2>
        </div>

        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="
                  flex items-center justify-between
                  p-4 rounded-xl
                  bg-slate-100 dark:bg-[#1f2430]
                  hover:bg-slate-200/60 dark:hover:bg-[#232734]
                  transition-colors
                "
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {activity.type}: {activity.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
                <a
                  href={activity.link}
                  className="
                    text-sm font-medium
                    text-indigo-600 dark:text-indigo-400
                    hover:underline
                  "
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Clock className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No recent activity yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
