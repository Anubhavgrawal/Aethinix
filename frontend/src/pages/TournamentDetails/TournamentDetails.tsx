import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./TournamentDetails.css";

type Category = {
  id: string;
  name: string;
  gender: string | null;
  ageGroup: string | null;
  fee: string;
};

type Tournament = {
  id: string;
  name: string;
  slug: string;
  sport: string;
  venue: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  registrationOpen: string | null;
  registrationClose: string | null;
  status: string;
  description: string | null;
  rules: string | null;
  capacity: number | null;
  categories: Category[];
};

const TournamentDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);
  
  const [registrationLoading, setRegistrationLoading] =
  useState(false);

  const [registrationMessage, setRegistrationMessage] =
  useState("");

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/tournaments/${slug}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch tournament"
          );
        }

        setTournament(data.data);
      } catch (error) {
        console.error(error);
        setError("Unable to load tournament.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTournament();
    }
  }, [slug]);

  const handleRegister = (category: Category) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
          categoryId: category.id,
        },
      });

      return;
    }

    if (user.role !== "ATHLETE") {
      return;
    }

    setSelectedCategory(category);
  };

  const closeRegistration = () => {
    setSelectedCategory(null);
  };

  const handleRegistrationSubmit = async () => {
  if (!tournament || !selectedCategory) return;

  try {
    setRegistrationLoading(true);
    setRegistrationMessage("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5001/api/registrations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tournamentId: tournament.id,
          categoryId: selectedCategory.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Registration failed"
      );
    }

    setRegistrationMessage(
      "Registration submitted successfully."
    );
  } catch (error) {
    setRegistrationMessage(
      error instanceof Error
        ? error.message
        : "Registration failed"
    );
  } finally {
    setRegistrationLoading(false);
  }
    };

  if (loading) {
    return <div>Loading tournament...</div>;
  }

  if (error || !tournament) {
    return (
      <div>
        <h1>Tournament Not Found</h1>

        <Link to="/tournaments">
          ← Back to Tournaments
        </Link>
      </div>
    );
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="tournament-details-page">
      <div className="tournament-details-container">
        <Link
          to="/tournaments"
          className="tournament-details-back"
        >
          ← Back to Tournaments
        </Link>

        <header className="tournament-details-header">
          <p>
            {tournament.sport.toUpperCase()} COMPETITION
          </p>

          <h1>{tournament.name}</h1>

          <span>
            {tournament.description ||
              "Tournament details."}
          </span>
        </header>

        <section className="tournament-details-card">
          <div>
            <span>STATUS</span>
            <strong>{tournament.status}</strong>
          </div>

          <div>
            <span>DATE</span>

            <strong>
              {formatDate(tournament.startDate)} –{" "}
              {formatDate(tournament.endDate)}
            </strong>
          </div>

          <div>
            <span>VENUE</span>
            <strong>
              {tournament.venue || "—"}
            </strong>
          </div>

          <div>
            <span>LOCATION</span>
            <strong>
              {tournament.location || "—"}
            </strong>
          </div>

          <div>
            <span>CAPACITY</span>
            <strong>
              {tournament.capacity ?? "—"}
            </strong>
          </div>
        </section>

        <section className="tournament-details-section">
          <p>REGISTRATION</p>

          <h2>REGISTRATION WINDOW</h2>

          <div className="registration-dates">
            <div>
              <span>OPENS</span>

              <strong>
                {tournament.registrationOpen
                  ? formatDate(
                      tournament.registrationOpen
                    )
                  : "—"}
              </strong>
            </div>

            <div>
              <span>CLOSES</span>

              <strong>
                {tournament.registrationClose
                  ? formatDate(
                      tournament.registrationClose
                    )
                  : "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="tournament-details-section">
          <p>CATEGORIES</p>

          <h2>COMPETITION CATEGORIES</h2>

          {tournament.categories.length === 0 ? (
            <div className="tournament-empty">
              Categories will be available here.
            </div>
          ) : (
            <div className="tournament-category-list">
              {tournament.categories.map(
                (category) => (
                  <div
                    className="category-card"
                    key={category.id}
                  >
                    <div className="category-card-info">
                      <strong>
                        {category.name}
                      </strong>

                      <span>
                        {category.gender ||
                          "Open"}{" "}
                        ·{" "}
                        {category.ageGroup ||
                          "All ages"}
                      </span>

                      <small>
                        Entry Fee: ₹{category.fee}
                      </small>
                    </div>

                    {user?.role === "ATHLETE" ||
                    !user ? (
                      <button
                        className="category-register-button"
                        onClick={() =>
                          handleRegister(category)
                        }
                      >
                        Register
                      </button>
                    ) : null}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="tournament-details-section">
          <p>RULES</p>

          <h2>COMPETITION RULES</h2>

          <div className="tournament-rules">
            {tournament.rules ||
              "Rules will be available here."}
          </div>
        </section>
      </div>

      {selectedCategory && (
        <div className="registration-modal-overlay">
          <div className="registration-modal">
            <button
              className="registration-modal-close"
              onClick={closeRegistration}
            >
              ×
            </button>

            <span className="manage-eyebrow">
              TOURNAMENT REGISTRATION
            </span>

            <h2>
              Register for{" "}
              {selectedCategory.name}
            </h2>

            <p>
              You are registering for{" "}
              <strong>
                {tournament.name}
              </strong>
              .
            </p>

            <div className="registration-summary">
              <div>
                <span>CATEGORY</span>
                <strong>
                  {selectedCategory.name}
                </strong>
              </div>

              <div>
                <span>GENDER</span>
                <strong>
                  {selectedCategory.gender ||
                    "Open"}
                </strong>
              </div>

              <div>
                <span>AGE GROUP</span>
                <strong>
                  {selectedCategory.ageGroup ||
                    "All ages"}
                </strong>
              </div>

              <div>
                <span>ENTRY FEE</span>
                <strong>
                  ₹{selectedCategory.fee}
                </strong>
              </div>
            </div>

            <button
            className="registration-continue-button"
            disabled={registrationLoading}
            onClick={handleRegistrationSubmit}
            >
            {registrationLoading
                ? "Submitting..."
                : "Continue Registration"}
            </button>

            {registrationMessage && (
            <p>{registrationMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;