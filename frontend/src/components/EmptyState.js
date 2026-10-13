const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && <Icon className="w-12 h-12 text-slate-500 mb-3" />}
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;
