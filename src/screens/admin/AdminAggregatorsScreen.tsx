import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { ALL_AGGREGATORS_QUERY } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AdminAggregatorsScreen() {
  const { primaryColor } = useStore();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminAggregators'],
    queryFn: () => graphqlClient.query(ALL_AGGREGATORS_QUERY, {}),
  });

  const aggregators: any[] = (data as any)?.allAggregators ?? [];
  const filtered = aggregators.filter(a =>
    `${a.user?.firstName} ${a.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput style={styles.searchInput} placeholder="Search aggregators…" value={search} onChangeText={setSearch} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: primaryColor + '20' }]}>
                  <Text style={[styles.avatarText, { color: primaryColor }]}>
                    {item.user?.firstName?.[0] ?? '?'}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.user?.firstName} {item.user?.lastName}</Text>
                  <Text style={styles.sub}>{item.vehicleType} · {item.vehiclePlate}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: item.isAvailable ? '#dcfce7' : '#fee2e2' }]}>
                  <Text style={[styles.badgeTxt, { color: item.isAvailable ? '#16a34a' : '#dc2626' }]}>
                    {item.isAvailable ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{item.totalDeliveries ?? 0}</Text>
                  <Text style={styles.statLabel}>Deliveries</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{Number(item.averageRating ?? 0).toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>K {Number(item.totalEarnings ?? 0).toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Earnings</Text>
                </View>
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
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 10, paddingHorizontal: 12, gap: 8, elevation: 1 },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: '#374151' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt: { fontSize: 11, fontWeight: '600' },
  stats: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
});
