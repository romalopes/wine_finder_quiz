import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const initialForm = { email: "", password: "", name: "" };

function Login() {
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signIn");
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "signUp";
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const { email, password, name } = form;
      if (!email || !password) {
        setFormError("Email and password are required.");
        return;
      }
      if (isSignUp && password.length < 6) {
        setFormError("Password must be at least 6 characters long.");
        return;
      }

      if (isSignUp) {
        await signUp({ email, password, name });
      } else {
        await signIn({ email, password });
      }

      navigate("/wines", { replace: true });
    } catch (error) {
      console.error(error);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        {user ? (
          <p className="auth-card__status">
            You are already signed in as {user.email}.
          </p>
        ) : (
          <>
            <p className="wine-kicker">
              {isSignUp ? "Create account" : "Welcome back"}
            </p>
            <h1 id="auth-title">
              {isSignUp ? "Join Wine Prediction" : "Sign in to Wine Prediction"}
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

              {formError ? (
                <p className="auth-form__error" role="alert">
                  {formError}
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
          </>
        )}

        <Link className="text-link" to="/wines">
          Back to wine list
        </Link>
      </section>
    </main>
  );
}

export default Login;
