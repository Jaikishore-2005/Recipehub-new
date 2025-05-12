
import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Check if we're on login or signup pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Only render sidebar components if authenticated and not on auth pages
  const showSidebar = isAuthenticated && !isAuthPage;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop - only show if authenticated */}
      {!isMobile && showSidebar && (
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <Sidebar />
        </div>
      )}
      
      {/* Mobile sidebar drawer - only show if authenticated */}
      {isMobile && sidebarOpen && showSidebar && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-background shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-full bg-muted/50 hover:bg-muted"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Top bar - only show if authenticated */}
        {showSidebar && (
          <header className="h-16 border-b border-border flex items-center px-4 sticky top-0 bg-background z-10">
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-md hover:bg-muted"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 flex items-center">
              <img 
                src="/lovable-uploads/3254d9db-868b-4134-9d0a-f642494baf9b.png" 
                alt="RecipeHub Logo" 
                className="h-8 w-auto mr-2" 
              />
              <div>
                <div className="text-lg font-medium">RecipeHub</div>
                <div className="text-xs text-muted-foreground">Where Recipe Meets Collaboration</div>
              </div>
            </div>
          </header>
        )}
        
        {/* Main content */}
        <main className={`flex-1 ${isAuthPage ? 'p-0' : 'p-4 md:p-6'} overflow-auto bg-background`}>
          {isAuthPage ? (
            children
          ) : (
            <div className="container mx-auto max-w-6xl">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
