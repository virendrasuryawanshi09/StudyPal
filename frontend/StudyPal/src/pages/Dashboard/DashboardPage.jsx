import React, { useState, useEffect } from 'react';
import Spinner from '../../components/common/spinner';
import progressService from '../../services/progressSevice';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
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
      <div
        className="
          min-h-[60vh] flex items-center justify-center
          bg-slate-100 dark:bg-[#0f1115]
          transition-colors duration-300
        "
      >
        <div className="text-center">
          <div
            className="
              inline-flex items-center justify-center
              w-16 h-16 rounded-2xl
              bg-slate-200 dark:bg-[#232734]
              mb-4
            "
          >
            <TrendingUp className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            No dashboard data available.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="">
      <div className="">
        <div className="">
          <div className="">
            <h1 className="">
              Dashboard
            </h1>
            <p className="">
              Track your learning progress and activity
            </p>
          </div>
          <div className="">
            {stats.map((stat, index) => {
              <div
                key={index}
                className=""
              >
                <div className="">
                  <span className="">
                    {stat.label}
                  </span>
                  <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${stat.gradient} shadow-lg ${stat.shadowColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`} >
                    <stat.icon className="" strokeWidth={2} />
                  </div>
                </div>
                <div className="">
                  {stat.value}
                </div>
              </div>
            })}
          </div>

          <div className="">
            <div className="">
              <div className="">
                <Clock className="" strokeWidth={2} />
              </div>
              <h3 className="">
                Recent Activity
              </h3>
            </div>

            {dashboardData.recentActivity && (dashboardData.recentActivity.documents.length > 0 || dashboardData.recentActivity.quizzes.length > 0) ?
              <div className="">
                {[
                  ...(dashboardData.recentActivity.documents || []).map(doc => ({
                    id: doc._id,
                    description: doc.title,
                    timestamp: doc.lastAccessed,
                    link: `/documents/${doc._id}`,
                    type: 'document',
                  })),

                  ...(dashboardData.recentActivity.quizzes || []).map(quiz => ({
                    id: quiz._id,
                    description: quiz.title,
                    timestamp: quiz.lastAccessed,
                    link: `/quizzes/${quiz._id}`,
                    type: 'quiz',
                  })),

                ]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((activity, index) => {
                  <div
                    key={activity.id || index}
                    className=""
                    >
                      <div className="">
                        <div className="">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'document'
                            ? 'bg-line'
                          }`}>

                          </div>
                        </div>
                      </div>
                })
                }
                }
              </div>
      </div>
        </div>
      </div>
      );
};

      export default DashboardPage;
