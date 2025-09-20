
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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

const Index: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { currentStudent, currentClass } = useStudent();

  return (
    <div className="min-h-screen bg-background relative">
      <Hero />
      <Features />
      <StudySmarter />
      <NoMoreStuck />
      
      {/* Entry Points Section - Only show if user is not logged in */}
      {!user && (
        <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Get Started with <span className="text-primary">EcoQuest</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join the environmental education revolution. Choose your path to start learning and playing together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Students */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Students</CardTitle>
                <CardDescription>
                  Join your class with a simple code and start your eco-adventure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <span>Enter class code or use teacher's link</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <span>Choose your nickname</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <span>Play games and earn points</span>
                    </div>
                  </div>
                  <Link to="/join" className="block">
                    <Button className="w-full group">
                      Join Class
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Teachers */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <GraduationCap className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Teachers</CardTitle>
                <CardDescription>
                  Create classes, assign activities, and track student progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                      <span>Sign up with email (magic link)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                      <span>Create and manage classes</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                      <span>Assign games and track results</span>
                    </div>
                  </div>
                  <Link to="/teachers/signup" className="block">
                    <Button variant="secondary" className="w-full group">
                      Teacher Sign Up
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Schools */}
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <School className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Schools</CardTitle>
                <CardDescription>
                  Enterprise solutions for educational institutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      <span>Bulk teacher registration</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      <span>School-wide analytics</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      <span>Custom curriculum integration</span>
                    </div>
                  </div>
                  <Link to="/schools/register" className="block">
                    <Button variant="outline" className="w-full group">
                      Register Your School
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
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
