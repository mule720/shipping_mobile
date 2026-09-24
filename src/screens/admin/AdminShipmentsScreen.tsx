import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';

const ADMIN_SHIPMENTS_QUERY = `
  query AdminAllShipments($search: String, $status: String, $limit: Int, $offset: Int) {
    adminAllShipments(search: $search, status: $status, limit: $limit, offset: $offset) {
      id
      trackingNumber
      status
      senderName
      recipientName
      originCity
      destinationCity
      shippingCost
      createdAt
      company { id name }
    }
  }
`;

const STATUSES = ['', 'pending', 'dispatched', 'in_transit', 'delivered', 'returned', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  dispatched: '#3b82f6',
  in_transit: '#8b5cf6',
  delivered: '#10b981',
  returned: '#f97316',
  cancelled: '#ef4444',
};

export function AdminShipmentsScreen() {
  const { primaryColor } = useStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [submitted, setSubmitted] = useState({ search: '', status: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminShipments', submitted.search, submitted.status],
    queryFn: () => graphqlClient.query(ADMIN_SHIPMENTS_QUERY, {
      search: submitted.search || null,
      status: submitted.status || null,
      limit: 50,
      offset: 0,
    }),
  });

  const shipments: any[] = (data as any)?.adminAllShipments ?? [];

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tracking # or name…"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => setSubmitted({ search, status })}
          />
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: primaryColor }]} onPress={() => setSubmitted({ search, status })}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Status filter chips */}
      <View style={styles.filterRow}>
        {STATUSES.map(s => (
          <TouchableOpacity
            key={s || 'all'}
            style={[styles.chip, status === s && { backgroundColor: primaryColor }]}
            onPress={() => { setStatus(s); setSubmitted({ search, status: s }); }}
          >
            <Text style={[styles.chipText, status === s && { color: '#fff' }]}>{s || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={shipments}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No shipments found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.tracking}>{item.trackingNumber}</Text>
                  <Text style={styles.company}>{item.company?.name ?? '—'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.status] ?? '#6b7280') + '20' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] ?? '#6b7280' }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.route}>
                <Ionicons name="radio-button-on-outline" size={12} color="#3b82f6" />
                <Text style={styles.routeText}>{item.originCity}</Text>
                <Ionicons name="arrow-forward-outline" size={12} color="#9ca3af" />
                <Ionicons name="location-outline" size={12} color="#ef4444" />
                <Text style={styles.routeText}>{item.destinationCity}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.metaText}>{item.senderName} → {item.recipientName}</Text>
                <Text style={styles.metaText}>K {Number(item.shippingCost ?? 0).toFixed(2)}</Text>
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
  searchRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, gap: 8, elevation: 1 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: '#374151' },
  searchBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 6, paddingBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#374151', textTransform: 'capitalize' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tracking: { fontSize: 14, fontWeight: '700', color: '#111827' },
  company: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  route: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  routeText: { fontSize: 12, color: '#374151' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metaText: { fontSize: 11, color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 60 },
});
