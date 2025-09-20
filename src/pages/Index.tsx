
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import Hero from "@/components/learning-companion/Hero";
import Features from "@/components/learning-companion/Features";
import StudySmarter from "@/components/learning-companion/StudySmarter";
import NoMoreStuck from "@/components/learning-companion/NoMoreStuck";
import Footer from "@/components/learning-companion/Footer";
import Navbar from "@/components/learning-companion/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, School, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStudent } from "@/hooks/useStudent";
import { useEffect } from "react";

const Index: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const { currentStudent, currentClass } = useStudent();
  const navigate = useNavigate();

  // Auto-redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      console.log('Index: User authenticated:', user.id);
      
      if (userProfile) {
        console.log('Index: User has profile with role:', userProfile.role);
        
        if (userProfile.role === 'school_admin' && userProfile.school_id) {
          console.log('Index: Redirecting school admin to dashboard');
          navigate('/schools/admin-dashboard');
        } else if (userProfile.role === 'school_admin' && !userProfile.school_id) {
          console.log('Index: Redirecting school admin to complete school setup');
          navigate('/school-admin/signup');
        } else if (userProfile.role === 'teacher') {
          console.log('Index: Redirecting teacher to dashboard');
          navigate('/teacher/dashboard');
        } else if (userProfile.role === 'student') {
          console.log('Index: Redirecting student to dashboard');
          navigate('/student/dashboard');
        }
      } else {
        // User is authenticated but has no profile - likely new Google OAuth user
        console.log('Index: Authenticated user has no profile, redirecting to school admin signup');
        navigate('/school-admin/signup');
      }
    }
  }, [user, userProfile, loading, navigate]);

  return (
    <div className="min-h-screen bg-background relative">
      <Hero />
      <Features />
      <StudySmarter />
      <NoMoreStuck />
      
      {/* School Admin Only Section */}
      {!user && (
        <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Welcome to <span className="text-primary">EcoQuest</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The gamified environmental education platform. Currently, only school administrators can create accounts.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">School Administrator Registration</h3>
              <p className="text-amber-700 mb-4">
                To get started, you'll first provide some basic school information, then authenticate with your Google account to complete the registration process.
              </p>
              <Link to="/school-admin/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start School Registration
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* How It Works */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">How It Works</CardTitle>
                <CardDescription>
                  The EcoQuest platform follows a structured approach to ensure quality education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">School Registration</h4>
                      <p className="text-sm text-muted-foreground">School administrators register their school using Google OAuth</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Teacher Invitations</h4>
                      <p className="text-sm text-muted-foreground">Admins invite teachers to join their school</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Class Creation</h4>
                      <p className="text-sm text-muted-foreground">Teachers create classes and share codes with students</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Student Learning</h4>
                      <p className="text-sm text-muted-foreground">Students join classes and start their eco-adventure</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Platform Benefits</CardTitle>
                <CardDescription>
                  Why EcoQuest is the perfect choice for environmental education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Secure Google OAuth authentication</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Controlled access through school administrators</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Gamified learning experience</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Real-time progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Environmental education focus</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Easy class management</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Already have an account? Teachers can access their dashboard after signing in.
            </p>
          </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
