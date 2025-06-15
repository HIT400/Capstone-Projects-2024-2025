
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart3, FileText, Home, LogOut, MessageSquare, User, GraduationCap, School, Shield, Settings } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isLecturer = user?.role === "lecturer";
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="flex-col items-start p-4">
        <h2 className="text-lg font-semibold">Course Sentiment Analysis</h2>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? (
            <span className="flex items-center gap-1"><Shield size={16} /> Admin Portal</span>
          ) : isLecturer ? (
            <span className="flex items-center gap-1"><GraduationCap size={16} /> Lecturer Portal</span>
          ) : (
            <span className="flex items-center gap-1"><School size={16} /> Student Portal</span>
          )}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate(isAdmin ? "/admin" : isLecturer ? "/lecturer" : "/")}>
                  <Home size={20} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isStudent && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate("/feedback")}>
                    <MessageSquare size={20} />
                    <span>Submit Feedback</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {(isAdmin || isLecturer) && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate("/analytics")}>
                    <BarChart3 size={20} />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => navigate("/reports")}>
                    <FileText size={20} />
                    <span>Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/profile")}>
                  <User size={20} />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenuButton onClick={logout} className="w-full justify-start">
          <LogOut size={20} />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">
                {user?.role === "admin" 
                  ? "Admin Management Portal" 
                  : user?.role === "lecturer" 
                    ? "Lecturer Feedback Portal" 
                    : "Student Feedback System"}
              </h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
