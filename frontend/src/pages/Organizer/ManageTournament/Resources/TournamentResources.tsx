import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./TournamentResources.css";

type Court = {
  id: string;
  name: string;
  number?: number | null;
  active: boolean;
};

type Venue = {
  id: string;
  name: string;
  address?: string | null;
  courts: Court[];
};

const API = "http://localhost:5001/api";

const TournamentResources = () => {
  const { slug } = useParams();

  const [tournamentId, setTournamentId] = useState("");
  const [tournamentName, setTournamentName] = useState("");

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [venueForm, setVenueForm] = useState({
    name: "",
    address: "",
  });
  const [venueSaving, setVenueSaving] = useState(false);

  const [courtForms, setCourtForms] = useState<
    Record<string, { name: string; courtNumber: string; type: string }>
  >({});
  const [courtSaving, setCourtSaving] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const loadVenues = useCallback(async (id: string) => {
    const response = await fetch(`${API}/venues/tournament/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch venues");
    }

    setVenues(data);
  }, [token]);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const tournamentResponse = await fetch(`${API}/tournaments/${slug}`);
        const tournamentData = await tournamentResponse.json();

        if (!tournamentResponse.ok) {
          throw new Error(
            tournamentData.message || "Failed to fetch tournament"
          );
        }

        const tournament = tournamentData.data;
        setTournamentId(tournament.id);
        setTournamentName(tournament.name);

        await loadVenues(tournament.id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resources"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, loadVenues]);

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournamentId || !venueForm.name.trim()) return;

    try {
      setVenueSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API}/venues/tournament/${tournamentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: venueForm.name.trim(),
          address: venueForm.address.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create venue");
      }

      setVenues((current) => [...current, { ...data.venue, courts: [] }]);
      setVenueForm({ name: "", address: "" });
      setMessage("Venue created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create venue");
    } finally {
      setVenueSaving(false);
    }
  };

  const handleCreateCourt = async (venueId: string) => {
    const form = courtForms[venueId];

    if (!form?.name.trim()) return;

    try {
      setCourtSaving(venueId);
      setMessage("");
      setError("");

      const response = await fetch(`${API}/courts/venue/${venueId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          courtNumber: form.courtNumber
            ? Number(form.courtNumber)
            : undefined,
          type: form.type.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create court");
      }

      setVenues((current) =>
        current.map((venue) =>
          venue.id === venueId
            ? { ...venue, courts: [...venue.courts, data.court] }
            : venue
        )
      );

      setCourtForms((current) => ({
        ...current,
        [venueId]: { name: "", courtNumber: "", type: "" },
      }));

      setMessage("Court created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create court");
    } finally {
      setCourtSaving(null);
    }
  };

  const handleToggleCourt = async (court: Court) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API}/courts/${court.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          active: !court.active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update court");
      }

      setVenues((current) =>
        current.map((venue) => ({
          ...venue,
          courts: venue.courts.map((item) =>
            item.id === court.id ? data.court : item
          ),
        }))
      );

      setMessage(
        `Court ${data.court.active ? "activated" : "deactivated"} successfully.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update court");
    }
  };

  const updateCourtForm = (
    venueId: string,
    field: "name" | "courtNumber" | "type",
    value: string
  ) => {
    setCourtForms((current) => ({
      ...current,
      [venueId]: {
        name: current[venueId]?.name || "",
        courtNumber: current[venueId]?.courtNumber || "",
        type: current[venueId]?.type || "",
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <section className="resources-page">
        <p>Loading tournament resources...</p>
      </section>
    );
  }

  return (
    <section className="resources-page">
      <div className="resources-header">
        <div>
          <Link
            to={`/organizer/tournaments/${slug}`}
            className="resources-back-link"
          >
            ← Back to Tournament
          </Link>
          <span className="resources-eyebrow">TOURNAMENT OPERATIONS</span>
          <h1>Venue & Courts</h1>
          <p>{tournamentName}</p>
        </div>

        <Link
          to={`/organizer/tournaments/${slug}/fixtures`}
          className="resources-fixtures-link"
        >
          Open Fixtures →
        </Link>
      </div>

      {message && <div className="resources-message success">{message}</div>}
      {error && <div className="resources-message error">{error}</div>}

      <div className="resources-section">
        <div className="resources-section-header">
          <div>
            <span className="resources-eyebrow">VENUE CONFIGURATION</span>
            <h2>Add Venue</h2>
          </div>
        </div>

        <form className="resources-form" onSubmit={handleCreateVenue}>
          <div>
            <label>Venue Name</label>
            <input
              value={venueForm.name}
              onChange={(e) =>
                setVenueForm({ ...venueForm, name: e.target.value })
              }
              placeholder="City Sports Complex"
              required
            />
          </div>

          <div>
            <label>Address</label>
            <input
              value={venueForm.address}
              onChange={(e) =>
                setVenueForm({ ...venueForm, address: e.target.value })
              }
              placeholder="Venue address"
            />
          </div>

          <button type="submit" disabled={venueSaving}>
            {venueSaving ? "Adding..." : "Add Venue"}
          </button>
        </form>
      </div>

      <div className="resources-section">
        <div className="resources-section-header">
          <div>
            <span className="resources-eyebrow">PLAYING FACILITIES</span>
            <h2>Configured Venues</h2>
          </div>
          <span className="resources-count">
            {venues.length} {venues.length === 1 ? "Venue" : "Venues"}
          </span>
        </div>

        {venues.length === 0 ? (
          <div className="resources-empty">
            <h3>No venues configured</h3>
            <p>Add at least one venue and one active court before scheduling fixtures.</p>
          </div>
        ) : (
          <div className="resources-venue-list">
            {venues.map((venue) => {
              const activeCourts = venue.courts.filter(
                (court) => court.active
                ).length;

              return (
                <div className="resources-venue-card" key={venue.id}>
                  <div className="resources-venue-top">
                    <div>
                      <span className="resources-eyebrow">VENUE</span>
                      <h3>{venue.name}</h3>
                      {venue.address && <p>{venue.address}</p>}
                    </div>

                    <div className="resources-stat">
                      <strong>{activeCourts}</strong>
                      <span>Active Courts</span>
                    </div>
                  </div>

                  <div className="resources-courts">
                    <div className="resources-courts-header">
                      <h4>Courts</h4>
                      <span>{venue.courts.length} configured</span>
                    </div>

                    {venue.courts.length === 0 ? (
                      <p className="resources-muted">
                        No courts configured for this venue.
                      </p>
                    ) : (
                      <div className="resources-court-list">
                        {venue.courts.map((court) => (
                          <div className="resources-court-row" key={court.id}>
                            <div>
                              <strong>{court.name}</strong>
                              <span>
                                {court.type || "Standard"}{" "}
                                {court.number !== null &&
                                court.number !== undefined
                                  ? `· Court ${court.number}`
                                  : ""}
                              </span>
                            </div>

                            <div className="resources-court-actions">
                              <span
                                className={`resources-status ${
                                  court.active ? "active" : "inactive"
                                }`}
                              >
                                {court.active ? "ACTIVE" : "INACTIVE"}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleToggleCourt(court)}
                              >
                                {court.active ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="resources-add-court">
                      <input
                        value={courtForms[venue.id]?.name || ""}
                        onChange={(e) =>
                          updateCourtForm(venue.id, "name", e.target.value)
                        }
                        placeholder="Court 1"
                      />

                      <input
                        type="number"
                        min="1"
                        value={courtForms[venue.id]?.courtNumber || ""}
                        onChange={(e) =>
                          updateCourtForm(
                            venue.id,
                            "courtNumber",
                            e.target.value
                          )
                        }
                        placeholder="Number"
                      />

                      <input
                        value={courtForms[venue.id]?.type || ""}
                        onChange={(e) =>
                          updateCourtForm(venue.id, "type", e.target.value)
                        }
                        placeholder="Badminton"
                      />

                      <button
                        type="button"
                        disabled={courtSaving === venue.id}
                        onClick={() => handleCreateCourt(venue.id)}
                      >
                        {courtSaving === venue.id ? "Adding..." : "Add Court"}
                      </button>
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

export default TournamentResources;
