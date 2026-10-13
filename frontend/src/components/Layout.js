import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineFolder, HiOutlineClipboardList, HiOutlineUsers, HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/projects', label: 'Projects', icon: HiOutlineFolder },
    { path: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
  ];

  if (isAdmin) {
    navItems.push({ path: '/users', label: 'Users', icon: HiOutlineUsers });
  }

  const isActive = (path) => location.pathname.startsWith(path);

  const getRoleLabel = (role) => {
    const labels = { admin: 'Admin', project_manager: 'Project Manager', team_member: 'Team Member' };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-700">
          <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ProjectHub
          </Link>
          <button
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/20 transition-all"
          >
            <HiOutlineLogout className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-slate-800/80 backdrop-blur border-b border-slate-700 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-700 lg:hidden"
            >
              <HiOutlineMenu className="w-6 h-6" />
            </button>
            <span className="text-sm font-medium text-slate-400">
              Welcome, <span className="text-slate-200 font-semibold">{user?.firstName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-300 border border-slate-600">
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
