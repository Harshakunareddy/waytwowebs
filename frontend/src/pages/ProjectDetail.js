import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProject, addProjectMember, removeProjectMember } from '../services/projectService';
import { getTasks } from '../services/taskService';
import { getUsers } from '../services/userService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ProjectForm from './ProjectForm';
import { HiOutlineCalendar, HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const { canManageProjects, isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        getProject(id),
        getTasks({ projectId: id, limit: 100 }),
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    try {
      await addProjectMember(id, { userId: parseInt(selectedUser, 10) });
      toast.success('Member added');
      setShowAddMember(false);
      setSelectedUser('');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await removeProjectMember(id, userId);
      toast.success('Member removed');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const openAddMember = async () => {
    try {
      const res = await getUsers({ limit: 100 });
      setAllUsers(res.data.data);
    } catch {}
    setShowAddMember(true);
  };

  const canEdit = isAdmin || (canManageProjects && project?.createdBy === user?.id);
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const completionPercent = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 text-red-400 font-medium">
        Project not found
      </div>
    );
  }

  const memberIds = project.members?.map((m) => m.id) || [];
  const availableUsers = allUsers.filter((u) => !memberIds.includes(u.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium mb-2 transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{project.name}</h1>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-all self-start sm:self-auto"
          >
            <HiOutlinePencil className="w-4 h-4" />
            <span>Edit Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Details</h2>
          <div className="space-y-3.5 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</span>
              <StatusBadge status={project.status} />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</span>
              <p className="text-slate-300 leading-relaxed">{project.description || 'No description provided'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <HiOutlineCalendar className="w-4 h-4" /> Start Date
                </span>
                <span className="text-slate-200">{new Date(project.startDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <HiOutlineCalendar className="w-4 h-4" /> Deadline
                </span>
                <span className="text-slate-200">{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-200">{completionPercent}% ({doneTasks}/{tasks.length} tasks)</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200">
              Team Members ({project.members?.length || 0})
            </h2>
            {canEdit && (
              <button
                onClick={openAddMember}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all"
              >
                <HiOutlinePlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {project.members?.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No members assigned yet</p>
            ) : (
              project.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{member.firstName} {member.lastName}</p>
                      <p className="text-xs text-slate-400 capitalize">{member.role?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  {canEdit && member.id !== project.createdBy && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-200">
            Tasks ({tasks.length})
          </h2>
          {canManageProjects && (
            <Link
              to={`/tasks?projectId=${id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
            >
              View in Tasks →
            </Link>
          )}
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No tasks for this project yet</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700/80">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-900/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/tasks/${task.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.priority} type="priority" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Project">
        <ProjectForm project={project} onSuccess={() => { setShowEdit(false); fetchProject(); }} />
      </Modal>

      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member to Project">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Choose a user...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddMember}
            disabled={!selectedUser}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all"
          >
            Add Member
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
