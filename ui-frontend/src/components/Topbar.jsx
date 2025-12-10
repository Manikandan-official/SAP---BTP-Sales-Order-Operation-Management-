export default function Topbar({ onAdd }) {
  return (
    <header className="w-full h-16 bg-[#F16523] flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-white/90 shadow-sm" />
        <span className="text-white font-bold text-lg tracking-wide">
          Sales Order Management
        </span>
      </div>

      <button
        onClick={onAdd}
        className="bg-white text-[#F16523] font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-orange-50 transition"
      >
        ＋ Add SO
      </button>
    </header>
  );
}
