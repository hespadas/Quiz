import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import { Navigation } from "./components/navigation/Navigation";
import { Home } from "./components/quiz/Home";
import { Login } from "./components/auth/Login";
import { Logout } from "./components/auth/Logout";
import Register from "./components/accounts/Register";
import Creation from "./components/quiz/Creation";
import "./i18n/i18n";
import List from "./components/quiz/List";
import Detail from "./components/quiz/Detail";
import Edit from "./components/quiz/Edit";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateGameRoom from "./components/game/CreateRoom";
import JoinGameRoom from "./components/game/Join";
import GameRoom from "./components/game/Game";
import Lobby from "./components/lobby/Lobby";
import CreateLobby from "./components/lobby/CreateLobby";
import JoinLobby from "./components/lobby/JoinLobby";

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
          <Route path="/game_rooms/create" element={<CreateGameRoom />} />
          <Route path="/game_rooms/join" element={<JoinGameRoom />} />
          <Route path="/game_rooms/:code/" element={<GameRoom />} />
          <Route path="/lobby/join" element={<JoinLobby />} />
          <Route path="/lobby/:code" element={<Lobby />} />
          <Route path="/lobby/create" element={<CreateLobby />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
