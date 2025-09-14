import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const AuthWrapper = ({ children }) => {
  const { isLoading, isInitialized } = useAuth();

  // Show a loading indicator while checking auth status
  if (isLoading || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default AuthWrapper;