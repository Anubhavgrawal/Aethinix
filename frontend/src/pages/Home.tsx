import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section>
        <p>AETHENIX</p>

        <h1>
          COMPETE.
          <br />
          RECORD.
          <br />
          RISE.
        </h1>

        <p>
          A digital sports competition platform connecting athletes,
          tournaments, results and rankings in one competitive record.
        </p>

        <div>
          <Link to="/tournaments">Explore Tournaments</Link>
          <Link to="/players">Find an Athlete</Link>
        </div>
      </section>

      {/* Upcoming Tournament */}
      <section>
        <h2>Upcoming Tournament</h2>

        <div>
          <p>AETHENIX Series 01</p>
          <p>10–11 October 2026</p>
          <p>Registration Open</p>

          <Link to="/tournaments">View Tournament →</Link>
        </div>
      </section>

      {/* Rankings */}
      <section>
        <h2>Rankings</h2>

        <div>
          <p>01 — Player One</p>
          <p>1200 Points</p>

          <p>02 — Player Two</p>
          <p>1050 Points</p>

          <p>03 — Player Three</p>
          <p>980 Points</p>

          <p>04 — Player Four</p>
          <p>920 Points</p>

          <p>05 — Player Five</p>
          <p>870 Points</p>
        </div>

        <Link to="/rankings">View Full Rankings →</Link>
      </section>

      {/* Athlete Search */}
      <section>
        <h2>Find an Athlete</h2>

        <p>
          Search athletes by name or AETHENIX Player ID.
        </p>

        <div>
          <input
            type="text"
            placeholder="Player Name or AETHENIX Player ID"
          />

          <button>Search</button>
        </div>
      </section>

      {/* Recent Results */}
      <section>
        <h2>Recent Results</h2>

        <div>
          <p>Player One vs Player Two</p>
          <p>21 — 18</p>
          <p>AETHENIX Series 01</p>
        </div>

        <div>
          <p>Player Three vs Player Four</p>
          <p>15 — 21</p>
          <p>AETHENIX Series 01</p>
        </div>

        <Link to="/results">View All Results →</Link>
      </section>
    </div>
  );
};

export default Home;