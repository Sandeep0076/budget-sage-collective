import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  session: Session | null;
  profile: any | null;
  logout: () => Promise<void>;
}

/**
 * Authentication hook for managing user sessions with Supabase
 * 
 * This hook provides authentication state and functions for the application.
 * It handles session management, login state, and logout functionality.
 */
export const useAuth = (): AuthState => {
  // Define logout function outside state to avoid circular reference
  const logoutFn = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    profile: null,
    logout: logoutFn
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
            profile: null,
            logout: logoutFn
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
            profile: null,
            logout: logoutFn
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            session: null,
            profile: null,
            logout: logoutFn
          });
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          session: null,
          profile: null,
          logout: logoutFn
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
            profile: null,
            logout: logoutFn
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            session: null,
            profile: null,
            logout: logoutFn
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
