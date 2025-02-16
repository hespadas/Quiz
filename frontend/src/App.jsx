import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";

import { Login } from "./components/auth/Login";
import { Logout } from "./components/auth/Logout";

import "./i18n/i18n";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigation } from "./components/layout/Navigation";
import Home from "./pages/Home/Home";
import Register from "./pages/Register/Register";
import Creation from "./pages/QuizCreate/Creation";
import List from "./pages/QuizList/List";
import Detail from "./pages/QuizDetail/Detail";
import Edit from "./pages/QuizEdit/Edit";
import JoinLobby from "./pages/LobbyJoin/JoinLobby";
import Lobby from "./pages/Lobby/Lobby";
import CreateLobby from "./pages/LobbyCreate/CreateLobby";
import GameRoom from "./pages/Game/Game";
import EmailConfirmation from "./pages/EmailConfirmation/EmailConfirmation";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-quiz" element={<Creation />} />
          <Route path="/quizzes" element={<List />} />
          <Route path="/quizzes/:id" element={<Detail />} />
          <Route path="/quiz/edit/:id/" element={<Edit />} />
          <Route path="/game_rooms/:code/" element={<GameRoom />} />
          <Route path="/lobby/join" element={<JoinLobby />} />
          <Route path="/lobby/:code" element={<Lobby />} />
          <Route path="/lobby/create" element={<CreateLobby />} />
          <Route
            path="/confirm-email/:uidb64/:token/"
            element={<EmailConfirmation />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
