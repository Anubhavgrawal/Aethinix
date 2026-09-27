import "./MyRanking.css";

const MyRanking = () => {
  return (
    <div className="my-ranking-page">
      <div className="my-ranking-container">
        <header className="my-ranking-header">
          <p>COMPETITIVE STANDING</p>
          <h1>MY RANKING</h1>
          <span>
            Track your position and ranking points across AETHENIX.
          </span>
        </header>

        <section className="ranking-hero-card">
          <div className="ranking-position">
            <span>OVERALL RANK</span>
            <strong>—</strong>
            <p>No ranking yet</p>
          </div>

          <div className="ranking-points">
            <span>RANKING POINTS</span>
            <strong>0</strong>
            <p>Points earned</p>
          </div>
        </section>

        <section className="ranking-breakdown">
          <div className="ranking-section-title">
            <p>RANKING</p>
            <h2>YOUR STANDING</h2>
          </div>

          <div className="ranking-empty">
            <div className="ranking-empty-icon">#</div>

            <h3>Your ranking will appear here.</h3>

            <p>
              Complete AETHENIX competitions to earn ranking points and build
              your competitive position.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyRanking;