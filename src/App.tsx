import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
  NoMatch,
} from "./Routes";
import OAuthCallbackHandler from "./Components/OAuthCallbackHandler/OAuthCallbackHandler";

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

  // Use the URL cleanup hook
  useUrlCleanup();

  return (
    <React.StrictMode>
      <BrowserRouter>
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

                  {/* Auth callback route for magic link deep linking */}
                  {/* <Route path="auth/callback" element={<AuthCallback />} /> */}

                  {/* Authenticated Routes */}
                  {isAuthenticated ? (
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
                      <Route
                        path="league-success"
                        element={<LeagueSuccess />}
                      />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                  ) : (
                    /* Unauthenticated Routes */
                    <Route path="/" element={<Landing />} />
                  )}

                  {/* 404 Page - Catch all unmatched routes */}
                  {/* <Route path="*" element={<NoMatch />} /> */}
                </Routes>
              </OAuthCallbackHandler>
            </ThemeProvider>
          </UserProvider>
        </FeedbackProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;
