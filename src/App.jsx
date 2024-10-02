import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Sidebar from "./components/Sidebar/Sidebar";
import SignUp from "./Signup";
import Login from "./pages/Login/Login";
import Settings from "./pages/Settings/Settings";
import Toolbar from "./components/Toolbar/Toolbar";
import ContributionManagement from "./pages/ContributionManagement/ContributionManagement";
import Comments from "./pages/Comments/Comments";
import Account from "./pages/AccountManagement/Account";
import Dialect from "./pages/Dialect/Dialect";
import Analytics from "./pages/Analytics/Analytics";
import './style/Root.css';

const App = () => {
  const isAuthenticated = false; // Change this according to your authentication logic

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? ( // Check if the user is authenticated
                <div className="app-layout">
                  <Sidebar />
                  <div className="content">
                    <Toolbar />
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/userManagement" element={<Account />} />
                      <Route path="/contributionManagement" element={<ContributionManagement />} />
                      <Route path="/dialectCategories" element={<Dialect />} />
                      <Route path="/comments" element={<Comments />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </div>
                </div>
              ) : (
                <Navigate to="/login" /> // Redirect to login if not authenticated
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
