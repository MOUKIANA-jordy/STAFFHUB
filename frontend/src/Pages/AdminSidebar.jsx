import { LayoutDashboard, Users, Calendar, Bell } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#020617] p-5 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-8">StaffHub</h1>

        <nav className="space-y-3">
          <div className="flex items-center gap-2 bg-blue-600 p-2 rounded">
            <LayoutDashboard size={18} /> Dashboard
          </div>

          <div className="flex items-center gap-2 opacity-70 hover:opacity-100">
            <Users size={18} /> Salarie
          </div>

          <div className="flex items-center gap-2 opacity-70">
            <Calendar size={18} /> Attendance
          </div>

          <div className="flex items-center gap-2 opacity-70">
            <Bell size={18} /> Notifications
          </div>
        </nav>
      </div>

      <div className="opacity-70">Logout</div>
    </div>
  );
}
