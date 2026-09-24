import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { GLOBAL_ANALYTICS_QUERY } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AdminAnalyticsScreen() {
  const { primaryColor } = useStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['globalAnalytics'],
    queryFn: () => graphqlClient.query(GLOBAL_ANALYTICS_QUERY, {}),
  });

  const analytics = (data as any)?.globalAnalytics;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />} contentContainerStyle={{ padding: 16 }}>
      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <>
          <Text style={styles.sectionTitle}>Growth Metrics</Text>
          {[
            { label: 'New Companies', value: analytics?.newCompanies ?? 0, icon: 'business-outline', color: '#6366f1' },
            { label: 'New Users', value: analytics?.newUsers ?? 0, icon: 'person-add-outline', color: '#10b981' },
            { label: 'Total Revenue', value: `K ${Number(analytics?.totalRevenue ?? 0).toFixed(0)}`, icon: 'cash-outline', color: '#f59e0b' },
            { label: 'Shipments', value: analytics?.totalShipments ?? 0, icon: 'cube-outline', color: '#3b82f6' },
          ].map(m => (
            <View key={m.label} style={styles.metricRow}>
              <View style={[styles.iconBox, { backgroundColor: m.color + '20' }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
            </View>
          ))}

          {analytics?.topCompanies?.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Top Companies</Text>
              {analytics.topCompanies.map((c: any, i: number) => (
                <View key={c.id ?? i} style={styles.topRow}>
                  <Text style={styles.rank}>#{i + 1}</Text>
                  <Text style={styles.companyName}>{c.name}</Text>
                  <Text style={styles.companyValue}>{c.totalShipments} shipments</Text>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  metricRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, gap: 12, elevation: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '600' },
  metricValue: { fontSize: 18, fontWeight: '800' },
  topRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, gap: 10, elevation: 1 },
  rank: { fontSize: 14, fontWeight: '800', color: '#9ca3af', width: 28 },
  companyName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  companyValue: { fontSize: 13, color: '#6b7280' },
});
