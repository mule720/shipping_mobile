import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { AggregatorJobsScreen } from './AggregatorJobsScreen';
import { AggregatorEarningsScreen } from './AggregatorEarningsScreen';
import { AggregatorProfileScreen } from './AggregatorProfileScreen';
import { AggregatorAnalyticsScreen } from './AggregatorAnalyticsScreen';
import { AggregatorPricingScreen } from './AggregatorPricingScreen';

const TABS = [
  { key: 'jobs', label: 'Jobs', icon: 'briefcase-outline' },
  { key: 'earnings', label: 'Earnings', icon: 'cash-outline' },
  { key: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
  { key: 'pricing', label: 'Pricing', icon: 'pricetag-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

export function AggregatorScreen() {
  const [activeTab, setActiveTab] = useState('jobs');
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs': return <AggregatorJobsScreen />;
      case 'earnings': return <AggregatorEarningsScreen />;
      case 'analytics': return <AggregatorAnalyticsScreen />;
      case 'pricing': return <AggregatorPricingScreen />;
      case 'profile': return <AggregatorProfileScreen />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Ionicons name="car-outline" size={20} color={primaryColor} />
        <Text style={styles.headerTitle}>Aggregator Portal</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? primaryColor : '#9ca3af'} />
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? primaryColor : '#9ca3af' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  tabBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tabBarContent: { flexDirection: 'row' },
  tab: { paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  content: { flex: 1 },
});
