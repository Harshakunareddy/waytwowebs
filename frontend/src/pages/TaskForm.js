import { useState, useEffect } from 'react';
import { createTask, updateTask } from '../services/taskService';
import { getProjects } from '../services/projectService';
import { getProjectMembers } from '../services/projectService';
import toast from 'react-hot-toast';

const TaskForm = ({ task, projectId, onSuccess }) => {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    projectId: task?.projectId || projectId || '',
    assigneeId: task?.assigneeId || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'to_do',
    dueDate: task?.dueDate || '',
  });
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getProjects({ limit: 100 });
        setProjects(res.data.data);
      } catch {}
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!form.projectId) { setMembers([]); return; }
      try {
        const res = await getProjectMembers(form.projectId);
        setMembers(res.data.data?.map((m) => m.user) || []);
      } catch { setMembers([]); }
    };
    fetchMembers();
  }, [form.projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, projectId: parseInt(form.projectId, 10) };
      if (data.assigneeId) data.assigneeId = parseInt(data.assigneeId, 10);
      else data.assigneeId = null;

      if (task) {
        const { projectId: _, ...updateData } = data;
        await updateTask(task.id, updateData);
        toast.success('Task updated');
      } else {
        await createTask(data);
        toast.success('Task created');
      }
      onSuccess();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err.response?.data?.message || 'Failed to save task');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Task Title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder="e.g. Implement authentication"
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Task details and expectations..."
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
        ></textarea>
      </div>

      {!task && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Project
          </label>
          <select
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value, assigneeId: '' })}
            required
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          >
            <option value="">Select project...</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Assignee
        </label>
        <select
          value={form.assigneeId}
          onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          <option value="">Unassigned</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          >
            <option value="to_do">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Due Date
        </label>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          required
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm shadow-md transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
      </button>
    </form>
  );
};

export default TaskForm;
