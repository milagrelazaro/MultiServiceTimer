import React from 'react';
import { ActivityProvider } from './src/context/ActivityContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ActivityProvider>
      <AppNavigator />
    </ActivityProvider>
  );
}
