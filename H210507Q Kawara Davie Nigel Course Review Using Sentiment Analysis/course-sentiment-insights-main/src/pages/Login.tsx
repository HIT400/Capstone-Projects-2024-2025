
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, School, User, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"student" | "lecturer" | "admin">("student");
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password, userType);
      if (userType === "admin") {
        navigate("/admin");
      } else if (userType === "lecturer") {
        navigate("/lecturer");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signup(name, email, password, userType);
      toast.success("Account created successfully. Logging you in...");
      if (userType === "admin") {
        navigate("/admin");
      } else if (userType === "lecturer") {
        navigate("/lecturer");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Course Sentiment Analysis System</CardTitle>
            <CardDescription className="text-center">
              {userType === "student" ? "Student Portal" : 
               userType === "lecturer" ? "Lecturer Portal" : "Admin Portal"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6 space-x-2">
              <Button 
                variant={userType === "student" ? "default" : "outline"} 
                onClick={() => setUserType("student")}
                className="flex items-center gap-1 text-sm px-2"
              >
                <School size={16} />
                Student
              </Button>
              <Button 
                variant={userType === "lecturer" ? "default" : "outline"} 
                onClick={() => setUserType("lecturer")}
                className="flex items-center gap-1 text-sm px-2"
              >
                <GraduationCap size={16} />
                Lecturer
              </Button>
              <Button 
                variant={userType === "admin" ? "default" : "outline"} 
                onClick={() => setUserType("admin")}
                className="flex items-center gap-1 text-sm px-2"
              >
                <Shield size={16} />
                Admin
              </Button>
            </div>
          
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your-email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {userType === "admin" && (
                    <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground">
                      <p className="font-medium">Admin Login</p>
                      <p>Email: admin@example.com</p>
                      <p>Password: admin123</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="your-email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {userType === "admin" && (
                    <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800">
                      <p className="font-medium">Note:</p>
                      <p>Admin accounts should only be created by authorized personnel.</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-center text-muted-foreground mt-2">
              By signing in, you agree to our terms and conditions.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
