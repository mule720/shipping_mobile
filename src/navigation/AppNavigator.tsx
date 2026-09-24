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
import { ReportsScreen } from '../screens/main/ReportsScreen';
import { VehiclesScreen } from '../screens/main/VehiclesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { AccountSettingsScreen } from '../screens/profile/AccountSettingsScreen';
import { CompanyProfileScreen } from '../screens/profile/CompanyProfileScreen';
import { SubscriptionScreen } from '../screens/profile/SubscriptionScreen';
import { BrandingScreen } from '../screens/profile/BrandingScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';
import { AdminScreen } from '../screens/admin/AdminScreen';
import { AggregatorScreen } from '../screens/aggregator/AggregatorScreen';
import { BatchUploadScreen } from '../screens/main/BatchUploadScreen';
import { CustomerBookingScreen } from '../screens/main/CustomerBookingScreen';
import { ReceiptLookupScreen } from '../screens/main/ReceiptLookupScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Stacks ──────────────────────────────────────────────────────────────────

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
      <Stack.Screen name="CustomerBooking" component={CustomerBookingScreen} />
      <Stack.Screen name="ReceiptLookup" component={ReceiptLookupScreen} />
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
      <Stack.Screen name="BatchUpload" component={BatchUploadScreen} />
      <Stack.Screen name="ReceiptLookup" component={ReceiptLookupScreen} />
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

// ── Shared tab config helpers ────────────────────────────────────────────────

type TabIcon = keyof typeof Ionicons.glyphMap;

function tabScreenOptions(primaryColor: string) {
  return {
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
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600' as const },
  };
}

function tabIcon(active: TabIcon, inactive: TabIcon) {
  return ({ focused, color }: { focused: boolean; color: string }) => (
    <Ionicons name={focused ? active : inactive} size={22} color={color} />
  );
}

// ── Vendor (company_admin / staff) tabs ──────────────────────────────────────

function VendorTabs() {
  const { primaryColor } = useStore();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions(primaryColor)}>
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarIcon: tabIcon('home', 'home-outline') }} />
      <Tab.Screen name="Shipments" component={ShipmentsStack} options={{ tabBarIcon: tabIcon('cube', 'cube-outline') }} />
      <Tab.Screen name="Operations" component={OperationsScreen} options={{ tabBarLabel: 'Ops', tabBarIcon: tabIcon('car-sport', 'car-sport-outline') }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarIcon: tabIcon('bar-chart', 'bar-chart-outline') }} />
      <Tab.Screen name="Fleet" component={VehiclesScreen} options={{ tabBarIcon: tabIcon('car', 'car-outline') }} />
      <Tab.Screen name="Business" component={BusinessScreen} options={{ tabBarIcon: tabIcon('briefcase', 'briefcase-outline') }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tab.Navigator>
  );
}

// ── Platform Admin tabs ──────────────────────────────────────────────────────

function AdminTabs() {
  const { primaryColor } = useStore();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions(primaryColor)}>
      <Tab.Screen name="Admin" component={AdminScreen} options={{ tabBarIcon: tabIcon('shield', 'shield-outline') }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tab.Navigator>
  );
}

// ── Aggregator tabs ──────────────────────────────────────────────────────────

function AggregatorTabs() {
  const { primaryColor } = useStore();
  return (
    <Tab.Navigator screenOptions={tabScreenOptions(primaryColor)}>
      <Tab.Screen name="Portal" component={AggregatorScreen} options={{ tabBarIcon: tabIcon('car', 'car-outline') }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarIcon: tabIcon('person-circle', 'person-circle-outline') }} />
    </Tab.Navigator>
  );
}

// ── Root: role-based dispatch ────────────────────────────────────────────────

function MainTabs() {
  const { user } = useStore();
  const role = user?.role?.name ?? user?.role ?? '';

  if (role === 'platform_admin') return <AdminTabs />;
  if (role === 'aggregator') return <AggregatorTabs />;
  // company_admin, staff, customer, default
  return <VendorTabs />;
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
