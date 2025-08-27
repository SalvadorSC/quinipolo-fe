import React from "react";
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
} from "./Routes";
import OAuthCallbackHandler from "./Components/OAuthCallbackHandler/OAuthCallbackHandler";

function App() {
  const { userData } = useUser();
  const isAuthenticated = userData.isAuthenticated;

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

                  <Route
                    path="/"
                    element={isAuthenticated ? <MenuBar /> : <Landing />}
                  >
                    <Route
                      path="/"
                      element={isAuthenticated ? <Dashboard /> : null}
                    />
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

                    <Route path="dashboard" element={<Dashboard />} />
                    <Route
                      path="league-dashboard"
                      element={<LeagueDashboard />}
                    />
                    <Route path="profile" element={<Profile />} />
                    <Route path="join-league" element={<LeagueList />} />
                    <Route path="crear-liga" element={<NewLeague />} />
                    <Route path="create-league" element={<CreateLeague />} />
                    <Route path="league-success" element={<LeagueSuccess />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Route>

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
