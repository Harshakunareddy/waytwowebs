import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects, deleteProject } from '../services/projectService';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ProjectForm from './ProjectForm';
import { HiOutlineFolder, HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ProjectList = () => {
  const { canManageProjects, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getProjects(params);
      setProjects(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this project?')) return;
    try {
      await deleteProject(id);
      toast.success('Project archived');
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive project');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Projects</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track your ongoing projects</p>
        </div>
        {canManageProjects && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition-all self-start sm:self-auto"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all sm:w-44"
        >
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-8">
          <EmptyState
            icon={HiOutlineFolder}
            title="No projects found"
            description="Get started by creating a new project or adjust your filters"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1"
                    >
                      {project.name}
                    </Link>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'No description provided'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/70 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400 truncate max-w-[150px]">
                      By {project.creator?.firstName} {project.creator?.lastName}
                    </span>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                          Archive
                        </button>
                      )}
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition-colors"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Project">
        <ProjectForm onSuccess={() => { setShowForm(false); fetchProjects(); }} />
      </Modal>
    </div>
  );
};

export default ProjectList;
