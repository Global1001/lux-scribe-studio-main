import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration."
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-editor-background text-text-primary overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="relative">
            <FileText className="h-10 w-10 text-accent-blue" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-blue rounded-full opacity-60 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-text-primary tracking-tight">LuxScribe</span>
            <span className="text-xs text-text-muted font-medium">Premium Document Editor</span>
          </div>
        </div>

        <Card className="bg-editor-surface/80 border-editor-border backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-text-primary mb-2">Welcome</CardTitle>
            <CardDescription className="text-text-secondary text-sm leading-relaxed">
              Create an account or sign in to get started with <span className="font-medium text-accent-blue">100 free credits</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Tabs value={isSignUp ? "signup" : "signin"} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-editor-surface-hover border border-editor-border">
                <TabsTrigger 
                  value="signin" 
                  onClick={() => setIsSignUp(false)}
                  className="data-[state=active]:bg-accent-blue data-[state=active]:text-text-inverse data-[state=active]:shadow-sm font-medium transition-all duration-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setIsSignUp(true)}
                  className="data-[state=active]:bg-accent-blue data-[state=active]:text-text-inverse data-[state=active]:shadow-sm font-medium transition-all duration-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-text-primary font-medium text-sm">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="bg-content-background border-editor-border text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 transition-all duration-200 h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-text-primary font-medium text-sm">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="bg-content-background border-editor-border text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 transition-all duration-200 h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-accent-blue hover:bg-accent-blue-hover text-text-inverse font-medium py-3 h-12 transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-text-primary font-medium text-sm">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="bg-content-background border-editor-border text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 transition-all duration-200 h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-text-primary font-medium text-sm">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      required
                      minLength={6}
                      className="bg-content-background border-editor-border text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20 transition-all duration-200 h-11"
                    />
                    <p className="text-xs text-text-muted">Password must be at least 6 characters long</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-accent-blue hover:bg-accent-blue-hover text-text-inverse font-medium py-3 h-12 transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            By creating an account, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}