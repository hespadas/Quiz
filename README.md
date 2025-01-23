# Multiplayer Quiz Application

This repository represents a **multiplayer quiz application** built with a **Django** back end and a **React** front end. The project leverages **real-time communication** via **Django Channels** and WebSockets, enabling users to join lobbies, start games, and answer quiz questions together. It also incorporates **internationalization (i18n)** and various configuration files to streamline development and deployment.

---

## Back End: Django

1. **Django Framework**

   - Provides the main server-side logic and database interactions.
   - Organized into separate apps (`accounts`, `quiz`, `tokens`) for clear separation of concerns.
   - Uses `models` to structure data (e.g., quiz questions, answers, game sessions), and `views` to handle HTTP requests.
   - `serializers` facilitate converting Python objects to JSON (and vice versa) for RESTful APIs.

2. **Django Channels**

   - Extends Django’s capabilities to handle WebSockets, enabling **real-time** features such as live quiz updates and lobby management.
   - **Consumers** (e.g., `GameRoomConsumer`, `LobbyConsumer`) manage events like new connections, quiz state changes, and score submissions.

3. **Database**

   - Includes `db.sqlite3` by default for local development.
   - `migrations` folders contain Django schema changes, ensuring consistent database updates.

4. **Authentication and Token Management**
   - The `tokens` app handles custom token-based authentication.
   - Middleware and managers enable secure request handling and session management.

---

## Front End: React

1. **React Components**

   - Organized by feature: `auth`, `quiz`, `lobby`, `game`, etc.
   - Each component manages specific functionality (e.g., Lobby for waiting rooms, Game for quiz interactions).

2. **WebSocket Integration**

   - Uses the native `WebSocket` API to connect to Django Channels.
   - Handles real-time updates for lobby memberships, question progression, final scores, and more.

3. **Internationalization (i18n)**

   - Implemented with **i18next** for multi-language support (e.g., English, Portuguese).
   - Translation files are located in `public/i18n`, and `src/i18n/i18n.js` configures the i18n setup.

4. **Axios**

   - Centralized in `src/services/axiosConfig.js` for API communication.
   - Automatically attaches credentials (CSRF tokens, Bearer tokens) to each request.
   - Provides a unified error-handling mechanism through interceptors.

5. **Tailwind CSS**

   - `tailwind.config.js` defines custom utility classes and design tokens.
   - Allows quick, consistent, and responsive styling across the application.

6. **Testing**
   - **Jest** is used for unit testing React components.
   - Test files reside in `__tests__` directories, located next to the components or services they cover.

---

## Additional Configuration Files

- **`babel.config.js`**: Manages Babel’s transpilation settings for modern JavaScript.
- **`postcss.config.js`**: Processes CSS, including Tailwind and autoprefixer.
- **`i18next-scanner.config.js`**: Automates extraction of translation keys from source files.
- **`merge-translations.js`**: (If used) Merges translation files into a single structure.
- **`jest.config.js`**: Customizes Jest’s testing environment and coverage thresholds.

---

## How It Works

1. **Lobby Flow**

   - Users authenticate and join a lobby via a unique code.
   - A “host” user controls when the quiz starts by sending a WebSocket message.

2. **Real-Time Gameplay**

   - When the host starts the quiz, participants enter the game room.
   - Questions, answers, and scoring are communicated instantly via WebSockets.

3. **Quiz Submission**

   - Players submit their answers through a REST API endpoint.
   - Final scores are updated and broadcast to all participants in real time.

4. **Internationalized UI**

   - The interface uses `t("key")` calls to fetch translations dynamically for multiple languages.

5. **Security**
   - Token-based authentication ensures only authorized users join or host games.
   - CSRF protection, used with `withCredentials`, adds an extra layer of security.

---
