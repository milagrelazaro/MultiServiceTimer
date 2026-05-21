import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import NewActivityScreen from '../screens/NewActivityScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ClientsScreen from '../screens/ClientsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Clients') {
            iconName = focused ? 'people' : 'people-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Início' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Histórico' }}
      />
      <Tab.Screen 
        name="Clients" 
        component={ClientsScreen} 
        options={{ title: 'Clientes' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="NewActivity" 
          component={NewActivityScreen}
          options={{ title: 'Nova Atividade' }}
        />
        <Stack.Screen 
          name="ActivityDetail" 
          component={ActivityDetailScreen}
          options={{ title: 'Detalhes da Atividade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
