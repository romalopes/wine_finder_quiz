import { Route, Routes } from "react-router-dom";
import About from "./About.jsx";
import Footer from "./Footer";
import Header from "./Header";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Quiz from "./Quiz.jsx";
// import LoginSignupForm from "../features/auth/LoginSignupForm";

function AppRoutes({ user, setUser }) {
  return (
    <>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Quiz />} path="quiz" />
        <Route element={<About />} path="about" />
        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />}
        />
      </Routes>
    </>
  );
}

export default AppRoutes;
