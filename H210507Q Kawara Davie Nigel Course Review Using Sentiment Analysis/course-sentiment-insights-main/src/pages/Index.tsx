
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  // If authenticated, redirect to dashboard, otherwise to login
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
