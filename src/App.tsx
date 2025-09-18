import React, { useEffect, useRef } from "react";
import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { UserProvider, useUser } from "./Context/UserContext/UserContext";
import { FeedbackProvider } from "./Context/FeedbackContext/FeedbackContext";
import { ThemeProvider } from "./Context/ThemeContext/ThemeContext";
import MenuBar from "./Components/MenuBar/MenuBar";
import {
  AnswersForm,
  CorrectionSuccess,
  CreateLeague,
  Dashboard,
  Landing,
  LeagueDashboard,
  Profile,
  LeagueList,
  LeagueSuccess,
  LoginForm,
  NewLeague,
  QuinipoloSuccess,
  ResetPassword,
  SignUpForm,
  EmailConfirmation,
  SurveyForm,
  Admin,
} from "./Routes";
import OAuthCallbackHandler from "./Components/OAuthCallbackHandler/OAuthCallbackHandler";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import { trackPageView } from "./utils/analytics";

// Custom hook to handle URL cleanup
function useUrlCleanup() {
  useEffect(() => {
    // Clean up trailing hash fragments (like /dashboard#)
    if (window.location.hash === "#") {
      // Remove the empty hash without triggering a page reload
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);
}

function App() {
  const { userData } = useUser();
  const isAuthenticated = userData.isAuthenticated;
  const authInitialized = userData.authInitialized;
  const shouldShowAuthed = Boolean(authInitialized && isAuthenticated);

  // Use the URL cleanup hook
  useUrlCleanup();

  // Track page views on route changes (must be inside Router)
  function RouteChangeTracker() {
    const location = useLocation();
    const lastPathRef = useRef<string | null>(null);
    useEffect(() => {
      const path = location.pathname + location.search;
      if (lastPathRef.current === path) return;
      lastPathRef.current = path;
      console.debug("[Analytics] route change detected", { path });
      trackPageView(path);
    }, [location]);
    return null;
  }

  return (
    <BrowserRouter>
      <RouteChangeTracker />
      <FeedbackProvider>
        <UserProvider>
          <ThemeProvider>
            <OAuthCallbackHandler>
              <Routes>
                <Route path="/sign-in" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route
                  path="/email-confirmation"
                  element={<EmailConfirmation />}
                />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Authenticated Routes */}
                {shouldShowAuthed ? (
                  <Route path="/" element={<MenuBar />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="crear-quinipolo" element={<SurveyForm />} />
                    <Route
                      path="quinipolo-success"
                      element={<QuinipoloSuccess />}
                    />
                    <Route
                      path="correction-success"
                      element={<CorrectionSuccess />}
                    />
                    <Route path="quinipolo" element={<AnswersForm />}>
                      <Route path="correct" element={<AnswersForm />} />
                    </Route>
                    <Route
                      path="league-dashboard"
                      element={<LeagueDashboard />}
                    />
                    <Route path="profile" element={<Profile />} />
                    <Route path="join-league" element={<LeagueList />} />
                    <Route path="crear-liga" element={<NewLeague />} />
                    <Route path="create-league" element={<CreateLeague />} />
                    <Route path="league-success" element={<LeagueSuccess />} />
                    <Route
                      path="admin"
                      element={
                        <ProtectedRoute requireAdmin={true} fallbackPath="/">
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Route>
                ) : (
                  /* Unauthenticated Routes */
                  <Route path="/" element={<Landing />} />
                )}

                {/* 404 Page - Catch all unmatched routes */}
                <Route path="*" element={<Landing />} />
              </Routes>
            </OAuthCallbackHandler>
          </ThemeProvider>
        </UserProvider>
      </FeedbackProvider>
    </BrowserRouter>
  );
}

export default App;
