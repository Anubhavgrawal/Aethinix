import { Link } from "react-router-dom";
import "./MyResults.css";

const MyResults = () => {
  return (
    <div className="my-results-page">
      <div className="my-results-container">
        <header className="my-results-header">
          <p>PERFORMANCE</p>
          <h1>MY RESULTS</h1>
          <span>Review your match results and competitive history.</span>
        </header>

        <div className="results-summary">
          <div>
            <span>MATCHES</span>
            <strong>0</strong>
          </div>

          <div>
            <span>WINS</span>
            <strong>0</strong>
          </div>

          <div>
            <span>LOSSES</span>
            <strong>0</strong>
          </div>

          <div>
            <span>WIN RATE</span>
            <strong>—</strong>
          </div>
        </div>

        <section className="results-empty">
          <div className="results-empty-icon">↗</div>

          <p>NO RESULTS YET</p>

          <h2>Your competitive record starts here.</h2>

          <span>
            Match results, tournament performances and your competitive
            history will appear here after you compete.
          </span>

          <Link to="/my-tournaments">View My Tournaments →</Link>
        </section>

        <Link to="/dashboard" className="results-back">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MyResults;