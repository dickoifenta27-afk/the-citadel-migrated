import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
// Add page imports here
import Layout from './Layout';
import LoginPage from './pages/LoginPage';
import MainMenu from './pages/MainMenu';
import Citadel from './pages/Citadel';
import Marketplace from './pages/Marketplace';
import HallOfLawsPage from './pages/HallOfLawsPage';
import Architect from './pages/Architect';
import Diplomacy from './pages/Diplomacy';
import WarRoom from './pages/WarRoom';
import TechLab from './pages/TechLab';
import Infrastructure from './pages/Infrastructure';

// Protected Route Component
const ProtectedRoute = ({ children, requireDeveloper = false }) => {
  const { isAuthenticated, isDeveloper, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#c9a84c', fontFamily: 'Cinzel Decorative' }}>
            The Citadel
          </h1>
          <div className="w-8 h-8 border-4 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireDeveloper && !isDeveloper) {
    return <Navigate to="/MainMenu" replace />;
  }
  
  return children;
};

const AuthenticatedApp = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#c9a84c', fontFamily: 'Cinzel Decorative' }}>
            The Citadel
          </h1>
          <div className="w-8 h-8 border-4 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render the main app
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/MainMenu" /> : <LoginPage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/MainMenu" replace />} />
      <Route path="/MainMenu" element={
        <ProtectedRoute>
          <MainMenu />
        </ProtectedRoute>
      } />
      
      {/* Game Routes with Layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/Citadel" element={<Citadel />} />
        <Route path="/Marketplace" element={<Marketplace />} />
        <Route path="/HallOfLawsPage" element={<HallOfLawsPage />} />
        <Route path="/Diplomacy" element={<Diplomacy />} />
        <Route path="/WarRoom" element={<WarRoom />} />
        <Route path="/TechLab" element={<TechLab />} />
        <Route path="/Infrastructure" element={<Infrastructure />} />
        
        {/* Developer Only - Architect */}
        <Route path="/Architect" element={
          <ProtectedRoute requireDeveloper={true}>
            <Architect />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
