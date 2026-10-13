import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../services/dashboardService';
import { HiOutlineFolder, HiOutlineClipboardList, HiOutlineExclamation, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardSummary();
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-red-400 font-medium">
        Failed to load dashboard
      </div>
    );
  }

  const getStatusCount = (counts, status) => {
    const found = counts?.find((c) => c.status === status);
    return found ? parseInt(found.count, 10) : 0;
  };

  const getPriorityCount = (counts, priority) => {
    const found = counts?.find((c) => c.priority === priority);
    return found ? parseInt(found.count, 10) : 0;
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: data.projects?.total || 0,
      icon: HiOutlineFolder,
      iconBg: 'bg-indigo-500/15 text-indigo-400',
    },
    {
      title: 'Active Projects',
      value: getStatusCount(data.projects?.statusCounts, 'active'),
      icon: HiOutlineCheckCircle,
      iconBg: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      title: 'Total Tasks',
      value: data.tasks?.total || 0,
      icon: HiOutlineClipboardList,
      iconBg: 'bg-purple-500/15 text-purple-400',
    },
    {
      title: 'Overdue Tasks',
      value: data.tasks?.overdue || 0,
      icon: HiOutlineExclamation,
      iconBg: 'bg-red-500/15 text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition-all shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-200 mb-5">Tasks by Status</h2>
          <div className="space-y-4">
            {['to_do', 'in_progress', 'in_review', 'done'].map((status) => {
              const count = getStatusCount(data.tasks?.statusCounts, status);
              const percentage = data.tasks?.total > 0 ? Math.round((count / data.tasks.total) * 100) : 0;
              const barColors = {
                to_do: 'bg-indigo-500',
                in_progress: 'bg-amber-500',
                in_review: 'bg-purple-500',
                done: 'bg-emerald-500',
              };
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-slate-200">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColors[status]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-200 mb-5">Tasks by Priority</h2>
          <div className="space-y-4">
            {['critical', 'high', 'medium', 'low'].map((priority) => {
              const count = getPriorityCount(data.tasks?.priorityCounts, priority);
              const percentage = data.tasks?.total > 0 ? Math.round((count / data.tasks.total) * 100) : 0;
              const barColors = {
                critical: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-amber-500',
                low: 'bg-blue-500',
              };
              return (
                <div key={priority} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400 capitalize">{priority}</span>
                    <span className="text-slate-200">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColors[priority]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-200 mb-5">Project Completion</h2>
        <div className="space-y-5">
          {data.projectCompletion?.length === 0 ? (
            <p className="text-sm text-slate-400">No project data available</p>
          ) : (
            data.projectCompletion?.map((proj) => (
              <div key={proj.projectId} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-200 truncate">{proj.projectName}</span>
                  <span className="text-indigo-400 font-semibold ml-2">{proj.completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${proj.completionPercentage}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  {proj.doneTasks} of {proj.totalTasks} tasks completed
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
