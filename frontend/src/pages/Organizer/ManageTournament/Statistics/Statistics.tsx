import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Statistics.css";

type StatisticsData = {
  totalEvents: number;
  totalEntries: number;
  totalMatches: number;
  completedMatches: number;
  scheduledMatches: number;
  pendingMatches: number;
  completionPercentage: number;
};

type Tournament = {
  id: string;
  name: string;
};

const API = "http://localhost:5001/api";

const Statistics = () => {
  const { slug } = useParams();

  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [statistics, setStatistics] =
    useState<StatisticsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!slug) return;

    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError("");

        const tournamentResponse = await fetch(
          `${API}/tournaments/${slug}`
        );

        const tournamentData =
          await tournamentResponse.json();

        if (!tournamentResponse.ok) {
          throw new Error(
            tournamentData.message ||
              "Failed to fetch tournament"
          );
        }

        const tournamentInfo =
          tournamentData.data;

        setTournament(tournamentInfo);

        const response = await fetch(
          `${API}/tournament-statistics/tournament/${tournamentInfo.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch statistics"
          );
        }

        setStatistics(data.statistics);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [slug, token]);

  if (loading) {
    return (
      <section className="tournament-statistics-page">
        <p>Loading statistics...</p>
      </section>
    );
  }

  return (
    <section className="tournament-statistics-page">
      <div className="tournament-statistics-header">
        <div>
          <Link
            to={`/organizer/tournaments/${slug}`}
            className="tournament-statistics-back"
          >
            ← Back to Tournament
          </Link>

          <span className="tournament-statistics-eyebrow">
            TOURNAMENT OPERATIONS
          </span>

          <h1>Statistics</h1>

          <p>
            {tournament?.name ||
              "Tournament Statistics"}
          </p>
        </div>

        <Link
          to={`/organizer/tournaments/${slug}/ranking`}
          className="tournament-statistics-link"
        >
          View Rankings →
        </Link>
      </div>

      {error && (
        <div className="tournament-statistics-error">
          {error}
        </div>
      )}

      {statistics && (
        <>
          <div className="tournament-statistics-progress">
            <div>
              <span>TOURNAMENT PROGRESS</span>
              <strong>
                {statistics.completionPercentage}%
              </strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${statistics.completionPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="tournament-statistics-grid">
            <div className="stat-card">
              <span>TOTAL EVENTS</span>
              <strong>
                {statistics.totalEvents}
              </strong>
            </div>

            <div className="stat-card">
              <span>TOTAL ENTRIES</span>
              <strong>
                {statistics.totalEntries}
              </strong>
            </div>

            <div className="stat-card">
              <span>TOTAL MATCHES</span>
              <strong>
                {statistics.totalMatches}
              </strong>
            </div>

            <div className="stat-card">
              <span>COMPLETED</span>
              <strong>
                {statistics.completedMatches}
              </strong>
            </div>

            <div className="stat-card">
              <span>SCHEDULED</span>
              <strong>
                {statistics.scheduledMatches}
              </strong>
            </div>

            <div className="stat-card">
              <span>PENDING</span>
              <strong>
                {statistics.pendingMatches}
              </strong>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default Statistics;