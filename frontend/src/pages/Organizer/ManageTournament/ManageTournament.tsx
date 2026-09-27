import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ManageTournament.css";

type Category = {
  id: string;
  name: string;
  gender?: string;
  ageGroup?: string;
  capacity?: number;
  fee: string | number;
  eligibility?: string;
};

type Event = {
  id: string;
  name: string;
  code: string;
  eventType: string;
  categoryId: string;
};


type Tournament = {
  id: string;
  name: string;
  slug: string;
  sport: string;
  organizerId: string;
  venue?: string;
  location?: string;
  startDate: string;
  endDate: string;
  registrationOpen?: string;
  registrationClose?: string;
  status: string;
  description?: string;
  rules?: string;
  capacity?: number;
  categories: Category[];
};

type EditForm = {
  name: string;
  slug: string;
  sport: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationOpen: string;
  registrationClose: string;
  description: string;
  rules: string;
  capacity: string;
};

type Registration = {
  id: string;
  registrationId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  player: {
    playerId: string;
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
  };
  category: {
    id: string;
    name: string;
  };
};

const ManageTournament = () => {
  const { slug } = useParams();

  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Publish
  const [publishLoading, setPublishLoading] =
    useState(false);

  // Edit Tournament
  const [showEditForm, setShowEditForm] =
    useState(false);

  const [editLoading, setEditLoading] =
    useState(false);

  const [editMessage, setEditMessage] =
    useState("");

  const [editForm, setEditForm] =
    useState<EditForm>({
      name: "",
      slug: "",
      sport: "",
      venue: "",
      location: "",
      startDate: "",
      endDate: "",
      registrationOpen: "",
      registrationClose: "",
      description: "",
      rules: "",
      capacity: "",
    });

  // Category
  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [categoryForm, setCategoryForm] =
    useState({
      name: "",
      gender: "",
      ageGroup: "",
      capacity: "",
      fee: "",
      eligibility: "",
    });

  const [categoryLoading, setCategoryLoading] =
    useState(false);

  const [categoryMessage, setCategoryMessage] =
    useState("");

  // Events
  const [events, setEvents] =
    useState<Event[]>([]);

  const [eventsLoading, setEventsLoading] =
    useState(false);

  const [showEventForm, setShowEventForm] =
    useState(false);

  const [eventCreating, setEventCreating] =
    useState(false);

  const [eventMessage, setEventMessage] =
    useState("");

  const [eventForm, setEventForm] =
    useState({
      categoryId: "",
      name: "",
      code: "",
      eventType: "SINGLES",
    });

  // Tournament Rules

  const [rulesLoading, setRulesLoading] =
    useState(false);

  const [rulesSaving, setRulesSaving] =
    useState(false);

  const [rulesMessage, setRulesMessage] =
    useState("");

  const [rulesForm, setRulesForm] =
    useState({
      format: "KNOCKOUT",
      matchDurationMin: "30",
      courtTurnaroundMin: "10",
      operationalBufferMin: "5",
      minimumRestMin: "30",
      operatingStartTime: "09:00",
      operatingEndTime: "18:00",
    });

  // Registrations
  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [registrationsLoading, setRegistrationsLoading] =
    useState(false);

  const [registrationError, setRegistrationError] =
    useState("");

  const [registrationActionLoading, setRegistrationActionLoading] =
    useState<string | null>(null);

  const [syncEntriesLoading, setSyncEntriesLoading] =
    useState(false);

  const [syncEntriesMessage, setSyncEntriesMessage] =
    useState("");

  // Players
  const [players, setPlayers] =
    useState<Registration[]>([]);

  const [playersLoading, setPlayersLoading] =
    useState(false);

  const [playersError, setPlayersError] =
    useState("");

  // Fetch tournament
  useEffect(() => {
    const fetchTournament = async () => {
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

        setTournament(data.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTournament();
    }
  }, [slug]);

  // Fetch events for tournament categories
  useEffect(() => {
    if (!tournament || tournament.categories.length === 0) {
      return;
    }

    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        setEventMessage("");

        const token =
          localStorage.getItem("token");

        const responses = await Promise.all(
          tournament.categories.map((category) =>
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

        setEvents(eventLists.flat());
      } catch (error) {
        setEventMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch events"
        );
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, [tournament]);

  // Fetch tournament scheduling rules
  useEffect(() => {
    if (!tournament) return;

    const fetchTournamentRule = async () => {
      try {
        setRulesLoading(true);
        setRulesMessage("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5001/api/tournament-rules/${tournament.id}`,
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
              "Failed to fetch tournament rules"
          );
        }

        if (data) {
          setRulesForm({
            format: data.format || "KNOCKOUT",
            matchDurationMin: String(data.matchDurationMin ?? 30),
            courtTurnaroundMin: String(data.courtTurnaroundMin ?? 10),
            operationalBufferMin: String(data.operationalBufferMin ?? 5),
            minimumRestMin: String(data.minimumRestMin ?? 30),
            operatingStartTime: data.operatingStartTime || "09:00",
            operatingEndTime: data.operatingEndTime || "18:00",
          });
        }
      } catch (error) {
        setRulesMessage(
          error instanceof Error
            ? error.message
            : "Failed to fetch tournament rules"
        );
      } finally {
        setRulesLoading(false);
      }
    };

    fetchTournamentRule();
  }, [tournament]);

  // Save tournament scheduling rules
  const handleRulesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournament) return;

    try {
      setRulesSaving(true);
      setRulesMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/tournament-rules/${tournament.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            format: rulesForm.format,
            matchDurationMin: Number(rulesForm.matchDurationMin),
            courtTurnaroundMin: Number(rulesForm.courtTurnaroundMin),
            operationalBufferMin: Number(rulesForm.operationalBufferMin),
            minimumRestMin: Number(rulesForm.minimumRestMin),
            operatingStartTime: rulesForm.operatingStartTime,
            operatingEndTime: rulesForm.operatingEndTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save tournament rules"
        );
      }

      setRulesMessage(
        data.message ||
          "Tournament rules saved successfully."
      );
    } catch (error) {
      setRulesMessage(
        error instanceof Error
          ? error.message
          : "Failed to save tournament rules"
      );
    } finally {
      setRulesSaving(false);
    }
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    if (!tournament) return;

    try {
      setRegistrationsLoading(true);
      setRegistrationError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/registrations/tournament/${tournament.id}`,
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
            "Failed to fetch registrations"
        );
      }

      setRegistrations(data.data || []);
    } catch (error) {
      setRegistrationError(
        error instanceof Error
          ? error.message
          : "Failed to fetch registrations"
      );
    } finally {
      setRegistrationsLoading(false);
    }
  };

  // Sync approved registrations into tournament entries
  const handleSyncEntries = async () => {
    if (!tournament) return;

    try {
      setSyncEntriesLoading(true);
      setSyncEntriesMessage("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/registrations/tournament/${tournament.id}/sync-entries`,
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
            "Failed to sync approved entries"
        );
      }

      setSyncEntriesMessage(
        data.message ||
          "Approved entries synced successfully."
      );
    } catch (error) {
      setSyncEntriesMessage(
        error instanceof Error
          ? error.message
          : "Failed to sync approved entries"
      );
    } finally {
      setSyncEntriesLoading(false);
    }
  };

  // Fetch approved players
  const fetchPlayers = async () => {
    if (!tournament) return;

    try {
      setPlayersLoading(true);
      setPlayersError("");

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/registrations/tournament/${tournament.id}/players`,
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
            "Failed to fetch players"
        );
      }

      setPlayers(data.data || []);
    } catch (error) {
      setPlayersError(
        error instanceof Error
          ? error.message
          : "Failed to fetch players"
      );
    } finally {
      setPlayersLoading(false);
    }
  };

  // Load registrations and players after tournament loads
  useEffect(() => {
  if (!tournament) return;

  const loadTournamentData = async () => {
    try {
      setRegistrationsLoading(true);
      setRegistrationError("");
      setPlayersLoading(true);
      setPlayersError("");

      const token = localStorage.getItem("token");

      const [registrationsResponse, playersResponse] =
        await Promise.all([
          fetch(
            `http://localhost:5001/api/registrations/tournament/${tournament.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `http://localhost:5001/api/registrations/tournament/${tournament.id}/players`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const registrationsData =
        await registrationsResponse.json();

      const playersData =
        await playersResponse.json();

      if (!registrationsResponse.ok) {
        throw new Error(
          registrationsData.message ||
            "Failed to fetch registrations"
        );
      }

      if (!playersResponse.ok) {
        throw new Error(
          playersData.message ||
            "Failed to fetch players"
        );
      }

      setRegistrations(
        registrationsData.data || []
      );

      setPlayers(
        playersData.data || []
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load tournament data";

      setRegistrationError(message);
      setPlayersError(message);
    } finally {
      setRegistrationsLoading(false);
      setPlayersLoading(false);
    }
  };

  loadTournamentData();
}, [tournament]);
  // Event creation
  const handleEventSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!tournament || !eventForm.categoryId) return;

    setEventCreating(true);
    setEventMessage("");

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/events/category/${eventForm.categoryId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: eventForm.name,
            code: eventForm.code,
            eventType: eventForm.eventType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create event"
        );
      }

      setEvents((current) => [
        ...current,
        data.event,
      ]);

      setEventForm({
        categoryId: "",
        name: "",
        code: "",
        eventType: "SINGLES",
      });

      setEventMessage(
        "Event created successfully."
      );

      setShowEventForm(false);
    } catch (error) {
      setEventMessage(
        error instanceof Error
          ? error.message
          : "Failed to create event"
      );
    } finally {
      setEventCreating(false);
    }
  };

  // Category creation
  const handleCategorySubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!tournament) return;

    setCategoryLoading(true);
    setCategoryMessage("");

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/categories/${tournament.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: categoryForm.name,
            gender:
              categoryForm.gender || undefined,
            ageGroup:
              categoryForm.ageGroup || undefined,
            capacity: categoryForm.capacity
              ? Number(categoryForm.capacity)
              : undefined,
            fee: Number(categoryForm.fee),
            eligibility:
              categoryForm.eligibility ||
              undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create category"
        );
      }

      setTournament((current) =>
        current
          ? {
              ...current,
              categories: [
                ...current.categories,
                data.data,
              ],
            }
          : current
      );

      setCategoryForm({
        name: "",
        gender: "",
        ageGroup: "",
        capacity: "",
        fee: "",
        eligibility: "",
      });

      setCategoryMessage(
        "Category created successfully."
      );

      setShowCategoryForm(false);
    } catch (error) {
      setCategoryMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setCategoryLoading(false);
    }
  };

  // Publish tournament
  const handlePublish = async () => {
    if (!tournament) return;

    try {
      setPublishLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/tournaments/${tournament.id}/publish`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to publish tournament"
        );
      }

      setTournament((current) =>
        current
          ? {
              ...current,
              status: "UPCOMING",
            }
          : current
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to publish tournament"
      );
    } finally {
      setPublishLoading(false);
    }
  };

  // Open edit form
  const openEditForm = () => {
    if (!tournament) return;

    setEditMessage("");

    setEditForm({
      name: tournament.name,
      slug: tournament.slug,
      sport: tournament.sport,
      venue: tournament.venue || "",
      location: tournament.location || "",
      startDate:
        tournament.startDate.slice(0, 10),
      endDate:
        tournament.endDate.slice(0, 10),
      registrationOpen:
        tournament.registrationOpen
          ? tournament.registrationOpen.slice(0, 10)
          : "",
      registrationClose:
        tournament.registrationClose
          ? tournament.registrationClose.slice(0, 10)
          : "",
      description:
        tournament.description || "",
      rules:
        tournament.rules || "",
      capacity:
        tournament.capacity !== undefined &&
        tournament.capacity !== null
          ? String(tournament.capacity)
          : "",
    });

    setShowEditForm(true);
  };

  // Edit tournament
  const handleEditSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!tournament) return;

    setEditLoading(true);
    setEditMessage("");

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/tournaments/${tournament.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editForm.name,
            slug: editForm.slug,
            sport: editForm.sport,
            venue:
              editForm.venue || undefined,
            location:
              editForm.location || undefined,
            startDate: editForm.startDate,
            endDate: editForm.endDate,
            registrationOpen:
              editForm.registrationOpen ||
              undefined,
            registrationClose:
              editForm.registrationClose ||
              undefined,
            description:
              editForm.description ||
              undefined,
            rules:
              editForm.rules ||
              undefined,
            capacity:
              editForm.capacity !== ""
                ? Number(editForm.capacity)
                : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update tournament"
        );
      }

      setTournament((current) =>
        current
          ? {
              ...current,
              ...data.data,
              categories:
                current.categories,
            }
          : current
      );

      setEditMessage(
        "Tournament updated successfully."
      );
    } catch (error) {
      setEditMessage(
        error instanceof Error
          ? error.message
          : "Failed to update tournament"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Approve / Reject registration
  const handleRegistrationStatus = async (
    registrationId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setRegistrationActionLoading(
        registrationId
      );

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/registrations/${registrationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update registration"
        );
      }

      setRegistrations((current) =>
        current.map((registration) =>
          registration.id === registrationId
            ? {
                ...registration,
                status,
              }
            : registration
        )
      );

      // Refresh approved players
      await fetchPlayers();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update registration"
      );
    } finally {
      setRegistrationActionLoading(null);
    }
  };

  if (loading) {
    return (
      <section className="manage-tournament-page">
        <p>Loading tournament...</p>
      </section>
    );
  }

  if (error || !tournament) {
    return (
      <section className="manage-tournament-page">
        <h1>Tournament not found</h1>

        <p>{error}</p>

        <Link to="/organizer/tournaments">
          ← Back to Tournaments
        </Link>
      </section>
    );
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  return (
    <section className="manage-tournament-page">
      {/* HEADER */}

      <div className="manage-tournament-header">
        <div>
          <Link
            to="/organizer/tournaments"
            className="manage-back-link"
          >
            ← Back to Tournaments
          </Link>

          <span className="manage-eyebrow">
            TOURNAMENT MANAGEMENT
          </span>

          <h1>{tournament.name}</h1>

          <p>
            {tournament.sport} ·{" "}
            {tournament.location ||
              tournament.venue ||
              "Location not specified"}
          </p>
        </div>

        <div className="manage-header-actions">
          <span
            className={`manage-status ${tournament.status.toLowerCase()}`}
          >
            {tournament.status}
          </span>

          {tournament.status === "DRAFT" && (
            <button
              className="manage-publish-button"
              disabled={publishLoading}
              onClick={handlePublish}
            >
              {publishLoading
                ? "Publishing..."
                : "Publish Tournament"}
            </button>
          )}

          <button
            className="manage-edit-button"
            onClick={() => {
              if (showEditForm) {
                setShowEditForm(false);
                setEditMessage("");
              } else {
                openEditForm();
              }
            }}
          >
            {showEditForm
              ? "Cancel Edit"
              : "Edit Tournament"}
          </button>
        </div>
      </div>

      {/* EDIT FORM */}

      {showEditForm && (
        <div className="manage-edit-form">
          <div className="manage-section-header">
            <div>
              <span className="manage-eyebrow">
                TOURNAMENT SETTINGS
              </span>

              <h2>Edit Tournament</h2>
            </div>
          </div>

          <form onSubmit={handleEditSubmit}>
            <div className="manage-edit-grid">
              <div>
                <label>Tournament Name</label>

                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Slug</label>

                <input
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      slug: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Sport</label>

                <input
                  value={editForm.sport}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      sport: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Venue</label>

                <input
                  value={editForm.venue}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      venue: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Location</label>

                <input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Capacity</label>

                <input
                  type="number"
                  min="1"
                  value={editForm.capacity}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      capacity: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>Start Date</label>

                <input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      startDate:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>End Date</label>

                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      endDate:
                        e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>
                  Registration Opens
                </label>

                <input
                  type="date"
                  value={
                    editForm.registrationOpen
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      registrationOpen:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label>
                  Registration Closes
                </label>

                <input
                  type="date"
                  value={
                    editForm.registrationClose
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      registrationClose:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="manage-edit-full">
                <label>Description</label>

                <textarea
                  value={
                    editForm.description
                  }
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description:
                        e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>

              <div className="manage-edit-full">
                <label>Rules</label>

                <textarea
                  value={editForm.rules}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      rules: e.target.value,
                    })
                  }
                  rows={5}
                />
              </div>
            </div>

            <button
              type="submit"
              className="manage-save-button"
              disabled={editLoading}
            >
              {editLoading
                ? "Saving..."
                : "Save Changes"}
            </button>

            {editMessage && (
              <p className="manage-edit-message">
                {editMessage}
              </p>
            )}
          </form>
        </div>
      )}

      {/* OVERVIEW */}

      <div className="manage-overview-grid">
        <div className="manage-card">
          <span>DATE</span>

          <strong>
            {formatDate(
              tournament.startDate
            )}
            {" — "}
            {formatDate(tournament.endDate)}
          </strong>
        </div>

        <div className="manage-card">
          <span>REGISTRATION</span>

          <strong>
            {tournament.registrationOpen
              ? formatDate(
                  tournament.registrationOpen
                )
              : "Not specified"}
          </strong>
        </div>

        <div className="manage-card">
          <span>CAPACITY</span>

          <strong>
            {tournament.capacity ??
              "Not specified"}
          </strong>
        </div>

        <div className="manage-card">
          <span>CATEGORIES</span>

          <strong>
            {tournament.categories.length}
          </strong>
        </div>
      </div>

      {/* TOURNAMENT RULES */}

      <div className="manage-section">
        <div className="manage-section-header">
          <div>
            <span className="manage-eyebrow">
              COMPETITION CONFIGURATION
            </span>
            <h2>Tournament Rules</h2>
          </div>
        </div>

        {rulesLoading ? (
          <div className="manage-empty">
            <h3>Loading tournament rules...</h3>
          </div>
        ) : (
          <form
            className="manage-category-form"
            onSubmit={handleRulesSubmit}
          >
            <div className="manage-form-grid">
              <div>
                <label>Format</label>
                <select
                  value={rulesForm.format}
                  onChange={(e) =>
                    setRulesForm({
                      ...rulesForm,
                      format: e.target.value,
                    })
                  }
                >
                  <option value="KNOCKOUT">KNOCKOUT</option>
                </select>
              </div>

              <div>
                <label>Match Duration (min)</label>
                <input
                  type="number"
                  min="1"
                  value={rulesForm.matchDurationMin}
                  onChange={(e) =>
                    setRulesForm({
                      ...rulesForm,
                      matchDurationMin: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Court Turnaround (min)</label>
                <input
                  type="number"
                  min="0"
                  value={rulesForm.courtTurnaroundMin}
                  onChange={(e) =>
                    setRulesForm({
                      ...rulesForm,
                      courtTurnaroundMin: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Operational Buffer (min)</label>
                <input
                  type="number"
                  min="0"
                  value={rulesForm.operationalBufferMin}
                  onChange={(e) =>
                    setRulesForm({
                      ...rulesForm,
                      operationalBufferMin: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Minimum Rest (min)</label>
                <input
                  type="number"
                  min="0"
                  value={rulesForm.minimumRestMin}
                  onChange={(e) =>
                    setRulesForm({
                      ...rulesForm,
                      minimumRestMin: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Operating Start</label>
                <input
                  type="time"
                  value={rulesForm.operatingStartTime}
                  onChange={(e) =>
                    setRulesForm({
                      ...rulesForm,
                      operatingStartTime: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label>Operating End</label>
                <input
                  type="time"
                  value={rulesForm.operatingEndTime}
                  onChange={(e) =>
                    setRulesForm({
                      ...rulesForm,
                      operatingEndTime: e.target.value,
                    })
                  }
                  required
                />
              </div>


            </div>

            <button type="submit" disabled={rulesSaving}>
              {rulesSaving
                ? "Saving..."
                : "Save Tournament Rules"}
            </button>

            {rulesMessage && <p>{rulesMessage}</p>}
          </form>
        )}
      </div>

      {/* CATEGORIES */}

      <div className="manage-section">
        <div className="manage-section-header">
          <div>
            <span className="manage-eyebrow">
              COMPETITION
            </span>

            <h2>Categories</h2>
          </div>

          <button
            className="manage-add-category-button"
            onClick={() => {
              setShowCategoryForm(
                !showCategoryForm
              );

              setCategoryMessage("");
            }}
          >
            {showCategoryForm
              ? "Cancel"
              : "+ Add Category"}
          </button>
        </div>

        {showCategoryForm && (
          <form
            className="manage-category-form"
            onSubmit={handleCategorySubmit}
          >
            <div className="manage-form-grid">
              <div>
                <label>Category Name</label>

                <input
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Men's Singles"
                  required
                />
              </div>

              <div>
                <label>Gender</label>

                <input
                  value={categoryForm.gender}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      gender: e.target.value,
                    })
                  }
                  placeholder="Male"
                />
              </div>

              <div>
                <label>Age Group</label>

                <input
                  value={categoryForm.ageGroup}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      ageGroup: e.target.value,
                    })
                  }
                  placeholder="Open"
                />
              </div>

              <div>
                <label>Capacity</label>

                <input
                  type="number"
                  min="1"
                  value={categoryForm.capacity}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="50"
                />
              </div>

              <div>
                <label>Entry Fee</label>

                <input
                  type="number"
                  min="0"
                  value={categoryForm.fee}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      fee: e.target.value,
                    })
                  }
                  placeholder="500"
                  required
                />
              </div>

              <div>
                <label>Eligibility</label>

                <input
                  value={categoryForm.eligibility}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      eligibility:
                        e.target.value,
                    })
                  }
                  placeholder="Open category"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={categoryLoading}
            >
              {categoryLoading
                ? "Adding..."
                : "Add Category"}
            </button>

            {categoryMessage && (
              <p>{categoryMessage}</p>
            )}
          </form>
        )}

        {tournament.categories.length === 0 ? (
          <div className="manage-empty">
            <h3>No categories yet</h3>

            <p>
              Add categories to start accepting
              registrations.
            </p>
          </div>
        ) : (
          <div className="manage-category-grid">
            {tournament.categories.map(
              (category) => (
                <div
                  className="manage-category-card"
                  key={category.id}
                >
                  <div>
                    <span>
                      {category.gender ||
                        "Open"}
                    </span>

                    <h3>{category.name}</h3>
                  </div>

                  <div className="manage-category-info">
                    <div>
                      <small>
                        AGE GROUP
                      </small>

                      <strong>
                        {category.ageGroup ||
                          "Open"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        CAPACITY
                      </small>

                      <strong>
                        {category.capacity ??
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <small>FEE</small>

                      <strong>
                        ₹{category.fee}
                      </strong>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* EVENTS */}

      <div className="manage-section">
        <div className="manage-section-header">
          <div>
            <span className="manage-eyebrow">
              COMPETITION SETUP
            </span>

            <h2>Events</h2>
          </div>

          <div>
            <button
              className="manage-add-category-button"
              onClick={() => {
                setShowEventForm(!showEventForm);
                setEventMessage("");
              }}
            >
              {showEventForm ? "Cancel" : "+ Add Event"}
            </button>

          </div>
        </div>

        {showEventForm && (
          <form
            className="manage-category-form"
            onSubmit={handleEventSubmit}
          >
            <div className="manage-form-grid">
              <div>
                <label>Category</label>
                <select
                  value={eventForm.categoryId}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      categoryId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select category</option>
                  {tournament.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Event Name</label>
                <input
                  value={eventForm.name}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Men's Singles"
                  required
                />
              </div>

              <div>
                <label>Event Code</label>
                <input
                  value={eventForm.code}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="MS"
                  required
                />
              </div>

              <div>
                <label>Event Type</label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) =>
                    setEventForm({
                      ...eventForm,
                      eventType: e.target.value,
                    })
                  }
                >
                  <option value="SINGLES">SINGLES</option>
                  <option value="DOUBLES">DOUBLES</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={eventCreating}>
              {eventCreating ? "Creating..." : "Create Event"}
            </button>

            {eventMessage && <p>{eventMessage}</p>}
          </form>
        )}

        {eventsLoading ? (
          <div className="manage-empty">
            <h3>Loading events...</h3>
          </div>
        ) : events.length === 0 ? (
          <div className="manage-empty">
            <h3>No events yet</h3>
            <p>
              Create an event for each category before generating fixtures.
            </p>
          </div>
        ) : (
          <div className="manage-category-grid">
            {events.map((event) => {
              const category = tournament.categories.find(
                (item) => item.id === event.categoryId
              );

              return (
                <div className="manage-category-card" key={event.id}>
                  <div>
                    <span>{event.eventType}</span>
                    <h3>{event.name}</h3>
                    <p>{category?.name || "Category not found"}</p>
                  </div>

                  <div className="manage-category-info">
                    <div>
                      <small>CODE</small>
                      <strong>{event.code}</strong>
                    </div>

                    <div>
                      <small>TYPE</small>
                      <strong>{event.eventType}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REGISTRATIONS */}

      <div className="manage-section">
        <div className="manage-section-header">
          <div>
            <span className="manage-eyebrow">
              PLAYER MANAGEMENT
            </span>

            <h2>Registrations</h2>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="manage-add-category-button"
              onClick={handleSyncEntries}
              disabled={syncEntriesLoading}
            >
              {syncEntriesLoading
                ? "Syncing..."
                : "Sync Approved Entries"}
            </button>

            <button
              className="manage-add-category-button"
              onClick={fetchRegistrations}
              disabled={registrationsLoading}
            >
              {registrationsLoading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {syncEntriesMessage && (
            <p style={{ marginTop: "8px" }}>
              {syncEntriesMessage}
            </p>
          )}
        </div>

        {registrationsLoading ? (
          <div className="manage-empty">
            <h3>
              Loading registrations...
            </h3>
          </div>
        ) : registrationError ? (
          <div className="manage-empty">
            <h3>
              Unable to load registrations
            </h3>

            <p>{registrationError}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="manage-empty">
            <h3>No registrations yet</h3>

            <p>
              Player registrations will appear
              here once athletes register for this
              tournament.
            </p>
          </div>
        ) : (
          <div className="manage-registrations-list">
            {registrations.map(
              (registration) => (
                <div
                  className="manage-registration-card"
                  key={registration.id}
                >
                  <div className="manage-registration-main">
                    <span className="manage-registration-player-id">
                      {registration.player.playerId}
                    </span>

                    <h3>
                      {registration.player.user.name}
                    </h3>

                    <p>
                      {registration.category.name}
                    </p>
                  </div>

                  <div className="manage-registration-contact">
                    <span>
                      {registration.player.user.email}
                    </span>

                    {registration.player.user
                      .phone && (
                      <span>
                        {
                          registration.player.user
                            .phone
                        }
                      </span>
                    )}
                  </div>

                  <div className="manage-registration-status">
                    <span
                      className={`manage-registration-badge ${registration.status.toLowerCase()}`}
                    >
                      {registration.status}
                    </span>
                  </div>

                  {registration.status ===
                    "PENDING" && (
                    <div className="manage-registration-actions">
                      <button
                        className="manage-approve-button"
                        disabled={
                          registrationActionLoading ===
                          registration.id
                        }
                        onClick={() =>
                          handleRegistrationStatus(
                            registration.id,
                            "APPROVED"
                          )
                        }
                      >
                        {registrationActionLoading ===
                        registration.id
                          ? "Updating..."
                          : "Approve"}
                      </button>

                      <button
                        className="manage-reject-button"
                        disabled={
                          registrationActionLoading ===
                          registration.id
                        }
                        onClick={() =>
                          handleRegistrationStatus(
                            registration.id,
                            "REJECTED"
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* PLAYERS */}

      <div className="manage-section">
        <div className="manage-section-header">
          <div>
            <span className="manage-eyebrow">
              COMPETITION
            </span>

            <h2>Players</h2>
          </div>

          <button
            className="manage-add-category-button"
            onClick={fetchPlayers}
            disabled={playersLoading}
          >
            {playersLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {playersLoading ? (
          <div className="manage-empty">
            <h3>Loading players...</h3>
          </div>
        ) : playersError ? (
          <div className="manage-empty">
            <h3>
              Unable to load players
            </h3>

            <p>{playersError}</p>
          </div>
        ) : players.length === 0 ? (
          <div className="manage-empty">
            <h3>No approved players yet</h3>

            <p>
              Players will appear here after
              their registrations are approved.
            </p>
          </div>
        ) : (
          <div className="manage-registrations-list">
            {players.map((player) => (
              <div
                className="manage-registration-card"
                key={player.id}
              >
                <div className="manage-registration-main">
                  <span className="manage-registration-player-id">
                    {player.player.playerId}
                  </span>

                  <h3>
                    {player.player.user.name}
                  </h3>

                  <p>
                    {player.category.name}
                  </p>
                </div>

                <div className="manage-registration-contact">
                  <span>
                    {player.player.user.email}
                  </span>

                  {player.player.user.phone && (
                    <span>
                      {player.player.user.phone}
                    </span>
                  )}
                </div>

                <div className="manage-registration-status">
                  <span className="manage-registration-badge approved">
                    APPROVED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OPERATIONS */}

      <div className="manage-section">
        <div className="manage-section-header">
          <div>
            <span className="manage-eyebrow">
              OPERATIONS
            </span>

            <h2>
              Competition Management
            </h2>
          </div>
        </div>

        <div className="manage-operation-grid">
          <div className="manage-operation-card">
            <h3>Registrations</h3>

            <p>
              Review and approve player
              registrations.
            </p>

            <strong>
              {registrations.length}{" "}
              {registrations.length === 1
                ? "Registration"
                : "Registrations"}
            </strong>
          </div>

          <div className="manage-operation-card">
            <h3>Players</h3>

            <p>
              View approved players for this
              tournament.
            </p>

            <strong>
              {players.length}{" "}
              {players.length === 1
                ? "Player"
                : "Players"}
            </strong>
          </div>

          <div className="manage-operation-card">
            <h3>Fixtures</h3>

            <p>
              Generate and schedule
              tournament fixtures.
            </p>

            <span>Coming next</span>
          </div>

          <div className="manage-operation-card">
            <h3>Results</h3>

            <p>
              Enter and manage match
              results.
            </p>

            <span>Coming next</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManageTournament;