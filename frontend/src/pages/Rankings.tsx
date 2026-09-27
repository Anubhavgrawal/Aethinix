const Rankings = () => {
  return (
    <div>
      {/* Header */}
      <section>
        <p>AETHENIX RANKINGS</p>
        <h1>RANKINGS</h1>
        <p>
          Track athlete performance, points and competitive position across
          tournaments and seasons.
        </p>
      </section>

      {/* Filters */}
      <section>
        <h2>Leaderboard</h2>

        <div>
          <p>Sport: All</p>
          <p>Category: All</p>
          <p>Gender: All</p>
          <p>Season: 2026</p>
        </div>
      </section>

      {/* Rankings */}
      <section>
        <h2>Top Athletes</h2>

        <div>
          <p>01 — Player One</p>
          <p>1200 Points</p>
        </div>

        <div>
          <p>02 — Player Two</p>
          <p>1050 Points</p>
        </div>

        <div>
          <p>03 — Player Three</p>
          <p>980 Points</p>
        </div>

        <div>
          <p>04 — Player Four</p>
          <p>920 Points</p>
        </div>

        <div>
          <p>05 — Player Five</p>
          <p>870 Points</p>
        </div>
      </section>
    </div>
  );
};

export default Rankings;