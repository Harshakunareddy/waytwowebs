const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, meta.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(meta.totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase = "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors";
  const btnActive = "bg-indigo-600 border-indigo-600 text-white shadow-sm";
  const btnInactive = "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
      <button
        className={`${btnBase} ${btnInactive}`}
        disabled={!meta.hasPreviousPage}
        onClick={() => onPageChange(meta.currentPage - 1)}
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button className={`${btnBase} ${btnInactive}`} onClick={() => onPageChange(1)}>
            1
          </button>
          <span className="px-1 text-slate-500 text-sm">...</span>
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`${btnBase} ${p === meta.currentPage ? btnActive : btnInactive}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < meta.totalPages && (
        <>
          <span className="px-1 text-slate-500 text-sm">...</span>
          <button className={`${btnBase} ${btnInactive}`} onClick={() => onPageChange(meta.totalPages)}>
            {meta.totalPages}
          </button>
        </>
      )}

      <button
        className={`${btnBase} ${btnInactive}`}
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(meta.currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
