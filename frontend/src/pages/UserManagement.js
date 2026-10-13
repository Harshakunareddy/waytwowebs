import { useState, useEffect, useCallback } from 'react';
import { getUsers, updateUser, deleteUser } from '../services/userService';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { HiOutlineUsers, HiOutlinePencil, HiOutlineBan } from 'react-icons/hi';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', isActive: true });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit: 10 });
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const handleUpdate = async () => {
    try {
      await updateUser(editUser.id, editForm);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'bg-red-500/15 text-red-400 border-red-500/30',
      project_manager: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      team_member: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleColors[role] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
        {role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">User Management</h1>
        <p className="text-sm text-slate-400 mt-1">Manage user accounts and permission roles</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-12 text-center">
          <HiOutlineUsers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">No users found</h3>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80 bg-slate-800 shadow-sm">
            <table className="w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-900/70 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-medium text-slate-100">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3.5">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        u.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                        >
                          <HiOutlinePencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        {u.isActive && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <HiOutlineBan className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Edit ${editUser?.firstName} ${editUser?.lastName}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="admin">Admin</option>
              <option value="project_manager">Project Manager</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Account Status
            </label>
            <select
              value={editForm.isActive ? 'true' : 'false'}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <button
            onClick={handleUpdate}
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md transition-all flex items-center justify-center cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
