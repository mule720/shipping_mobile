import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';

const DRIVER_PERFORMANCE_QUERY = `
  query MyAggregatorDriverPerformance {
    myAggregatorDriverPerformance {
      driverId
      driverName
      totalJobs
      completedJobs
      avgRating
    }
  }
`;

const JOB_STATS_QUERY = `
  query MyJobStats {
    myJobStats {
      totalJobs
      completedJobs
      pendingJobs
      cancelledJobs
      avgDeliveryTime
      successRate
      jobsByCity { city count }
      jobsByType { type count }
    }
  }
`;

export function AggregatorAnalyticsScreen() {
  const { primaryColor } = useStore();

  const { data: statsData, isLoading: sLoading, refetch: sRefetch } = useQuery({
    queryKey: ['myJobStats'],
    queryFn: () => graphqlClient.query(JOB_STATS_QUERY, {}),
  });

  const { data: driverData, isLoading: dLoading, refetch: dRefetch } = useQuery({
    queryKey: ['myDriverPerformance'],
    queryFn: () => graphqlClient.query(DRIVER_PERFORMANCE_QUERY, {}),
  });

  const stats = (statsData as any)?.myJobStats;
  const drivers: any[] = (driverData as any)?.myAggregatorDriverPerformance ?? [];
  const isLoading = sLoading || dLoading;

  const refetch = () => { sRefetch(); dRefetch(); };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Job Summary */}
      <Text style={styles.sectionTitle}>Job Summary</Text>
      <View style={styles.kpiGrid}>
        {[
          { label: 'Total Jobs', value: stats?.totalJobs ?? 0, icon: 'briefcase-outline', color: '#6366f1' },
          { label: 'Completed', value: stats?.completedJobs ?? 0, icon: 'checkmark-circle-outline', color: '#10b981' },
          { label: 'Pending', value: stats?.pendingJobs ?? 0, icon: 'time-outline', color: '#f59e0b' },
          { label: 'Cancelled', value: stats?.cancelledJobs ?? 0, icon: 'close-circle-outline', color: '#ef4444' },
        ].map(k => (
          <View key={k.label} style={[styles.kpiCard, { borderLeftColor: k.color }]}>
            <Ionicons name={k.icon as any} size={18} color={k.color} />
            <Text style={styles.kpiValue}>{k.value}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
          </View>
        ))}
      </View>

      {/* Performance metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{Number(stats?.successRate ?? 0).toFixed(1)}%</Text>
          <Text style={styles.metricLabel}>Success Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats?.avgDeliveryTime ?? '—'}</Text>
          <Text style={styles.metricLabel}>Avg Delivery Time</Text>
        </View>
      </View>

      {/* Jobs by city */}
      {stats?.jobsByCity?.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Jobs by City</Text>
          {stats.jobsByCity.map((c: any) => {
            const max = Math.max(...stats.jobsByCity.map((x: any) => x.count), 1);
            return (
              <View key={c.city} style={styles.barRow}>
                <Text style={styles.barLabel}>{c.city}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(c.count / max) * 100}%` as any, backgroundColor: primaryColor }]} />
                </View>
                <Text style={styles.barCount}>{c.count}</Text>
              </View>
            );
          })}
        </>
      )}

      {/* Jobs by type */}
      {stats?.jobsByType?.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Jobs by Type</Text>
          <View style={styles.typeGrid}>
            {stats.jobsByType.map((t: any) => (
              <View key={t.type} style={styles.typeCard}>
                <Text style={[styles.typeCount, { color: primaryColor }]}>{t.count}</Text>
                <Text style={styles.typeLabel}>{t.type}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Driver performance */}
      {drivers.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Driver Performance</Text>
          {drivers.map((d: any) => (
            <View key={d.driverId} style={styles.driverCard}>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{d.driverName}</Text>
                <Text style={styles.driverSub}>{d.completedJobs}/{d.totalJobs} jobs completed</Text>
              </View>
              <View style={styles.driverStats}>
                <View style={styles.starRow}>
                  {[1,2,3,4,5].map(s => (
                    <Ionicons key={s} name={s <= Math.round(d.avgRating ?? 0) ? 'star' : 'star-outline'} size={12} color="#f59e0b" />
                  ))}
                </View>
                <Text style={styles.driverRating}>{Number(d.avgRating ?? 0).toFixed(1)}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  kpiCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderLeftWidth: 3, elevation: 1, gap: 4 },
  kpiValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  kpiLabel: { fontSize: 11, color: '#6b7280' },
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 1 },
  metricValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  metricLabel: { fontSize: 11, color: '#6b7280', marginTop: 2, textAlign: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  barLabel: { width: 72, fontSize: 11, color: '#6b7280' },
  barBg: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barCount: { width: 28, fontSize: 11, color: '#374151', textAlign: 'right' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', minWidth: 80, elevation: 1 },
  typeCount: { fontSize: 20, fontWeight: '800' },
  typeLabel: { fontSize: 10, color: '#6b7280', marginTop: 2, textTransform: 'capitalize' },
  driverCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  driverSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  driverStats: { alignItems: 'flex-end' },
  starRow: { flexDirection: 'row', gap: 1 },
  driverRating: { fontSize: 13, fontWeight: '700', color: '#f59e0b', marginTop: 2 },
});
