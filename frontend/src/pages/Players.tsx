import { Link } from "react-router-dom";

const Players = () => {
  return (
    <div>
      {/* Header */}
      <section>
        <p>AETHENIX ATHLETES</p>
        <h1>PLAYERS</h1>
        <p>
          Discover athletes, competitive records and performance history.
        </p>
      </section>

      {/* Search */}
      <section>
        <h2>Find an Athlete</h2>

        <div>
          <input
            type="text"
            placeholder="Search by name or AETHENIX Player ID"
          />
          <button>Search</button>
        </div>
      </section>

      {/* Player List */}
      <section>
        <h2>Featured Athletes</h2>

        <div>
          <p>Player One</p>
          <p>AETHENIX ID: AX-00001</p>
          <p>Rank #1</p>
          <Link to="/players/player-one">View Profile →</Link>
        </div>

        <div>
          <p>Player Two</p>
          <p>AETHENIX ID: AX-00002</p>
          <p>Rank #2</p>
          <Link to="/players/player-two">View Profile →</Link>
        </div>

        <div>
          <p>Player Three</p>
          <p>AETHENIX ID: AX-00003</p>
          <p>Rank #3</p>
          <Link to="/players/player-three">View Profile →</Link>
        </div>
      </section>
    </div>
  );
};

export default Players;