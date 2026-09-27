import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-logo">
          AETHENIX
        </Link>

        <div className="admin-profile">
          <div className="admin-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user?.name}</strong>
            <span>Super Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/organizers">Organizers</NavLink>
          <NavLink to="/admin/tournaments">Tournaments</NavLink>
          <NavLink to="/admin/registrations">Registrations</NavLink>
          <NavLink to="/admin/payments">Payments</NavLink>
          <NavLink to="/admin/fixtures">Fixtures</NavLink>
          <NavLink to="/admin/results">Results</NavLink>
          <NavLink to="/admin/rankings">Rankings</NavLink>
          <NavLink to="/admin/reports">Reports</NavLink>
          <NavLink to="/admin/audit-logs">Audit Logs</NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <NavLink to="/admin/settings">Settings</NavLink>

          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <span>Super Admin Panel</span>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;