import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphqlClient } from '../../api/client';
import { ADMIN_REVENUE_QUERY, PLATFORM_HEALTH_QUERY } from '../../api/queries';
import { useStore } from '../../store/useStore';

function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export function AdminOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();

  const { data: revData, isLoading: revLoading, refetch: refetchRev } = useQuery({
    queryKey: ['adminRevenue'],
    queryFn: () => graphqlClient.query(ADMIN_REVENUE_QUERY, {}),
  });

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['platformHealth'],
    queryFn: () => graphqlClient.query(PLATFORM_HEALTH_QUERY, {}),
  });

  const rev = (revData as any)?.adminRevenue;
  const health = (healthData as any)?.platformHealth;
  const isLoading = revLoading || healthLoading;

  const fmt = (n: number) => n >= 1000 ? `K ${(n / 1000).toFixed(1)}k` : `K ${n?.toFixed(2) ?? '0.00'}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 56, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { refetchRev(); refetchHealth(); }} />}
    >
      {/* Revenue Section */}
      <Text style={styles.sectionTitle}>Revenue</Text>
      <View style={styles.kpiGrid}>
        <KpiCard label="Total Revenue" value={fmt(rev?.totalRevenue ?? 0)} icon="cash-outline" color="#10b981" />
        <KpiCard label="This Month" value={fmt(rev?.monthlyRevenue ?? 0)} icon="trending-up-outline" color="#6366f1" />
        <KpiCard label="Total Shipments" value={String(rev?.totalShipments ?? 0)} icon="cube-outline" color="#f59e0b" />
        <KpiCard label="Active Companies" value={String(rev?.activeCompanies ?? 0)} icon="business-outline" color="#3b82f6" />
      </View>

      {/* Platform Health */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Platform Health</Text>
      <View style={[styles.healthCard, { borderColor: health?.dbStatus === 'Healthy' ? '#10b981' : '#ef4444' }]}>
        <View style={styles.healthRow}>
          <Ionicons
            name={health?.dbStatus === 'Healthy' ? 'checkmark-circle' : 'alert-circle'}
            size={22}
            color={health?.dbStatus === 'Healthy' ? '#10b981' : '#ef4444'}
          />
          <Text style={[styles.healthStatus, { color: health?.dbStatus === 'Healthy' ? '#10b981' : '#ef4444' }]}>
            Database: {health?.dbStatus ?? 'Checking…'}
          </Text>
        </View>
      </View>
      <View style={styles.healthGrid}>
        {[
          { label: 'Companies', value: health?.totalCompanies ?? 0, icon: 'business-outline' },
          { label: 'Active', value: health?.activeCompanies ?? 0, icon: 'checkmark-circle-outline' },
          { label: 'Users', value: health?.totalUsers ?? 0, icon: 'people-outline' },
          { label: 'Shipments', value: health?.totalShipments ?? 0, icon: 'cube-outline' },
          { label: 'Aggregators', value: health?.totalAggregators ?? 0, icon: 'car-outline' },
          { label: 'Pending Payouts', value: health?.pendingPayouts ?? 0, icon: 'wallet-outline' },
        ].map(item => (
          <View key={item.label} style={styles.healthMetric}>
            <Ionicons name={item.icon as any} size={16} color={primaryColor} />
            <Text style={styles.healthMetricValue}>{item.value}</Text>
            <Text style={styles.healthMetricLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Monthly revenue trend */}
      {rev?.monthlyData?.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Monthly Revenue</Text>
          {rev.monthlyData.slice(-6).map((d: any) => {
            const max = Math.max(...rev.monthlyData.map((x: any) => x.revenue), 1);
            return (
              <View key={d.month} style={styles.barRow}>
                <Text style={styles.barLabel}>{d.month}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(d.revenue / max) * 100}%` as any, backgroundColor: primaryColor }]} />
                </View>
                <Text style={styles.barValue}>K {Number(d.revenue).toFixed(0)}</Text>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 16, marginBottom: 10 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  kpiCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderLeftWidth: 3, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, gap: 4 },
  kpiValue: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 4 },
  kpiLabel: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
  healthCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1.5, marginBottom: 12 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthStatus: { fontSize: 15, fontWeight: '700' },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 8 },
  healthMetric: { width: '30%', backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', gap: 4, elevation: 1 },
  healthMetricValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  healthMetricLabel: { fontSize: 10, color: '#6b7280', fontWeight: '500', textAlign: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  barLabel: { width: 48, fontSize: 11, color: '#6b7280' },
  barBg: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { width: 52, fontSize: 11, color: '#374151', textAlign: 'right' },
});
