import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { School } from 'lucide-react';

const SchoolsRegister = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [country, setCountry] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, createUserProfile } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fullName.trim()) return;
    
    if (!user) {
      toast({ 
        title: 'Authentication Required', 
        description: 'Please sign in first to register a school', 
        variant: 'destructive' 
      });
      navigate('/teachers/signup');
      return;
    }

    setLoading(true);
    try {
      // Create school
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: name.trim(),
          address: address || null,
          city: city || null,
          state: stateRegion || null,
          country: country || null,
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Create school admin profile
      const { error: profileError } = await createUserProfile(
        user.email || '',
        fullName.trim(),
        'school_admin',
        schoolData.id
      );

      if (profileError) throw profileError;

      toast({ 
        title: 'School registered successfully!', 
        description: `Welcome to ${schoolData.name} as the school administrator` 
      });
      
      navigate('/schools/admin-dashboard');
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to register school', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <School className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Register Your School</CardTitle>
          <CardDescription>Optional: helps organize classes under a school</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., John Smith" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">School Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Green Valley School" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, Area" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !name.trim() || !fullName.trim()}>
              {loading ? 'Registering...' : 'Register School & Become Admin'}
            </Button>
            <Button variant="ghost" className="w-full" type="button" onClick={() => navigate('/')}>Back to Home</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolsRegister;


