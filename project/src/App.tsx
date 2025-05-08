import React, { createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/settings';
import { AuthProvider, useAuth } from './context/AuthContext';

// Gemini context
const GeminiContext = createContext<{ askGemini: (prompt: string) => Promise<string> }>( {
  askGemini: async () => ""
});
export const useGemini = () => useContext(GeminiContext);

// Cohere context
const CohereContext = createContext<{ askCohere: (prompt: string) => Promise<string> }>( {
  askCohere: async () => ""
});
export const useCohere = () => useContext(CohereContext);

// Claude context
const ClaudeContext = createContext<{ askClaude: (prompt: string) => Promise<string> }>( {
  askClaude: async () => ""
});
export const useClaude = () => useContext(ClaudeContext);

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  // Gemini API call
  const askGemini = async (prompt: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      return data.response || "No response from Gemini";
    } catch (error) {
      console.error('Gemini API error:', error);
      return "Error occurred while calling Gemini API.";
    }
  };

  // Cohere API call
  const askCohere = async (prompt: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/cohere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      return data.response || "No response from Cohere";
    } catch (error) {
      console.error('Cohere API error:', error);
      return "Error occurred while calling Cohere API.";
    }
  };



  return (
    <AuthProvider>
      <GeminiContext.Provider value={{ askGemini }}>
        <CohereContext.Provider value={{ askCohere }}>
          
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
          
        </CohereContext.Provider>
      </GeminiContext.Provider>
    </AuthProvider>
  );
}

export default App;
