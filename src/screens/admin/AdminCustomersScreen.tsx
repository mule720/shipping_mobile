import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { useStore } from '../../store/useStore';

const ADMIN_CUSTOMERS_QUERY = `
  query AdminAllCustomers($search: String) {
    adminAllCustomers(search: $search) {
      id
      name
      phone
      email
      city
      totalShipments
      createdAt
      company { id name }
    }
  }
`;

export function AdminCustomersScreen() {
  const { primaryColor } = useStore();
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminCustomers', submitted],
    queryFn: () => graphqlClient.query(ADMIN_CUSTOMERS_QUERY, { search: submitted || null }),
  });

  const customers: any[] = (data as any)?.adminAllCustomers ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers…"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => setSubmitted(search)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSubmitted(''); }}>
              <Ionicons name="close-outline" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.goBtn, { backgroundColor: primaryColor }]} onPress={() => setSubmitted(search)}>
          <Text style={styles.goBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.count}>{customers.length} customers</Text>
      </View>

      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList
          data={customers}
          keyExtractor={i => i.id}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No customers found</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: primaryColor + '20' }]}>
                  <Text style={[styles.avatarText, { color: primaryColor }]}>{item.name?.[0] ?? '?'}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>{item.phone}</Text>
                  {item.email && <Text style={styles.sub}>{item.email}</Text>}
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.shipCount}>{item.totalShipments ?? 0}</Text>
                  <Text style={styles.shipLabel}>shipments</Text>
                </View>
              </View>
              <View style={styles.cardFoot}>
                {item.city && <Text style={styles.footText}><Ionicons name="location-outline" size={11} /> {item.city}</Text>}
                {item.company && <Text style={styles.footText}><Ionicons name="business-outline" size={11} /> {item.company.name}</Text>}
                <Text style={styles.footText}><Ionicons name="calendar-outline" size={11} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
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
  goBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  goBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  countRow: { paddingHorizontal: 16, paddingBottom: 6 },
  count: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  rightSide: { alignItems: 'flex-end' },
  shipCount: { fontSize: 20, fontWeight: '800', color: '#111827' },
  shipLabel: { fontSize: 10, color: '#6b7280' },
  cardFoot: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  footText: { fontSize: 11, color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 60 },
});
