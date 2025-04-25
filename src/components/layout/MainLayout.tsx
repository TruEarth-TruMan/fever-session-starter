
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, Home, LayoutDashboard, Music } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const { isSubscribed, tier } = useSubscription();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="min-h-screen bg-fever-black text-fever-light flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-fever-dark/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-fever-amber font-bold text-lg">
              FEVER
            </Link>
            
            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/">
                <Button 
                  variant={isActive('/') ? "default" : "ghost"} 
                  className="gap-1.5"
                  size="sm"
                >
                  <Home size={18} />
                  <span>Home</span>
                </Button>
              </Link>
              
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? "default" : "ghost"}
                  className="gap-1.5"
                  size="sm"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              {user && isSubscribed && (
                <Link to="/sessions">
                  <Button 
                    variant={isActive('/sessions') ? "default" : "ghost"}
                    className="gap-1.5"
                    size="sm"
                  >
                    <Music size={18} />
                    <span>Sessions</span>
                  </Button>
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {!isSubscribed && (
                  <Link to="/marketplace">
                    <Button 
                      variant="outline" 
                      className="gap-1.5 border-fever-amber/30 text-fever-amber"
                      size="sm"
                    >
                      <Sparkles className="h-4 w-4 text-fever-amber" />
                      <span>Upgrade</span>
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-fever-light/70 hover:text-fever-light"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign out</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-fever-dark/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-fever-light/50">
          <p>© {new Date().getFullYear()} Fever Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
