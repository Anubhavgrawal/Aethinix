import "./AdminDashboard.css";

const AdminDashboard = () => {
  return (
    <section className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">OVERVIEW</span>
          <h1>Admin Dashboard</h1>
          <p>
            Manage AETHENIX users, organizers, tournaments and competition
            operations.
          </p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span>Total Users</span>
          <strong>—</strong>
        </div>

        <div className="admin-stat-card">
          <span>Organizers</span>
          <strong>—</strong>
        </div>

        <div className="admin-stat-card">
          <span>Tournaments</span>
          <strong>—</strong>
        </div>

        <div className="admin-stat-card">
          <span>Registrations</span>
          <strong>—</strong>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-panel-card">
          <h2>Quick Actions</h2>

          <div className="admin-actions">
            <a href="/admin/organizers">Create Organizer</a>
            <a href="/admin/tournaments">Manage Tournaments</a>
            <a href="/admin/users">Manage Users</a>
          </div>
        </div>

        <div className="admin-panel-card">
          <h2>System Status</h2>

          <div className="admin-status-row">
            <span>Backend API</span>
            <strong>Connected</strong>
          </div>

          <div className="admin-status-row">
            <span>Database</span>
            <strong>Connected</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;