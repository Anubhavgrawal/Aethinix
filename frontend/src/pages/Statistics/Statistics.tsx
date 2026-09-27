
import "./Statistics.css";

const Statistics = () => {
  return (
    <div className="statistics-page">
      <div className="statistics-container">
        <header className="statistics-header">
          <p>PERFORMANCE</p>
          <h1>STATISTICS</h1>
          <span>
            Track your competitive performance across AETHENIX.
          </span>
        </header>

        <section className="statistics-grid">
          <div className="stat-card">
            <span>MATCHES PLAYED</span>
            <strong>0</strong>
            <p>Total matches</p>
          </div>

          <div className="stat-card">
            <span>WINS</span>
            <strong>0</strong>
            <p>Matches won</p>
          </div>

          <div className="stat-card">
            <span>LOSSES</span>
            <strong>0</strong>
            <p>Matches lost</p>
          </div>

          <div className="stat-card">
            <span>WIN RATE</span>
            <strong>—</strong>
            <p>Overall performance</p>
          </div>
        </section>

        <section className="statistics-section">
          <div className="statistics-section-title">
            <p>COMPETITIVE RECORD</p>
            <h2>PERFORMANCE OVERVIEW</h2>
          </div>

          <div className="statistics-empty">
            <div className="statistics-empty-icon">◈</div>

            <h3>Your statistics will appear here.</h3>

            <p>
              Match performance, tournament results and competitive metrics
              will be tracked here as you compete.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Statistics;