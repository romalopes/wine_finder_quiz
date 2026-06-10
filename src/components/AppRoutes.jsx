import { Route, Routes } from "react-router-dom";
import About from "./About.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Quiz from "./Quiz.jsx";
import WineList from "./WineList.jsx";
import WineDetail from "./WineDetail.jsx";
import WineForm from "./WineForm.jsx";
import WineSearch from "./WineSearch.jsx";

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
        <Route element={<WineSearch />} path="/search" />
        <Route element={<WineList />} path="/wines" />
        <Route element={<WineDetail />} path="/wines/:slug" />
        <Route element={<WineForm />} path="/wines/new" />
        <Route element={<WineForm />} path="/wines/:slug/edit" />
      </Routes>
    </>
  );
}

export default AppRoutes;
