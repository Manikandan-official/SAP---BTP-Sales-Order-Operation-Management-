export default function Topbar({ onAdd }) {
  return (
    <div className="h-14 bg-orange-500 flex items-center justify-between px-6 text-white">
      <h1 className="font-semibold">Sales Order Management</h1>
      <button
        onClick={onAdd}
        className="bg-white text-orange-500 px-3 py-1 rounded"
      >
        + Add SO
      </button>
    </div>
  );
}
