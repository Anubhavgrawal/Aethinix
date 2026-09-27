import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./OrganizerLayout.css";


const OrganizerLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="organizer-layout">
      <aside className="organizer-sidebar">
        <Link to="/" className="organizer-logo">
          <span className="organizer-logo-mark">AX</span>
          <span className="organizer-logo-word">AETHENIX</span>
        </Link>

        <div className="organizer-profile">
          <div className="organizer-avatar">
            {user?.name?.charAt(0).toUpperCase() || "O"}
          </div>

          <div>
            <span className="organizer-profile-badge">Organizer</span>
            <strong>{user?.name || "Organizer"}</strong>
          </div>
        </div>

        <nav className="organizer-nav">
          <NavLink to="/organizer/dashboard">Dashboard</NavLink>
          <NavLink to="/organizer/tournaments">My Tournaments</NavLink>
          <NavLink to="/organizer/tournaments/create">
            Create Tournament
          </NavLink>
          <NavLink to="/organizer/registrations">Registrations</NavLink>
          <NavLink to="/organizer/players">Players</NavLink>
          <NavLink to="/organizer/fixtures">Fixtures</NavLink>
          <NavLink to="/organizer/matches">Matches</NavLink>
          <NavLink to="/organizer/results">Results</NavLink>
          <NavLink to="/organizer/reports">Reports</NavLink>
        </nav>

        <div className="organizer-sidebar-bottom">
          <NavLink to="/organizer/settings">Settings</NavLink>

          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="organizer-main">
        <header className="organizer-topbar">
          <span>Organizer Panel</span>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default OrganizerLayout;