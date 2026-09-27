import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Matches.css";

type Player = {
  id: string;
  playerId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
};

type MatchEntry = {
  id: string;
  playerId: string;
  player?: Player | null;
};

type Match = {
  id: string;
  matchNumber: number;
  roundName: string;
  status: string;

  playerAEntryId?: string | null;
  playerBEntryId?: string | null;

  courtId?: string | null;
  timeSlotId?: string | null;

  playerA?: MatchEntry | null;
  playerB?: MatchEntry | null;

  winnerEntryId?: string | null;
  loserEntryId?: string | null;
  score?: string | null;

  court?: {
    id: string;
    name: string;
    number?: number | null;
  } | null;

  timeSlot?: {
    id: string;
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
  if (!entry?.player) {
    return "TBD";
  }

  const player = entry.player;

  if (player.name) {
    return player.name;
  }

  const fullName = [player.firstName, player.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  return player.playerId || "TBD";
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const Matches = () => {
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
  const [success, setSuccess] = useState("");

  const [resultMatchId, setResultMatchId] =
    useState<string | null>(null);

  const [winnerEntryId, setWinnerEntryId] =
    useState("");

  const [score, setScore] = useState("");

  const [submittingResult, setSubmittingResult] =
    useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!slug) {
      return;
    }

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

          if (!eventResponse.ok) {
            continue;
          }

          const eventData =
            await eventResponse.json();

          const categoryEvents = Array.isArray(
            eventData
          )
            ? eventData
            : eventData.data || [];

          eventResults.push(
            ...categoryEvents
          );
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
            : "Failed to load matches"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTournament();
  }, [slug, token]);

  useEffect(() => {
    if (!tournament?.id || !selectedEventId) {
      return;
    }

    const loadMatches = async () => {
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
            data.message || "Failed to fetch draw"
          );
        }

        const drawMatches =
          data.rounds?.flatMap(
            (round: {
              matches?: Match[];
            }) => round.matches || []
          ) || [];

        setMatches(drawMatches);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load matches"
        );
      } finally {
        setMatchesLoading(false);
      }
    };

    loadMatches();
  }, [
    tournament?.id,
    selectedEventId,
    token,
  ]);

  const openResultForm = (match: Match) => {
    setResultMatchId(match.id);
    setWinnerEntryId("");
    setScore("");
    setError("");
    setSuccess("");
  };

  const closeResultForm = () => {
    setResultMatchId(null);
    setWinnerEntryId("");
    setScore("");
  };

  const submitResult = async (match: Match) => {
    if (!winnerEntryId) {
      setError("Please select the winner.");
      return;
    }

    const playerAId = match.playerAEntryId;
    const playerBId = match.playerBEntryId;

    if (!playerAId || !playerBId) {
      setError(
        "Both players must be assigned before submitting the result."
      );
      return;
    }

    const loserEntryId =
      winnerEntryId === playerAId
        ? playerBId
        : playerAId;

    try {
      setSubmittingResult(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API}/match-results/${match.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            winnerEntryId,
            loserEntryId,
            score: score.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit match result"
        );
      }

      setSuccess(
        "Match result submitted successfully."
      );

      closeResultForm();

      await loadMatches();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit match result"
      );
    } finally {
      setSubmittingResult(false);
    }
  };

  if (loading) {
    return (
      <section className="matches-page">
        <p>Loading matches...</p>
      </section>
    );
  }

  return (
    <section className="matches-page">
      <div className="matches-header">
        <div>
          <Link
            to={`/organizer/tournaments/${slug}`}
            className="matches-back-link"
          >
            ← Back to Tournament
          </Link>

          <span className="matches-eyebrow">
            TOURNAMENT OPERATIONS
          </span>

          <h1>Matches</h1>

          <p>
            {tournament?.name ||
              "Tournament Matches"}
          </p>
        </div>

        <Link
          to={`/organizer/tournaments/${slug}/fixtures`}
          className="matches-fixtures-link"
        >
          Open Fixtures →
        </Link>
      </div>

      {error && (
        <div className="matches-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="matches-message success">
          {success}
        </div>
      )}

      <div className="matches-toolbar">
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

      <div className="matches-section">
        <div className="matches-section-header">
          <div>
            <span className="matches-eyebrow">
              MATCH SCHEDULE
            </span>

            <h2>Scheduled Matches</h2>
          </div>

          <span className="matches-count">
            {matches.length}{" "}
            {matches.length === 1
              ? "Match"
              : "Matches"}
          </span>
        </div>

        {matchesLoading ? (
          <div className="matches-empty">
            <p>
              Loading scheduled matches...
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="matches-empty">
            <h3>No matches available</h3>

            <p>
              Generate a draw and schedule its
              matches from Fixtures.
            </p>
          </div>
        ) : (
          <div className="matches-list">
            {matches.map((match) => (
              <div
                className="match-card"
                key={match.id}
              >
                <div className="match-card-top">
                  <div>
                    <span className="matches-eyebrow">
                      {match.roundName ||
                        "MATCH"}
                    </span>

                    <h3>
                      Match {match.matchNumber}
                    </h3>
                  </div>

                  <span
                    className={`match-status ${match.status.toLowerCase()}`}
                  >
                    {match.status}
                  </span>
                </div>

                <div className="match-players">
                  <div className="match-player">
                    <span>PLAYER A</span>

                    <strong>
                      {getPlayerName(
                        match.playerA
                      )}
                    </strong>
                  </div>

                  <div className="match-vs">
                    VS
                  </div>

                  <div className="match-player">
                    <span>PLAYER B</span>

                    <strong>
                      {getPlayerName(
                        match.playerB
                      )}
                    </strong>
                  </div>
                </div>

                <div className="match-details">
                  <div>
                    <span>DATE & TIME</span>

                    <strong>
                      {formatDateTime(
                        match.timeSlot
                          ?.scheduledStart
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>COURT</span>

                    <strong>
                      {match.court
                        ? match.court.name
                        : "Not assigned"}
                    </strong>
                  </div>

                  <div>
                    <span>END TIME</span>

                    <strong>
                      {match.timeSlot
                        ? formatDateTime(
                            match.timeSlot
                              .scheduledEnd
                          )
                        : "Not scheduled"}
                    </strong>
                  </div>
                </div>

                {match.status === "SCHEDULED" && (
                  <div className="match-result-actions">
                    {resultMatchId !== match.id ? (
                      <button
                        type="button"
                        className="match-result-button"
                        onClick={() =>
                          openResultForm(match)
                        }
                      >
                        Enter Result
                      </button>
                    ) : (
                      <div className="match-result-form">
                        <div className="match-result-form-header">
                          <div>
                            <span className="matches-eyebrow">
                              MATCH RESULT
                            </span>

                            <h4>
                              Enter Match Result
                            </h4>
                          </div>

                          <button
                            type="button"
                            className="match-result-cancel"
                            onClick={
                              closeResultForm
                            }
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="result-field">
                          <label>
                            Winner
                          </label>

                          <select
                            value={
                              winnerEntryId
                            }
                            onChange={(e) =>
                              setWinnerEntryId(
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Select winner
                            </option>

                            <option
                              value={
                                match.playerAEntryId ||
                                ""
                              }
                            >
                              {getPlayerName(
                                match.playerA
                              )}
                            </option>

                            <option
                              value={
                                match.playerBEntryId ||
                                ""
                              }
                            >
                              {getPlayerName(
                                match.playerB
                              )}
                            </option>
                          </select>
                        </div>

                        <div className="result-field">
                          <label>
                            Score
                          </label>

                          <input
                            type="text"
                            value={score}
                            onChange={(e) =>
                              setScore(
                                e.target.value
                              )
                            }
                            placeholder="e.g. 21-18, 21-16"
                          />
                        </div>

                        <button
                          type="button"
                          className="match-result-submit"
                          disabled={
                            submittingResult ||
                            !winnerEntryId
                          }
                          onClick={() =>
                            submitResult(match)
                          }
                        >
                          {submittingResult
                            ? "Saving..."
                            : "Save Result"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {match.status === "COMPLETED" && (
                  <div className="match-completed">
                    <div>
                      <span>WINNER</span>
                      <strong>
                        {match.winnerEntryId ===
                        match.playerAEntryId
                          ? getPlayerName(
                              match.playerA
                            )
                          : getPlayerName(
                              match.playerB
                            )}
                      </strong>
                    </div>

                    {match.score && (
                      <div>
                        <span>SCORE</span>
                        <strong>
                          {match.score}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Matches;