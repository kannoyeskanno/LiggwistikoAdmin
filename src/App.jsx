import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Library from "./pages/Library/Library";
import './style/Root.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/*"
            element={
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
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/library/:email" element={<Library />} /> 
                  </Routes>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
