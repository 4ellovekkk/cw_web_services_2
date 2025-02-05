import { BrowserRouter, Routes, Route } from 'react-router-dom';
import authApi from "@/api/auth";
import LoginPage from "../src/pages/Login.tsx"
authApi.loginUser("user", "pass");
function App() {
  const handleLogin = async (credentials: LoginCredentials) => {
    // Implement your authentication logic here
    consoe.log("Orda sosat");
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <LoginPage 
            onLogin={handleLogin}
            isLoading={false}
          />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
