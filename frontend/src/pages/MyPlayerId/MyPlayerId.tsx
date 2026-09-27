import { Link } from "react-router-dom";
import "./MyPlayerId.css";
import { useAuth } from "../../context/AuthContext";

const MyPlayerId = () => {
    const { user } = useAuth();
  return (
    <div className="player-id-page">
      <div className="player-id-container">
        <header className="player-id-header">
          <p>ATHLETE IDENTITY</p>
          <h1>MY PLAYER ID</h1>
          <span>
            Your permanent AETHENIX competitive identity.
          </span>
        </header>

        <section className="player-id-main-card">
          <div className="player-id-info">
            <p>AETHENIX PLAYER</p>
            <h2>{user?.player?.playerId || "—"}</h2>

            <div className="player-id-details">
              <div>
                <span>PLAYER</span>
                <strong>{user?.name || "—"}</strong>
              </div>

              <div>
                <strong>STATUS</strong>
                <strong>
                {user?.player?.verificationStatus || "PENDING"}
                </strong>
              </div>

              <div>
                <span>MEMBER SINCE</span>
                <strong>
                    {user?.createdAt
                    ? new Date(user.createdAt).getFullYear()
                    : "—"}
                </strong>
              </div>
            </div>
          </div>

          <div className="player-id-avatar">
            <div className="avatar-circle">
                <span>ATHLETE</span>
            </div>

            <p>PLAYER PROFILE</p>
           </div>
        </section>

        <section className="player-id-note">
          <p>ABOUT YOUR PLAYER ID</p>

          <h2>ONE ATHLETE. ONE ID.</h2>

          <span>
            Your Player ID remains connected to your competitive record
            across AETHENIX tournaments, results, rankings and statistics.
          </span>
        </section>

        <Link to="/dashboard" className="player-id-back">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MyPlayerId;