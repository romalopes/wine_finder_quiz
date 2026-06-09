import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const initialForm = { email: "", password: "", name: "" };

function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, currentUser, status, error, isAuthenticated } =
    useAuth();
  const [mode, setMode] = useState("signIn");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  function toggleMode(nextMode) {
    setMode(nextMode);
    setFormError(null);
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const { email, password, name } = form;
    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }
    if (mode === "signUp" && password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    try {
      if (mode === "signIn") {
        await signIn({ email, password });
      } else {
        await signUp({ email, password, name });
      }
      navigate("/", { replace: true });
    } catch (submitError) {
      setFormError(submitError.message);
    }
  }

  const isSubmitting = status === "loading";
  const isSignUp = mode === "signUp";

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="wine-kicker">
          {isSignUp ? "Create account" : "Welcome back"}
        </p>
        <h1 id="auth-title">
          {isSignUp ? "Join Cellar Signal" : "Sign in to Cellar Signal"}
        </h1>
        <p className="auth-card__intro">
          {isSignUp
            ? "Save tasting profiles, track the wines you have tried, and sync your quiz results across devices."
            : "Access your saved tasting profiles and continue where you left off in the quiz."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isSignUp ? (
            <label className="auth-form__field">
              <span>Name</span>
              <input
                autoComplete="name"
                name="name"
                onChange={updateField("name")}
                type="text"
                value={form.name}
              />
            </label>
          ) : null}

          <label className="auth-form__field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={updateField("email")}
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="auth-form__field">
            <span>Password</span>
            <input
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={6}
              name="password"
              onChange={updateField("password")}
              required
              type="password"
              value={form.password}
            />
          </label>

          {formError || error ? (
            <p className="auth-form__error" role="alert">
              {formError || error}
            </p>
          ) : null}

          <button
            className="auth-form__submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Please wait..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-card__switch">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button onClick={() => toggleMode("signIn")} type="button">
                Sign in instead
              </button>
            </>
          ) : (
            <>
              New to Cellar Signal?{" "}
              <button onClick={() => toggleMode("signUp")} type="button">
                Create an account
              </button>
            </>
          )}
        </p>

        {currentUser ? (
          <p className="auth-card__status">
            You are already signed in as {currentUser.email}.
          </p>
        ) : null}

        <Link className="text-link" to="/">
          Back to finder
        </Link>
      </section>
    </main>
  );
}

export default Login;
