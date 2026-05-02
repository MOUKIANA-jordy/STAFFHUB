import Header from "../Components/Header";

export default function AdminLayout({ children }) {
  return (
    <div className="app-layout">

      {/* 🔥 Sidebar ADMIN */}
      <div className="sidebar">
        <h3>Admin Panel</h3>

        <div className="nav-item active">📊 Dashboard</div>
        <div className="nav-item">👥 Salariés</div>
        <div className="nav-item">📁 Demandes</div>
      </div>

      <div className="main-area">
        <Header />

        <div className="main-content">
          {children}
        </div>
      </div>

    </div>
  );
}
