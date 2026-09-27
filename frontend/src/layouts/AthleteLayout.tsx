// import { NavLink, Outlet, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import "./AthleteLayout.css";

// const AthleteLayout = () => {
//   const { user, logout } = useAuth();

//   return (
//     <div className="athlete-layout">
//       <aside className="athlete-sidebar">
//         <Link to="/" className="athlete-logo">
//           AETHENIX
//         </Link>

//         <div className="athlete-profile">
//           <span>ATHLETE</span>
//           <strong>{user?.name || "Athlete"}</strong>
//         </div>

//         <nav className="athlete-nav">
//           <NavLink to="/dashboard">Dashboard</NavLink>
//           <NavLink to="/my-player-id">My Player ID</NavLink>
//           <NavLink to="/my-tournaments">My Tournaments</NavLink>
//           <NavLink to="/my-fixtures">My Fixtures</NavLink>
//           <NavLink to="/my-results">My Results</NavLink>
//           <NavLink to="/my-ranking">My Ranking</NavLink>
//           <NavLink to="/statistics">Statistics</NavLink>
//         </nav>

//         <div className="athlete-sidebar-bottom">
//           <NavLink to="/account">Account Settings</NavLink>

//           <button onClick={logout}>Logout</button>
//         </div>
//       </aside>

//       <main className="athlete-main">
//         <header className="athlete-topbar">
//           <Link to="/" className="back-home">
//             ← Back to AETHENIX
//           </Link>

//           <div className="athlete-more">
//             <button>More ▾</button>

//             <div className="athlete-more-menu">
//               <Link to="/tournaments">Explore Tournaments</Link>
//               <Link to="/rankings">Public Rankings</Link>
//               <Link to="/players">Find Players</Link>
//               <Link to="/results">Results</Link>
//             </div>
//           </div>
//         </header>

//         <Outlet />
//       </main>
//     </div>
//   );
// };

import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AthleteLayout.css";

const getInitials = (name?: string) => {
  if (!name) return "AX";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("") || "AX";
};

const AthleteLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="athlete-layout">
      <aside className="athlete-sidebar">
        <Link to="/" className="athlete-logo">
          <span className="athlete-logo-mark">AX</span>
          <span className="athlete-logo-word">AETHENIX</span>
        </Link>

        <div className="athlete-profile">
          <div className="athlete-avatar">{getInitials(user?.name)}</div>
          <div className="athlete-profile-info">
            <span className="athlete-profile-badge">Athlete</span>
            <strong>{user?.name || "Athlete"}</strong>
          </div>
        </div>

        <nav className="athlete-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/my-player-id">My Player ID</NavLink>
          <NavLink to="/my-tournaments">My Tournaments</NavLink>
          <NavLink to="/my-fixtures">My Fixtures</NavLink>
          <NavLink to="/my-results">My Results</NavLink>
          <NavLink to="/my-ranking">My Ranking</NavLink>
          <NavLink to="/statistics">Statistics</NavLink>
        </nav>

        <div className="athlete-sidebar-bottom">
          <NavLink to="/account">Account Settings</NavLink>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>

      <main className="athlete-main">
        <header className="athlete-topbar">
          <div className="athlete-topbar-spacer" />

          <div className="athlete-more">
            <button>
              Explore <span className="athlete-more-caret">▾</span>
            </button>

            <div className="athlete-more-menu">
              <Link to="/tournaments">Explore Tournaments</Link>
              <Link to="/rankings">Public Rankings</Link>
              <Link to="/players">Find Players</Link>
              <Link to="/results">Results</Link>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default AthleteLayout;