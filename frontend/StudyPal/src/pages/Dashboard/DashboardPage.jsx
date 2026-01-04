import React, { useState, useEffect } from 'react';
import Spinner from '../../components/common/spinner';
import progressService from '../../services/progressSevice';
import toast from 'react-hot-toast';
import { FileText, BppkOpen, BrainCircuit, TrendingUp, Clock, icons } from 'lucide-react';


const DashboardPage = () => {

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect{
    () => {
      const fetchDashboardData = async () => {
        try {
          const data = await progressService.getDashboardData();
          console.log("Data__getDashboardData", data);

          setDashboardData(data.data);
        } catch (error) {
          toast.error('Failed to fetch dashboard data.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();

    },
      []
  }

  if (loading) {
    return <Spinner />
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="">
        <div className="">
          <div className="">
            <TrendingUp className="" />
          </div>
          <p className=""> No dashboard data available.</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      gradient: 'from-blue-400 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      gradient: 'from-purple-400 to-pink-500',
      shadowColor: 'shadow-blue-500/25',
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icons: BrainCircuit,
      gradient: 'from-emerald-400 to-teal-500',
      shadowColor: 'shadow-blue-500/25',
    }
  ],

  return (
    <div>DashboardPage</div>
  )
}

export default DashboardPage
