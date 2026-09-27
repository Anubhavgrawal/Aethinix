import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import AthleteLayout from "./layouts/AthleteLayout";
import AdminLayout from "./layouts/Admin/AdminLayout";

import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import Organizers from "./pages/Admin/Organizers/Organizers";

import Home from "./pages/Home";
import Tournaments from "./pages/Tournaments";
import Rankings from "./pages/Rankings";
import Players from "./pages/Players";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MyPlayerId from "./pages/MyPlayerId/MyPlayerId";
import MyTournaments from "./pages/MyTournaments/MyTournaments";
import MyFixtures from "./pages/MyFixtures/MyFixtures";
import MyResults from "./pages/MyResults/MyResults";
import MyRanking from "./pages/MyRanking/MyRanking";
import AthleteStatistics from "./pages/Statistics/Statistics";
import Account from "./pages/Account/Account";
import TournamentDetails from "./pages/TournamentDetails/TournamentDetails";

import OrganizerLayout from "./layouts/Organizer/OrganizerLayout";
import OrganizerDashboard from "./pages/Organizer/Dashboard/OrganizerDashboard";
import CreateTournament from "./pages/Organizer/CreateTournament/CreateTournament";
import OrganizerTournaments from "./pages/Organizer/Tournaments/OrganizerTournaments";
import ManageTournament from "./pages/Organizer/ManageTournament/ManageTournament";

import Fixtures from "./pages/Organizer/ManageTournament/Fixtures/Fixtures";
import TournamentResources from "./pages/Organizer/ManageTournament/Resources/TournamentResources";
import Matches from "./pages/Organizer/ManageTournament/Matches/Matches";
import Results from "./pages/Organizer/ManageTournament/Results/Results";
import Ranking from "./pages/Organizer/ManageTournament/Ranking/Ranking";
import OrganizerStatistics from "./pages/Organizer/ManageTournament/Statistics/Statistics";

import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC WEBSITE */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/tournaments"
            element={<Tournaments />}
          />

          <Route
            path="/rankings"
            element={<Rankings />}
          />

          <Route
            path="/players"
            element={<Players />}
          />

          <Route
            path="/results"
            element={<Results />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/tournaments/:slug"
            element={<TournamentDetails />}
          />

          <Route
            path="/organizer/tournaments/create"
            element={<CreateTournament />}
          />
        </Route>

        {/* ORGANIZER PORTAL */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ORGANIZER"]} />
          }
        >
          <Route element={<OrganizerLayout />}>
            <Route
              path="/organizer/dashboard"
              element={<OrganizerDashboard />}
            />

            <Route
              path="/organizer/tournaments"
              element={<OrganizerTournaments />}
            />

            <Route
              path="/organizer/tournaments/create"
              element={<CreateTournament />}
            />

            <Route
              path="/organizer/tournaments/:slug"
              element={<ManageTournament />}
            />

            <Route
              path="/organizer/tournaments/:slug/fixtures"
              element={<Fixtures />}
            />

            <Route
              path="/organizer/tournaments/:slug/matches"
              element={<Matches />}
            />

            <Route
              path="/organizer/tournaments/:slug/results"
              element={<Results />}
            />

            <Route
              path="/organizer/tournaments/:slug/resources"
              element={<TournamentResources />}
            />

            <Route
              path="/organizer/tournaments/:slug/ranking"
              element={<Ranking />}
            />

            <Route
              path="/organizer/tournaments/:slug/statistics"
              element={<OrganizerStatistics />}
            />
          </Route>
        </Route>

        {/* SUPER ADMIN PORTAL */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />
          }
        >
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
          </Route>

          <Route
            path="/admin/organizers"
            element={<Organizers />}
          />
        </Route>

        {/* ATHLETE PORTAL */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["ATHLETE"]} />
          }
        >
          <Route element={<AthleteLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/my-player-id"
              element={<MyPlayerId />}
            />

            <Route
              path="/my-tournaments"
              element={<MyTournaments />}
            />

            <Route
              path="/my-fixtures"
              element={<MyFixtures />}
            />

            <Route
              path="/my-results"
              element={<MyResults />}
            />

            <Route
              path="/my-ranking"
              element={<MyRanking />}
            />

            <Route
              path="/statistics"
              element={<AthleteStatistics />}
            />

            <Route
              path="/account"
              element={<Account />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;