import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { DispatchScreen } from './DispatchScreen';
import { DriversScreen } from './DriversScreen';
import { WarehouseScreen } from './WarehouseScreen';
import { BranchesScreen } from './BranchesScreen';

type OpTab = 'dispatch' | 'drivers' | 'warehouse' | 'branches';

const OP_TABS: [OpTab, string, string][] = [
  ['dispatch', 'Dispatch', 'car-sport-outline'],
  ['drivers', 'Drivers', 'person-outline'],
  ['warehouse', 'Warehouse', 'storefront-outline'],
  ['branches', 'Branches', 'business-outline'],
];

export function OperationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [activeTab, setActiveTab] = useState<OpTab>('dispatch');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: primaryColor }]}>
        <Text style={styles.headerTitle}>Operations</Text>
      </View>

      {/* Sub Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContent}>
        {OP_TABS.map(([key, label, icon]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && { borderBottomColor: primaryColor }]}
            onPress={() => setActiveTab(key)}
          >
            <Ionicons name={icon as any} size={16} color={activeTab === key ? primaryColor : '#9ca3af'} />
            <Text style={[styles.tabText, activeTab === key && { color: primaryColor, fontWeight: '700' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'dispatch' && <DispatchScreen />}
        {activeTab === 'drivers' && <DriversScreen />}
        {activeTab === 'warehouse' && <WarehouseScreen />}
        {activeTab === 'branches' && <BranchesScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  tabScroll: { backgroundColor: '#ffffff', flexGrow: 0 },
  tabContent: { paddingHorizontal: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  content: { flex: 1 },
});
