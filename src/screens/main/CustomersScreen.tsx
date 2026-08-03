import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCustomers } from '../../hooks/useData';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency, formatDate, getInitials } from '../../utils/format';
import type { Customer } from '../../types';

type SortKey = 'name' | 'revenue' | 'shipments';

export function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const { data: customers, isLoading, refetch } = useCustomers();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('revenue');

  const filtered = useMemo(() => {
    let list: Customer[] = customers ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sort === 'revenue') return (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0);
      if (sort === 'shipments') return (b.totalShipments ?? 0) - (a.totalShipments ?? 0);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [customers, search, sort]);

  const totalRevenue = (customers ?? []).reduce((sum, c) => sum + (c.totalRevenue ?? 0), 0);
  const totalCustomers = (customers ?? []).length;

  const renderCustomer = ({ item: c }: { item: Customer }) => (
    <Card style={styles.card} padding={14}>
      <View style={styles.cardRow}>
        <View style={[styles.avatar, { backgroundColor: primaryColor + '20' }]}>
          <Text style={[styles.avatarText, { color: primaryColor }]}>{getInitials(c.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{c.name}</Text>
          {c.phone && <Text style={styles.meta}>{c.phone}</Text>}
          {c.email && <Text style={styles.meta}>{c.email}</Text>}
          {c.city && <Text style={styles.meta}>{c.city}</Text>}
          {c.lastShipment && <Text style={styles.lastShipment}>Last: {formatDate(c.lastShipment)}</Text>}
        </View>
        <View style={styles.stats}>
          <Text style={styles.revenue}>{formatCurrency(c.totalRevenue ?? 0)}</Text>
          <Text style={styles.shipCount}>{c.totalShipments ?? 0} shipments</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalCustomers}</Text>
          <Text style={styles.summaryLabel}>Customers</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Search & Sort */}
      <View style={styles.controls}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.sortRow}>
        {([['revenue', 'By Revenue'], ['shipments', 'By Shipments'], ['name', 'By Name']] as [SortKey, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.sortBtn, sort === key && { backgroundColor: primaryColor, borderColor: primaryColor }]}
            onPress={() => setSort(key)}
          >
            <Text style={[styles.sortText, sort === key && { color: '#ffffff' }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderCustomer}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
        ListEmptyComponent={<EmptyState icon="people-outline" title="No customers" message="Customers are added automatically when shipments are created" />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  summary: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 0 },
  summaryCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  summaryLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  controls: { padding: 16, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1.5, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#111827' },
  sortRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb' },
  sortText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  list: { padding: 16, gap: 10 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '800' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  meta: { fontSize: 12, color: '#6b7280', marginBottom: 1 },
  lastShipment: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  stats: { alignItems: 'flex-end' },
  revenue: { fontSize: 14, fontWeight: '700', color: '#10b981' },
  shipCount: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
