import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const dashboardCards = [
  {
    title: "Producers",
    description:
      "Browse wineries and growers, explore their stories, and manage producer records.",
    to: "/producers",
    cta: "View producers",
  },
  {
    title: "Wines",
    description:
      "Explore the full wine catalogue, open a bottle's detail page, or add a new wine.",
    to: "/wines",
    cta: "View wines",
  },
  {
    title: "Reviews",
    description:
      "Read community tasting notes and keep track of the reviews you have written.",
    to: "/my-reviews",
    cta: "View reviews",
  },
];

function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="wine-app">
      <section className="wine-hero" aria-labelledby="dashboard-title">
        <div className="wine-hero__content">
          <p className="wine-kicker">Dashboard</p>
          <h1 id="dashboard-title">
            Welcome{user ? `, ${user.email.split("@")[0]}` : ""} to Wine
            Prediction
          </h1>
          <p>
            Your cellar command centre. Jump into producers, wines, or your
            tasting reviews — everything starts here.
          </p>
          {!user && (
            <p className="dashboard-auth-hint">
              <Link className="text-link" to="/login">
                Sign in or create an account
              </Link>{" "}
              to save tasting profiles and write reviews.
            </p>
          )}
        </div>
      </section>

      <section aria-label="Dashboard sections" className="wine-workspace">
        <div className="dashboard-grid">
          {dashboardCards.map((card) => (
            <article className="wine-panel dashboard-card" key={card.title}>
              <div className="section-heading">
                <p>Navigate</p>
                <h2>{card.title}</h2>
              </div>
              <p>{card.description}</p>
              <Link className="dashboard-card__cta" to={card.to}>
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
