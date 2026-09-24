import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { AdminOverviewScreen } from './AdminOverviewScreen';
import { AdminCompaniesScreen } from './AdminCompaniesScreen';
import { AdminAggregatorsScreen } from './AdminAggregatorsScreen';
import { AdminPayoutsScreen } from './AdminPayoutsScreen';
import { AdminAnnouncementsScreen } from './AdminAnnouncementsScreen';
import { AdminSubscriptionsScreen } from './AdminSubscriptionsScreen';
import { AdminAnalyticsScreen } from './AdminAnalyticsScreen';
import { AdminAuditLogScreen } from './AdminAuditLogScreen';
import { AdminShipmentsScreen } from './AdminShipmentsScreen';
import { AdminCustomersScreen } from './AdminCustomersScreen';
import { AdminAiSettingsScreen } from './AdminAiSettingsScreen';

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'grid-outline' },
  { key: 'companies', label: 'Companies', icon: 'business-outline' },
  { key: 'aggregators', label: 'Aggregators', icon: 'car-outline' },
  { key: 'shipments', label: 'Shipments', icon: 'cube-outline' },
  { key: 'customers', label: 'Customers', icon: 'people-outline' },
  { key: 'payouts', label: 'Payouts', icon: 'wallet-outline' },
  { key: 'announcements', label: 'Announce', icon: 'megaphone-outline' },
  { key: 'subscriptions', label: 'Plans', icon: 'card-outline' },
  { key: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
  { key: 'audit', label: 'Audit', icon: 'list-outline' },
  { key: 'ai', label: 'AI', icon: 'sparkles-outline' },
];

export function AdminScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverviewScreen />;
      case 'companies': return <AdminCompaniesScreen />;
      case 'aggregators': return <AdminAggregatorsScreen />;
      case 'shipments': return <AdminShipmentsScreen />;
      case 'customers': return <AdminCustomersScreen />;
      case 'payouts': return <AdminPayoutsScreen />;
      case 'announcements': return <AdminAnnouncementsScreen />;
      case 'subscriptions': return <AdminSubscriptionsScreen />;
      case 'analytics': return <AdminAnalyticsScreen />;
      case 'audit': return <AdminAuditLogScreen />;
      case 'ai': return <AdminAiSettingsScreen />;
      default: return null;
    }
  };

  const currentTab = TABS.find(t => t.key === activeTab);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Ionicons name="shield-outline" size={20} color={primaryColor} />
        <Text style={styles.headerTitle}>Platform Admin</Text>
        <Text style={styles.headerSub}>{currentTab?.label}</Text>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? primaryColor : '#9ca3af'} />
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? primaryColor : '#9ca3af' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827', flex: 1 },
  headerSub: { fontSize: 12, color: '#9ca3af' },
  tabBar: { backgroundColor: '#fff', maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tabBarContent: { paddingHorizontal: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabLabel: { fontSize: 12, fontWeight: '600' },
  content: { flex: 1 },
});
