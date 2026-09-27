import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyTournaments.css";

interface Category {
  id: string;
  name: string;
}

interface Tournament {
  id: string;
  name: string;
  slug: string;
  sport: string;
  startDate: string;
  endDate: string;
  venue?: string | null;
  location?: string | null;
}

interface Registration {
  id: string;
  registrationId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  tournament: Tournament;
  category: Category;
}

const MyTournaments = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your tournaments.");
          return;
        }

        const response = await fetch(
          "http://localhost:5001/api/registrations/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch tournaments"
          );
        }

        setRegistrations(data.data || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch tournaments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyRegistrations();
  }, []);

  const upcomingRegistrations = registrations.filter(
    (registration) =>
      new Date(registration.tournament.endDate) >= new Date()
  );

  const completedRegistrations = registrations.filter(
    (registration) =>
      new Date(registration.tournament.endDate) < new Date()
  );

  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );

  const visibleRegistrations =
    activeTab === "upcoming"
      ? upcomingRegistrations
      : completedRegistrations;

  return (
    <div className="my-tournaments-page">
      <div className="my-tournaments-container">
        <header className="my-tournaments-header">
          <p>COMPETITION</p>
          <h1>MY TOURNAMENTS</h1>
          <span>
            Track your registered and completed competitions.
          </span>
        </header>

        <div className="tournament-tabs">
          <button
            className={activeTab === "upcoming" ? "active" : ""}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>

          <button
            className={activeTab === "completed" ? "active" : ""}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
        </div>

        {loading && (
          <section className="tournament-empty">
            <p>LOADING</p>
            <h2>Loading your tournaments...</h2>
          </section>
        )}

        {!loading && error && (
          <section className="tournament-empty">
            <p>ERROR</p>
            <h2>{error}</h2>
          </section>
        )}

        {!loading &&
          !error &&
          visibleRegistrations.length === 0 && (
            <section className="tournament-empty">
              <div className="tournament-empty-icon">+</div>

              <p>NO TOURNAMENTS YET</p>

              <h2>
                {activeTab === "upcoming"
                  ? "Ready to compete?"
                  : "No completed tournaments"}
              </h2>

              <span>
                {activeTab === "upcoming"
                  ? "Explore upcoming AETHENIX tournaments and register to start your competitive journey."
                  : "Your completed competitions will appear here once you finish a tournament."}
              </span>

              {activeTab === "upcoming" && (
                <Link to="/tournaments">
                  Explore Tournaments →
                </Link>
              )}
            </section>
          )}

        {!loading &&
          !error &&
          visibleRegistrations.length > 0 && (
            <section className="my-tournaments-list">
              {visibleRegistrations.map((registration) => (
                <article
                  key={registration.id}
                  className="my-tournament-card"
                >
                  <div>
                    <p>{registration.tournament.sport}</p>

                    <h2>{registration.tournament.name}</h2>

                    <span>
                      Category: {registration.category.name}
                    </span>
                  </div>

                  <div>
                    <span>
                      {new Date(
                        registration.tournament.startDate
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                    <span>
                      Status: {registration.status}
                    </span>
                  </div>

                  <Link
                    to={`/tournaments/${registration.tournament.slug}`}
                  >
                    View Tournament →
                  </Link>
                </article>
              ))}
            </section>
          )}

        <Link to="/dashboard" className="tournament-back">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MyTournaments;