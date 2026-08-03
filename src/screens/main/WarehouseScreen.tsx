import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useWarehouses, useCreateWarehouse } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { WAREHOUSE_TYPES, ZAMBIAN_CITIES } from '../../constants/config';
import type { Warehouse } from '../../types';

export function WarehouseScreen() {
  const insets = useSafeAreaInsets();
  const { company, primaryColor } = useStore();
  const { data: warehouses, isLoading, refetch } = useWarehouses();
  const [showModal, setShowModal] = useState(false);

  const renderWarehouse = ({ item: w }: { item: Warehouse }) => {
    const loadPct = w.capacity > 0 ? Math.min(100, Math.round((w.currentLoad / w.capacity) * 100)) : 0;
    const loadColor = loadPct > 80 ? '#ef4444' : loadPct > 60 ? '#f59e0b' : '#10b981';

    return (
      <Card style={styles.card} padding={16}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <View style={[styles.icon, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name="storefront-outline" size={20} color={primaryColor} />
            </View>
            <View>
              <Text style={styles.name}>{w.name}</Text>
              {w.code && <Text style={styles.code}>{w.code}</Text>}
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: '#e0f2fe' }]}>
            <Text style={styles.typeText}>{w.warehouseType}</Text>
          </View>
        </View>

        <View style={styles.meta}>
          {w.city && <Text style={styles.metaText}><Ionicons name="location-outline" size={12} /> {w.city}, {w.country}</Text>}
          {w.managerName && <Text style={styles.metaText}><Ionicons name="person-outline" size={12} /> {w.managerName}</Text>}
          {w.phone && <Text style={styles.metaText}><Ionicons name="call-outline" size={12} /> {w.phone}</Text>}
        </View>

        {/* Capacity Bar */}
        <View style={styles.capacitySection}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityLabel}>Capacity Usage</Text>
            <Text style={[styles.capacityPct, { color: loadColor }]}>{loadPct}%</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${loadPct}%` as any, backgroundColor: loadColor }]} />
          </View>
          <Text style={styles.capacityDetail}>{w.currentLoad} / {w.capacity} units · {w.availableCapacity} available</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={warehouses as Warehouse[]}
        keyExtractor={item => item.id}
        renderItem={renderWarehouse}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={primaryColor} />}
        ListEmptyComponent={<EmptyState icon="storefront-outline" title="No warehouses" message="Add your first warehouse" />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      <AddWarehouseModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        companyId={company?.id ?? ''}
      />
    </View>
  );
}

function AddWarehouseModal({ visible, onClose, companyId }: { visible: boolean; onClose: () => void; companyId: string }) {
  const { primaryColor } = useStore();
  const createWarehouse = useCreateWarehouse();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [warehouseType, setWarehouseType] = useState('storage');
  const [capacity, setCapacity] = useState('');

  const handleAdd = async () => {
    if (!name || !city) {
      Alert.alert('Missing Info', 'Warehouse name and city are required.'); return;
    }
    try {
      await createWarehouse.mutateAsync({
        companyId, name, code, address, city, state, country: 'Zambia',
        phone, email, managerName, warehouseType, capacity: capacity ? parseFloat(capacity) : 0,
      });
      Alert.alert('Success', 'Warehouse added!');
      setName(''); setCode(''); setAddress(''); setCity(''); setState('');
      setPhone(''); setEmail(''); setManagerName(''); setCapacity('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create warehouse.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modal.container}>
        <View style={modal.header}>
          <Text style={modal.title}>Add Warehouse</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
        </View>
        <ScrollView style={modal.body} keyboardShouldPersistTaps="handled">
          <Input label="Warehouse Name" value={name} onChangeText={setName} required leftIcon="storefront-outline" />
          <Input label="Code" value={code} onChangeText={setCode} placeholder="e.g. WH-001" leftIcon="barcode-outline" />
          <Input label="Address" value={address} onChangeText={setAddress} leftIcon="location-outline" />

          <Text style={modal.pickerLabel}>City *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {ZAMBIAN_CITIES.map(c => (
              <TouchableOpacity key={c} style={[modal.chip, city === c && { backgroundColor: primaryColor, borderColor: primaryColor }]} onPress={() => setCity(c)}>
                <Text style={[modal.chipText, city === c && { color: '#ffffff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={modal.pickerLabel}>Warehouse Type</Text>
          <View style={modal.typeGrid}>
            {WAREHOUSE_TYPES.map(t => (
              <TouchableOpacity key={t.value} style={[modal.typeBtn, warehouseType === t.value && { backgroundColor: primaryColor, borderColor: primaryColor }]} onPress={() => setWarehouseType(t.value)}>
                <Text style={[modal.typeText, warehouseType === t.value && { color: '#ffffff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Capacity (units)" value={capacity} onChangeText={setCapacity} keyboardType="decimal-pad" leftIcon="scale-outline" />
          <Input label="Manager Name" value={managerName} onChangeText={setManagerName} leftIcon="person-outline" />
          <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="call-outline" />
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" />

          <Button title="Add Warehouse" onPress={handleAdd} loading={createWarehouse.isPending} fullWidth size="lg" style={{ marginTop: 8 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#ffffff' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  body: { padding: 20 },
  pickerLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb', marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1.5, borderColor: '#e5e7eb' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#374151' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, gap: 12 },
  card: { marginBottom: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  code: { fontSize: 11, color: '#9ca3af' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  typeText: { fontSize: 11, fontWeight: '600', color: '#0284c7' },
  meta: { gap: 3, marginBottom: 12 },
  metaText: { fontSize: 12, color: '#6b7280' },
  capacitySection: {},
  capacityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  capacityLabel: { fontSize: 12, color: '#6b7280' },
  capacityPct: { fontSize: 12, fontWeight: '700' },
  progressBg: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  capacityDetail: { fontSize: 11, color: '#9ca3af' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
});
