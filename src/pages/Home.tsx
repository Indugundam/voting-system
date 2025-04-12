
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-20 flex flex-col items-center">
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-4xl">V</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Votely</h1>
          <p className="text-xl text-muted-foreground italic">
            "Your Voice. Your Vote. Your Way."
          </p>
        </div>

        <div className="max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-semibold mb-4">
            Secure, Transparent and Democratic Voting Platform
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Votely is designed to make voting accessible and transparent for everyone.
            Our platform ensures that every vote is counted and results are displayed
            in real-time. Join us in making democracy work better.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/login?tab=signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>

        <div className="w-full max-w-5xl bg-card rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">Why Choose Votely?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Secure</h4>
              <p className="text-muted-foreground">End-to-end encryption ensures your vote remains confidential.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Transparent</h4>
              <p className="text-muted-foreground">View real-time results and verify election integrity.</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h4 className="text-xl font-medium mb-2">Accessible</h4>
              <p className="text-muted-foreground">Vote from anywhere, at any time, on any device.</p>
            </div>
          </div>
        </div>

        <footer className="text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Votely. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
