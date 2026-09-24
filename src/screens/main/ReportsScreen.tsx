import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphqlClient } from '../../api/client';
import { DAILY_SHIPMENTS_REPORT_QUERY, BRANCH_PERFORMANCE_QUERY, DELIVERY_PERFORMANCE_QUERY } from '../../api/queries';
import { useStore } from '../../store/useStore';

const REPORT_TABS = [
  { key: 'daily', label: 'Daily' },
  { key: 'branch', label: 'Branch' },
  { key: 'delivery', label: 'Delivery' },
];

const DAY_OPTIONS = [7, 14, 30, 90];

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor, company } = useStore();
  const [activeTab, setActiveTab] = useState('daily');
  const [days, setDays] = useState(30);

  const companyId = company?.id ?? '';

  const { data: dailyData, isLoading: dailyLoading, refetch: dailyRefetch } = useQuery({
    queryKey: ['dailyReport', companyId, days],
    queryFn: () => graphqlClient.query(DAILY_SHIPMENTS_REPORT_QUERY, { companyId, days }),
    enabled: !!companyId && activeTab === 'daily',
  });

  const { data: branchData, isLoading: branchLoading, refetch: branchRefetch } = useQuery({
    queryKey: ['branchReport', companyId, days],
    queryFn: () => graphqlClient.query(BRANCH_PERFORMANCE_QUERY, { companyId, days }),
    enabled: !!companyId && activeTab === 'branch',
  });

  const { data: deliveryData, isLoading: deliveryLoading, refetch: deliveryRefetch } = useQuery({
    queryKey: ['deliveryReport', companyId, days],
    queryFn: () => graphqlClient.query(DELIVERY_PERFORMANCE_QUERY, { companyId, days }),
    enabled: !!companyId && activeTab === 'delivery',
  });

  const isLoading = dailyLoading || branchLoading || deliveryLoading;

  const renderDailyReport = () => {
    const rows: any[] = (dailyData as any)?.dailyShipmentsReport ?? [];
    const max = Math.max(...rows.map(r => r.total), 1);
    return rows.slice(-14).map((r: any) => (
      <View key={r.date} style={styles.barRow}>
        <Text style={styles.barLabel}>{new Date(r.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${(r.total / max) * 100}%` as any, backgroundColor: primaryColor }]} />
        </View>
        <Text style={styles.barValue}>{r.total}</Text>
      </View>
    ));
  };

  const renderBranchReport = () => {
    const rows: any[] = (branchData as any)?.branchPerformance ?? [];
    return rows.map((r: any) => (
      <View key={r.branchId} style={styles.reportCard}>
        <Text style={styles.reportCardTitle}>{r.branchName}</Text>
        <View style={styles.reportCardStats}>
          <StatChip label="Total" value={r.totalShipments} />
          <StatChip label="Delivered" value={r.delivered} color="#10b981" />
          <StatChip label="Pending" value={r.pending} color="#f59e0b" />
          <StatChip label="Returned" value={r.returned} color="#ef4444" />
        </View>
        <Text style={styles.reportCardSub}>Revenue: K {Number(r.revenue ?? 0).toFixed(0)}</Text>
      </View>
    ));
  };

  const renderDeliveryReport = () => {
    const d = (deliveryData as any)?.deliveryPerformance;
    if (!d) return null;
    return (
      <View style={styles.reportCard}>
        <Text style={styles.reportCardTitle}>Delivery Performance</Text>
        <View style={styles.reportCardStats}>
          <StatChip label="Delivered" value={d.delivered} color="#10b981" />
          <StatChip label="Returned" value={d.returned} color="#ef4444" />
          <StatChip label="In Transit" value={d.inTransit} color="#3b82f6" />
        </View>
        <Text style={styles.reportCardSub}>Avg Delivery Time: {d.avgDeliveryTime ?? '—'}</Text>
        <Text style={styles.reportCardSub}>Success Rate: {Number(d.successRate ?? 0).toFixed(1)}%</Text>
      </View>
    );
  };

  const refetch = () => { dailyRefetch(); branchRefetch(); deliveryRefetch(); };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      {/* Report type tabs */}
      <View style={styles.tabRow}>
        {REPORT_TABS.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]} onPress={() => setActiveTab(t.key)}>
            <Text style={[styles.tabLabel, { color: activeTab === t.key ? primaryColor : '#9ca3af' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Days filter */}
      <View style={styles.daysRow}>
        <Text style={styles.daysLabel}>Period:</Text>
        {DAY_OPTIONS.map(d => (
          <TouchableOpacity key={d} style={[styles.dayChip, days === d && { backgroundColor: primaryColor }]} onPress={() => setDays(d)}>
            <Text style={[styles.dayChipText, days === d && { color: '#fff' }]}>{d}d</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />} contentContainerStyle={{ padding: 16 }}>
        {isLoading ? <ActivityIndicator color={primaryColor} style={{ marginTop: 40 }} /> : (
          <>
            {activeTab === 'daily' && renderDailyReport()}
            {activeTab === 'branch' && renderBranchReport()}
            {activeTab === 'delivery' && renderDeliveryReport()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatChip({ label, value, color = '#374151' }: { label: string; value: any; color?: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statChipValue, { color }]}>{value ?? 0}</Text>
      <Text style={styles.statChipLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  daysRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', gap: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  daysLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  dayChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#f3f4f6' },
  dayChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  content: { flex: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  barLabel: { width: 60, fontSize: 11, color: '#6b7280' },
  barBg: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { width: 32, fontSize: 11, color: '#374151', textAlign: 'right' },
  reportCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  reportCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  reportCardStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statChip: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, alignItems: 'center', minWidth: 70 },
  statChipValue: { fontSize: 18, fontWeight: '800' },
  statChipLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  reportCardSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
