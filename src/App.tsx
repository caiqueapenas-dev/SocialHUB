import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FacebookLogin } from './components/Auth/FacebookLogin';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { CalendarView } from './components/Calendar/CalendarView';
import { ClientManager } from './components/Clients/ClientManager';
import { ApprovalPage } from './components/Approval/ApprovalPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'clients'>('dashboard');

  if (!isAuthenticated) {
    return <FacebookLogin />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'clients':
        return <ClientManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
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
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;