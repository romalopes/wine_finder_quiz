import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { articlesApi } from "../services/api";
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
  {
    title: "Articles",
    description:
      "Read community stories and guides about wines, regions and producers.",
    to: "/articles",
    cta: "Read articles",
  },
];

function Dashboard() {
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    articlesApi
      .list()
      .then((data) =>
        setRecentArticles((Array.isArray(data) ? data : []).slice(0, 10)),
      )
      .catch(() => setRecentArticles([]));
  }, []);

  return (
    <main className="wine-app">
      <section className="wine-hero" aria-labelledby="dashboard-title">
        <div className="wine-hero__content">
          <p className="wine-kicker">Dashboard</p>
          <h1 id="dashboard-title">
            Welcome{user ? `, ${user.email.split("@")[0]}` : ""} to Wine Words
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

        {recentArticles.length > 0 && (
          <div className="wine-detail__section">
            <div className="section-heading">
              <p>From the community</p>
              <h2>Latest Articles</h2>
            </div>
            {recentArticles.map((article) => (
              <article
                className="wine-panel"
                key={article.id}
                style={{ marginBottom: 16 }}
              >
                {Array.isArray(article.images) && article.images.length > 0 && (
                  <img
                    src={article.images[0]}
                    alt={article.title}
                    style={{
                      width: "100%",
                      height: "8rem",
                      objectFit: "cover",
                      borderRadius: ".5rem",
                    }}
                  />
                )}
                <h3 style={{ margin: ".5rem 0 .25rem" }}>
                  <Link to={`/articles/${article.id}`}>{article.title}</Link>
                </h3>
                {[article.category, `by ${article.author_name}`]
                  .filter(Boolean)
                  .join(" · ") && (
                  <p className="review-card__comment">
                    {[article.category, `by ${article.author_name}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {article.abstract && (
                  <p>{String(article.abstract).slice(0, 160)}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
