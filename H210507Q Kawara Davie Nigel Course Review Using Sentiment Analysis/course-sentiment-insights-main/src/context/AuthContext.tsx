
import React, { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";

type UserRole = "admin" | "student" | "lecturer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: "student" | "lecturer" | "admin") => Promise<void>;
  signup: (name: string, email: string, password: string, role: "student" | "lecturer" | "admin") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In-memory storage for users
// In a production environment, this would be stored in a database
const users: User[] = [];

// In-memory credential storage
// In a production environment, this would be hashed and stored in a database
const credentials: Record<string, {password: string, role: "student" | "lecturer" | "admin"}> = {};

// Add a default admin user
const adminUser: User = {
  id: "admin-1",
  name: "System Administrator",
  email: "admin@example.com",
  role: "admin"
};
users.push(adminUser);
credentials[adminUser.email] = { password: "admin123", role: "admin" };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: "student" | "lecturer" | "admin") => {
    try {
      // Check if email exists in credentials
      if (!credentials[email]) {
        toast.error("User not found");
        throw new Error("User not found");
      }
      
      // Check if password matches
      if (credentials[email].password !== password) {
        toast.error("Invalid credentials");
        throw new Error("Invalid credentials");
      }
      
      // Check if role matches
      if (credentials[email].role !== role) {
        toast.error(`Invalid login. This account is registered as a ${credentials[email].role}`);
        throw new Error("Role mismatch");
      }
      
      // Find user data
      const userData = users.find(u => u.email === email);
      if (userData) {
        setUser(userData);
        toast.success("Logged in successfully");
      } else {
        toast.error("User data not found");
        throw new Error("User data not found");
      }
    } catch (error) {
      toast.error("Login failed");
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: "student" | "lecturer" | "admin") => {
    try {
      // Check if email already exists
      if (credentials[email]) {
        toast.error("User already exists with this email");
        throw new Error("User already exists");
      }
      
      // Create new user
      const newUser: User = {
        id: (users.length + 1).toString(),
        name,
        email,
        role,
      };
      
      // Store user and credentials
      users.push(newUser);
      credentials[email] = { password, role };
      
      toast.success("Account created successfully");
      
      // Auto-login after signup
      setUser(newUser);
    } catch (error) {
      toast.error("Sign up failed");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info("Logged out successfully");
  };
  
  const getAllUsers = () => {
    return [...users];
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    getAllUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
