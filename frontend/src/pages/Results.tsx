import { Link } from "react-router-dom";

const Results = () => {
  return (
    <div>
      {/* Header */}
      <section>
        <p>AETHENIX COMPETITION DATA</p>
        <h1>RESULTS</h1>
        <p>
          Explore completed matches, tournament results and athlete
          performance records.
        </p>
      </section>

      {/* Recent Results */}
      <section>
        <h2>Recent Results</h2>

        <div>
          <p>Player One vs Player Two</p>
          <p>21 — 18</p>
          <p>AETHENIX Series 01</p>
          <Link to="/results/match-001">View Match →</Link>
        </div>

        <div>
          <p>Player Three vs Player Four</p>
          <p>15 — 21</p>
          <p>AETHENIX Series 01</p>
          <Link to="/results/match-002">View Match →</Link>
        </div>
      </section>

      {/* Tournament Results */}
      <section>
        <h2>Tournament Results</h2>

        <div>
          <p>AETHENIX Series 01</p>
          <p>Completed matches and final standings</p>
          <Link to="/tournaments/series-01/results">
            View Tournament Results →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Results;