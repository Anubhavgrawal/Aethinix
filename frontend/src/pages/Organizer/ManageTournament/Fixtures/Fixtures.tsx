import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Fixtures.css";

type Category = {
  id: string;
  name: string;
};

type Event = {
  id: string;
  name: string;
  code: string;
  eventType: string;
  categoryId: string;
};

type TournamentEntry = {
  id: string;
  eventId: string;
  player?: {
    id: string;
  };
  category?: {
    id: string;
    name: string;
  };
  event?: {
    id: string;
    name: string;
    code: string;
  };
  pair?: unknown;
};

type DrawCalculation = {
  entryCount: number;
  bracketSize: number;
  byeCount: number;
  totalMatches: number;
  rounds: number;
};

type GeneratedDraw = {
  id: string;
  status: string;
  version: number;
  bracketSize: number;
  byeCount: number;
  totalMatches: number;
};

const Fixtures = () => {
  const { slug } = useParams();

  const [tournamentId, setTournamentId] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [events, setEvents] =
    useState<Event[]>([]);

  const [entries, setEntries] =
    useState<TournamentEntry[]>([]);

  const [selectedEventId, setSelectedEventId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [eventsLoading, setEventsLoading] =
    useState(false);

  const [entriesLoading, setEntriesLoading] =
    useState(false);

  const [drawLoading, setDrawLoading] =
    useState(false);

  const [generateLoading, setGenerateLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [draw, setDraw] =
    useState<GeneratedDraw | null>(null);

  const [calculation, setCalculation] =
    useState<DrawCalculation | null>(null);

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleStartTime, setScheduleStartTime] =
    useState("09:00");
  const [scheduleEndTime, setScheduleEndTime] =
    useState("18:00");
  const [scheduleLoading, setScheduleLoading] =
    useState(false);
  const [assignLoading, setAssignLoading] =
    useState(false);
  const [scheduleResult, setScheduleResult] =
    useState<{
      slotsCreated: number;
      courts: number;
      matchDurationMinutes: number;
      turnaroundMinutes: number;
      slotDurationMinutes: number;
    } | null>(null);
  const [assignmentResult, setAssignmentResult] =
    useState<{
      totalMatches: number;
      assignedMatches: number;
      unassignedMatches: number;
    } | null>(null);

  // Fetch tournament
  useEffect(() => {
    const fetchTournament = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5001/api/tournaments/${slug}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch tournament"
          );
        }

        const tournament = data.data;

        setTournamentId(tournament.id);

        setCategories(
          tournament.categories || []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch tournament"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [slug]);

  // Fetch tournament entries
  useEffect(() => {
    const fetchEntries = async () => {
      if (!tournamentId) return;

      try {
        setEntriesLoading(true);

        const token =
          localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5001/api/tournament-entries/tournament/${tournamentId}`,
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
              "Failed to fetch tournament entries"
          );
        }

        setEntries(data || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch tournament entries"
        );
      } finally {
        setEntriesLoading(false);
      }
    };

    fetchEntries();
  }, [tournamentId]);

  // Fetch events from all tournament categories
  useEffect(() => {
    const fetchEvents = async () => {
      if (categories.length === 0) {
        setEvents([]);
        return;
      }

      try {
        setEventsLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const responses = await Promise.all(
          categories.map((category) =>
            fetch(
              `http://localhost:5001/api/events/category/${category.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
          )
        );

        const eventLists = await Promise.all(
          responses.map(async (response) => {
            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message ||
                  "Failed to fetch events"
              );
            }

            return data;
          })
        );

        const allEvents: Event[] =
          eventLists.flat();

        setEvents(allEvents);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch events"
        );
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [categories]);

  // Check existing draw for selected event
  const fetchExistingDraw = async (
    eventId: string
  ) => {
    if (!tournamentId || !eventId) return;

    try {
      setDrawLoading(true);
      setMessage("");
      setError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/draws/tournament/${tournamentId}/event/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // No draw exists yet
      if (response.status === 404) {
        setDraw(null);
        setCalculation(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch draw"
        );
      }

      setDraw(data);

      setCalculation({
        entryCount:
          data.positions?.filter(
            (position: {
              entry?: unknown;
            }) => position.entry
          ).length || 0,

        bracketSize: data.bracketSize,

        byeCount: data.byeCount,

        totalMatches:
          data.totalMatches,

        rounds:
          data.rounds?.length || 0,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch draw"
      );
    } finally {
      setDrawLoading(false);
    }
  };

  // Handle event selection
  const handleEventChange = async (
    eventId: string
  ) => {
    setSelectedEventId(eventId);
    setDraw(null);
    setCalculation(null);
    setScheduleResult(null);
    setAssignmentResult(null);
    setMessage("");
    setError("");

    if (eventId) {
      await fetchExistingDraw(eventId);
    }
  };

  // Generate draw
  const handleGenerateDraw = async () => {
    if (
      !tournamentId ||
      !selectedEventId
    ) {
      return;
    }

    try {
      setGenerateLoading(true);
      setError("");
      setMessage("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/draws/tournament/${tournamentId}/event/${selectedEventId}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to generate draw"
        );
      }

      setDraw(data.draw);
      setCalculation(data.calculation);

      setMessage(
        "Draw and matches generated successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate draw"
      );
    } finally {
      setGenerateLoading(false);
    }
  };

  // Generate time slots for the tournament.
  const handleGenerateSchedule = async () => {
    if (
      !tournamentId ||
      !selectedEventId ||
      !scheduleDate ||
      !scheduleStartTime ||
      !scheduleEndTime
    ) {
      setError(
        "Select an event, date, start time and end time."
      );
      return;
    }

    try {
      setScheduleLoading(true);
      setError("");
      setMessage("");
      setScheduleResult(null);
      setAssignmentResult(null);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/scheduling/tournament/${tournamentId}/generate-slots`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: scheduleDate,
            startTime: scheduleStartTime,
            endTime: scheduleEndTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to generate schedule slots"
        );
      }

      setScheduleResult({
        slotsCreated: data.slotsCreated ?? 0,
        courts: data.courts ?? 0,
        matchDurationMinutes:
          data.matchDurationMinutes ?? 0,
        turnaroundMinutes:
          data.turnaroundMinutes ?? 0,
        slotDurationMinutes:
          data.slotDurationMinutes ?? 0,
      });

      setMessage(
        `Schedule slots generated successfully. ${data.slotsCreated ?? 0} slots created.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate schedule slots"
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  // Assign draw matches to generated time slots.
  const handleAssignMatches = async () => {
    if (!draw?.id) {
      setError(
        "Generate or load a draw before scheduling matches."
      );
      return;
    }

    try {
      setAssignLoading(true);
      setError("");
      setMessage("");
      setAssignmentResult(null);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/scheduling/draw/${draw.id}/assign`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to schedule matches"
        );
      }

      const result = data.result;

      setAssignmentResult({
        totalMatches: result?.totalMatches ?? 0,
        assignedMatches: result?.assignedMatches ?? 0,
        unassignedMatches:
          result?.unassignedMatches ?? 0,
      });

      setMessage(
        `Matches scheduled successfully. ${result?.assignedMatches ?? 0} of ${result?.totalMatches ?? 0} assigned.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to schedule matches"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const selectedEvent = events.find(
    (event) =>
      event.id === selectedEventId
  );

  const selectedEventEntries =
    entries.filter(
      (entry) =>
        entry.eventId === selectedEventId
    );

  const selectedEventEntryCount =
    selectedEventEntries.length;

  if (loading) {
    return (
      <section className="fixtures-page">
        <p>Loading tournament...</p>
      </section>
    );
  }

  if (error && !tournamentId) {
    return (
      <section className="fixtures-page">
        <div className="fixtures-header">
          <Link
            to={`/organizer/tournaments/${slug}`}
            className="fixtures-back-link"
          >
            ← Back to Tournament
          </Link>

          <h1>Fixtures</h1>

          <div className="fixtures-error">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fixtures-page">
      {/* HEADER */}

      <div className="fixtures-header">
        <div>
          <Link
            to={`/organizer/tournaments/${slug}`}
            className="fixtures-back-link"
          >
            ← Back to Tournament
          </Link>

          <span className="fixtures-eyebrow">
            COMPETITION MANAGEMENT
          </span>

          <h1>Fixtures</h1>

          <p>
            Select an event to generate and
            manage its tournament draw.
          </p>
        </div>
      </div>

      {/* EVENT SELECTION */}

      <div className="fixtures-section">
        <div className="fixtures-section-header">
          <div>
            <span className="fixtures-eyebrow">
              EVENT
            </span>

            <h2>Select Event</h2>
          </div>
        </div>

        {eventsLoading ? (
          <div className="fixtures-empty">
            <h3>Loading events...</h3>
          </div>
        ) : events.length === 0 ? (
          <div className="fixtures-empty">
            <h3>No events available</h3>

            <p>
              Create events for the tournament
              categories before generating
              fixtures.
            </p>
          </div>
        ) : (
          <div className="fixtures-event-selection">
            <select
              value={selectedEventId}
              onChange={(e) =>
                handleEventChange(
                  e.target.value
                )
              }
            >
              <option value="">
                Select an event
              </option>

              {events.map((event) => {
                const category =
                  categories.find(
                    (item) =>
                      item.id ===
                      event.categoryId
                  );

                return (
                  <option
                    key={event.id}
                    value={event.id}
                  >
                    {category?.name
                      ? `${category.name} — `
                      : ""}
                    {event.name} ({event.code})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* SELECTED EVENT */}

      {selectedEvent && (
        <div className="fixtures-section">
          <div className="fixtures-section-header">
            <div>
              <span className="fixtures-eyebrow">
                SELECTED EVENT
              </span>

              <h2>
                {selectedEvent.name}
              </h2>

              <p>
                {selectedEvent.code} ·{" "}
                {selectedEvent.eventType}
              </p>
            </div>
          </div>

          {/* ENTRY SUMMARY */}

          <div className="fixtures-entry-summary">
            <span className="fixtures-card-label">
              APPROVED ENTRIES
            </span>

            {entriesLoading ? (
              <strong>
                Loading...
              </strong>
            ) : (
              <strong>
                {selectedEventEntryCount}{" "}
                {selectedEventEntryCount === 1
                  ? "Entry"
                  : "Entries"}
              </strong>
            )}
          </div>

          {/* DRAW */}

          {drawLoading ? (
            <div className="fixtures-empty">
              <h3>Checking draw...</h3>
            </div>
          ) : draw ? (
            <>
              <div className="fixtures-draw-card">
                <div>
                  <span className="fixtures-card-label">
                    CURRENT DRAW
                  </span>

                  <h3>
                    Version {draw.version}
                  </h3>

                  <p>
                    Status:{" "}
                    <strong>
                      {draw.status}
                    </strong>
                  </p>
                </div>

                {calculation && (
                  <div className="fixtures-calculation-grid">
                    <div>
                      <span>ENTRIES</span>

                      <strong>
                        {calculation.entryCount}
                      </strong>
                    </div>

                    <div>
                      <span>BRACKET</span>

                      <strong>
                        {calculation.bracketSize}
                      </strong>
                    </div>

                    <div>
                      <span>BYES</span>

                      <strong>
                        {calculation.byeCount}
                      </strong>
                    </div>

                    <div>
                      <span>MATCHES</span>

                      <strong>
                        {calculation.totalMatches}
                      </strong>
                    </div>

                    <div>
                      <span>ROUNDS</span>

                      <strong>
                        {calculation.rounds}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="fixtures-schedule-card">
                <div>
                  <span className="fixtures-card-label">
                    SCHEDULE SETUP
                  </span>

                  <h3>
                    Generate Time Slots
                  </h3>

                  <p>
                    Create the available tournament
                    time slots, then assign this draw's
                    matches to them.
                  </p>
                </div>

                <div className="fixtures-schedule-form">
                  <div>
                    <label htmlFor="schedule-date">
                      Date
                    </label>
                    <input
                      id="schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) =>
                        setScheduleDate(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="schedule-start-time">
                      Start Time
                    </label>
                    <input
                      id="schedule-start-time"
                      type="time"
                      value={scheduleStartTime}
                      onChange={(e) =>
                        setScheduleStartTime(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="schedule-end-time">
                      End Time
                    </label>
                    <input
                      id="schedule-end-time"
                      type="time"
                      value={scheduleEndTime}
                      onChange={(e) =>
                        setScheduleEndTime(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <button
                    onClick={
                      handleGenerateSchedule
                    }
                    disabled={
                      scheduleLoading ||
                      !scheduleDate
                    }
                  >
                    {scheduleLoading
                      ? "Generating..."
                      : "Generate Schedule"}
                  </button>
                </div>

                {scheduleResult && (
                  <div className="fixtures-calculation-grid">
                    <div>
                      <span>SLOTS CREATED</span>

                      <strong>
                        {scheduleResult.slotsCreated}
                      </strong>
                    </div>

                    <div>
                      <span>ACTIVE COURTS</span>

                      <strong>
                        {scheduleResult.courts}
                      </strong>
                    </div>

                    <div>
                      <span>MATCH MIN</span>

                      <strong>
                        {scheduleResult.matchDurationMinutes}
                      </strong>
                    </div>

                    <div>
                      <span>TURNAROUND</span>

                      <strong>
                        {scheduleResult.turnaroundMinutes}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="fixtures-schedule-card">
                <div>
                  <span className="fixtures-card-label">
                    MATCH ASSIGNMENT
                  </span>

                  <h3>
                    Assign Draw Matches
                  </h3>

                  <p>
                    Use the generated slots to
                    schedule this draw's matches.
                  </p>
                </div>

                <button
                  onClick={
                    handleAssignMatches
                  }
                  disabled={
                    assignLoading ||
                    scheduleLoading
                  }
                >
                  {assignLoading
                    ? "Scheduling..."
                    : "Assign Matches"}
                </button>

                {assignmentResult && (
                  <div className="fixtures-calculation-grid">
                    <div>
                      <span>TOTAL</span>

                      <strong>
                        {assignmentResult.totalMatches}
                      </strong>
                    </div>

                    <div>
                      <span>ASSIGNED</span>

                      <strong>
                        {assignmentResult.assignedMatches}
                      </strong>
                    </div>

                    <div>
                      <span>UNASSIGNED</span>

                      <strong>
                        {assignmentResult.unassignedMatches}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="fixtures-generate-card">
              <div>
                <span className="fixtures-card-label">
                  DRAW MANAGEMENT
                </span>

                <h3>
                  No draw generated
                </h3>

                <p>
                  Generate the knockout draw
                  for this event. The backend
                  will validate the event before
                  creating the draw and matches.
                </p>
              </div>

              <button
                onClick={handleGenerateDraw}
                disabled={
                  generateLoading ||
                  entriesLoading
                }
              >
                {generateLoading
                  ? "Generating..."
                  : "Generate Draw"}
              </button>
            </div>
          )}

          {message && (
            <div className="fixtures-success">
              {message}
            </div>
          )}

          {error && (
            <div className="fixtures-error">
              {error}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Fixtures;