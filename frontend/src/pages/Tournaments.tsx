import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  sport: string;
  startDate: string;
  endDate: string;
  registrationOpen: string | null;
  registrationClose: string | null;
  status: "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  description: string | null;
};

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setTournaments(data.data);
      } catch (error) {
        console.error(error);
        setError("Unable to load tournaments.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const upcoming = tournaments.filter(
    (tournament) => tournament.status === "UPCOMING"
  );

  const ongoing = tournaments.filter(
    (tournament) => tournament.status === "ONGOING"
  );

  const completed = tournaments.filter(
    (tournament) => tournament.status === "COMPLETED"
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderEmpty = (message: string, description: string) => (
    <div>
      <p>{message}</p>
      <p>{description}</p>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <section>
        <p>AETHENIX COMPETITIONS</p>
        <h1>TOURNAMENTS</h1>
        <p>
          Discover upcoming competitions, follow ongoing events and explore
          completed tournaments.
        </p>
      </section>

      {loading && <p>Loading tournaments...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          {/* Upcoming */}
          <section>
            <h2>Upcoming</h2>

            {upcoming.length === 0
              ? renderEmpty(
                  "No upcoming tournaments",
                  "Upcoming competitions will appear here."
                )
              : upcoming.map((tournament) => (
                  <div key={tournament.id}>
                    <p>{tournament.name}</p>
                    <p>
                      {formatDate(tournament.startDate)} –{" "}
                      {formatDate(tournament.endDate)}
                    </p>
                    <p>Upcoming</p>
                    <p>
                      {tournament.description ||
                        "Competition details will be available here."}
                    </p>

                    <Link to={`/tournaments/${tournament.slug}`}>
                      View Tournament →
                    </Link>
                  </div>
                ))}
          </section>

          {/* Ongoing */}
          <section>
            <h2>Ongoing</h2>

            {ongoing.length === 0
              ? renderEmpty(
                  "No ongoing tournaments",
                  "Active competitions will appear here."
                )
              : ongoing.map((tournament) => (
                  <div key={tournament.id}>
                    <p>{tournament.name}</p>
                    <p>
                      {formatDate(tournament.startDate)} –{" "}
                      {formatDate(tournament.endDate)}
                    </p>
                    <p>Ongoing</p>

                    <Link to={`/tournaments/${tournament.slug}`}>
                      View Tournament →
                    </Link>
                  </div>
                ))}
          </section>

          {/* Completed */}
          <section>
            <h2>Completed</h2>

            {completed.length === 0
              ? renderEmpty(
                  "No completed tournaments yet",
                  "Results and tournament history will appear here."
                )
              : completed.map((tournament) => (
                  <div key={tournament.id}>
                    <p>{tournament.name}</p>
                    <p>
                      {formatDate(tournament.startDate)} –{" "}
                      {formatDate(tournament.endDate)}
                    </p>
                    <p>Completed</p>

                    <Link to={`/tournaments/${tournament.slug}`}>
                      View Tournament →
                    </Link>
                  </div>
                ))}
          </section>
        </>
      )}
    </div>
  );
};

export default Tournaments;