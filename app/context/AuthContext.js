import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";  // Updated import path
import { router } from "expo-router";

// Remove these imports if you don't have these files
// import notificationService from "../services/NotificationService";
// import { useNotifications } from "../hooks/useNotifications";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Remove this if you don't have useNotifications hook
  // const { sendWelcomeNotification } = useNotifications();

  useEffect(() => {
    // Remove if you don't have notifications
    // initializeNotifications();
    
    checkAuthStatus();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Remove if you don't have notifications
  /*
  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  };
  */

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Remove if you don't have notifications
      /*
      // Send welcome notification
      const userName = data.user.user_metadata?.firstName || 
                      data.user.email?.split("@")[0] || "User";
      await sendWelcomeNotification(userName);
      */

      return data;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const signUp = async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            dob: userData.dob,
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Remove if you don't have notifications
      // await notificationService.cancelAllNotifications();
      
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) throw error;
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'parkme://reset-password',
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isInitialized,
    login,
    signUp,
    logout,
    updateUserProfile,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};