import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./OrganizerDashboard.css";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  sport: string;
  organizerId: string;
  status: string;
  startDate: string;
  endDate: string;
};

const OrganizerDashboard = () => {
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/tournaments"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch tournaments"
          );
        }

        const myTournaments = data.data.filter(
          (tournament: Tournament) =>
            tournament.organizerId === user?.id
        );

        setTournaments(myTournaments);
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTournaments();
    }
  }, [user?.id]);

  const activeTournaments = tournaments.filter(
    (tournament) =>
      tournament.status === "UPCOMING" ||
      tournament.status === "ONGOING"
  );

  return (
    <section className="organizer-dashboard">
      <div className="organizer-dashboard-header">
        <div>
          <span className="organizer-dashboard-eyebrow">
            Organizer Dashboard
          </span>

          <h1>
            Welcome,{" "}
            {user?.name?.split(" ")[0] || "Organizer"}
          </h1>

          <p>
            Manage your tournaments, registrations, fixtures
            and results from one place.
          </p>
        </div>

        <Link
          to="/organizer/tournaments/create"
          className="organizer-create-button"
        >
          + Create Tournament
        </Link>
      </div>

      <div className="organizer-stats-grid">
        <div className="organizer-stat-card">
          <span>Total Tournaments</span>
          <strong>{loading ? "—" : tournaments.length}</strong>
          <small>Created by you</small>
        </div>

        <div className="organizer-stat-card">
          <span>Active Tournaments</span>
          <strong>
            {loading ? "—" : activeTournaments.length}
          </strong>
          <small>Upcoming & ongoing</small>
        </div>

        <div className="organizer-stat-card">
          <span>Registrations</span>
          <strong>—</strong>
          <small>Across your tournaments</small>
        </div>

        <div className="organizer-stat-card">
          <span>Matches</span>
          <strong>—</strong>
          <small>Scheduled & completed</small>
        </div>
      </div>

      <div className="organizer-dashboard-grid">
        <div className="organizer-dashboard-card">
          <div className="organizer-card-header">
            <div>
              <span>TOURNAMENTS</span>
              <h2>Your recent tournaments</h2>
            </div>

            <Link to="/organizer/tournaments">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="organizer-empty-state">
              <p>Loading tournaments...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="organizer-empty-state">
              <div className="organizer-empty-icon">+</div>

              <h3>No tournaments yet</h3>

              <p>
                Create your first tournament and start managing
                registrations, players and fixtures.
              </p>

              <Link to="/organizer/tournaments/create">
                Create your first tournament
              </Link>
            </div>
          ) : (
            <div className="organizer-tournament-list">
              {tournaments.slice(0, 5).map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.slug}`}
                  className="organizer-tournament-item"
                >
                  <div>
                    <strong>{tournament.name}</strong>

                    <span>
                      {tournament.sport} ·{" "}
                      {new Date(
                        tournament.startDate
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <span
                    className={`organizer-status ${tournament.status.toLowerCase()}`}
                  >
                    {tournament.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="organizer-dashboard-card">
          <div className="organizer-card-header">
            <div>
              <span>QUICK ACTIONS</span>
              <h2>Get things done</h2>
            </div>
          </div>

          <div className="organizer-quick-actions">
            <Link to="/organizer/tournaments/create">
              <div>
                <strong>Create Tournament</strong>
                <span>Set up a new event</span>
              </div>
              <span>→</span>
            </Link>

            <Link to="/organizer/registrations">
              <div>
                <strong>Registrations</strong>
                <span>Review athlete registrations</span>
              </div>
              <span>→</span>
            </Link>

            <Link to="/organizer/fixtures">
              <div>
                <strong>Fixtures</strong>
                <span>Generate and manage fixtures</span>
              </div>
              <span>→</span>
            </Link>

            <Link to="/organizer/results">
              <div>
                <strong>Results</strong>
                <span>Manage match results</span>
              </div>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizerDashboard;