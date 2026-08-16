import {
  createContext,
  useContext,
  useState,
} from "react";

import api from "../services/api";


// ==========================================
// CREATE CONTEXT
// ==========================================

const AuthContext = createContext();


// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({
  children,
}) => {

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });


  const [loading, setLoading] =
    useState(false);


  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    email,
    password
  ) => {

    try {

      setLoading(true);

      const response =
        await api.post(
          "/auth/login",
          {
            email,
            password,
          }
        );

      const {
        token,
        user,
      } = response.data;

      // Save token
      localStorage.setItem(
        "token",
        token
      );

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setUser(user);

      return {
        success: true,
        user,
      };

    } catch (error) {

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed",
      };

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);

  };


  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {

  return useContext(
    AuthContext
  );

};