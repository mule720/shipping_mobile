import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { MY_PICKUP_JOBS_QUERY, ACCEPT_JOB_MUTATION, COMPLETE_JOB_MUTATION } from '../../api/queries';
import { useStore } from '../../store/useStore';

const STATUS_TABS = ['pending', 'accepted', 'completed'];

export function AggregatorJobsScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('pending');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myPickupJobs'],
    queryFn: () => graphqlClient.query(MY_PICKUP_JOBS_QUERY, {}),
  });

  // "Accept" maps to claimShipmentForPickup (takes shipmentId, not jobId)
  const acceptMutation = useMutation({
    mutationFn: (shipmentId: string) => graphqlClient.mutate(ACCEPT_JOB_MUTATION, { shipmentId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myPickupJobs'] }); Alert.alert('Accepted!', 'Job accepted successfully.'); },
    onError: () => Alert.alert('Error', 'Failed to accept job'),
  });

  // "Complete" maps to updatePickupJobStatus with status='delivered'
  const completeMutation = useMutation({
    mutationFn: (jobId: string) => graphqlClient.mutate(COMPLETE_JOB_MUTATION, { jobId, status: 'delivered' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myPickupJobs'] }); Alert.alert('Completed!', 'Job marked as complete.'); },
    onError: () => Alert.alert('Error', 'Failed to complete job'),
  });

  const jobs: any[] = ((data as any)?.myPickupJobs ?? []).filter((j: any) => j.status === filter);

  const statusColor = (s: string) => s === 'completed' ? '#10b981' : s === 'accepted' ? '#3b82f6' : '#f59e0b';

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {STATUS_TABS.map(t => (
          <TouchableOpacity key={t} style={[styles.tab, filter === t && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]} onPress={() => setFilter(t)}>
            <Text style={[styles.tabText, { color: filter === t ? primaryColor : '#9ca3af' }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={jobs}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No {filter} jobs</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.trackingNo}>{item.shipment?.trackingNumber ?? 'JOB'}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20' }]}>
                  <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.addressBlock}>
                <View style={styles.addressRow}>
                  <Ionicons name="radio-button-on-outline" size={14} color="#3b82f6" />
                  <Text style={styles.addressText}>{item.pickupAddress}</Text>
                </View>
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={14} color="#ef4444" />
                  <Text style={styles.addressText}>{item.deliveryAddress}</Text>
                </View>
              </View>
              <View style={styles.meta}>
                <Text style={styles.metaText}>Fee: K {Number(item.fee ?? 0).toFixed(2)}</Text>
                <Text style={styles.metaText}>{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : ''}</Text>
              </View>
              <View style={styles.actions}>
                {item.status === 'pending' && (
                  <TouchableOpacity style={[styles.btn, { backgroundColor: '#3b82f6' }]} onPress={() => acceptMutation.mutate(item.id)}>
                    <Ionicons name="checkmark-outline" size={14} color="#fff" />
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'accepted' && (
                  <TouchableOpacity style={[styles.btn, { backgroundColor: '#10b981' }]} onPress={() =>
                    Alert.alert('Complete Job', 'Mark this job as completed?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Complete', onPress: () => completeMutation.mutate(item.id) },
                    ])
                  }>
                    <Ionicons name="flag-outline" size={14} color="#fff" />
                    <Text style={styles.btnText}>Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackingNo: { fontSize: 14, fontWeight: '700', color: '#111827' },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  addressBlock: { marginTop: 10, gap: 6 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  addressText: { fontSize: 12, color: '#374151', flex: 1 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  metaText: { fontSize: 12, color: '#9ca3af' },
  actions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 60, color: '#9ca3af', fontSize: 15 },
});
