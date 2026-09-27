import { Link } from "react-router-dom";
import "./MyFixtures.css";

const MyFixtures = () => {
  return (
    <div className="my-fixtures-page">
      <div className="my-fixtures-container">
        <header className="my-fixtures-header">
          <p>SCHEDULE</p>
          <h1>MY FIXTURES</h1>
          <span>View your upcoming and scheduled matches.</span>
        </header>

        <div className="fixture-filters">
          <button className="active">Upcoming</button>
          <button>Completed</button>
        </div>

        <section className="fixtures-empty">
          <div className="fixtures-empty-icon">◷</div>

          <p>NO FIXTURES</p>

          <h2>No matches scheduled</h2>

          <span>
            Your fixtures will appear here once you register for a tournament
            and your matches are scheduled.
          </span>

          <Link to="/my-tournaments">View My Tournaments →</Link>
        </section>

        <Link to="/dashboard" className="fixtures-back">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MyFixtures;