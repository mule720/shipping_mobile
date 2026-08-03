import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useShipments } from '../../hooks/useData';
import { useStore } from '../../store/useStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Shipment } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export function ShipmentsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { primaryColor } = useStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const { data: shipments, isLoading, refetch } = useShipments();

  const filtered = useMemo(() => {
    let list: Shipment[] = shipments ?? [];
    if (statusFilter) list = list.filter(s => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.senderName.toLowerCase().includes(q) ||
        s.receiverName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [shipments, statusFilter, search]);

  const renderItem = ({ item: s }: { item: Shipment }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ShipmentDetail', { shipmentId: s.id })}
      activeOpacity={0.8}
    >
      <Card style={styles.card} padding={14}>
        <View style={styles.cardRow}>
          <View style={styles.left}>
            <View style={styles.trackRow}>
              <Text style={styles.tracking}>{s.trackingNumber}</Text>
              {s.isSensitive && (
                <View style={styles.specialTag}>
                  <Text style={styles.specialTagText}>SENSITIVE</Text>
                </View>
              )}
              {s.isColdChain && (
                <View style={[styles.specialTag, styles.coldTag]}>
                  <Text style={[styles.specialTagText, { color: '#06b6d4' }]}>COLD</Text>
                </View>
              )}
            </View>
            <Text style={styles.names}>{s.senderName} → {s.receiverName}</Text>
            <Text style={styles.route}>{s.originBranch} → {s.destinationBranch}</Text>
            <Text style={styles.meta}>{formatDate(s.createdAt)} · {s.pieces} pcs · {s.weight} kg</Text>
          </View>
          <View style={styles.right}>
            <StatusBadge status={s.status} small />
            <Text style={styles.cost}>{formatCurrency(s.shippingCost)}</Text>
            <Text style={[styles.payType, s.paymentType === 'cod' && styles.cod]}>
              {s.paymentType.toUpperCase()}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by tracking, name..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: primaryColor }]}
          onPress={() => navigation.navigate('CreateShipment')}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        keyExtractor={item => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterTab,
              statusFilter === item.value && { backgroundColor: primaryColor, borderColor: primaryColor },
            ]}
            onPress={() => setStatusFilter(item.value)}
          >
            <Text style={[
              styles.filterLabel,
              statusFilter === item.value && { color: '#ffffff' },
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No shipments found"
            message={search || statusFilter ? 'Try adjusting your filters' : 'Create your first shipment'}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchWrap: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#111827' },
  addBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filterList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  list: { padding: 16, gap: 10 },
  card: { marginBottom: 0 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  left: { flex: 1 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tracking: { fontSize: 14, fontWeight: '700', color: '#111827' },
  specialTag: {
    backgroundColor: '#fef3c7', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  coldTag: { backgroundColor: '#e0f2fe' },
  specialTagText: { fontSize: 9, fontWeight: '700', color: '#d97706' },
  names: { fontSize: 13, color: '#374151', marginBottom: 2 },
  route: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  meta: { fontSize: 11, color: '#9ca3af' },
  right: { alignItems: 'flex-end', gap: 5, minWidth: 90 },
  cost: { fontSize: 13, fontWeight: '700', color: '#111827' },
  payType: { fontSize: 10, fontWeight: '700', color: '#10b981', backgroundColor: '#d1fae5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cod: { color: '#f59e0b', backgroundColor: '#fef3c7' },
});
