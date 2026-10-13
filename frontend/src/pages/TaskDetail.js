import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTask } from '../services/taskService';
import { getTaskComments, addTaskComment } from '../services/taskService';
import { getTaskActivities } from '../services/taskService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import TaskForm from './TaskForm';
import { HiOutlinePencil, HiOutlineChat, HiOutlineClock, HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const { canManageProjects, user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  const fetchTask = useCallback(async () => {
    try {
      const [taskRes, commentsRes, activitiesRes] = await Promise.all([
        getTask(id),
        getTaskComments(id, { limit: 50 }),
        getTaskActivities(id, { limit: 50 }),
      ]);
      setTask(taskRes.data.data);
      setComments(commentsRes.data.data);
      setActivities(activitiesRes.data.data);
    } catch (err) {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await addTaskComment(id, { content: newComment });
      setNewComment('');
      toast.success('Comment added');
      const res = await getTaskComments(id, { limit: 50 });
      setComments(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const canEdit = canManageProjects || task?.assigneeId === user?.id;
  const isOverdue = task && new Date(task.dueDate) < new Date() && task.status !== 'done';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12 text-red-400 font-medium">
        Task not found
      </div>
    );
  }

  const formatAction = (action) => {
    const map = {
      task_created: 'created this task',
      task_updated: 'updated this task',
      task_status_changed: 'changed the status',
      task_deleted: 'deleted this task',
      comment_added: 'added a comment',
    };
    return map[action] || action;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/tasks" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium mb-2 transition-colors">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>Back to Tasks</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{task.title}</h1>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-all self-start sm:self-auto"
          >
            <HiOutlinePencil className="w-4 h-4" />
            <span>Edit Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Details</h2>
          <div className="space-y-3.5 text-sm">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Project</span>
              <Link to={`/projects/${task.project?.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                {task.project?.name}
              </Link>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</span>
                <StatusBadge status={task.status} />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</span>
                <StatusBadge status={task.priority} type="priority" />
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assignee</span>
              <span className="text-slate-200">{task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Due Date</span>
              <span className={`text-slate-200 ${isOverdue ? 'text-red-400 font-semibold' : ''}`}>
                {new Date(task.dueDate).toLocaleDateString()} {isOverdue && '(Overdue)'}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</span>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{task.description || 'No description provided'}</p>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Created At</span>
              <span className="text-slate-400 text-xs">{new Date(task.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'comments'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HiOutlineChat className="w-4 h-4" />
              <span>Comments ({comments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'activity'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HiOutlineClock className="w-4 h-4" />
              <span>Activity ({activities.length})</span>
            </button>
          </div>

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={commentLoading || !newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-all"
                  >
                    {commentLoading ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                        {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No activity recorded yet</p>
              ) : (
                <div className="relative pl-4 space-y-4 border-l border-slate-700 ml-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-800"></div>
                      <p className="text-xs text-slate-300">
                        <strong className="text-slate-100 font-semibold">{activity.user?.firstName} {activity.user?.lastName}</strong>{' '}
                        {formatAction(activity.action)}
                      </p>
                      {activity.details?.previousStatus && (
                        <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                          {activity.details.previousStatus.replace(/_/g, ' ')} → {activity.details.status?.replace(/_/g, ' ')}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm task={task} onSuccess={() => { setShowEdit(false); fetchTask(); }} />
      </Modal>
    </div>
  );
};

export default TaskDetail;
