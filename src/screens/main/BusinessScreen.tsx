import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { CustomersScreen } from './CustomersScreen';
import { FinanceScreen } from './FinanceScreen';
import { UsersScreen } from './UsersScreen';

type BizTab = 'customers' | 'finance' | 'users';

const BIZ_TABS: [BizTab, string, string][] = [
  ['customers', 'Customers', 'people-outline'],
  ['finance', 'Finance', 'wallet-outline'],
  ['users', 'Team', 'shield-outline'],
];

export function BusinessScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [activeTab, setActiveTab] = useState<BizTab>('customers');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <Text style={styles.headerTitle}>Business</Text>
      </View>

      <View style={styles.tabRow}>
        {BIZ_TABS.map(([key, label, icon]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && { borderBottomColor: primaryColor }]}
            onPress={() => setActiveTab(key)}
          >
            <Ionicons name={icon as any} size={16} color={activeTab === key ? primaryColor : '#9ca3af'} />
            <Text style={[styles.tabText, activeTab === key && { color: primaryColor, fontWeight: '700' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'customers' && <CustomersScreen />}
        {activeTab === 'finance' && <FinanceScreen />}
        {activeTab === 'users' && <UsersScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  tabRow: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  content: { flex: 1 },
});
