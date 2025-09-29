import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FacebookLogin } from "./components/Auth/FacebookLogin";
import { Header } from "./components/Layout/Header";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { CalendarView } from "./components/Calendar/CalendarView";
import { ClientManager } from "./components/Clients/ClientManager";
import { ApprovalPage } from "./components/Approval/ApprovalPage";

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<
    "dashboard" | "calendar" | "clients"
  >("dashboard");
  const location = useLocation();

  useEffect(() => {
    const view = localStorage.getItem("redirectToView");
    if (location.pathname === "/" && view === "calendar") {
      setCurrentView("calendar");
      localStorage.removeItem("redirectToView");
    }
  }, [location]);

  if (!isAuthenticated) {
    return <FacebookLogin />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "calendar":
        return <CalendarView />;
      case "clients":
        return <ClientManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Routes>
      <Route path="/approve/:postId" element={<ApprovalPage />} />
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-gray-50">
            <Header currentView={currentView} onViewChange={setCurrentView} />
            {renderCurrentView()}
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
