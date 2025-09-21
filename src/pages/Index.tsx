
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Hero from "@/components/learning-companion/Hero";
import Features from "@/components/learning-companion/Features";
import StudySmarter from "@/components/learning-companion/StudySmarter";
import NoMoreStuck from "@/components/learning-companion/NoMoreStuck";
import Footer from "@/components/learning-companion/Footer";
import Navbar from "@/components/learning-companion/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, School, ArrowRight, Settings, BarChart3 } from "lucide-react";
import { SupabaseConnectionTest } from "@/components/SupabaseConnectionTest";

const Index: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('Index.tsx - Auth state:', { user: !!user, userProfile: !!userProfile, loading });

  // Redirect authenticated users with profiles to their appropriate dashboards
  useEffect(() => {
    if (!loading && user && userProfile) {
      console.log('Redirecting user with role:', userProfile.role);
      if (userProfile.role === 'school_admin') {
        navigate('/schools/admin-dashboard', { replace: true });
      } else if (userProfile.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (userProfile.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, userProfile, loading, navigate]);

  // Show loading for a maximum of 3 seconds, then show content anyway
  const [forceShowContent, setForceShowContent] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShowContent(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication (but not indefinitely)
  if (loading && !forceShowContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authenticated user content if user exists but no profile (incomplete registration)
  if (user && !userProfile) {
    return (
      <div className="min-h-screen bg-background relative">
        <Hero />
        <Features />
        <StudySmarter />
        <NoMoreStuck />
        
        {/* Registration Completion Section */}
        <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Complete Your <span className="text-primary">Registration</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                You're signed in as {user.email}. Complete your school registration to access your dashboard.
              </p>
            </div>

            <div className="flex justify-center">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 group max-w-md w-full">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <School className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">Complete School Setup</CardTitle>
                  <CardDescription>
                    Finish setting up your school to access your administrator dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        <span>Create your school profile</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        <span>Access administrator tools</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                        <span>Start managing your school</span>
                      </div>
                    </div>
                    <Link to="/schools/register" className="block">
                      <Button className="w-full group">
                        Continue Setup
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Show default landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background relative">
      <Hero />
      <Features />
      <StudySmarter />
      <NoMoreStuck />
      
      {/* Entry Points Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Get Started with <span className="text-primary">EcoQuest</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Register your school to access environmental education tools for teachers and students.
            </p>
          </div>

          <div className="flex justify-center">
            {/* Schools */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 group max-w-md w-full">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <School className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">School Registration</CardTitle>
                <CardDescription>
                  Register your educational institution to get started with EcoQuest
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      <span>Manage teachers and classes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      <span>School-wide analytics and reporting</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      <span>Environmental education curriculum</span>
                    </div>
                  </div>
                  <Link to="/schools/register" className="block">
                    <Button className="w-full group">
                      Register School
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Already registered? School administrators can access their dashboard after signing in.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
