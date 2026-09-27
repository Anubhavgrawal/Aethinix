import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Ranking.css";

type RankingRow = {
  rank: number;
  entryId: string;
  playerId: string | null;
  playerName: string;
  seed: number | null;
  wins: number;
  losses: number;
  rankingPoints: number;
};

type Event = {
  id: string;
  name: string;
  code: string;
  eventType: string;
};

type Tournament = {
  id: string;
  name: string;
  categories?: {
    id: string;
  }[];
};

const API = "http://localhost:5001/api";

const Ranking = () => {
  const { slug } = useParams();

  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] =
    useState("");

  const [rankings, setRankings] =
    useState<RankingRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] =
    useState(false);

  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
  if (!tournament?.id || !selectedEventId) {
    return;
  }

  const loadRankings = async () => {
    try {
      setRankingLoading(true);
      setError("");

      const response = await fetch(
        `${API}/rankings/tournament/${tournament.id}/event/${selectedEventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch rankings"
        );
      }

      setRankings(data.rankings || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load rankings"
      );
    } finally {
      setRankingLoading(false);
    }
  };

  loadRankings();
}, [tournament, selectedEventId, token]);

  useEffect(() => {
    if (!slug) return;

    const loadTournament = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API}/tournaments/${slug}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch tournament"
          );
        }

        const tournamentData = data.data;

        setTournament(tournamentData);

        const categories =
          tournamentData.categories || [];

        const eventResults: Event[] = [];

        for (const category of categories) {
          const eventResponse = await fetch(
            `${API}/events/category/${category.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!eventResponse.ok) continue;

          const eventData =
            await eventResponse.json();

          const categoryEvents = Array.isArray(
            eventData
          )
            ? eventData
            : eventData.data || [];

          eventResults.push(...categoryEvents);
        }

        setEvents(eventResults);

        if (eventResults.length > 0) {
          setSelectedEventId(
            eventResults[0].id
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load ranking page"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [slug, token]);


  if (loading) {
    return (
      <section className="ranking-page">
        <p>Loading rankings...</p>
      </section>
    );
  }

  return (
    <section className="ranking-page">
      <div className="ranking-header">
        <div>
          <Link
            to={`/organizer/tournaments/${slug}`}
            className="ranking-back-link"
          >
            ← Back to Tournament
          </Link>

          <span className="ranking-eyebrow">
            TOURNAMENT OPERATIONS
          </span>

          <h1>Rankings</h1>

          <p>
            {tournament?.name ||
              "Tournament Rankings"}
          </p>
        </div>

        <Link
          to={`/organizer/tournaments/${slug}/results`}
          className="ranking-results-link"
        >
          View Results →
        </Link>
      </div>

      {error && (
        <div className="ranking-message error">
          {error}
        </div>
      )}

      <div className="ranking-toolbar">
        <div>
          <label>Select Event</label>

          <select
            value={selectedEventId}
            onChange={(e) =>
              setSelectedEventId(e.target.value)
            }
          >
            {events.length === 0 && (
              <option value="">
                No events available
              </option>
            )}

            {events.map((event) => (
              <option
                key={event.id}
                value={event.id}
              >
                {event.name} · {event.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ranking-section">
        <div className="ranking-section-header">
          <div>
            <span className="ranking-eyebrow">
              COMPETITIVE STANDINGS
            </span>

            <h2>Event Rankings</h2>
          </div>

          <span className="ranking-count">
            {rankings.length}{" "}
            {rankings.length === 1
              ? "Player"
              : "Players"}
          </span>
        </div>

        {rankingLoading ? (
          <div className="ranking-empty">
            <p>Loading rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="ranking-empty">
            <h3>No rankings available</h3>

            <p>
              Complete matches to generate event
              rankings.
            </p>
          </div>
        ) : (
          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>PLAYER ID</th>
                  <th>PLAYER</th>
                  <th>SEED</th>
                  <th>WINS</th>
                  <th>LOSSES</th>
                  <th>POINTS</th>
                </tr>
              </thead>

              <tbody>
                {rankings.map((player) => (
                  <tr key={player.entryId}>
                    <td>
                      <span className="ranking-position">
                        {player.rank}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {player.playerId || "—"}
                      </strong>
                    </td>

                    <td>
                      {player.playerName}
                    </td>

                    <td>
                      {player.seed ?? "—"}
                    </td>

                    <td>
                      {player.wins}
                    </td>

                    <td>
                      {player.losses}
                    </td>

                    <td>
                      <strong>
                        {player.rankingPoints}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Ranking;