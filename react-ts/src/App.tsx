import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authApi from "@/api/auth";
import LoginPage from "../src/pages/Login";
import RegisterPage from "../src/pages/Register";
//import DocumentsPage from "../src/pages/Documents"; // Uncommented for use
//import DocumentTypesPage from "../src/pages/DocumentTypes"; // Uncommented for use
//import DocumentDetailsPage from "../src/pages/DocumentDetails"; // Uncommented for use
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

  const handleLogin = async (credentials) => {
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

  if (isLoading) {
    return <p>Loading...</p>; // Show loading state while checking auth
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/documents" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/documents" replace /> : <RegisterPage />
          }
        />

        {/* Protected Routes (Only for authenticated users) */}
        {/*        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/:id" element={<DocumentDetailsPage />} />
          <Route path="/document-types" element={<DocumentTypesPage />} />
        </Route>*/}

        {/* Catch-all Route for Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
