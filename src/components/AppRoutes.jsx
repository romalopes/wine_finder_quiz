import { Route, Routes } from "react-router-dom";
import About from "./About.jsx";
import Dashboard from "./Dashboard.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import MyReviews from "./MyReviews.jsx";
import Reviews from "./Reviews.jsx";
import ReviewDetail from "./ReviewDetail.jsx";
import Articles from "./Articles.jsx";
import ArticleDetail from "./ArticleDetail.jsx";
import Quiz from "./Quiz.jsx";
import WineList from "./WineList.jsx";
import WineDetail from "./WineDetail.jsx";
import WineForm from "./WineForm.jsx";
import WineSearch from "./WineSearch.jsx";
import ProducerList from "./ProducerList.jsx";
import ProducerDetail from "./ProducerDetail.jsx";
import ProducerForm from "./ProducerForm.jsx";

function AppRoutes({ user, setUser }) {
  return (
    <>
      <Routes>
        <Route element={<Dashboard />} path="/" />
        <Route element={<Home />} path="/finder" />
        <Route element={<Quiz />} path="quiz" />
        <Route element={<About />} path="about" />
        <Route
          path="/login"
          element={<Login user={user} setUser={setUser} />}
        />
        <Route element={<MyReviews />} path="/my-reviews" />
        <Route element={<Reviews />} path="/reviews" />
        <Route element={<ReviewDetail />} path="/reviews/:id" />
        <Route element={<Articles />} path="/articles" />
        <Route element={<ArticleDetail />} path="/articles/:id" />
        <Route element={<ArticleDetail />} path="/articles/:id/edit" />
        <Route element={<WineSearch />} path="/search" />
        <Route element={<WineList />} path="/wines" />
        <Route element={<WineDetail />} path="/wines/:slug" />
        <Route element={<WineForm />} path="/wines/new" />
        <Route element={<WineForm />} path="/wines/:slug/edit" />
        <Route element={<ProducerList />} path="/producers" />
        <Route element={<ProducerDetail />} path="/producers/:slug" />
        <Route element={<ProducerForm />} path="/producers/new" />
        <Route element={<ProducerForm />} path="/producers/:slug/edit" />
      </Routes>
    </>
  );
}

export default AppRoutes;
