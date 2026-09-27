import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./OrganizerTournaments.css";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  sport: string;
  organizerId: string;
  location?: string;
  venue?: string;
  startDate: string;
  endDate: string;
  registrationOpen?: string;
  registrationClose?: string;
  status: string;
  categories: {
    id: string;
    name: string;
    capacity?: number;
    fee: string | number;
  }[];
};

const OrganizerTournaments = () => {
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/tournaments"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tournaments");
        }

        const myTournaments = data.data.filter(
          (tournament: Tournament) =>
            tournament.organizerId === user?.id
        );

        setTournaments(myTournaments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTournaments();
    }
  }, [user?.id]);

  const filteredTournaments =
    filter === "ALL"
      ? tournaments
      : tournaments.filter(
          (tournament) => tournament.status === filter
        );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section className="organizer-tournaments-page">
      <div className="organizer-tournaments-header">
        <div>
          <span className="organizer-tournaments-eyebrow">
            Tournament Management
          </span>

          <h1>My Tournaments</h1>

          <p>
            Create and manage the tournaments assigned to you.
          </p>
        </div>

        <Link
          to="/organizer/tournaments/create"
          className="organizer-create-button"
        >
          + Create Tournament
        </Link>
      </div>

      <div className="organizer-tournament-toolbar">
        {["ALL", "DRAFT", "UPCOMING", "ONGOING", "COMPLETED"].map(
          (status) => (
            <button
              key={status}
              className={filter === status ? "active" : ""}
              onClick={() => setFilter(status)}
            >
              {status === "ALL"
                ? "All"
                : status.charAt(0) +
                  status.slice(1).toLowerCase()}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="organizer-tournaments-empty">
          <p>Loading tournaments...</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="organizer-tournaments-empty">
          <div className="organizer-empty-icon">+</div>

          <h2>No tournaments found</h2>

          <p>
            Create a tournament to start managing your event.
          </p>

          <Link to="/organizer/tournaments/create">
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="organizer-tournament-cards">
          {filteredTournaments.map((tournament) => (
            <div
              className="organizer-tournament-card"
              key={tournament.id}
            >
              <div className="organizer-tournament-card-top">
                <div>
                  <span className="organizer-tournament-sport">
                    {tournament.sport}
                  </span>

                  <h2>{tournament.name}</h2>
                </div>

                <span
                  className={`organizer-status ${tournament.status.toLowerCase()}`}
                >
                  {tournament.status}
                </span>
              </div>

              <div className="organizer-tournament-info">
                <div>
                  <span>DATE</span>
                  <strong>
                    {formatDate(tournament.startDate)}
                    {" — "}
                    {formatDate(tournament.endDate)}
                  </strong>
                </div>

                <div>
                  <span>LOCATION</span>
                  <strong>
                    {tournament.location ||
                      tournament.venue ||
                      "Not specified"}
                  </strong>
                </div>

                <div>
                  <span>CATEGORIES</span>
                  <strong>
                    {tournament.categories.length}
                  </strong>
                </div>
              </div>

              <div className="organizer-tournament-actions">
                <Link
                  to={`/tournaments/${tournament.slug}`}
                >
                  View Public Page
                </Link>

                <Link
                  to={`/organizer/tournaments/${tournament.slug}`}
                >
                  Manage Tournament →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrganizerTournaments;