
/**
 * Auth Page
 * 
 * Handles user authentication with sign-in and sign-up forms.
 * Provides a simple interface for users to create an account
 * or log into their existing account.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import CustomCard, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CustomCard';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password, rememberMe);
        navigate('/');
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Budget Sage</h1>
          <p className="text-muted-foreground mt-1">
            {isSignUp ? 'Create an account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <CustomCard className="w-full">
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              {!isSignUp && (
                <div className="flex items-center space-x-3 mt-4">
                  <div 
                    className={`flex justify-center items-center h-5 w-5 rounded-sm cursor-pointer ${rememberMe ? 'bg-white' : 'bg-transparent border-2 border-white'}`}
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    {rememberMe && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                  <span 
                    className="text-sm font-medium text-white cursor-pointer"
                    onClick={() => setRememberMe(!rememberMe)}
                  >
                    Remember me
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? 'Loading...'
                  : isSignUp
                  ? 'Create Account'
                  : 'Sign In'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </CustomCard>
      </div>
    </div>
  );
};

export default Auth;
