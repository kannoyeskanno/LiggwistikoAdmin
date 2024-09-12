import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";

import SignUp from "./Signup";
import Login from "./Login";
import Sidebar from "./components/Sidebar";

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/*"
            element={
              <>
                <Sidebar />
                <div className="content">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
