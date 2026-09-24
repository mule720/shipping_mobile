import React from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { MY_EARNINGS_QUERY, MY_RATINGS_QUERY } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AggregatorEarningsScreen() {
  const { primaryColor } = useStore();

  const { data: earningsData, isLoading: eLoading, refetch: eRefetch } = useQuery({
    queryKey: ['myEarnings'],
    queryFn: () => graphqlClient.query(MY_EARNINGS_QUERY, {}),
  });

  const { data: ratingsData, isLoading: rLoading, refetch: rRefetch } = useQuery({
    queryKey: ['myRatings'],
    queryFn: () => graphqlClient.query(MY_RATINGS_QUERY, {}),
  });

  const earnings = (earningsData as any)?.myEarnings;
  const ratings: any[] = (ratingsData as any)?.myRatings ?? [];
  const isLoading = eLoading || rLoading;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { eRefetch(); rRefetch(); }} />}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Summary */}
      <View style={[styles.summaryCard, { borderColor: primaryColor }]}>
        <Text style={styles.totalLabel}>Total Earnings</Text>
        <Text style={[styles.totalValue, { color: primaryColor }]}>K {Number(earnings?.totalEarnings ?? 0).toFixed(2)}</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{earnings?.totalJobs ?? 0}</Text>
            <Text style={styles.summaryLabel}>Total Jobs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>K {Number(earnings?.pendingAmount ?? 0).toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>K {Number(earnings?.paidAmount ?? 0).toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
        </View>
      </View>

      {/* Monthly breakdown */}
      {earnings?.monthlyBreakdown?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
          {earnings.monthlyBreakdown.slice(-6).map((m: any) => {
            const max = Math.max(...earnings.monthlyBreakdown.map((x: any) => x.amount), 1);
            return (
              <View key={m.month} style={styles.barRow}>
                <Text style={styles.barLabel}>{m.month}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(m.amount / max) * 100}%` as any, backgroundColor: primaryColor }]} />
                </View>
                <Text style={styles.barValue}>K {Number(m.amount).toFixed(0)}</Text>
              </View>
            );
          })}
        </>
      )}

      {/* Ratings */}
      {ratings.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Ratings</Text>
          {ratings.slice(0, 10).map((r: any, i: number) => (
            <View key={i} style={styles.ratingCard}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
                ))}
              </View>
              <Text style={styles.ratingComment} numberOfLines={2}>{r.comment || 'No comment'}</Text>
              <Text style={styles.ratingDate}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1.5, marginBottom: 16, alignItems: 'center' },
  totalLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  totalValue: { fontSize: 32, fontWeight: '900', marginTop: 4 },
  summaryGrid: { flexDirection: 'row', marginTop: 16, gap: 24 },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 16, fontWeight: '700', color: '#111827' },
  summaryLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  barLabel: { width: 48, fontSize: 11, color: '#6b7280' },
  barBg: { flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { width: 52, fontSize: 11, color: '#374151', textAlign: 'right' },
  ratingCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, elevation: 1 },
  stars: { flexDirection: 'row', gap: 2 },
  ratingComment: { fontSize: 13, color: '#374151', marginTop: 6 },
  ratingDate: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
});
