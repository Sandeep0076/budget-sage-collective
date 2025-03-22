import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  session: Session | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
  });

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            session: null,
          });
          return;
        }

        if (data.session) {
          const { user } = data.session;
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            session: data.session,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            session: null,
          });
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          session: null,
        });
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: session.user,
            session,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            session: null,
          });
        }
      }
    );

    // Check session immediately
    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};
