import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Settings from './pages/Settings';
import ListContainer from './components/ListContainer';
import { useAuth } from './contexts/AuthContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }>
              <Route path="/" element={<Home />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/:type" element={<ListContainer />} />
              <Route path="/:type/:id" element={<ListContainer />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;