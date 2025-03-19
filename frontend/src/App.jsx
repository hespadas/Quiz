import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import "./i18n/i18n";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigation } from "./components/layout/Navigation";
import { Logout } from "./components/auth/Logout";
import Home from "./pages/Home/Home";
import GameRoom from "./pages/Game/Game";
import { Login } from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Creation from "./pages/Quiz/QuizCreate/Creation";
import List from "./pages/Quiz/QuizList/List";
import Detail from "./pages/Quiz/QuizDetail/Detail";
import Edit from "./pages/Quiz/QuizEdit/Edit";
import EditQuestions from "./pages/Quiz/QuizEdit/EditQuestions";
import JoinLobby from "./pages/Lobby/LobbyJoin/JoinLobby";
import Lobby from "./pages/Lobby/Lobby/Lobby";
import CreateLobby from "./pages/Lobby/LobbyCreate/CreateLobby";
import EmailConfirmation from "./pages/Auth/EmailConfirmation/EmailConfirmation";
import ForgotPassword from "./pages/Auth/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";

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
          <Route path="/quiz/:id/edit-questions/" element={<EditQuestions />} />
          <Route path="/game_rooms/:code/" element={<GameRoom />} />
          <Route path="/lobby/join" element={<JoinLobby />} />
          <Route path="/lobby/:code" element={<Lobby />} />
          <Route path="/lobby/create" element={<CreateLobby />} />
          <Route
            path="/confirm-email/:uidb64/:token/"
            element={<EmailConfirmation />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:uidb64/:token"
            element={<ResetPassword />}
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
