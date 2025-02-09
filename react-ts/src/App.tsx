import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authApi from "@/api/auth";
import LoginPage from "../src/pages/Login";
import RegisterPage from "../src/pages/Register";
import DocumentsPage from "../src/pages/Documents";
import DocumentTypesPage from "../src/pages/DocumentTypes";
import DocumentDetailsPage from "../src/pages/DocumentDetails";
import NotFoundPage from "../src/pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute"; // A component to guard routes

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await authApi.getUser(); // Fetch authenticated user
        setUser(response.data);
      } catch (error) {
        setUser(null); // User not authenticated
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.loginUser(
        credentials.username,
        credentials.password,
      );
      setUser(response.data); // Set authenticated user
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <BrowserRouter>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/documents" />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/documents" /> : <RegisterPage />}
          />

          {/* Protected Routes (Only for authenticated users) */}
          <Route element={<ProtectedRoute user={user} />}>
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/:id" element={<DocumentDetailsPage />} />
            <Route path="/document-types" element={<DocumentTypesPage />} />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
