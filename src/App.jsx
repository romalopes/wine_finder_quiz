import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

import AppRoutes from "./components/AppRoutes.jsx";

import { AuthProvider } from "./contexts/AuthContext.jsx";

// useEffect(() => {
//   authClient.getSession().then((result) => {
//     if (result.data?.session && result.data?.user) {
//       setSession(result.data.session);
//       setUser(result.data.user);
//     }
//     setLoading(false);
//   });
// }, []);

// async function handleLogin(user) {
//   setSession(user.session);
//   setUser(user.user);
// }

function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <main className="app-main">
          <AppRoutes user={user} setUser={setUser} />
        </main>
        {/* <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<Login />} path="login" />
          <Route element={<Quiz />} path="quiz" />
          <Route element={<About />} path="about" />
        </Routes> */}
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
