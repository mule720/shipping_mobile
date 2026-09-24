import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../../api/client';
import { ALL_COMPANIES_QUERY, APPROVE_COMPANY_MUTATION, SUSPEND_COMPANY_MUTATION } from '../../api/queries';
import { useStore } from '../../store/useStore';

export function AdminCompaniesScreen() {
  const { primaryColor } = useStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: () => graphqlClient.query(ALL_COMPANIES_QUERY, {}),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => graphqlClient.mutate(APPROVE_COMPANY_MUTATION, { companyId: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminCompanies'] }); Alert.alert('Success', 'Company approved'); },
    onError: () => Alert.alert('Error', 'Failed to approve'),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => graphqlClient.mutate(SUSPEND_COMPANY_MUTATION, { companyId: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminCompanies'] }); Alert.alert('Success', 'Company suspended'); },
    onError: () => Alert.alert('Error', 'Failed to suspend'),
  });

  const companies: any[] = (data as any)?.allCompanies ?? [];
  const filtered = companies.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string) => s === 'active' ? '#10b981' : s === 'pending' ? '#f59e0b' : '#ef4444';

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20', borderColor: statusColor(item.status) }]}>
          <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}><Ionicons name="cube-outline" size={12} /> {item.totalShipments ?? 0} shipments</Text>
        <Text style={styles.metaText}><Ionicons name="people-outline" size={12} /> {item.totalUsers ?? 0} users</Text>
        <Text style={styles.metaText}><Ionicons name="calendar-outline" size={12} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
      </View>
      <View style={styles.actions}>
        {item.status !== 'active' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#10b981' }]} onPress={() => approveMutation.mutate(item.id)}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#fff" />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'suspended' && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444' }]} onPress={() =>
            Alert.alert('Suspend', `Suspend ${item.name}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Suspend', style: 'destructive', onPress: () => suspendMutation.mutate(item.id) },
            ])
          }>
            <Ionicons name="ban-outline" size={14} color="#fff" />
            <Text style={styles.btnText}>Suspend</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput style={styles.searchInput} placeholder="Search companies…" value={search} onChangeText={setSearch} />
      </View>
      {isLoading ? <ActivityIndicator style={{ marginTop: 40 }} color={primaryColor} /> : (
        <FlatList data={filtered} keyExtractor={i => i.id} renderItem={renderItem} contentContainerStyle={{ padding: 16 }} onRefresh={refetch} refreshing={isLoading} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 10, paddingHorizontal: 12, gap: 8, elevation: 1 },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: '#374151' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  email: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaText: { fontSize: 11, color: '#6b7280' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
});
