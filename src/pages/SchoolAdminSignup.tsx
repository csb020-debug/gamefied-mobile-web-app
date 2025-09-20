import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Building2 } from 'lucide-react';

const SchoolAdminSignup = () => {
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { signInWithGoogle, user, createUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const saveSchoolInfoToLocalStorage = () => {
    const schoolData = {
      name: schoolName.trim(),
      city: city.trim() || null,
      country: country.trim() || null,
      timestamp: Date.now()
    };
    localStorage.setItem('pendingSchoolInfo', JSON.stringify(schoolData));
  };

  const loadSchoolInfoFromLocalStorage = () => {
    const stored = localStorage.getItem('pendingSchoolInfo');
    if (stored) {
      try {
        const schoolData = JSON.parse(stored);
        if (Date.now() - schoolData.timestamp < 3600000) {
          setSchoolName(schoolData.name || '');
          setCity(schoolData.city || '');
          setCountry(schoolData.country || '');
          return schoolData;
        }
      } catch (error) {
        console.error('Error loading school info from localStorage:', error);
      }
    }
    return null;
  };

  const clearSchoolInfoFromLocalStorage = () => {
    localStorage.removeItem('pendingSchoolInfo');
  };

  useEffect(() => {
    const handleOAuthReturn = async () => {
      if (user && step !== 3) {
        console.log('User returned from OAuth, checking for pending school info...');
        
        const storedSchoolData = loadSchoolInfoFromLocalStorage();
        
        if (storedSchoolData) {
          console.log('Found pending school info, completing registration...');
          setStep(3);
          setIsLoading(true);
          
          try {
            console.log('Creating school with data:', storedSchoolData);
            const { data: schoolData, error: schoolError } = await supabase
              .from('schools')
              .insert({
                name: storedSchoolData.name,
                city: storedSchoolData.city,
                country: storedSchoolData.country,
              })
              .select()
              .single();

            if (schoolError) {
              console.error('Error creating school:', schoolError);
              toast({
                title: "Database Error",
                description: `Please run the SQL fix in your Supabase dashboard. Error: ${schoolError.message}`,
                variant: "destructive",
              });
              setStep(1);
              setIsLoading(false);
              return;
            }

            console.log('School created successfully:', schoolData);
            
            const { error: profileError } = await createUserProfile(
              user.email || '',
              user.user_metadata?.full_name || user.email?.split('@')[0] || 'School Administrator',
              'school_admin',
              schoolData.id
            );

            if (profileError) {
              console.error('Error creating profile:', profileError);
              toast({
                title: "Profile Creation Failed",
                description: profileError.message,
                variant: "destructive",
              });
              setStep(1);
              setIsLoading(false);
              return;
            }

            clearSchoolInfoFromLocalStorage();
            toast({
              title: "Registration Successful!",
              description: "Welcome to the gamified learning platform.",
            });

            navigate('/schools/admin-dashboard');
            
          } catch (error) {
            console.error('Error during registration completion:', error);
            toast({
              title: "Registration Error",
              description: "An error occurred while completing registration.",
              variant: "destructive",
            });
            setStep(1);
          } finally {
            setIsLoading(false);
          }
        } else {
          console.log('No pending school info found, showing form');
          setStep(1);
        }
      }
    };

    handleOAuthReturn();
  }, [user, step, createUserProfile, toast, navigate]);

  const handleNext = async () => {
    if (!schoolName.trim()) {
      toast({
        title: "School name required",
        description: "Please enter your school name to continue.",
        variant: "destructive",
      });
      return;
    }

    saveSchoolInfoToLocalStorage();
    setStep(2);
    
    toast({
      title: "Information Saved",
      description: "Click 'Sign in with Google' to complete registration.",
    });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Sign-in failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Redirecting to Google...",
        description: "You'll be redirected back after signing in.",
      });
      
    } catch (error: any) {
      console.error('Unexpected error during sign-in:', error);
      toast({
        title: "Sign-in error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            School Admin Registration
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? "Enter your school information to get started" 
              : step === 2
              ? "Complete registration with Google sign-in"
              : "Completing your registration..."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="schoolName"
                    type="text"
                    placeholder="Enter your school name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter city (optional)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="country"
                    type="text"
                    placeholder="Enter country (optional)"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button 
                onClick={handleNext}
                disabled={!schoolName.trim() || isLoading}
                className="w-full"
              >
                Next
              </Button>
            </>
          ) : step === 2 ? (
            <>
              <div className="text-center space-y-2">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ School information saved locally
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    School: {schoolName}
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>

              <Button 
                onClick={() => {
                  setStep(1);
                  setSchoolName('');
                  setCity('');
                  setCountry('');
                  clearSchoolInfoFromLocalStorage();
                }}
                variant="ghost"
                className="w-full text-sm"
              >
                ← Back to edit school information
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-blue-800 font-medium">
                    Completing your registration...
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    Creating school and setting up your account
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminSignup;