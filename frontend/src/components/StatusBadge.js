const StatusBadge = ({ status, type = 'default' }) => {
  const getBadgeStyle = () => {
    if (type === 'priority') {
      const priorityStyles = {
        critical: 'bg-red-500/15 text-red-400 border-red-500/30',
        high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      };
      return priorityStyles[status] || 'bg-slate-700 text-slate-300 border-slate-600';
    }

    const statusStyles = {
      planning: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      on_hold: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      completed: 'bg-slate-700 text-slate-300 border-slate-600',
      to_do: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      in_progress: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      in_review: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      done: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    };
    return statusStyles[status] || 'bg-slate-700 text-slate-300 border-slate-600';
  };

  const formatLabel = (s) => s?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      {formatLabel(status)}
    </span>
  );
};

export default StatusBadge;
