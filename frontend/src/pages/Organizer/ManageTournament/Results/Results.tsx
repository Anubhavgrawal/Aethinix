import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Results.css";

type Player = {
  playerId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
};

type MatchEntry = {
  id: string;
  player?: Player | null;
};

type Match = {
  id: string;
  matchNumber: number;
  roundName: string;
  status: string;
  playerAEntryId?: string | null;
  playerBEntryId?: string | null;
  winnerEntryId?: string | null;
  loserEntryId?: string | null;
  score?: string | null;
  playerA?: MatchEntry | null;
  playerB?: MatchEntry | null;
  court?: {
    name: string;
  } | null;
  timeSlot?: {
    scheduledStart: string;
    scheduledEnd: string;
  } | null;
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

const getPlayerName = (entry?: MatchEntry | null) => {
  if (!entry?.player) return "TBD";

  const player = entry.player;

  if (player.name) return player.name;

  const fullName = [player.firstName, player.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || player.playerId || "TBD";
};

const formatDateTime = (value?: string) => {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const Results = () => {
  const { slug } = useParams();

  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] =
    useState("");

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] =
    useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

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
            data.message || "Failed to fetch tournament"
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

          const categoryEvents = Array.isArray(eventData)
            ? eventData
            : eventData.data || [];

          eventResults.push(...categoryEvents);
        }

        setEvents(eventResults);

        if (eventResults.length > 0) {
          setSelectedEventId(eventResults[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load results"
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTournament();
  }, [slug, token]);

  useEffect(() => {
    if (!tournament?.id || !selectedEventId) return;

    const loadResults = async () => {
      try {
        setMatchesLoading(true);
        setError("");

        const response = await fetch(
          `${API}/draws/tournament/${tournament.id}/event/${selectedEventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setMatches([]);
            return;
          }

          throw new Error(
            data.message || "Failed to fetch results"
          );
        }

        const drawMatches =
          data.rounds?.flatMap(
            (round: { matches?: Match[] }) =>
              round.matches || []
          ) || [];

        setMatches(
          drawMatches.filter(
            (match: Match) =>
              match.status === "COMPLETED"
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load results"
        );
      } finally {
        setMatchesLoading(false);
      }
    };

    void loadResults();
  }, [
    tournament?.id,
    selectedEventId,
    token,
  ]);

  if (loading) {
    return (
      <section className="results-page">
        <p>Loading results...</p>
      </section>
    );
  }

  return (
    <section className="results-page">
      <div className="results-header">
        <div>
          <Link
            to={`/organizer/tournaments/${slug}`}
            className="results-back-link"
          >
            ← Back to Tournament
          </Link>

          <span className="results-eyebrow">
            TOURNAMENT OPERATIONS
          </span>

          <h1>Results</h1>

          <p>
            {tournament?.name || "Tournament Results"}
          </p>
        </div>

        <Link
          to={`/organizer/tournaments/${slug}/matches`}
          className="results-matches-link"
        >
          Open Matches →
        </Link>
      </div>

      {error && (
        <div className="results-message error">
          {error}
        </div>
      )}

      <div className="results-toolbar">
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

      <div className="results-section">
        <div className="results-section-header">
          <div>
            <span className="results-eyebrow">
              MATCH RESULTS
            </span>

            <h2>Completed Matches</h2>
          </div>

          <span className="results-count">
            {matches.length}{" "}
            {matches.length === 1
              ? "Result"
              : "Results"}
          </span>
        </div>

        {matchesLoading ? (
          <div className="results-empty">
            <p>Loading results...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="results-empty">
            <h3>No results available</h3>
            <p>
              Completed match results will appear here.
            </p>
          </div>
        ) : (
          <div className="results-list">
            {matches.map((match) => {
              const winner =
                match.winnerEntryId ===
                match.playerAEntryId
                  ? match.playerA
                  : match.playerB;

              const loser =
                match.loserEntryId ===
                match.playerAEntryId
                  ? match.playerA
                  : match.playerB;

              return (
                <div
                  className="result-card"
                  key={match.id}
                >
                  <div className="result-card-top">
                    <div>
                      <span className="results-eyebrow">
                        {match.roundName || "MATCH"}
                      </span>

                      <h3>
                        Match {match.matchNumber}
                      </h3>
                    </div>

                    <span className="result-status">
                      COMPLETED
                    </span>
                  </div>

                  <div className="result-players">
                    <div className="result-player winner">
                      <span>WINNER</span>
                      <strong>
                        {getPlayerName(winner)}
                      </strong>
                    </div>

                    <div className="result-score">
                      <span>SCORE</span>
                      <strong>
                        {match.score || "Score not recorded"}
                      </strong>
                    </div>

                    <div className="result-player loser">
                      <span>OPPONENT</span>
                      <strong>
                        {getPlayerName(loser)}
                      </strong>
                    </div>
                  </div>

                  <div className="result-details">
                    <div>
                      <span>DATE & TIME</span>
                      <strong>
                        {formatDateTime(
                          match.timeSlot?.scheduledStart
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>COURT</span>
                      <strong>
                        {match.court?.name ||
                          "Not assigned"}
                      </strong>
                    </div>

                    <div>
                      <span>END TIME</span>
                      <strong>
                        {formatDateTime(
                          match.timeSlot?.scheduledEnd
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Results;