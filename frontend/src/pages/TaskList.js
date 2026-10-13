import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, deleteTask } from '../services/taskService';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import TaskForm from './TaskForm';
import { HiOutlineClipboardList, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const TaskList = () => {
  const { canManageProjects } = useAuth();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const projectId = searchParams.get('projectId');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectId) params.projectId = projectId;
      const res = await getTasks(params);
      setTasks(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">
            {projectId ? 'Filtered by project' : 'Track and manage your tasks'}
          </p>
        </div>
        {canManageProjects && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all self-start sm:self-auto"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </form>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all flex-1 sm:w-36"
          >
            <option value="">All Status</option>
            <option value="to_do">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all flex-1 sm:w-36"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-8">
          <EmptyState
            icon={HiOutlineClipboardList}
            title="No tasks found"
            description="Create a new task to get started"
          />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-900/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Title</th>
                  <th className="px-4 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Assignee</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  {canManageProjects && <th className="px-4 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {tasks.map((task) => {
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';
                  return (
                    <tr key={task.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <Link to={`/tasks/${task.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/projects/${task.project?.id}`} className="text-slate-300 hover:text-indigo-300 transition-colors">
                          {task.project?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={task.priority} type="priority" />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className={`px-4 py-3.5 ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                        {new Date(task.dueDate).toLocaleDateString()} {isOverdue && '(Overdue)'}
                      </td>
                      {canManageProjects && (
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Task">
        <TaskForm projectId={projectId} onSuccess={() => { setShowForm(false); fetchTasks(); }} />
      </Modal>
    </div>
  );
};

export default TaskList;
