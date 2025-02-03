
import axios from "axios";

// Define the structure of the user object for registration
interface RegisterUserData {
  username: string;
  password: string;
  role: "Administrator" | "Worker" | "Student";
}

// Define the structure of the login response
interface LoginResponse {
  role: number;
}

// Define the structure of error responses
interface ApiError {
  error: string;
}

const API_URL = "https://localhost:3000/auth";

axios.defaults.withCredentials = true; // Ensures cookies are sent with requests

// Function to log in a user
export const loginUser = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error: any) {
    throw (error.response?.data as ApiError) || { error: "Login failed" };
  }
};

// Function to log out a user
export const logoutUser = async (): Promise<void> => {
  try {
    await axios.get(`${API_URL}/logout`);
  } catch (error: any) {
    throw (error.response?.data as ApiError) || { error: "Logout failed" };
  }
};

// Function to register a user
export const registerUser = async (userData: RegisterUserData): Promise<void> => {
  try {
    await axios.post(`${API_URL}/register`, userData);
  } catch (error: any) {
    throw (error.response?.data as ApiError) || { error: "Registration failed" };
  }
};

