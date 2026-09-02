import { Route, Routes, Navigate } from "react-router-dom";
import About from "./About.jsx";
import Dashboard from "./Dashboard.jsx";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
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
import ProducerWines from "./ProducerWines.jsx";
import UserRoles from "./UserRoles.jsx";
import Categories from "./Categories.jsx";
import CategoryDetail from "./CategoryDetail.jsx";
import Grapes from "./Grapes.jsx";
import GrapeDetail from "./GrapeDetail.jsx";
import GrapeWines from "./GrapeWines.jsx";
import Countries from "./Countries.jsx";
import CountryDetail from "./CountryDetail.jsx";
import Regions from "./Regions.jsx";
import RegionDetail from "./RegionDetail.jsx";
import ApiHealth from "./ApiHealth/ApiHealth.jsx";
import Subscribe from "./Subscribe.jsx";
import SubscriptionAdmin from "./SubscriptionAdmin.jsx";

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
        <Route element={<Navigate replace to="/reviews" />} path="/my-reviews" />
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
        <Route element={<ProducerWines />} path="/producers/:slug/wines" />

        <Route element={<ProducerDetail />} path="/producers/:slug" />
        <Route element={<ProducerForm />} path="/producers/new" />
        <Route element={<ProducerForm />} path="/producers/:slug/edit" />
        <Route element={<UserRoles />} path="/users" />
        <Route element={<Categories />} path="/categories" />
        <Route element={<CategoryDetail />} path="/categories/:id" />
        <Route element={<Grapes />} path="/grapes" />
        <Route element={<GrapeDetail />} path="/grapes/:id" />
        <Route element={<GrapeWines />} path="/grapes/:id/wines" />
        <Route element={<Countries />} path="/countries" />
        <Route element={<CountryDetail />} path="/countries/:id" />
        <Route element={<Regions />} path="/regions" />
        <Route element={<RegionDetail />} path="/regions/:id" />
        <Route element={<ApiHealth />} path="/admin/api-health" />
        <Route element={<Subscribe />} path="/subscribe" />
        <Route element={<SubscriptionAdmin />} path="/subscriptions" />
      </Routes>
    </>
  );
}

export default AppRoutes;
