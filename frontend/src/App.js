// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import { Navigation } from "./components/navigation/Navigation";
import { Home } from "./components/quiz/Home";
import { Login } from "./components/auth/Login";
import { Logout } from "./components/auth/Logout";
import Register from "./components/accounts/Register";
import Creation from "./components/quiz/Creation";
import "./i18n/i18n";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-quiz" element={<Creation />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
