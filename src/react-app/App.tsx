import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">Stock Trading</div>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
