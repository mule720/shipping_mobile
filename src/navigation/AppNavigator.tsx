import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator as createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { ShipmentsScreen } from '../screens/main/ShipmentsScreen';
import { ShipmentDetailScreen } from '../screens/main/ShipmentDetailScreen';
import { CreateShipmentScreen } from '../screens/main/CreateShipmentScreen';
import { TrackingScreen } from '../screens/main/TrackingScreen';
import { OperationsScreen } from '../screens/main/OperationsScreen';
import { BusinessScreen } from '../screens/main/BusinessScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AccountSettingsScreen } from '../screens/profile/AccountSettingsScreen';
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { SubscriptionScreen } from '../screens/profile/SubscriptionScreen';
import { BrandingScreen } from '../screens/profile/BrandingScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
    </Stack.Navigator>
  );
}

function ShipmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShipmentsList" component={ShipmentsScreen} />
      <Stack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
      <Stack.Screen name="CreateShipment" component={CreateShipmentScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Branding" component={BrandingScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

type TabIcon = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, [TabIcon, TabIcon]> = {
  Home: ['home', 'home-outline'],
  Shipments: ['cube', 'cube-outline'],
  Operations: ['car-sport', 'car-sport-outline'],
  Business: ['briefcase', 'briefcase-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

function MainTabs() {
  const { primaryColor } = useStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          const [activeIcon, inactiveIcon] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? activeIcon : inactiveIcon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Shipments" component={ShipmentsStack} />
      <Tab.Screen name="Operations" component={OperationsScreen} options={{ tabBarLabel: 'Ops' }} />
      <Tab.Screen name="Business" component={BusinessScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
