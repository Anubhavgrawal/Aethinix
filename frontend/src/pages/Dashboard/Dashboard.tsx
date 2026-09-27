import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <section className="dashboard-header">
        <div className="dashboard-container">
          <p>ATHLETE PORTAL</p>

          <h1>
            WELCOME,
            <br />
            {user?.name?.toUpperCase()}
          </h1>

          <p>
            Manage your competitions, fixtures, results and competitive record
            from one place.
          </p>
        </div>
      </section>

      {/* PLAYER ID */}
      <section className="dashboard-section">
        <div className="dashboard-container">
          <div className="dashboard-title">
            <p>IDENTITY</p>
            <h2>MY PLAYER ID</h2>
          </div>

          <div className="player-id-card">
            <div>
              <p>AETHENIX PLAYER</p>
              <h3>{user?.player?.playerId || "—"}</h3>
              <span>Your permanent competitive identity</span>
            </div>

            <div className="qr-placeholder">QR</div>

            <Link to="/my-player-id">View Player ID →</Link>
          </div>
        </div>
      </section>

      {/* TOURNAMENTS */}
      <section className="dashboard-section">
        <div className="dashboard-container">
          <div className="dashboard-title">
            <p>COMPETITION</p>
            <h2>MY TOURNAMENTS</h2>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>UPCOMING</span>
              <h3>0</h3>
              <p>Registered tournaments</p>
              <Link to="/my-tournaments">View Tournaments →</Link>
            </div>

            <div className="dashboard-card">
              <span>COMPLETED</span>
              <h3>0</h3>
              <p>Completed competitions</p>
              <Link to="/my-results">View Results →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FIXTURES */}
      <section className="dashboard-section">
        <div className="dashboard-container">
          <div className="dashboard-title">
            <p>SCHEDULE</p>
            <h2>UPCOMING FIXTURES</h2>
          </div>

          <div className="empty-dashboard-card">
            <h3>No upcoming fixtures</h3>

            <p>
              Your scheduled matches will appear here once you are registered
              for a tournament.
            </p>

            <Link to="/tournaments">Explore Tournaments →</Link>
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}
      <section className="dashboard-section">
        <div className="dashboard-container">
          <div className="dashboard-title">
            <p>PERFORMANCE</p>
            <h2>COMPETITIVE RECORD</h2>
          </div>

          <div className="dashboard-stats">
            <div>
              <span>RANKING</span>
              <strong>—</strong>
            </div>

            <div>
              <span>MATCHES</span>
              <strong>0</strong>
            </div>

            <div>
              <span>WINS</span>
              <strong>0</strong>
            </div>

            <div>
              <span>POINTS</span>
              <strong>0</strong>
            </div>
          </div>

          <Link to="/my-ranking">View Ranking →</Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;