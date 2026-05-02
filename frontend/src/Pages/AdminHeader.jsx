export default function Header() {
  return (
    <div className="flex justify-between items-center bg-[#020617] p-4 rounded-xl mb-6">
      <input
        placeholder="Search..."
        className="bg-[#0f172a] px-4 py-2 rounded w-1/3"
      />

      <div className="flex items-center gap-4">
        <span>🔔</span>
        <img
          src="https://i.pravatar.cc/40"
          className="rounded-full"
        />
      </div>
    </div>
  );
}
