import { BrowserRouter, Route, Routes } from 'react-router-dom';
import About from './components/About.jsx';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './components/Home.jsx';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<About />} path="about" />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
