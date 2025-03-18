import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './hooks/useAuth';
import NavigationStack from './navigation/NavigationStack';
import SplitView from './navigation/SplitView';
import { useWindowDimensions } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import { SafeAreaView, Text, Button } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

function logError(error, componentStack) {
  crashlytics().recordError(error);
  console.error('Error:', error, 'Stack:', componentStack);
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Button 
        title="Try again" 
        onPress={resetErrorBoundary} 
      />
    </SafeAreaView>
  );
}

function App() {
  const { width } = useWindowDimensions();
  const { currentUser, loading } = useAuth();
  const isLargeScreen = width >= 768;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Clear any cached state that might have caused the error
        localStorage.clear();
        sessionStorage.clear();
      }}
    >
      <ThemeProvider>
        <ChatProvider>
          <NavigationContainer>
            {isLargeScreen ? (
              <SplitView />
            ) : (
              <NavigationStack />
            )}
          </NavigationContainer>
        </ChatProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

